"""
Train models using LightGBM (SHAP-compatible alternative to XGBoost)
This solves the base_score string array bug that prevents SHAP from working
"""

import pandas as pd
import numpy as np
from pathlib import Path
import json
from datetime import datetime
from lightgbm import LGBMClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import warnings
warnings.filterwarnings('ignore')

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / 'data'
MODELS_DIR = BASE_DIR / 'models'
MODELS_DIR.mkdir(exist_ok=True)

# Dataset paths
TRAINING_DATA = DATA_DIR / 'comprehensive_training.csv'
HOLDOUT_DATA = DATA_DIR / 'comprehensive_holdout.csv'

# Parameters to train
PARAMETERS_TO_TRAIN = [
    ('hemoglobin_g_dL', 'hemoglobin_status'),
    ('wbc_10e9_L', 'wbc_status'),
    ('platelet_count', 'platelet_status'),
    ('neutrophils_percent', 'neutrophil_status'),
    ('lymphocytes_percent', 'lymphocyte_status'),
    ('rdw_percent', 'rdw_status'),
    ('random_blood_sugar_mg_dL', 'rbs_status'),
    ('hba1c_percent', 'hba1c_status'),
    ('esr_mm_hr', 'esr_status'),
    ('crp_mg_L', 'crp_status'),
    ('serum_creatinine_mg_dL', 'creatinine_status'),
]

# Features to use (50 features matching XGBoost models)
FEATURE_COLUMNS = [
    'patientAge', 'diabetic', 'pregnant',
    'gender_Female', 'gender_Male', 'gender_Other',
    'region_North', 'region_South', 'region_East', 'region_West', 'region_Central',
    'region_Urban', 'region_Rural', 'region_Unknown',
    'age_young', 'age_middle', 'age_senior', 'age_elderly',
    'hemoglobin_g_dL', 'wbc_10e9_L', 'platelet_count', 'rdw_percent',
    'neutrophils_percent', 'lymphocytes_percent', 'monocytes_percent',
    'eosinophils_percent', 'basophils_percent', 'rbc_count',
    'mcv_fL', 'mch_pg', 'mchc_g_dL',
    'neutrophils_abs', 'lymphocytes_abs', 'monocytes_abs',
    'hemoglobin_g_dL_zscore', 'wbc_10e9_L_zscore', 'platelet_count_zscore',
    'nlr', 'hemoglobin_g_dL_outlier', 'wbc_10e9_L_outlier', 'platelet_count_outlier',
    'patientWeight_kg', 'neutrophil_lymphocyte_ratio'
]

def train_lightgbm_model(param_name, label_col, training_df, holdout_df):
    """Train LightGBM model for a parameter"""
    print(f"\n{'='*70}")
    print(f"Training model: {param_name}")
    print(f"Target column: {label_col}")
    print(f"{'='*70}")
    
    # Prepare features
    feature_cols = [col for col in FEATURE_COLUMNS if col in training_df.columns and col != param_name]
    print(f"Selected {len(feature_cols)} features for training")
    
    X_train = training_df[feature_cols].copy()
    y_train = training_df[label_col].copy()
    
    # Remove missing targets
    valid_train = ~y_train.isna()
    X_train = X_train[valid_train]
    y_train = y_train[valid_train]
    
    # Check class distribution
    print(f"Training class distribution:\n{y_train.value_counts()}")
    
    # Handle non-contiguous class labels
    unique_classes = sorted(y_train.unique())
    if list(unique_classes) != list(range(len(unique_classes))):
        print(f"⚠️  Non-contiguous classes detected: {unique_classes}")
        class_mapping = {old_class: new_class for new_class, old_class in enumerate(unique_classes)}
        reverse_mapping = {new_class: old_class for old_class, new_class in class_mapping.items()}
        y_train_mapped = y_train.map(class_mapping)
        print(f"   Remapping to contiguous: {list(range(len(unique_classes)))}")
        print(f"   Class mapping: {class_mapping}")
    else:
        y_train_mapped = y_train
        reverse_mapping = None
    
    # Train LightGBM model
    model = LGBMClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=-1,  # Suppress warnings
        force_col_wise=True  # Faster training
    )
    
    # Compute median BEFORE converting to numpy array
    X_train_median = X_train.median()
    
    # Ensure all data is numeric
    X_train = X_train.astype(np.float64)
    y_train_mapped = y_train_mapped.astype(np.int32)
    
    # Force contiguous memory layout
    X_train = np.ascontiguousarray(X_train)
    y_train_mapped = np.ascontiguousarray(y_train_mapped)
    
    print("Training model...")
    model.fit(X_train, y_train_mapped)
    
    # Warm-up prediction
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
                                target_names=[f'Class {c}' for c in unique_classes],
                                zero_division=0))
    
    print("Confusion Matrix:")
    print(confusion_matrix(y_holdout, y_holdout_pred))
    
    # Save model with metadata
    model_data = {
        'model': model,
        'feature_names': feature_cols,
        'reverse_mapping': reverse_mapping,
        'original_classes': unique_classes,
        'model_type': 'LightGBM'  # Mark as LightGBM for SHAP compatibility
    }
    
    model_filename = f"{param_name.replace('_', '_').lower()}_model.joblib"
    model_path = MODELS_DIR / model_filename
    joblib.dump(model_data, model_path, compress=3, protocol=4)
    print(f"[OK] Saved: {model_filename}")
    
    return {
        'parameter': param_name,
        'target_column': label_col,
        'train_accuracy': float(train_acc),
        'holdout_accuracy': float(holdout_acc),
        'classes': [int(c) for c in unique_classes],
        'features_count': len(feature_cols),
        'has_class_mapping': reverse_mapping is not None,
        'model_type': 'LightGBM'
    }

def main():
    print("="*70)
    print("LIGHTGBM MODEL TRAINING (SHAP-COMPATIBLE)")
    print("="*70)
    print(f"Started: {datetime.now()}")
    
    # Load datasets
    print("Loading datasets...")
    training_df = pd.read_csv(TRAINING_DATA)
    holdout_df = pd.read_csv(HOLDOUT_DATA)
    
    print(f"Training: {len(training_df)} samples")
    print(f"Holdout: {len(holdout_df)} samples")
    print(f"Training columns: {list(training_df.columns)}\n")
    
    # Find status columns
    status_cols = [col for col in training_df.columns if col.endswith('_status')]
    print(f"Found {len(status_cols)} status columns: {status_cols}\n")
    
    print(f"Training models for {len(PARAMETERS_TO_TRAIN)} parameters\n")
    
    # Train all models
    results = []
    failed = []
    
    for param_name, label_col in PARAMETERS_TO_TRAIN:
        try:
            result = train_lightgbm_model(param_name, label_col, training_df, holdout_df)
            results.append(result)
        except Exception as e:
            print(f"[ERROR] Failed to train {param_name}: {e}")
            failed.append({'parameter': param_name, 'error': str(e)})
    
    # Save training report
    report = {
        'timestamp': str(datetime.now()),
        'models_trained': len(results),
        'models_failed': len(failed),
        'results': results,
        'failed': failed,
        'model_library': 'LightGBM',
        'shap_compatible': True
    }
    
    report_path = BASE_DIR / 'lightgbm_training_report.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "="*70)
    print("TRAINING COMPLETE")
    print("="*70)
    print(f"[OK] Successful: {len(results)} models")
    print(f"[X] Failed: {len(failed)} models")
    print(f"Report saved: {report_path}")
    print(f"Finished: {datetime.now()}")

if __name__ == '__main__':
    main()
