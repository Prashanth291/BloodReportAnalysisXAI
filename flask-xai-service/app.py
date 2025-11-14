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
import os
import shap
import functools
import hashlib
import logging
import traceback

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
# Use environment variable if provided, fallback to dev-secret-token
DEV_AUTH_TOKEN = os.environ.get('DEV_AUTH_TOKEN', "dev-secret-token")

MODELS_DIR = Path(__file__).parent / "models"

# Cache for loaded models
LOADED_MODELS = {}

def get_model(parameter_name):
    """Load and cache models."""
    # Map parameter aliases to model filenames
    PARAMETER_MODEL_MAP = {
        'hemoglobin': 'hemoglobin',
        'wbc': 'wbc',
        'platelet': 'platelet',
        'neutrophil': 'neutrophil',
        'neutrophils': 'neutrophil',
        'lymphocyte': 'lymphocyte',
        'lymphocytes': 'lymphocyte',
        'rdw': 'rdw',
        'monocyte': 'monocyte',
        'monocytes': 'monocyte',
        'eosinophil': 'eosinophil',
        'eosinophils': 'eosinophil',
        'basophil': 'basophil',
        'basophils': 'basophil',
        'rbc': 'rbc',
        'mcv': 'mcv',
        'mch': 'mch',
        'mchc': 'mchc',
    }
    key = parameter_name.lower() if parameter_name else ''
    model_key = PARAMETER_MODEL_MAP.get(key, key)
    if model_key not in LOADED_MODELS:
        model_path = MODELS_DIR / f"{model_key}_model.joblib"
        if not model_path.exists():
            return None
        LOADED_MODELS[model_key] = joblib.load(model_path)
    return LOADED_MODELS[model_key]


def normalize_parameter_name(param):
    """Normalize a human-readable parameter name to a model key.
    Attempts to map common frontend labels like 'Hemoglobin (Hb)',
    'Platelet Count', 'Total WBC count' to internal model keys.
    """
    if not param:
        return param
    s = str(param).lower()
    # remove parentheses content
    import re
    s = re.sub(r"\(.*?\)", "", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s).strip()
    # keyword matching (handle both American and British spellings)
    # IMPORTANT: Check most specific patterns first before general ones
    # MCH and MCHC must be checked BEFORE hemoglobin because they contain "hemoglobin"
    if 'mean corpuscular haemoglobin concentration' in s or 'mean corpuscular hemoglobin concentration' in s or 'mchc' in s:
        return 'mchc'
    if 'mean corpuscular haemoglobin' in s or 'mean corpuscular hemoglobin' in s or 'mch' in s:
        return 'mch'
    if 'mean corpuscular volume' in s or 'mcv' in s:
        return 'mcv'
    if 'hemoglobin' in s or 'haemoglobin' in s or s == 'hb':
        return 'hemoglobin'
    if 'wbc' in s or 'white' in s or 'total wbc' in s:
        return 'wbc'
    if 'platelet' in s:
        return 'platelet'
    if 'neutrophil' in s:
        return 'neutrophil'
    if 'lymphocyte' in s:
        return 'lymphocyte'
    if 'eosinophil' in s:
        return 'eosinophil'
    if 'basophil' in s:
        return 'basophil'
    if 'monocyte' in s:
        return 'monocyte'  # Note: no monocyte model exists, will 404
    if 'rdw' in s:
        return 'rdw'
    if 'rbc' in s or 'red blood' in s or 'red cell' in s:
        return 'rbc'
    if 'haematocrit' in s or 'hematocrit' in s or 'pcv' in s:
        return 'hematocrit'  # Note: no hematocrit model exists, will 404
    if 'neutrophils' in s:
        return 'neutrophil'
    if 'lymphocytes' in s:
        return 'lymphocyte'
    # fallback: try exact match to known model files (strip suffixes)
    for name in LOADED_MODELS.keys():
        if name in s:
            return name
    # as last resort return original lowercased no-space key
    return s.replace(' ', '_')

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
    
    # Get otherParameters dict from request (sent by frontend)
    other_params = data.get('otherParameters', {})
    
    # Debug logging
    print("==============================================================")
    logging.info(f"otherParameters received: {other_params}")
    logging.info(f"otherParameters type: {type(other_params)}")
    logging.info(f"otherParameters keys: {list(other_params.keys()) if isinstance(other_params, dict) else 'Not a dict'}")
    print("==============================================================")
    
    # Other parameters - try otherParameters first, then fall back to top-level data
    for param in ['hemoglobin_g_dL', 'wbc_10e9_L', 'platelet_count', 'rdw_percent',
                  'neutrophils_percent', 'lymphocytes_percent', 'monocytes_percent',
                  'eosinophils_percent', 'basophils_percent', 'rbc_count', 'mcv_fL',
                  'mch_pg', 'mchc_g_dL', 'neutrophils_abs', 'lymphocytes_abs', 'monocytes_abs']:
        # Try otherParameters first, then top-level data, then default to 0
        features[param] = other_params.get(param, data.get(param, 0))
    
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
    
    # Debug logging - log final feature values for blood parameters
    print("==============================================================")
    logging.info("Final feature values for blood parameters:")
    for param in ['hemoglobin_g_dL', 'wbc_10e9_L', 'platelet_count', 'rdw_percent',
                  'neutrophils_percent', 'lymphocytes_percent']:
        logging.info(f"  {param}: {features.get(param, 'NOT FOUND')}")
    print("==============================================================")
    
    return features

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "XAI Blood Report Analysis"})

