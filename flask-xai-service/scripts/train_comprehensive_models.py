"""
Train comprehensive XGBoost models for all blood parameters.
Supports gender-aware thresholds and produces 4-class classification.
FIXED VERSION - handles missing status columns and parameter mappings correctly.
"""
import pandas as pd
import numpy as np
from pathlib import Path
import json
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Paths
ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / 'data'
MODELS_DIR = ROOT / 'models'
MODELS_DIR.mkdir(exist_ok=True)

# FIXED: Comprehensive parameter-to-status mapping
PARAMETER_STATUS_MAP = {
    'hemoglobin_g_dL': 'hemoglobin_status',
    'wbc_10e9_L': 'wbc_status',
    'platelet_count': 'platelet_status',
    'neutrophils_percent': 'neutrophil_status',
    'lymphocytes_percent': 'lymphocyte_status',
    'monocytes_percent': 'monocyte_status',
    'eosinophils_percent': 'eosinophil_status',
    'basophils_percent': 'basophil_status',
    'rdw_percent': 'rdw_status',
    'rbc_count': 'rbc_status',
    'mcv_fL': 'mcv_status',
    'mch_pg': 'mch_status',
    'mchc_g_dL': 'mchc_status',
    'hematocrit_percent': 'hematocrit_status',
    'reticulocyte_count_percent': 'reticulocyte_status',
    'random_blood_sugar_mg_dL': 'rbs_status',
    'hba1c_percent': 'hba1c_status',
    'esr_mm_hr': 'esr_status',
    'crp_mg_L': 'crp_status',
    'serum_creatinine_mg_dL': 'creatinine_status',
    'serum_iron_mcg_dL': 'serum_iron_status',
    'tibc_mcg_dL': 'tibc_status',
    'transferrin_saturation_percent': 'transferrin_saturation_status',
    'ferritin_ng_mL': 'ferritin_status',
    'vitamin_b12_pg_mL': 'vitamin_b12_status',
    'vitamin_d_ng_mL': 'vitamin_d_status',
    'tsh_mIU_L': 'tsh_status',
    'cortisol_pm_mcg_dL': 'cortisol_status',
    'neutrophils_abs': 'neutrophil_abs_status',
    'lymphocytes_abs': 'lymphocyte_abs_status',
    'monocytes_abs': 'monocyte_abs_status',
}

# Feature sets for training
DEMOGRAPHIC_FEATURES = ['patientAge', 'patientWeight_kg']
RISK_FEATURES = ['diabetic', 'pregnant', 'hypertension', 'smoking', 'alcohol_use']
GENDER_FEATURES = ['gender_Female', 'gender_Male', 'gender_Other']
REGION_FEATURES = ['region_North', 'region_South', 'region_East', 'region_West', 
                   'region_Central', 'region_Urban', 'region_Rural']
AGE_GROUP_FEATURES = ['age_young', 'age_middle', 'age_senior', 'age_elderly']

def load_data():
    """Load training and holdout datasets."""
    print("Loading datasets...")
    train_df = pd.read_csv(DATA_DIR / 'comprehensive_training.csv')
    holdout_df = pd.read_csv(DATA_DIR / 'comprehensive_holdout.csv')
    print(f"Training: {len(train_df)} samples")
    print(f"Holdout: {len(holdout_df)} samples")
    print(f"Training columns: {list(train_df.columns)}")
    return train_df, holdout_df

def prepare_features(df):
    """Engineer features for model training."""
    # Gender encoding
    df['gender_Female'] = (df['patientGender'] == 'Female').astype(int)
    df['gender_Male'] = (df['patientGender'] == 'Male').astype(int)
    df['gender_Other'] = (df['patientGender'] == 'Other').astype(int)
    
    # Region encoding - handle missing region column
    if 'region' in df.columns:
        for region in ['North', 'South', 'East', 'West', 'Central', 'Urban', 'Rural']:
            df[f'region_{region}'] = (df['region'] == region).astype(int)
    else:
        print("⚠ Warning: 'region' column not found, using default region features")
        for region in ['North', 'South', 'East', 'West', 'Central', 'Urban', 'Rural']:
            df[f'region_{region}'] = 0
    
    # Age group encoding
    df['age_young'] = (df['patientAge'] < 30).astype(int)
    df['age_middle'] = ((df['patientAge'] >= 30) & (df['patientAge'] < 50)).astype(int)
    df['age_senior'] = ((df['patientAge'] >= 50) & (df['patientAge'] < 65)).astype(int)
    df['age_elderly'] = (df['patientAge'] >= 65).astype(int)
    
    # NLR ratio - with safe division
    if 'neutrophils_abs' in df.columns and 'lymphocytes_abs' in df.columns:
        df['neutrophil_lymphocyte_ratio'] = df.apply(
            lambda row: row['neutrophils_abs'] / row['lymphocytes_abs'] 
            if row['lymphocytes_abs'] > 0 else 0, axis=1
        )
    else:
        df['neutrophil_lymphocyte_ratio'] = 0
    
    return df

