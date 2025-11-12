"""
Proper training script for blood parameter models with:
- Train/test split
- Proper feature engineering
- SHAP explainer training
- Performance metrics
- Training report generation
"""
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
import shap
import json
from datetime import datetime

# Configuration
PARAMETER_MAP = {
    'hemoglobin': {'feature': 'hemoglobin_g_dL', 'status': 'hemoglobin_status'},
    'wbc': {'feature': 'wbc_10e9_L', 'status': 'wbc_status'},
    'platelet': {'feature': 'platelet_count', 'status': 'platelet_status'},
    'rdw': {'feature': 'rdw_percent', 'status': 'rdw_status'},
    'neutrophil': {'feature': 'neutrophils_percent', 'status': 'neutrophil_status'},
    'lymphocyte': {'feature': 'lymphocytes_percent', 'status': 'lymphocyte_status'},
    'rbc': {'feature': 'rbc_count', 'status': 'rbc_status'},
    'mcv': {'feature': 'mcv_fL', 'status': 'mcv_status'},
    'mch': {'feature': 'mch_pg', 'status': 'mch_status'},
    'mchc': {'feature': 'mchc_g_dL', 'status': 'mchc_status'},
    'monocyte': {'feature': 'monocytes_percent', 'status': 'monocytes_status'},
    'eosinophil': {'feature': 'eosinophils_percent', 'status': 'eosinophils_status'},
    'basophil': {'feature': 'basophils_percent', 'status': 'basophils_status'},
}

DATA_PATH = Path(__file__).parent / 'data' / 'processed_cbc_training_complete.csv'
MODEL_DIR = Path(__file__).parent / 'models'
MODEL_DIR.mkdir(exist_ok=True)

# XGBoost hyperparameters for better performance
XGB_PARAMS = {
    'n_estimators': 100,
    'max_depth': 6,
    'learning_rate': 0.1,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'eval_metric': 'mlogloss',
    'random_state': 42,
    'n_jobs': -1
}

print("="*60)
print("BLOOD PARAMETER MODEL TRAINING")
print("="*60)
print(f"Dataset: {DATA_PATH}")
print(f"Loading data...")

# Load data
df = pd.read_csv(DATA_PATH)
print(f"Dataset shape: {df.shape}")
print(f"Total samples: {len(df):,}")

# Prepare features to exclude from training
exclude_cols = ['overall_health_risk']  # Don't use this as a feature
status_cols = [v['status'] for v in PARAMETER_MAP.values()]
exclude_cols.extend(status_cols)

# Get all numeric columns for features
numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
base_features = [col for col in numeric_cols if col not in exclude_cols]

print(f"Base features: {len(base_features)}")
print("="*60)

# Training results
training_results = []
training_report = []

for param_name, param_info in PARAMETER_MAP.items():
    feature_col = param_info['feature']
    status_col = param_info['status']
    
    if status_col not in df.columns:
        print(f"❌ SKIP: {param_name} - Missing status column '{status_col}'")
        continue
    
    print(f"\n🔧 Training: {param_name.upper()}")
    print(f"   Feature: {feature_col}")
    print(f"   Target: {status_col}")
    
    # Prepare features (include the parameter value itself)
    feature_list = base_features.copy()
    
    # Prepare data
    X = df[feature_list].copy()
    y = df[status_col].copy()
    
    # Handle missing values
    X = X.fillna(0)
    
    # Check if we have enough classes for classification
    unique_classes = sorted(y.unique())
    if len(unique_classes) < 2:
        print(f"   ⚠ SKIP: Only {len(unique_classes)} class found (need at least 2 for classification)")
        continue
    
    # Relabel classes to start from 0 (XGBoost requirement)
    if unique_classes[0] != 0:
        class_mapping = {old: new for new, old in enumerate(unique_classes)}
        y = y.map(class_mapping)
        print(f"   Relabeled classes: {unique_classes} -> {list(range(len(unique_classes)))}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"   Train samples: {len(X_train):,}")
    print(f"   Test samples: {len(X_test):,}")
    print(f"   Classes: {sorted(y.unique().tolist())}")
    
    # Train model
    print(f"   Training XGBoost model...")
    model = XGBClassifier(**XGB_PARAMS)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    train_acc = accuracy_score(y_train, y_train_pred)
    test_acc = accuracy_score(y_test, y_test_pred)
    train_f1 = f1_score(y_train, y_train_pred, average='weighted')
    test_f1 = f1_score(y_test, y_test_pred, average='weighted')
    
    print(f"   ✓ Train Accuracy: {train_acc:.4f}, F1: {train_f1:.4f}")
    print(f"   ✓ Test Accuracy:  {test_acc:.4f}, F1: {test_f1:.4f}")
    
    # Save model
    model_path = MODEL_DIR / f"{param_name}_model.joblib"
    joblib.dump(model, model_path)
    print(f"   ✓ Model saved: {model_path.name}")
    
    # Train SHAP explainer (using a sample for speed)
    print(f"   Training SHAP explainer...")
    try:
        # Use a small sample for SHAP training (faster)
        sample_size = min(1000, len(X_train))
        X_sample = X_train.sample(n=sample_size, random_state=42)
        
        # Try TreeExplainer first (fastest for XGBoost)
        explainer = shap.TreeExplainer(model)
        
        # Test it works
        shap_test = explainer.shap_values(X_test.iloc[:5])
        
        explainer_path = MODEL_DIR / f"{param_name}_explainer.joblib"
        joblib.dump(explainer, explainer_path)
        print(f"   ✓ SHAP explainer saved: {explainer_path.name}")
    except Exception as e:
        print(f"   ⚠ SHAP explainer failed: {e}")
    
    # Store results
    training_results.append({
        'parameter': param_name,
        'feature': feature_col,
        'status': status_col,
        'train_acc': float(train_acc),
        'test_acc': float(test_acc),
        'train_f1': float(train_f1),
        'test_f1': float(test_f1),
        'n_features': len(feature_list),
        'n_classes': len(y.unique()),
        'train_samples': len(X_train),
        'test_samples': len(X_test),
    })
    
    # Report text
    training_report.append(f"""
Parameter: {status_col}
  Train Acc: {train_acc:.4f}, F1: {train_f1:.4f}
  Test Acc: {test_acc:.4f}, F1: {test_f1:.4f}
  Features: {len(feature_list)}, Classes: {sorted(y.unique().tolist())}
""")

# Save training results as JSON
results_path = MODEL_DIR / 'training_results.json'
with open(results_path, 'w') as f:
    json.dump({
        'timestamp': datetime.now().isoformat(),
        'dataset': str(DATA_PATH),
        'total_samples': len(df),
        'results': training_results
    }, f, indent=2)

# Save training report as text
report_path = MODEL_DIR / 'training_report.txt'
with open(report_path, 'w') as f:
    f.write("="*60 + "\n")
    f.write("TRAINING SUMMARY\n")
    f.write("="*60 + "\n")
    for line in training_report:
        f.write(line)

print("\n" + "="*60)
print("✅ TRAINING COMPLETE!")
print(f"✓ Trained {len(training_results)} models")
print(f"✓ Results saved: {results_path.name}")
print(f"✓ Report saved: {report_path.name}")
print("="*60)

# Summary table
print("\nMODEL PERFORMANCE SUMMARY:")
print("-"*60)
print(f"{'Parameter':<15} {'Test Acc':<12} {'Test F1':<12} {'Classes':<8}")
print("-"*60)
for result in training_results:
    print(f"{result['parameter']:<15} {result['test_acc']:<12.4f} {result['test_f1']:<12.4f} {result['n_classes']:<8}")
print("-"*60)
