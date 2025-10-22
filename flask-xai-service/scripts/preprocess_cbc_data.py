"""
Preprocessing and feature engineering for CBC dataset.
Loads processed_cbc_training.csv and produces feature-engineered datasets for model training.

Outputs:
 - ../data/features_train.csv and .parquet
 - ../data/features_test.csv and .parquet
 - ../data/preprocessing_report.txt

Run:
    python scripts/preprocess_cbc_data.py
"""
from pathlib import Path
import json
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"

def load_thresholds():
    path = DATA_DIR / 'clinical_thresholds.json'
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def compute_z_scores(df, param_col, gender_col='patientGender', age_col='patientAge'):
    """Compute age/gender stratified z-scores for a parameter."""
    # Simple implementation: compute z-score within gender groups
    z_scores = np.zeros(len(df))
    for gender in df[gender_col].unique():
        mask = df[gender_col] == gender
        if mask.sum() > 1:
            vals = df.loc[mask, param_col].values
            mean = np.nanmean(vals)
            std = np.nanstd(vals)
            if std > 0:
                z_scores[mask] = (vals - mean) / std
    return z_scores

def feature_engineering(df):
    """Add derived features to the dataframe."""
    # Z-scores for key parameters
    for param in ['hemoglobin_g_dL', 'wbc_10e9_L', 'platelet_count']:
        if param in df.columns:
            df[f'{param}_zscore'] = compute_z_scores(df, param)
    
    # Ratios
    if 'neutrophils_abs' in df.columns and 'lymphocytes_abs' in df.columns:
        df['nlr'] = df['neutrophils_abs'] / (df['lymphocytes_abs'] + 1e-6)
    
    # Age bins
    df['age_group'] = pd.cut(df['patientAge'], bins=[0, 30, 50, 65, 120], labels=['young', 'middle', 'senior', 'elderly'])
    
    # One-hot encode categorical
    df = pd.get_dummies(df, columns=['patientGender', 'region', 'age_group'], prefix=['gender', 'region', 'age'], drop_first=False)
    
    # Flag outliers (simple IQR method for key parameters)
    for param in ['hemoglobin_g_dL', 'wbc_10e9_L', 'platelet_count']:
        if param in df.columns:
            Q1 = df[param].quantile(0.25)
            Q3 = df[param].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 3 * IQR
            upper = Q3 + 3 * IQR
            df[f'{param}_outlier'] = ((df[param] < lower) | (df[param] > upper)).astype(int)
    
    return df

def main():
    train_path = DATA_DIR / 'processed_cbc_training.csv'
    holdout_path = DATA_DIR / 'processed_cbc_holdout.csv'
    
    if not train_path.exists():
        print(f"Error: {train_path} not found. Run generate_cbc_dataset.py first.")
        return
    
    df = pd.read_csv(train_path)
    print(f"Loaded {len(df)} rows from training set")
    
    # Fill missing values with median for numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col].fillna(median_val, inplace=True)
            print(f"Filled {col} missing values with median {median_val:.2f}")
    
    # Feature engineering
    df = feature_engineering(df)
    
    # Separate features and targets
    target_cols = [c for c in df.columns if '_status' in c]
    metadata_cols = ['sample_id', 'source']
    
    feature_cols = [c for c in df.columns if c not in target_cols and c not in metadata_cols]
    
    X = df[feature_cols]
    y = df[target_cols]
    meta = df[metadata_cols]
    
    # Train-test split (stratified by hemoglobin_status if present)
    if 'hemoglobin_status' in target_cols:
        X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
            X, y, meta, test_size=0.2, random_state=42, stratify=df['hemoglobin_status']
        )
    else:
        X_train, X_test, y_train, y_test, meta_train, meta_test = train_test_split(
            X, y, meta, test_size=0.2, random_state=42
        )
    
    # Combine back
    train_df = pd.concat([meta_train.reset_index(drop=True), X_train.reset_index(drop=True), y_train.reset_index(drop=True)], axis=1)
    test_df = pd.concat([meta_test.reset_index(drop=True), X_test.reset_index(drop=True), y_test.reset_index(drop=True)], axis=1)
    
    # Save
    train_csv = DATA_DIR / 'features_train.csv'
    test_csv = DATA_DIR / 'features_test.csv'
    train_parquet = DATA_DIR / 'features_train.parquet'
    test_parquet = DATA_DIR / 'features_test.parquet'
    
    train_df.to_csv(train_csv, index=False)
    test_df.to_csv(test_csv, index=False)
    train_df.to_parquet(train_parquet, index=False)
    test_df.to_parquet(test_parquet, index=False)
    
    # Report
    report = []
    report.append(f"Preprocessing complete")
    report.append(f"Train samples: {len(train_df)}")
    report.append(f"Test samples: {len(test_df)}")
    report.append(f"Feature columns: {len(feature_cols)}")
    report.append(f"Target columns: {target_cols}")
    report.append(f"\nTrain class distributions:")
    for target in target_cols:
        counts = train_df[target].value_counts().to_dict()
        report.append(f"  {target}: {counts}")
    
    report_path = DATA_DIR / 'preprocessing_report.txt'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report))
    
    print('\n'.join(report))
    print(f"\nWrote: {train_csv}, {test_csv}, {train_parquet}, {test_parquet}")

if __name__ == '__main__':
    main()