def get_relevant_features(parameter_name, all_features):
    """Select relevant features for a specific parameter model."""
    # Always include demographics and risk factors
    base_features = (DEMOGRAPHIC_FEATURES + RISK_FEATURES + 
                     GENDER_FEATURES + REGION_FEATURES + AGE_GROUP_FEATURES)
    
    # Add blood parameter features (correlated parameters)
    blood_params = [col for col in all_features 
                   if col.endswith(('_g_dL', '_10e9_L', '_count', '_percent', '_fL', '_pg',
                                   '_mg_dL', '_mcg_dL', '_ng_mL', '_mIU_L', '_mm_hr', '_mg_L'))
                   and col != parameter_name  # Don't include target parameter as feature
                   and not col.endswith('_status')  # Don't include status columns
                   and not col.endswith('_zscore')  # Don't include z-scores
                   and not col.endswith('_outlier')]  # Don't include outlier flags
    
    # Add derived features
    derived = [col for col in all_features 
              if 'neutrophil_lymphocyte_ratio' in col]
    
    selected_features = base_features + blood_params + derived
    
    # Filter to only existing features in the dataset
    existing_features = [f for f in selected_features if f in all_features]
    
    return existing_features

def train_parameter_model(param_name, train_df, holdout_df, label_col):
    """Train XGBoost model for a specific parameter."""
    print(f"\n{'='*70}")
    print(f"Training model: {param_name}")
    print(f"Target column: {label_col}")
    print(f"{'='*70}")
    
    # Get features
    all_features = [col for col in train_df.columns 
                   if col not in ['sample_id', 'source', 'patientGender', 'region']]
    feature_cols = get_relevant_features(param_name, all_features)
    
    print(f"Selected {len(feature_cols)} features for training")
    
    # Prepare training data
    X_train = train_df[feature_cols].copy()
    y_train = train_df[label_col].copy()
    
    # Handle missing values
    X_train = X_train.fillna(X_train.median())
    
    # Remove any rows with missing target
    valid_mask = ~y_train.isna()
    X_train = X_train[valid_mask]
    y_train = y_train[valid_mask]
    
    # Check class distribution
    class_dist = y_train.value_counts().sort_index()
    print(f"Training class distribution:\n{class_dist}")
    
    # Skip if insufficient data for any class
    if len(class_dist) < 2:
        print(f"⚠️  Skipping {param_name}: insufficient classes")
        return None
    
    # Handle non-contiguous class labels (e.g., [0,2,3] for RBS/HbA1c)
    unique_classes = sorted(y_train.unique())
    if unique_classes != list(range(len(unique_classes))):
        print(f"⚠️  Non-contiguous classes detected: {unique_classes}")
        print(f"   Remapping to contiguous: {list(range(len(unique_classes)))}")
        class_mapping = {old: new for new, old in enumerate(unique_classes)}
        reverse_mapping = {new: old for old, new in class_mapping.items()}
        y_train_mapped = y_train.map(class_mapping)
        print(f"   Class mapping: {class_mapping}")
    else:
        y_train_mapped = y_train
        reverse_mapping = None
    
    # Train model
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        use_label_encoder=False,
        eval_metric='mlogloss',
        tree_method='hist',
        enable_categorical=False,
        base_score=0.5  # CRITICAL: Force scalar base_score to prevent SHAP errors
    )
    
    # Compute median BEFORE converting to numpy array (needed for holdout imputation)
    X_train_median = X_train.median()
    
    # Ensure all data is numeric
    X_train = X_train.astype(np.float64)
    y_train_mapped = y_train_mapped.astype(np.int32)
    
    # Force contiguous memory layout
    X_train = np.ascontiguousarray(X_train)
    y_train_mapped = np.ascontiguousarray(y_train_mapped)
    
    print("Training model...")
    model.fit(X_train, y_train_mapped)
    
    # CRITICAL FIX: Force booster's base_score to scalar for SHAP compatibility
    # XGBoost stores base_score as string array "[5E-1,5E-1,5E-1,5E-1]" for multi-class
    # This causes SHAP TreeExplainer to fail with "could not convert string to float"
    # Solution: Manually override the booster config to use scalar 0.5
    import json
    booster = model.get_booster()
    config = json.loads(booster.save_config())
    config['learner']['learner_model_param']['base_score'] = '0.5'
    booster.load_config(json.dumps(config))
    print("Fixed base_score in booster config for SHAP compatibility")
    
    # Warm-up prediction to ensure proper data types
    _ = model.predict_proba(X_train[:min(100, len(X_train))])
    
    # Evaluate on training set
    y_train_pred_mapped = model.predict(X_train)
    if reverse_mapping:
        y_train_pred = pd.Series(y_train_pred_mapped).map(reverse_mapping)
    else:
        y_train_pred = y_train_pred_mapped
    train_acc = accuracy_score(y_train, y_train_pred)
    print(f"Training accuracy: {train_acc:.4f}")
    
    # Evaluate on holdout set
    X_holdout = holdout_df[feature_cols].copy()
    y_holdout = holdout_df[label_col].copy()
    
    # Handle missing values in holdout using training set median
    X_holdout = X_holdout.fillna(X_train_median)
    
    # Remove missing targets
    valid_holdout = ~y_holdout.isna()
    X_holdout = X_holdout[valid_holdout]
    y_holdout = y_holdout[valid_holdout]
    
    X_holdout = X_holdout.astype(np.float64)
    X_holdout = np.ascontiguousarray(X_holdout)
    
    # Map holdout labels if needed
    if reverse_mapping:
        y_holdout_mapped = y_holdout.map(class_mapping)
        y_holdout_pred_mapped = model.predict(X_holdout)
        y_holdout_pred = pd.Series(y_holdout_pred_mapped).map(reverse_mapping)
    else:
        y_holdout_mapped = y_holdout
        y_holdout_pred_mapped = model.predict(X_holdout)
        y_holdout_pred = y_holdout_pred_mapped
    
    holdout_acc = accuracy_score(y_holdout, y_holdout_pred)
    print(f"Holdout accuracy: {holdout_acc:.4f}")
    
    # Classification report
    print("\nHoldout Classification Report:")
    print(classification_report(y_holdout, y_holdout_pred, 
                                labels=sorted(y_holdout.unique()),
                                target_names=[f"Class {i}" for i in sorted(y_holdout.unique())],
                                zero_division=0))
    
    # Confusion matrix
    print("Confusion Matrix:")
    print(confusion_matrix(y_holdout, y_holdout_pred, labels=sorted(y_holdout.unique())))
    
    # Save model
    model_filename = f"{param_name.replace('_g_dL', '').replace('_10e9_L', '').replace('_count', '').replace('_percent', '').replace('_mg_dL', '').replace('_mcg_dL', '').replace('_ng_mL', '').replace('_mIU_L', '').replace('_mm_hr', '').replace('_mg_L', '').replace('_fL', '').replace('_pg', '')}_model.joblib"
    model_path = MODELS_DIR / model_filename
    
    model_data = {
        'model': model,
        'reverse_mapping': reverse_mapping,
        'original_classes': sorted(y_train.unique().tolist()),
        'feature_names': feature_cols
    }
    joblib.dump(model_data, model_path, compress=3, protocol=4)
    print(f"[OK] Saved: {model_path.name}")
    
    return {
        'parameter': param_name,
        'model_file': model_filename,
        'features_count': len(feature_cols),
        'train_accuracy': float(train_acc),
        'holdout_accuracy': float(holdout_acc),
        'classes': sorted(y_train.unique().tolist()),
        'class_distribution': class_dist.to_dict(),
        'has_class_mapping': reverse_mapping is not None
    }

