"""
Train models for all available blood parameters in the data and templates.
Logs missing parameters for future work.
"""
import os
import pandas as pd
import joblib
from xgboost import XGBClassifier
from pathlib import Path

# Map template parameter names to CSV column names
PARAMETER_COLUMN_MAP = {
    'hemoglobin': 'hemoglobin_g_dL',
    'wbc': 'wbc_10e9_L',
    'platelet': 'platelet_count',
    'rdw': 'rdw_percent',
    'neutrophils': 'neutrophils_percent',
    'lymphocytes': 'lymphocytes_percent',
    'monocytes': 'monocytes_percent',
    'eosinophils': 'eosinophils_percent',
    'basophils': 'basophils_percent',
    'rbc': 'rbc_count',
    'mcv': 'mcv_fL',
    'mch': 'mch_pg',
    'mchc': 'mchc_g_dL',
}

# Status columns for each parameter (for classification)
STATUS_COLUMN_MAP = {
    'hemoglobin': 'hemoglobin_status',
    'wbc': 'wbc_status',
    'platelet': 'platelet_status',
    'rdw': 'rdw_status',
    'neutrophils': 'neutrophil_status',
    'lymphocytes': 'lymphocyte_status',
    # Add more if available in your data
}

TEMPLATE_PARAMETERS = list(PARAMETER_COLUMN_MAP.keys())

DATA_PATH = Path(__file__).parent / 'data' / 'processed_cbc_training.csv'
MODEL_DIR = Path(__file__).parent / 'models'
MODEL_DIR.mkdir(exist_ok=True)

# Load data
print(f"Loading data from {DATA_PATH}")
df = pd.read_csv(DATA_PATH)

available = []
missing = []

for param in TEMPLATE_PARAMETERS:
    col = PARAMETER_COLUMN_MAP[param]
    status_col = STATUS_COLUMN_MAP.get(param)
    if col in df.columns and status_col and status_col in df.columns:
        print(f"Training model for {param} (feature: {col}, target: {status_col})")
        X = df.drop(columns=[status_col])
        y = df[status_col]
        # Use only numeric columns for features
        X = X.select_dtypes(include=['number'])
        # Remove the target column if present in X
        if status_col in X.columns:
            X = X.drop(columns=[status_col])
        # Remove the parameter column itself from features
        if col in X.columns:
            X = X.drop(columns=[col])
        # Train model
        model = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
        model.fit(X, y)
        model_path = MODEL_DIR / f"{param}_model.joblib"
        joblib.dump(model, model_path)
        print(f"Saved model: {model_path}")
        available.append(param)
    else:
        print(f"Missing data or status column for {param}")
        missing.append(param)

# Log missing parameters
if missing:
    with open(MODEL_DIR / 'missing_parameters.txt', 'w') as f:
        for m in missing:
            f.write(m + '\n')
    print(f"Missing parameters logged in {MODEL_DIR / 'missing_parameters.txt'}")
else:
    print("All template parameters are available and models trained.")
