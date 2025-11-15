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

# Import the medical text generator and clinical fallback
import sys
sys.path.append(str(Path(__file__).parent))
from medical_text_generator import generate_interpretation, STATUS_NAMES
from clinical_rules_fallback import classify_by_threshold, calculate_risk_assessments

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
    """Load and cache models. Returns (model, reverse_mapping, feature_names) tuple."""
    # Map normalized parameter names to model filenames
    # Updated to use LightGBM model filenames (with full parameter names)
    PARAMETER_MODEL_MAP = {
        'hemoglobin_g_dL': 'hemoglobin_g_dl',
        'hemoglobin': 'hemoglobin_g_dl',
        'wbc_10e9_L': 'wbc_10e9_l',
        'wbc': 'wbc_10e9_l',
        'platelet_count': 'platelet_count',
        'platelet': 'platelet_count',
        'neutrophils_percent': 'neutrophils_percent',
        'neutrophil': 'neutrophils_percent',
        'neutrophils': 'neutrophils_percent',
        'lymphocytes_percent': 'lymphocytes_percent',
        'lymphocyte': 'lymphocytes_percent',
        'lymphocytes': 'lymphocytes_percent',
        'rdw_percent': 'rdw_percent',
        'rdw': 'rdw_percent',
        'monocytes_percent': 'monocytes_percent',
        'monocyte': 'monocytes_percent',
        'monocytes': 'monocytes_percent',
        'eosinophils_percent': 'eosinophils_percent',
        'eosinophil': 'eosinophils_percent',
        'eosinophils': 'eosinophils_percent',
        'basophils_percent': 'basophils_percent',
        'basophil': 'basophils_percent',
        'basophils': 'basophils_percent',
        'rbc_count': 'rbc_count',
        'rbc': 'rbc_count',
        'mcv_fL': 'mcv_fl',
        'mcv': 'mcv_fl',
        'mch_pg': 'mch_pg',
        'mch': 'mch_pg',
        'mchc_g_dL': 'mchc_g_dl',
        'mchc': 'mchc_g_dl',
        'hba1c_percent': 'hba1c_percent',
        'hba1c': 'hba1c_percent',
        'random_blood_sugar_mg_dL': 'random_blood_sugar_mg_dl',
        'rbs': 'random_blood_sugar_mg_dl',
        'esr_mm_hr': 'esr_mm_hr',
        'esr': 'esr_mm_hr',
        'crp_mg_L': 'crp_mg_l',
        'crp': 'crp_mg_l',
        'serum_creatinine_mg_dL': 'serum_creatinine_mg_dl',
        'creatinine': 'serum_creatinine_mg_dl',
    }
    key = parameter_name.lower() if parameter_name else ''
    model_key = PARAMETER_MODEL_MAP.get(key, key)
    if model_key not in LOADED_MODELS:
        model_path = MODELS_DIR / f"{model_key}_model.joblib"
        if not model_path.exists():
            return None, None, None
        
        # Load model - could be just model or dict with model + mapping + feature_names
        model_data = joblib.load(model_path)
        if isinstance(model_data, dict) and 'model' in model_data:
            LOADED_MODELS[model_key] = (
                model_data['model'], 
                model_data.get('reverse_mapping'),
                model_data.get('feature_names')  # NEW: Load saved feature names
            )
        else:
            LOADED_MODELS[model_key] = (model_data, None, None)
    
    return LOADED_MODELS[model_key]