def main():
    """Main training pipeline."""
    print("="*70)
    print("COMPREHENSIVE MODEL TRAINING")
    print("="*70)
    print(f"Started: {datetime.now()}")
    
    # Load data
    train_df, holdout_df = load_data()
    
    # Prepare features
    train_df = prepare_features(train_df)
    holdout_df = prepare_features(holdout_df)
    
    # Determine which parameters to train based on available status columns
    available_status_cols = [col for col in train_df.columns if col.endswith('_status')]
    print(f"\nFound {len(available_status_cols)} status columns: {available_status_cols}")
    
    # Build parameter list from available status columns
    parameters_to_train = []
    for param, status_col in PARAMETER_STATUS_MAP.items():
        if status_col in train_df.columns:
            parameters_to_train.append((param, status_col))
    
    print(f"\nTraining models for {len(parameters_to_train)} parameters")
    
    # Train models
    results = []
    successful = 0
    failed = 0
    
    for param, label_col in parameters_to_train:
        try:
            result = train_parameter_model(param, train_df, holdout_df, label_col)
            if result:
                results.append(result)
                successful += 1
        except Exception as e:
            print(f"\n❌ Error training {param}: {e}")
            import traceback
            traceback.print_exc()
            failed += 1
    
    # Save training report
    report = {
        'timestamp': str(datetime.now()),
        'models_trained': successful,
        'models_failed': failed,
        'total_parameters': len(parameters_to_train),
        'results': results
    }
    
    report_path = MODELS_DIR / 'comprehensive_training_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "="*70)
    print("TRAINING COMPLETE")
    print("="*70)
    print(f"[OK] Successful: {successful} models")
    print(f"[X] Failed: {failed} models")
    print(f"Report saved: {report_path.name}")
    print(f"Finished: {datetime.now()}")

if __name__ == '__main__':
    main()