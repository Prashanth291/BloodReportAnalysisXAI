"""
Flask XAI API for Blood Report Analysis
Provides /api/v1/interpret endpoint that returns medical interpretations
with SHAP-based explainability for CBC parameters.
"""
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import shap
import functools
import hashlib
import logging

# MongoDB cache for XAI results
from mongo_cache import get_cached_interpretation, set_cached_interpretation

# Import the medical text generator
import sys
sys.path.append(str(Path(__file__).parent))
from medical_text_generator import generate_interpretation, STATUS_NAMES

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# Simple in-memory cache for responses
RESPONSE_CACHE = {}
CACHE_TTL_SECONDS = 300  # 5 minutes

# Basic auth token (set this securely in production)
DEV_AUTH_TOKEN = "dev-secret-token"

MODELS_DIR = Path(__file__).parent / "models"

# Cache for loaded models
LOADED_MODELS = {}

def get_model(parameter_name):
    """Load and cache models."""
    if parameter_name not in LOADED_MODELS:
        model_path = MODELS_DIR / f"{parameter_name}_model.joblib"
        if not model_path.exists():
            return None
        LOADED_MODELS[parameter_name] = joblib.load(model_path)
    return LOADED_MODELS[parameter_name]

def preprocess_input(data):
    """Convert API input to model features."""
    # Extract key features from request
    features = {}
    features['patientAge'] = data.get('patientAge', 50)
    features['diabetic'] = 1 if data.get('diabetic', False) else 0
    features['pregnant'] = 1 if data.get('pregnant', False) else 0
    
    # Gender encoding (match preprocessing)
    gender = data.get('patientGender', 'Male')
    features['gender_Female'] = 1 if gender == 'Female' else 0
    features['gender_Male'] = 1 if gender == 'Male' else 0
    features['gender_Other'] = 1 if gender == 'Other' else 0
    
    # Region encoding (default to Unknown)
    region = data.get('region', 'Unknown')
    for r in ['North', 'South', 'East', 'West', 'Central', 'Urban', 'Rural', 'Unknown']:
        features[f'region_{r}'] = 1 if region == r else 0
    
    # Age group encoding
    age = features['patientAge']
    features['age_young'] = 1 if age < 30 else 0
    features['age_middle'] = 1 if 30 <= age < 50 else 0
    features['age_senior'] = 1 if 50 <= age < 65 else 0
    features['age_elderly'] = 1 if age >= 65 else 0
    
    # Other parameters from request
    for param in ['hemoglobin_g_dL', 'wbc_10e9_L', 'platelet_count', 'rdw_percent',
                  'neutrophils_percent', 'lymphocytes_percent', 'monocytes_percent',
                  'eosinophils_percent', 'basophils_percent', 'rbc_count', 'mcv_fL',
                  'mch_pg', 'mchc_g_dL', 'neutrophils_abs', 'lymphocytes_abs', 'monocytes_abs']:
        features[param] = data.get('otherParameters', {}).get(param, 0)
    
    # Z-scores (simplified - could be computed from population stats)
    features['hemoglobin_g_dL_zscore'] = 0
    features['wbc_10e9_L_zscore'] = 0
    features['platelet_count_zscore'] = 0
    
    # NLR ratio
    if features['lymphocytes_abs'] > 0:
        features['nlr'] = features['neutrophils_abs'] / features['lymphocytes_abs']
    else:
        features['nlr'] = 0
    
    # Outlier flags (simplified)
    features['hemoglobin_g_dL_outlier'] = 0
    features['wbc_10e9_L_outlier'] = 0
    features['platelet_count_outlier'] = 0
    
    features['patientWeight_kg'] = data.get('patientWeight_kg', 70)
    features['neutrophil_lymphocyte_ratio'] = features['nlr']
    
    return features

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "XAI Blood Report Analysis"})

def require_auth(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return make_response(jsonify({"error": "Missing or invalid Authorization header"}), 401)
        token = auth_header.split(' ', 1)[1]
        if token != DEV_AUTH_TOKEN:
            return make_response(jsonify({"error": "Invalid API token"}), 403)
        return f(*args, **kwargs)
    return decorated

def cache_response(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        try:
            cache_key = hashlib.sha256((request.path + str(request.json)).encode()).hexdigest()
        except Exception:
            cache_key = None
        if cache_key and cache_key in RESPONSE_CACHE:
            entry = RESPONSE_CACHE[cache_key]
            if (pd.Timestamp.now() - entry['time']).total_seconds() < CACHE_TTL_SECONDS:
                logging.info(f"Cache hit for {request.path}")
                return make_response(entry['response'])
            else:
                del RESPONSE_CACHE[cache_key]
        response = f(*args, **kwargs)
        if cache_key:
            RESPONSE_CACHE[cache_key] = {'response': response, 'time': pd.Timestamp.now()}
        return response
    return decorated

@app.route('/api/v1/interpret', methods=['POST'])
@require_auth
@cache_response
def interpret():
    payload = request.get_json()
    # Check MongoDB cache first
    cached = get_cached_interpretation(payload)
    if cached:
        return jsonify(cached)
    try:
        data = payload
        parameter = data.get('parameter', 'hemoglobin')
        value = data.get('value', 0)
        logging.info(f"Interpret request for {parameter} (value={value})")
        # Load model
        model = get_model(parameter)
        if model is None:
            logging.error(f"Model for parameter '{parameter}' not found")
            return jsonify({"error": f"Model for parameter '{parameter}' not found"}), 404
        # Preprocess input
        features_dict = preprocess_input(data)
        # Convert to DataFrame matching training features
        feature_df = pd.DataFrame([features_dict])
        # Select only numeric features that model expects (28 features)
        numeric_cols = feature_df.select_dtypes(include=[np.number]).columns
        X = feature_df[numeric_cols]
        # Predict
        prediction = model.predict(X)[0]
        proba = model.predict_proba(X)[0]
        confidence = float(proba[prediction])
        # Compute SHAP values (create explainer on-the-fly)
        try:
            explainer = shap.Explainer(model, X[:1])
            shap_values = explainer(X)
            feature_importances = []
            shap_vals = None
            feature_names = list(X.columns)
            if hasattr(shap_values, 'values') and len(shap_values.values.shape) > 1:
                class_shap = shap_values.values[0, :, prediction]
                shap_vals = class_shap.tolist()
                for fname, impact in zip(feature_names, class_shap):
                    if abs(impact) > 0.01:
                        feature_importances.append({
                            "feature": fname,
                            "impact": float(impact),
                            "direction": "increases" if impact > 0 else "decreases"
                        })
            feature_importances = sorted(feature_importances, key=lambda x: abs(x['impact']), reverse=True)[:5]
        except Exception as e:
            logging.warning(f"SHAP computation failed: {e}")
            feature_importances = []
            shap_vals = None
            feature_names = list(X.columns)
        # Generate medical text
        interpretation = generate_interpretation(
            parameter_name=parameter,
            value=value,
            prediction_status=int(prediction),
            confidence=confidence,
            feature_importances=feature_importances
        )
        # Add SHAP values and feature names for frontend visualization
        interpretation["shap_values"] = shap_vals
        interpretation["feature_names"] = feature_names
        set_cached_interpretation(payload, interpretation)
        return jsonify(interpretation)
    except Exception as e:
        logging.exception("Error in interpret")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask XAI API...")
    print(f"Models directory: {MODELS_DIR}")
    app.run(host='0.0.0.0', port=5001, debug=True)