def require_auth(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        # Developer debug logging (masked) to help troubleshoot auth issues in dev
        try:
            if auth_header:
                # mask token for logs
                if auth_header.startswith('Bearer '):
                    _token = auth_header.split(' ', 1)[1]
                    masked = _token if len(_token) <= 8 else (_token[:4] + '...' + _token[-2:])
                    logging.info(f"Authorization header received (masked token): {masked} (len={len(_token)})")
                else:
                    logging.info(f"Authorization header received (not Bearer): {auth_header}")
            else:
                logging.info("No Authorization header received")
        except Exception:
            logging.debug("Failed to log Authorization header", exc_info=True)

        if not auth_header.startswith('Bearer '):
            return make_response(jsonify({"error": "Missing or invalid Authorization header"}), 401)
        # Normalize token: strip whitespace and surrounding quotes to handle clients that add them
        token = auth_header.split(' ', 1)[1].strip()
        if (token.startswith('"') and token.endswith('"')) or (token.startswith("'") and token.endswith("'")):
            token = token[1:-1]
        # Compare normalized token
        if token != DEV_AUTH_TOKEN:
            logging.warning(f"Authorization failed: invalid token provided (len_received={len(token)}, len_expected={len(DEV_AUTH_TOKEN)})")
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
        # Determine HTTP status code for the response to avoid caching errors
        status_code = None
        try:
            if hasattr(response, 'status_code'):
                status_code = response.status_code
            elif isinstance(response, tuple):
                # (body, status) or (body, status, headers)
                if len(response) > 1 and isinstance(response[1], int):
                    status_code = response[1]
                else:
                    status_code = 200
            else:
                status_code = 200
        except Exception:
            status_code = None

        # Only cache successful (200) responses to avoid persisting error states
        if cache_key and status_code == 200:
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
        print("==============================================================")
        logging.info(f"Raw data received from frontend: {data}")
        print("==============================================================")

        # Use parameter name from request, fallback to 'hemoglobin' only if missing or empty
        # Robustly extract parameter, fallback to 'hemoglobin' if missing or empty
        parameter = None
        for key in ['parameter', 'parameter_name', 'parameterName']:
            value = data.get(key)
            if value is not None and str(value).strip() != '':
                parameter = value
                break
        if not parameter:
            logging.warning("No parameter provided, defaulting to 'hemoglobin'")
            parameter = 'hemoglobin'
        value = data.get('value', 0)
        print("==============================================================")
        logging.info(f"Received parameter: '{parameter}', value: {value}")
        print("==============================================================")
        print("==============================================================")
        logging.info(f"Interpret request for parameter='{parameter}' (value={value}) | payload keys: {list(data.keys())}")
        print("==============================================================")
        if parameter == 'hemoglobin':
            logging.warning("Parameter defaulted to 'hemoglobin'. Check if frontend is sending the correct parameter name.")
        # Normalize parameter name from frontend labels to model keys
        normalized_param = normalize_parameter_name(parameter)
        logging.info(f"Normalized parameter name: '{parameter}' -> '{normalized_param}'")
        # Load model
        model = get_model(normalized_param)
        if model is None:
            logging.error(f"Model for parameter '{normalized_param}' not found (original: '{parameter}')")
            return jsonify({"error": f"Model for parameter '{normalized_param}' not found", "original_parameter": parameter}), 404
        print("==============================================================")
        logging.info(f"Model loaded for: '{normalized_param}' (original: '{parameter}')")
        print("==============================================================")
        # Preprocess input
        features_dict = preprocess_input(data)
        print("==============================================================")
        logging.info(f"Features sent for analysis: {features_dict}")
        print("==============================================================")
        # Convert to DataFrame matching training features
        feature_df = pd.DataFrame([features_dict])
        # Align DataFrame columns to model's expected features
        try:
            expected_features = model.get_booster().feature_names
        except Exception:
            expected_features = model.feature_names_in_ if hasattr(model, 'feature_names_in_') else list(feature_df.columns)
        # Reindex to match model's features, fill missing with 0
        X = feature_df.reindex(columns=expected_features, fill_value=0)
        # Predict
        prediction = model.predict(X)[0]
        proba = model.predict_proba(X)[0]
        confidence = float(proba[prediction])
        print("==============================================================")
        logging.info(f"Prediction class: {prediction}, Confidence: {confidence}")
        print("==============================================================")
        # Compute SHAP values (create explainer on-the-fly)
        try:
            # Prefer TreeExplainer for tree-based models (XGBoost, RandomForest, etc.)
            explainer = None
            explainer_type = None
            shap_error = None
            try:
                from xgboost import XGBClassifier, XGBRegressor
                is_tree = isinstance(model, (XGBClassifier, XGBRegressor))
            except ImportError:
                is_tree = False
            # Also check for scikit-learn RandomForest, ExtraTrees, etc.
            if not is_tree:
                from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, ExtraTreesClassifier, ExtraTreesRegressor
                is_tree = isinstance(model, (RandomForestClassifier, RandomForestRegressor, ExtraTreesClassifier, ExtraTreesRegressor))
            # Try multiple explainer strategies to maximize compatibility with different model wrappers
            shap_values = None
            shap_error = None
            explainer = None
            explainer_type = None
            attempts = []
            try:
                # prefer TreeExplainer on the model object
                if is_tree:
                    attempts.append(('TreeExplainer_model', lambda: shap.TreeExplainer(model)))
                # try using underlying booster if available (XGBoost)
                if hasattr(model, 'get_booster'):
                    attempts.append(('TreeExplainer_booster', lambda: shap.TreeExplainer(model.get_booster())))
                # generic explainer using model object
                attempts.append(('GenericExplainer', lambda: shap.Explainer(model, X[:1])))
                # explainer using predict_proba if available
                if hasattr(model, 'predict_proba'):
                    attempts.append(('PredictProbaExplainer', lambda: shap.Explainer(lambda d: model.predict_proba(d), X[:1])))
                # kernel explainer as last resort (slow)
                attempts.append(('KernelExplainer', lambda: shap.KernelExplainer((lambda d: model.predict_proba(d) if hasattr(model, 'predict_proba') else model.predict(d)), X[:min(len(X), max(1, int(len(X))))])) )
            except Exception as e:
                logging.warning(f"Error preparing SHAP explainer attempts: {e}")

            for name, ctor in attempts:
                try:
                    logging.info(f"Attempting SHAP explainer: {name}")
                    explainer_candidate = ctor()
                    # compute shap values
                    cand_vals = None
                    try:
                        cand_vals = explainer_candidate(X)
                    except Exception as e:
                        logging.warning(f"Explainer {name} failed to compute SHAP: {e}")
                        logging.debug(traceback.format_exc())
                        continue
                    vals = getattr(cand_vals, 'values', None)
                    if vals is None:
                        logging.info(f"Explainer {name} returned no values")
                        continue
                    import numpy as np
                    vals_np = np.array(vals)
                    logging.info(f"Explainer {name} returned SHAP values shape: {vals_np.shape}")
                    # accept this explainer if it produced a non-empty values array
                    if vals_np.size > 0:
                        explainer = explainer_candidate
                        explainer_type = name
                        shap_values = cand_vals
                        break
                except Exception as e:
                    logging.warning(f"SHAP attempt {name} raised: {e}")
                    logging.debug(traceback.format_exc())

            if explainer is None or shap_values is None:
                shap_error = "All SHAP explainer attempts failed or returned no values"
                logging.warning(shap_error)

            feature_importances = []
            shap_vals = None
            feature_names = list(X.columns)

            # Normalize shap values to a 1-D array for the sample and predicted class
            try:
                vals = getattr(shap_values, 'values', None)
                if vals is None:
                    raise ValueError('shap_values has no attribute "values"')
                vals = np.array(vals)
                n_feat = len(feature_names)
                
                # Debug: log the shape we received
                logging.info(f"SHAP raw shape: {vals.shape}, n_features expected: {n_feat}, prediction class: {prediction}")

                # Handle different possible SHAP shapes robustly
                if vals.ndim == 1:
                    class_shap = vals
                elif vals.ndim == 2:
                    if vals.shape[1] == n_feat:
                        class_shap = vals[0]
                    elif vals.shape[0] == n_feat:
                        class_shap = vals[:, 0]
                    else:
                        raise ValueError(f'Unexpected 2D SHAP shape: {vals.shape}')
                elif vals.ndim == 3:
                    # Shape is (n_samples, n_features, n_classes) or (n_samples, n_classes, n_features)
                    if vals.shape[2] == n_feat:
                        # Shape: (1, n_classes, n_features) - extract features for predicted class
                        class_shap = vals[0, prediction, :]
                    elif vals.shape[1] == n_feat:
                        # Shape: (1, n_features, n_classes) - extract features for predicted class
                        class_shap = vals[0, :, prediction]
                    else:
                        raise ValueError(f'Unexpected 3D SHAP shape: {vals.shape}')
                else:
                    raise ValueError(f'Unsupported SHAP values ndim: {vals.ndim}')

                shap_vals = class_shap.tolist()
                
                # Debug: log raw SHAP values
                logging.info(f"Raw SHAP values (first 10): {class_shap[:10]}")
                logging.info(f"SHAP value range: min={class_shap.min():.6f}, max={class_shap.max():.6f}")
                
                for fname, impact in zip(feature_names, class_shap):
                    if abs(impact) > 0.01:
                        feature_importances.append({
                            "feature": fname,
                            "impact": float(impact),
                            "direction": "increases" if impact > 0 else "decreases"
                        })
                feature_importances = sorted(feature_importances, key=lambda x: abs(x['impact']), reverse=True)[:5]
                logging.info(f"Feature importances found: {len(feature_importances)} (after filtering > 0.01)")
                
                # Fallback: if SHAP returns all zeros, use model's feature importances
                if len(feature_importances) == 0 and hasattr(model, 'feature_importances_'):
                    logging.info("SHAP returned all zeros, falling back to model feature importances")
                    model_importances = model.feature_importances_
                    for fname, importance in zip(feature_names, model_importances):
                        if importance > 0.01:
                            feature_importances.append({
                                "feature": fname,
                                "impact": float(importance),
                                "direction": "importance"  # Model importances don't have direction
                            })
                    feature_importances = sorted(feature_importances, key=lambda x: abs(x['impact']), reverse=True)[:5]
                    logging.info(f"Using {len(feature_importances)} model-based feature importances")
            except Exception as inner_e:
                shap_error = f"SHAP parse error: {inner_e}\n{traceback.format_exc()}"
                logging.warning(shap_error)
        except Exception as e:
            logging.warning(f"SHAP computation failed: {e}")
            feature_importances = []
            shap_vals = None
            feature_names = list(X.columns)
            # Capture traceback for easier dev debugging (returned in response only in dev)
            shap_error = f"{str(e)}\n{traceback.format_exc()}"
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
        # Developer debug: include shap error details when computation failed (may be None)
        interpretation["shap_error"] = shap_error
        print("==============================================================")
        logging.info(f"Output returned from XAI: {interpretation}")
        print("==============================================================")
        set_cached_interpretation(payload, interpretation)
        return jsonify(interpretation)
    except Exception as e:
        logging.exception("Error in interpret")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask XAI API...")
    print(f"Models directory: {MODELS_DIR}")
    app.run(host='0.0.0.0', port=5001, debug=True)
