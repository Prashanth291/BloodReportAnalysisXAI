"""
Train per-parameter XGBoost models with SHAP explainers.
Loads features_train.parquet and trains one classifier per CBC parameter target.

Outputs:
 - ../models/<parameter>_model.joblib
 - ../models/<parameter>_explainer.joblib
 - ../models/training_report.txt

Run:
    python scripts/train_cbc_models.py
"""
from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score
import shap

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"

PARAMETERS_TO_TRAIN = [
    'hemoglobin_status',
    'wbc_status',
    'platelet_status',
    'neutrophil_status',
    'lymphocyte_status',
    'rdw_status'
]

def train_model_for_parameter(param_name, X_train, y_train, X_test, y_test):
    """Train XGBoost classifier for a single parameter."""
    print(f"\n{'='*60}")
    print(f"Training model for: {param_name}")
    print(f"{'='*60}")
    
    # Check class distribution
    unique_classes = np.unique(y_train)
    print(f"Classes in training: {unique_classes}")
    print(f"Class distribution: {pd.Series(y_train).value_counts().to_dict()}")
    
    # Calculate scale_pos_weight for imbalanced classes
    class_counts = pd.Series(y_train).value_counts()
    max_count = class_counts.max()
    scale_weights = {cls: max_count / count for cls, count in class_counts.items()}
    
    # Train XGBoost classifier
    # Use softprob for SHAP compatibility
    model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        objective='multi:softprob',
        num_class=len(unique_classes),
        random_state=42,
        n_jobs=-1,
        eval_metric='mlogloss',
        use_label_encoder=False
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    train_acc = accuracy_score(y_train, y_pred_train)
    test_acc = accuracy_score(y_test, y_pred_test)
    
    train_f1 = f1_score(y_train, y_pred_train, average='weighted')
    test_f1 = f1_score(y_test, y_pred_test, average='weighted')
    
    print(f"\nTrain Accuracy: {train_acc:.4f}, F1: {train_f1:.4f}")
    print(f"Test Accuracy: {test_acc:.4f}, F1: {test_f1:.4f}")
    
    # Classification report
    print(f"\nTest Classification Report:")
    print(classification_report(y_test, y_pred_test, zero_division=0))
    
    # Create SHAP explainer using the booster for multi-class compatibility
    print(f"Creating SHAP explainer...")
    try:
        # Use get_booster() method and TreeExplainer
        explainer = shap.TreeExplainer(model.get_booster())
        
        # Test SHAP on a small sample
        sample_X = X_test[:10]
        shap_values = explainer.shap_values(sample_X.values if hasattr(sample_X, 'values') else sample_X)
        print(f"SHAP values shape: {np.array(shap_values).shape if isinstance(shap_values, list) else shap_values.shape}")
    except Exception as e:
        print(f"Error creating SHAP explainer: {e}")
        print(f"Falling back to saving model without explainer for now.")
        explainer = None
    
    # Save model and explainer
    model_path = MODELS_DIR / f"{param_name.replace('_status', '')}_model.joblib"
    explainer_path = MODELS_DIR / f"{param_name.replace('_status', '')}_explainer.joblib"
    
    joblib.dump(model, model_path)
    joblib.dump(explainer, explainer_path)
    
    print(f"Saved: {model_path}")
    print(f"Saved: {explainer_path}")
    
    return {
        'parameter': param_name,
        'train_accuracy': train_acc,
        'test_accuracy': test_acc,
        'train_f1': train_f1,
        'test_f1': test_f1,
        'n_features': X_train.shape[1],
        'n_train_samples': len(X_train),
        'n_test_samples': len(X_test),
        'classes': unique_classes.tolist()
    }

def main():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load preprocessed data
    train_path = DATA_DIR / 'features_train.parquet'
    test_path = DATA_DIR / 'features_test.parquet'
    
    if not train_path.exists():
        print(f"Error: {train_path} not found. Run preprocess_cbc_data.py first.")
        return
    
    train_df = pd.read_parquet(train_path)
    test_df = pd.read_parquet(test_path)
    
    print(f"Loaded {len(train_df)} train samples, {len(test_df)} test samples")
    
    # Identify feature and target columns
    target_cols = [c for c in train_df.columns if '_status' in c]
    metadata_cols = ['sample_id', 'source']
    feature_cols = [c for c in train_df.columns if c not in target_cols and c not in metadata_cols]
    
    print(f"Feature columns: {len(feature_cols)}")
    print(f"Target columns: {target_cols}")
    
    X_train = train_df[feature_cols].select_dtypes(include=[np.number])
    X_test = test_df[feature_cols].select_dtypes(include=[np.number])
    
    # Train models for each parameter
    results = []
    for param in PARAMETERS_TO_TRAIN:
        if param not in train_df.columns:
            print(f"Warning: {param} not found in dataset, skipping...")
            continue
        
        y_train = train_df[param].values
        y_test = test_df[param].values
        
        result = train_model_for_parameter(param, X_train, y_train, X_test, y_test)
        results.append(result)
    
    # Save training report
    report = []
    report.append("=" * 60)
    report.append("TRAINING SUMMARY")
    report.append("=" * 60)
    for r in results:
        report.append(f"\nParameter: {r['parameter']}")
        report.append(f"  Train Acc: {r['train_accuracy']:.4f}, F1: {r['train_f1']:.4f}")
        report.append(f"  Test Acc: {r['test_accuracy']:.4f}, F1: {r['test_f1']:.4f}")
        report.append(f"  Features: {r['n_features']}, Classes: {r['classes']}")
    
    report_path = MODELS_DIR / 'training_report.txt'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    
    print("\n" + '\n'.join(report))
    print(f"\nWrote: {report_path}")
    
    # Save results as JSON
    results_json = MODELS_DIR / 'training_results.json'
    with open(results_json, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    print(f"Wrote: {results_json}")

if __name__ == '__main__':
    main()
