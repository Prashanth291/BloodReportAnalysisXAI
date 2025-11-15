"""
Train comprehensive XGBoost models for all 79 blood parameters.
Supports gender-aware thresholds and produces 4-class classification.
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

# Parameters to train models for (30+ parameters with status columns)
PARAMETERS_TO_TRAIN = [
    'hemoglobin_g_dL',
    'wbc_10e9_L',
    'platelet_count',
    'neutrophils_percent',
    'lymphocytes_percent',
    'rdw_percent',
    'rbc_count',
    'mcv_fL',
    'mch_pg',
    'mchc_g_dL',
    'monocytes_percent',
    'eosinophils_percent',
    'basophils_percent',
    'reticulocyte_count_percent',
    'random_blood_sugar_mg_dL',
    'hba1c_percent',
    'esr_mm_hr',
    'crp_mg_L',
    'serum_creatinine_mg_dL',
    'serum_iron_mcg_dL',
    'tibc_mcg_dL',
    'transferrin_saturation_percent',
    'ferritin_ng_mL',
    'vitamin_b12_pg_mL',
    'vitamin_d_ng_mL',
    'tsh_mIU_L',
    'cortisol_pm_mcg_dL',
    'neutrophils_abs',
    'lymphocytes_abs',
    'monocytes_abs',
]

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
    return train_df, holdout_df

def prepare_features(df):
    """Engineer features for model training."""
    # Gender encoding
    df['gender_Female'] = (df['patientGender'] == 'Female').astype(int)
    df['gender_Male'] = (df['patientGender'] == 'Male').astype(int)
    df['gender_Other'] = (df['patientGender'] == 'Other').astype(int)
    
    # Region encoding
    for region in ['North', 'South', 'East', 'West', 'Central', 'Urban', 'Rural']:
        df[f'region_{region}'] = (df['region'] == region).astype(int)
    
    # Age group encoding
    df['age_young'] = (df['patientAge'] < 30).astype(int)
    df['age_middle'] = ((df['patientAge'] >= 30) & (df['patientAge'] < 50)).astype(int)
    df['age_senior'] = ((df['patientAge'] >= 50) & (df['patientAge'] < 65)).astype(int)
    df['age_elderly'] = (df['patientAge'] >= 65).astype(int)
    
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
    
    return base_features + blood_params + derived

def train_parameter_model(param_name, train_df, holdout_df, label_col):
    """Train XGBoost model for a specific parameter."""
    print(f"\n{'='*70}")
    print(f"Training model: {param_name}")
    print(f"{'='*70}")
    
    # Get features
    all_features = [col for col in train_df.columns 
                   if col not in ['sample_id', 'source', 'patientGender', 'region']]
    feature_cols = get_relevant_features(param_name, all_features)
    
    # Prepare training data
    X_train = train_df[feature_cols].copy()
    y_train = train_df[label_col].copy()
    
    # Handle missing values
    X_train = X_train.fillna(X_train.median())
    
    # Check class distribution
    class_dist = y_train.value_counts().sort_index()
    print(f"Training class distribution:\n{class_dist}")
    
    # Skip if insufficient data for any class
    if len(class_dist) < 2:
        print(f"⚠️  Skipping {param_name}: insufficient classes")
        return None
    
    # Handle non-contiguous class labels (e.g., [0,2,3] for RBS/HbA1c)
    # XGBoost expects classes to be 0,1,2,... so we need to remap
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
        tree_method='hist'
    )
    
    print("Training model...")
    model.fit(X_train, y_train_mapped)
    
    # Evaluate on training set
    y_train_pred_mapped = model.predict(X_train)
    # Map back to original classes if needed
    if reverse_mapping:
        y_train_pred = pd.Series(y_train_pred_mapped).map(reverse_mapping)
    else:
        y_train_pred = y_train_pred_mapped
    train_acc = accuracy_score(y_train, y_train_pred)
    print(f"Training accuracy: {train_acc:.4f}")
    
    # Evaluate on holdout set
    X_holdout = holdout_df[feature_cols].copy()
    y_holdout = holdout_df[label_col].copy()
    X_holdout = X_holdout.fillna(X_train.median())
    
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
    
    # Classification report (use original class labels)
    print("\nHoldout Classification Report:")
    print(classification_report(y_holdout, y_holdout_pred, 
                                labels=sorted(y_holdout.unique()),
                                target_names=[f"Class {i}" for i in sorted(y_holdout.unique())],
                                zero_division=0))
    
    # Confusion matrix
    print("Confusion Matrix:")
    print(confusion_matrix(y_holdout, y_holdout_pred, labels=sorted(y_holdout.unique())))
    
    # Save model with class mapping if needed
    model_filename = f"{param_name.replace('_g_dL', '').replace('_10e9_L', '').replace('_count', '').replace('_percent', '').replace('_mg_dL', '').replace('_mcg_dL', '').replace('_ng_mL', '').replace('_mIU_L', '').replace('_mm_hr', '').replace('_mg_L', '').replace('_fL', '').replace('_pg', '')}_model.joblib"
    model_path = MODELS_DIR / model_filename
    
    # Save both model and class mapping
    model_data = {
        'model': model,
        'reverse_mapping': reverse_mapping,  # Maps predicted (0,1,2) back to original (0,2,3)
        'original_classes': sorted(y_train.unique().tolist())
    }
    joblib.dump(model_data, model_path)
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
    
    # Train models
    results = []
    successful = 0
    failed = 0
    
    for param in PARAMETERS_TO_TRAIN:
        # Determine status column name
        if param == 'hemoglobin_g_dL':
            label_col = 'hemoglobin_status'
        elif param == 'wbc_10e9_L':
            label_col = 'wbc_status'
        elif param == 'platelet_count':
            label_col = 'platelet_status'
        elif param == 'neutrophils_percent':
            label_col = 'neutrophil_status'
        elif param == 'lymphocytes_percent':
            label_col = 'lymphocyte_status'
        elif param == 'rdw_percent':
            label_col = 'rdw_status'
        elif param == 'random_blood_sugar_mg_dL':
            label_col = 'rbs_status'
        elif param == 'hba1c_percent':
            label_col = 'hba1c_status'
        elif param == 'serum_creatinine_mg_dL':
            label_col = 'creatinine_status'
        elif param == 'esr_mm_hr':
            label_col = 'esr_status'
        elif param == 'crp_mg_L':
            label_col = 'crp_status'
        else:
            # Skip parameters without explicit status columns
            print(f"\n⚠️  No status column for {param}, skipping model training")
            continue
        
        # Check if status column exists
        if label_col not in train_df.columns:
            print(f"\n⚠️  Status column {label_col} not found, skipping {param}")
            failed += 1
            continue
        
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
        'total_parameters': len(PARAMETERS_TO_TRAIN),
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