def normalize_parameter_name(param):
    """
    Normalize a human-readable parameter name to internal key supporting 79 parameters.
    Maps frontend labels to standardized parameter names used in clinical_rules_fallback.
    """
    if not param:
        return param
    s = str(param).lower()
    # remove parentheses content
    import re
    s = re.sub(r"\(.*?\)", "", s)
    s = re.sub(r"[^a-z0-9 ]", " ", s).strip()
    
    # IMPORTANT: Check most specific patterns first
    # CBC Parameters
    if 'mean corpuscular haemoglobin concentration' in s or 'mean corpuscular hemoglobin concentration' in s or 'mchc' in s:
        return 'mchc_g_dL'
    if 'mean corpuscular haemoglobin' in s or 'mean corpuscular hemoglobin' in s or s == 'mch':
        return 'mch_pg'
    if 'mean corpuscular volume' in s or s == 'mcv':
        return 'mcv_fL'
    if 'hemoglobin' in s or 'haemoglobin' in s or s == 'hb' or s == 'hgb':
        return 'hemoglobin_g_dL'
    if 'hematocrit' in s or 'haematocrit' in s or 'pcv' in s:
        return 'hematocrit_percent'
    if 'wbc' in s or ('white' in s and 'blood' in s) or 'total wbc' in s:
        return 'wbc_10e9_L'
    if 'platelet' in s:
        return 'platelet_count'
    if 'rbc' in s or ('red' in s and 'blood' in s) or 'red cell count' in s:
        return 'rbc_count'
    if 'neutrophil' in s:
        return 'neutrophils_percent'
    if 'lymphocyte' in s:
        return 'lymphocytes_percent'
    if 'monocyte' in s:
        return 'monocytes_percent'
    if 'eosinophil' in s:
        return 'eosinophils_percent'
    if 'basophil' in s:
        return 'basophils_percent'
    if 'rdw' in s or 'red cell distribution width' in s:
        return 'rdw_percent'
    if 'reticulocyte' in s:
        return 'reticulocyte_count_percent'
    
    # Glucose/Diabetes
    if 'hba1c' in s or 'glycated' in s or 'glycosylated' in s:
        return 'hba1c_percent'
    if 'random blood sugar' in s or 'rbs' in s or ('glucose' in s and 'random' in s):
        return 'random_blood_sugar_mg_dL'
    if 'estimated average glucose' in s or 'eag' in s:
        return 'estimated_avg_glucose_mg_dL'
    
    # Inflammatory markers
    if 'esr' in s or 'erythrocyte sedimentation' in s:
        return 'esr_mm_hr'
    if 'crp' in s or 'c reactive protein' in s:
        return 'crp_mg_L'
    
    # Kidney function
    if 'creatinine' in s:
        return 'serum_creatinine_mg_dL'
    
    # Iron studies
    if 'serum iron' in s:
        return 'serum_iron_mcg_dL'
    if 'tibc' in s or 'total iron binding' in s:
        return 'tibc_mcg_dL'
    if 'uibc' in s or 'unsaturated iron binding' in s:
        return 'uibc_mcg_dL'
    if 'transferrin saturation' in s:
        return 'transferrin_saturation_percent'
    if 'ferritin' in s:
        return 'ferritin_ng_mL'
    
    # Vitamins and hormones
    if 'vitamin b12' in s or 'b12' in s:
        return 'vitamin_b12_pg_mL'
    if 'vitamin d' in s:
        return 'vitamin_d_ng_mL'
    if 'tsh' in s or 'thyroid stimulating' in s:
        return 'tsh_mIU_L'
    if 'cortisol' in s:
        return 'cortisol_pm_mcg_dL'
    
    # Fallback: try exact match to known model files
    for name in LOADED_MODELS.keys():
        if name in s:
            return name
    
    # Return cleaned parameter name
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
        raw_param_value = other_params.get(param, data.get(param, 0))
        try:
            features[param] = float(raw_param_value)
        except (ValueError, TypeError):
            features[param] = 0.0
    
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
        
        # Convert value to float to ensure numeric comparisons work
        raw_value = data.get('value', 0)
        try:
            value = float(raw_value)
        except (ValueError, TypeError):
            logging.warning(f"Could not convert value '{raw_value}' to float, defaulting to 0")
            value = 0.0
        
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
        
        # Try loading model first
        # Load model
        model, reverse_mapping, saved_feature_names = get_model(normalized_param)
        
        # Check if this is a LightGBM model (SHAP-compatible)
        is_lightgbm = False
        try:
            model_path = MODELS_DIR / f"{normalized_param}_model.joblib"
            if model_path.exists():
                model_data_check = joblib.load(model_path)
                if isinstance(model_data_check, dict):
                    is_lightgbm = model_data_check.get('model_type') == 'LightGBM'
        except:
            pass
        
        logging.info(f"Model type: {'LightGBM (SHAP-compatible)' if is_lightgbm else 'XGBoost (using alternative explainability)'}")
        use_clinical_fallback = False
        
        # Define low-accuracy models that should prefer clinical rules
        LOW_ACCURACY_MODELS = ['wbc_10e9_L', 'platelet_count', 'rdw_percent']
        prefer_clinical = normalized_param in LOW_ACCURACY_MODELS
        
        if model is None or prefer_clinical:
            if model is None:
                logging.warning(f"Model for parameter '{normalized_param}' not found, using clinical rules fallback")
            else:
                logging.warning(f"Model for parameter '{normalized_param}' has low accuracy ({normalized_param}), preferring clinical rules")
            use_clinical_fallback = True
            # We'll use clinical rules instead of returning 404
        
        # Preprocess input for both model and clinical fallback
        features_dict = preprocess_input(data)
        print("==============================================================")
        logging.info(f"Features sent for analysis: {features_dict}")
        print("==============================================================")
        
        # Determine prediction using model or clinical rules
        if use_clinical_fallback:
            # Use clinical rules for classification
            gender = data.get('patientGender', 'Male')
            age = data.get('patientAge', 50)
            try:
                prediction, status_label = classify_by_threshold(value, normalized_param, gender, age)
                confidence = 0.95  # Clinical rules have high confidence
                logging.info(f"Clinical fallback classification: class={prediction}, status={status_label}")
            except Exception as e:
                logging.error(f"Clinical fallback failed: {e}")
                return jsonify({"error": f"No model or clinical rule available for '{normalized_param}'", "original_parameter": parameter}), 404
        else:
            # Use ML model for prediction
            print("==============================================================")
            logging.info(f"Model loaded for: '{normalized_param}' (original: '{parameter}')")
            print("==============================================================")
            
            # Use saved feature names from model if available
            if saved_feature_names:
                expected_features = saved_feature_names
                logging.info(f"Using {len(expected_features)} saved feature names from model")
            else:
                # Fallback: try to get from model itself
                try:
                    expected_features = model.get_booster().feature_names
                except Exception:
                    expected_features = model.feature_names_in_ if hasattr(model, 'feature_names_in_') else list(features_dict.keys())
                logging.warning(f"No saved feature names, using {len(expected_features)} features from model")
            
            # Convert to DataFrame matching training features
            feature_df = pd.DataFrame([features_dict])
            # Reindex to match model's features, fill missing with 0
            X = feature_df.reindex(columns=expected_features, fill_value=0)
            logging.info(f"Feature vector shape: {X.shape} (expected: {len(expected_features)} features)")
            # Predict
            prediction_mapped = model.predict(X)[0]
            
            # Map back to original class if needed (for RBS/HbA1c with classes [0,2,3])
            if reverse_mapping:
                prediction = reverse_mapping[int(prediction_mapped)]
                logging.info(f"Mapped prediction: {prediction_mapped} -> {prediction}")
            else:
                prediction = prediction_mapped
            
            proba = model.predict_proba(X)[0]
            confidence = float(proba[int(prediction_mapped)])  # Use mapped class for probability
            print("=============================================================")
            logging.info(f"Model prediction: class={prediction}, confidence={confidence}")
            print("==============================================================")
        # ==========================================
        # EXPLAINABILITY WITHOUT SHAP
        # ==========================================
        feature_importances = []
        shap_vals = None
        feature_names = list(features_dict.keys()) if use_clinical_fallback else list(X.columns)
        shap_error = None
        individual_contributions = {}  # Store per-feature contributions for this prediction
        decision_path_info = {}  # Store decision tree path information
        
        if use_clinical_fallback:
            logging.info("Skipping explainability computation (clinical fallback mode)")
            feature_importances = []  # Clinical rules don't have feature importances
        else:
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
                # For XGBoost models (not LightGBM), skip SHAP due to base_score bug
                # For LightGBM models, SHAP works perfectly!
                if hasattr(model, 'get_booster') and not is_lightgbm:
                    logging.info("XGBoost model detected - using advanced explainability methods (no SHAP)")
                    shap_values = None
                    shap_error = "XGBoost base_score incompatibility - using alternative explainability"
                    explainer = None
                    explainer_type = None
                    
                    # ==========================================
                    # METHOD 1: Global Feature Importance (Model-wide)
                    # ==========================================
                    global_importances = model.feature_importances_
                    
                    # ==========================================
                    # METHOD 2: Local Feature Contribution (This Prediction)
                    # Using predict_proba to see how features affected THIS prediction
                    # ==========================================
                    try:
                        import numpy as np
                        # Get base prediction (using median of training data as baseline)
                        X_baseline = X.copy()
                        for col in X_baseline.columns:
                            X_baseline[col] = 0  # Use zero as baseline (neutral state)
                        
                        # Get prediction probabilities for actual vs baseline
                        proba_actual = model.predict_proba(X)[0]
                        proba_baseline = model.predict_proba(X_baseline)[0]
                        
                        # Calculate contribution: how much each feature changed the prediction
                        # We'll use a simple perturbation method: set each feature to baseline one at a time
                        for i, feature in enumerate(feature_names):
                            X_perturbed = X.copy()
                            X_perturbed.iloc[0, i] = 0  # Set this feature to baseline
                            proba_perturbed = model.predict_proba(X_perturbed)[0]
                            
                            # Contribution = change in predicted class probability
                            contribution = proba_actual[prediction] - proba_perturbed[prediction]
                            individual_contributions[feature] = float(contribution)
                        
                        logging.info(f"Computed individual feature contributions for {len(individual_contributions)} features")
                    except Exception as e:
                        logging.warning(f"Could not compute individual contributions: {e}")
                        individual_contributions = {}
                    
                    # ==========================================
                    # METHOD 3: Decision Path Analysis (Tree-based)
                    # ==========================================
                    try:
                        booster = model.get_booster()
                        # Get prediction contributions using XGBoost's built-in method
                        # This shows how each feature contributed to moving the prediction from base_score
                        contributions = model.predict(X, pred_contribs=True)
                        
                        if contributions is not None and len(contributions) > 0:
                            # pred_contribs returns [feature_contributions..., bias]
                            # Last value is the bias term
                            feature_contribs = contributions[0][:-1]  # Exclude bias
                            
                            # Store top contributing features
                            contrib_dict = {}
                            for fname, contrib in zip(feature_names, feature_contribs):
                                contrib_dict[fname] = float(contrib)
                            
                            decision_path_info = {
                                'contributions': contrib_dict,
                                'bias': float(contributions[0][-1]) if len(contributions[0]) > len(feature_names) else 0.0,
                                'method': 'XGBoost pred_contribs'
                            }
                            logging.info(f"✅ Computed XGBoost prediction contributions (tree path analysis)")
                        
                    except Exception as e:
                        logging.warning(f"Could not compute decision path: {e}")
                    
                    # Break out of SHAP computation
                    attempts = []
                
                # For LightGBM models, SHAP TreeExplainer works perfectly!
                elif is_lightgbm and is_tree:
                    logging.info("LightGBM model detected - using SHAP TreeExplainer")
                    attempts.append(('TreeExplainer_LightGBM', lambda: shap.TreeExplainer(model)))
                
                # For non-XGBoost models, try explainers
                # Explainer using predict_proba if available
                if hasattr(model, 'predict_proba') and len(attempts) > 0:
                    attempts.append(('PredictProbaExplainer', lambda: shap.Explainer(lambda d: model.predict_proba(d), X[:10] if len(X) >= 10 else X)))
                # Generic explainer using model object
                if len(attempts) > 0:
                    attempts.append(('GenericExplainer', lambda: shap.Explainer(model, X[:10] if len(X) >= 10 else X)))
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
                # Handle both Explanation objects (.values) and raw numpy arrays
                if hasattr(shap_values, 'values'):
                    vals = np.array(shap_values.values)
                else:
                    vals = np.array(shap_values)
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
                
                # Debug: log raw SHAP values with more detail
                print("==============================================================")
                logging.info(f"✅ SHAP VALUES COMPUTED SUCCESSFULLY")
                print("==============================================================")
                logging.info(f"Raw SHAP values (first 10): {class_shap[:10]}")
                logging.info(f"SHAP value range: min={class_shap.min():.6f}, max={class_shap.max():.6f}")
                print("==============================================================")
                logging.info(f"Top SHAP contributors:")
                
                # Create feature importances with detailed logging
                temp_importances = []
                for fname, impact in zip(feature_names, class_shap):
                    if abs(impact) > 0.01:
                        temp_importances.append({
                            "feature": fname,
                            "impact": float(impact),
                            "direction": "increases" if impact > 0 else "decreases"
                        })
                
                # Sort and take top 5
                feature_importances = sorted(temp_importances, key=lambda x: abs(x['impact']), reverse=True)[:5]
                
                # Log each top contributor
                for i, fi in enumerate(feature_importances, 1):
                    logging.info(f"  {i}. {fi['feature']}: {fi['impact']:.4f} ({fi['direction']} prediction)")
                
                print("==============================================================")
                logging.info(f"Feature importances found: {len(feature_importances)} (after filtering > 0.01)")
                print("==============================================================")
                
                # Fallback: if SHAP returns all zeros, use our enhanced explainability methods
                if len(feature_importances) == 0:
                    logging.info("Using alternative explainability methods (no SHAP)")
                    
                    # Priority 1: Use decision path contributions (tree-specific, most accurate)
                    if decision_path_info.get('contributions'):
                        logging.info("Using XGBoost prediction contributions (tree path analysis)")
                        for fname, contrib in decision_path_info['contributions'].items():
                            if abs(contrib) > 0.001:  # Lower threshold for contributions
                                feature_importances.append({
                                    "feature": fname,
                                    "impact": float(contrib),
                                    "direction": "increases" if contrib > 0 else "decreases",
                                    "method": "tree_path"
                                })
                        feature_importances = sorted(feature_importances, key=lambda x: abs(x['impact']), reverse=True)[:10]
                    
                    # Priority 2: Use individual contributions (perturbation-based)
                    elif individual_contributions:
                        logging.info("Using individual feature contributions (perturbation method)")
                        for fname, contrib in individual_contributions.items():
                            if abs(contrib) > 0.01:
                                feature_importances.append({
                                    "feature": fname,
                                    "impact": float(contrib),
                                    "direction": "increases" if contrib > 0 else "decreases",
                                    "method": "perturbation"
                                })
                        feature_importances = sorted(feature_importances, key=lambda x: abs(x['impact']), reverse=True)[:10]
                    
                    # Priority 3: Use global feature importances (model-wide)
                    elif hasattr(model, 'feature_importances_'):
                        logging.info("Using model global feature importances")
                        model_importances = model.feature_importances_
                        for fname, importance in zip(feature_names, model_importances):
                            if importance > 0.01:
                                feature_importances.append({
                                    "feature": fname,
                                    "impact": float(importance),
                                    "direction": "importance",
                                    "method": "global"
                                })
                        feature_importances = sorted(feature_importances, key=lambda x: abs(x['impact']), reverse=True)[:10]
                    
                    logging.info(f"✅ Extracted {len(feature_importances)} feature importances using alternative methods")
            except Exception as inner_e:
                shap_error = f"SHAP parse error: {inner_e}\n{traceback.format_exc()}"
                logging.warning(shap_error)
                feature_importances = []
                shap_vals = None
        
        # Generate medical text with patient data for risk assessments
        interpretation = generate_interpretation(
            parameter_name=parameter,
            value=value,
            prediction_status=int(prediction),
            confidence=confidence,
            feature_importances=feature_importances,
            patient_data=data  # Pass full patient data for risk assessment
        )
        # Add SHAP values and feature names for frontend visualization
        interpretation["shap_values"] = shap_vals
        interpretation["feature_names"] = feature_names
        # Add enhanced explainability information
        if decision_path_info:
            interpretation["decision_path"] = decision_path_info
        if individual_contributions:
            # Send top 10 individual contributions
            top_contributions = sorted(individual_contributions.items(), key=lambda x: abs(x[1]), reverse=True)[:10]
            interpretation["individual_contributions"] = dict(top_contributions)
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
    
    # Log available models at startup
    print("\n=== Available Models ===")
    model_files = list(MODELS_DIR.glob("*_model.joblib"))
    if model_files:
        for model_file in sorted(model_files):
            print(f"  ✓ {model_file.name}")
        print(f"Total: {len(model_files)} models found")
    else:
        print("  ⚠️  No models found!")
    print("=" * 25 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
