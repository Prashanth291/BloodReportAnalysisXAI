"""
Generate a high-quality synthetic CBC dataset and augment with real COVID CBC data.
Produces:
 - ../data/processed_cbc_training.csv  (main merged dataset)
 - ../data/processed_cbc_holdout.csv  (10% holdout)
 - ../data/sample_10_rows.csv         (10-row sample)

Run:
    python scripts/generate_cbc_dataset.py --n 50000 --seed 42

Notes:
 - Uses adult clinical ranges; pediatric ranges are not included.
 - Configurable sample size and random seed.
"""
from pathlib import Path
import argparse
import json
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
SCRIPTS_DIR = ROOT / "scripts"

# Load label rules and schema if present, otherwise embed defaults
DEFAULT_LABEL_RULES = {
    "hemoglobin_g_dL": {"male": [13.5, 17.5], "female": [12.0, 15.5], "critical_low": 7.0, "critical_high": 25.0},
    "wbc_10e9_L": [4.0, 11.0, 2.0, 20.0],  # normal low high criticalLow criticalHigh
    "platelet_count": [150, 400, 50, 1000],
    "neutrophils_percent": [40, 60, 10, 95],
    "lymphocytes_percent": [20, 40, 1, 90],
    "rdw_percent": [11.5, 14.5, None, None]
}

REGIONS = ["North", "South", "East", "West", "Central", "Urban", "Rural"]
GENDERS = ["Male", "Female", "Other"]


def generate_demographics(n, seed=42):
    rng = np.random.default_rng(seed)
    ages = rng.integers(18, 90, size=n)
    genders = rng.choice(GENDERS, size=n, p=[0.49, 0.49, 0.02])
    regions = rng.choice(REGIONS, size=n)
    diabetic = rng.choice([0, 1], size=n, p=[0.88, 0.12])
    # pregnant only for females in childbearing age
    pregnant = np.zeros(n, dtype=int)
    female_mask = (genders == "Female") & (ages >= 15) & (ages <= 50)
    pregnant[female_mask] = rng.choice([0, 1], size=female_mask.sum(), p=[0.94, 0.06])
    return ages, genders, regions, diabetic, pregnant


def generate_cbc_values(n, ages, genders, diabetic, pregnant, seed=42):
    rng = np.random.default_rng(seed)
    # Hemoglobin (g/dL) - males higher than females, pregnancy reduces
    hemoglobin = np.where(genders == 'Male',
                          rng.normal(loc=15.0, scale=1.0, size=n),
                          rng.normal(loc=13.3, scale=1.0, size=n))
    hemoglobin = hemoglobin - 0.8 * pregnant + 0.2 * diabetic
    hemoglobin = np.clip(hemoglobin, 5.0, 22.0)

    # WBC (10^9/L)
    wbc = rng.normal(loc=7.0, scale=3.0, size=n)
    wbc = wbc + 1.5 * diabetic + 0.5 * (rng.uniform(size=n) < 0.02) * 10
    wbc = np.clip(wbc, 0.1, 200)

    # Platelet count (x10^3/uL) - using same scale as your COVID CSV (~100-400)
    platelet = rng.normal(loc=250.0, scale=80.0, size=n)
    platelet = platelet - 30.0 * pregnant + 15.0 * diabetic
    platelet = np.clip(platelet, 10.0, 2000.0)

    # RDW (%)
    rdw = rng.normal(loc=13.0, scale=1.5, size=n)
    rdw = np.clip(rdw, 10.0, 30.0)

    # Differential percentages via Dirichlet to sum to ~100
    alpha = np.array([3.0, 2.5, 1.0, 0.8, 0.2])
    diffs = rng.dirichlet(alpha, size=n) * 100
    neutrophils_pct = diffs[:, 0]
    lymphocytes_pct = diffs[:, 1]
    monocytes_pct = diffs[:, 2]
    eos_pct = diffs[:, 3]
    baso_pct = diffs[:, 4]

    # Absolute counts derived from WBC
    neutrophils_abs = (neutrophils_pct / 100.0) * wbc
    lymphocytes_abs = (lymphocytes_pct / 100.0) * wbc
    monocytes_abs = (monocytes_pct / 100.0) * wbc

    # RBC, MCV, MCH, MCHC - synthetic correlated with hemoglobin
    rbc = np.clip((hemoglobin * 1.0) + rng.normal(0, 0.5, size=n), 2.5, 7.0)
    mcv = np.clip(rng.normal(loc=90, scale=6, size=n), 60, 120)
    mch = np.clip((hemoglobin / rbc) * 10 + rng.normal(0, 0.5, size=n), 20, 40)
    mchc = np.clip((mch / mcv) * 100 + rng.normal(0, 0.5, size=n), 28, 38)

    return {
        'hemoglobin_g_dL': hemoglobin,
        'wbc_10e9_L': wbc,
        'platelet_count': platelet,
        'rdw_percent': rdw,
        'neutrophils_percent': neutrophils_pct,
        'lymphocytes_percent': lymphocytes_pct,
        'monocytes_percent': monocytes_pct,
        'eosinophils_percent': eos_pct,
        'basophils_percent': baso_pct,
        'neutrophils_abs': neutrophils_abs,
        'lymphocytes_abs': lymphocytes_abs,
        'monocytes_abs': monocytes_abs,
        'rbc_count': rbc,
        'mcv_fL': mcv,
        'mch_pg': mch,
        'mchc_g_dL': mchc
    }


def status_from_threshold(value, low, high, critical_low=None, critical_high=None):
    # Return 0=normal 1=low 2=high 3=critical
    if critical_low is not None and value <= critical_low:
        return 3
    if critical_high is not None and value >= critical_high:
        return 3
    if value < low:
        return 1
    if value > high:
        return 2
    return 0


def label_rowwise(df):
    # Hemoglobin: gender-specific
    def hb_status(row):
        if row['patientGender'] == 'Male':
            low, high = DEFAULT_LABEL_RULES['hemoglobin_g_dL']['male']
        else:
            low, high = DEFAULT_LABEL_RULES['hemoglobin_g_dL']['female']
        return status_from_threshold(row['hemoglobin_g_dL'], low, high,
                                     DEFAULT_LABEL_RULES['hemoglobin_g_dL']['critical_low'],
                                     DEFAULT_LABEL_RULES['hemoglobin_g_dL']['critical_high'])

    df['hemoglobin_status'] = df.apply(hb_status, axis=1)
    df['wbc_status'] = df['wbc_10e9_L'].apply(lambda x: status_from_threshold(x, DEFAULT_LABEL_RULES['wbc_10e9_L'][0], DEFAULT_LABEL_RULES['wbc_10e9_L'][1], DEFAULT_LABEL_RULES['wbc_10e9_L'][2], DEFAULT_LABEL_RULES['wbc_10e9_L'][3]))
    df['platelet_status'] = df['platelet_count'].apply(lambda x: status_from_threshold(x, DEFAULT_LABEL_RULES['platelet_count'][0], DEFAULT_LABEL_RULES['platelet_count'][1], DEFAULT_LABEL_RULES['platelet_count'][2], DEFAULT_LABEL_RULES['platelet_count'][3]))
    df['neutrophil_status'] = df['neutrophils_percent'].apply(lambda x: status_from_threshold(x, DEFAULT_LABEL_RULES['neutrophils_percent'][0], DEFAULT_LABEL_RULES['neutrophils_percent'][1], DEFAULT_LABEL_RULES['neutrophils_percent'][2], DEFAULT_LABEL_RULES['neutrophils_percent'][3]))
    df['lymphocyte_status'] = df['lymphocytes_percent'].apply(lambda x: status_from_threshold(x, DEFAULT_LABEL_RULES['lymphocytes_percent'][0], DEFAULT_LABEL_RULES['lymphocytes_percent'][1], DEFAULT_LABEL_RULES['lymphocytes_percent'][2], DEFAULT_LABEL_RULES['lymphocytes_percent'][3]))

    # RDW: higher is abnormal (no critical thresholds defined)
    rdw_low, rdw_high = DEFAULT_LABEL_RULES['rdw_percent'][0], DEFAULT_LABEL_RULES['rdw_percent'][1]
    df['rdw_status'] = df['rdw_percent'].apply(lambda x: 1 if x < rdw_low else (2 if x > rdw_high else 0))

    return df


def read_and_normalize_real_csv(path):
    # Read the COVID CSV and try to map columns to our schema
    df = pd.read_csv(path)
    # Make column name mapping tolerant
    col_map = {}
    # Map likely columns (case-insensitive search)
    def find_col(possible_names):
        for name in possible_names:
            matches = [c for c in df.columns if name.lower() in c.lower()]
            if matches:
                return matches[0]
        return None

    col_map['age'] = find_col(['Patient Age', 'Age', 'patient age'])
    col_map['gender'] = find_col(['Gender', 'gender'])
    col_map['rdw_percent'] = find_col(['Red blood cell distribution width', 'rdw'])
    col_map['monocytes_percent'] = find_col(['Monocytes', 'Monocytes(%)', 'Monocytes(%)'])
    col_map['wbc_10e9_L'] = find_col(['White blood cell count', 'WBC', 'white blood cell'])
    col_map['platelet_count'] = find_col(['Platelet Count', 'platelet'])
    col_map['lymphocytes_percent'] = find_col(['Lymphocyte Count', 'Lymphocytes', 'Lymphocyte'])
    col_map['neutrophils_percent'] = find_col(['Neutrophils Count', 'Neutrophils', 'Neutrophils Count'])

    # Build standardized dataframe
    rows = []
    for _, r in df.iterrows():
        age = r[col_map['age']] if col_map['age'] else np.nan
        gender = r[col_map['gender']] if col_map['gender'] else 'Unknown'
        try:
            rdw = float(r[col_map['rdw_percent']]) if col_map['rdw_percent'] else np.nan
        except:
            rdw = np.nan
        def get_float(k):
            try:
                return float(r[col_map[k]]) if col_map[k] else np.nan
            except:
                return np.nan
        wbc = get_float('wbc_10e9_L')
        platelet = get_float('platelet_count')
        lymph = get_float('lymphocytes_percent')
        neut = get_float('neutrophils_percent')
        mon = get_float('monocytes_percent')
        rows.append({
            'patientAge': age,
            'patientGender': gender,
            'rdw_percent': rdw,
            'wbc_10e9_L': wbc,
            'platelet_count': platelet,
            'lymphocytes_percent': lymph,
            'neutrophils_percent': neut,
            'monocytes_percent': mon,
            'source': 'real'
        })
    out = pd.DataFrame(rows)
    return out


def main(n=50000, seed=42):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ages, genders, regions, diabetic, pregnant = generate_demographics(n, seed=seed)
    cbc = generate_cbc_values(n, ages, genders, diabetic, pregnant, seed=seed+1)
    df = pd.DataFrame({
        'sample_id': [f'syn_{i:06d}' for i in range(n)],
        'source': 'synthetic',
        'region': regions,
        'patientAge': ages,
        'patientGender': genders,
        'diabetic': diabetic,
        'pregnant': pregnant,
        'patientWeight_kg': np.round(np.clip(np.random.default_rng(seed+2).normal(70, 15, size=n), 40, 140), 1)
    })
    for k, v in cbc.items():
        df[k] = np.round(v, 3)

    # Add derived N/L ratio
    df['neutrophil_lymphocyte_ratio'] = np.where(df['lymphocytes_abs'] > 0, df['neutrophils_abs'] / (df['lymphocytes_abs'] + 1e-6), np.nan)

    # Load real COVID data if present and normalize
    real_path = DATA_DIR / 'COVID-19_CBC_Data.csv'
    if real_path.exists():
        real_df = read_and_normalize_real_csv(real_path)
        # Fill missing demographics in real with synthetic-ish values
        real_df['patientGender'] = real_df['patientGender'].fillna('Unknown')
        real_df['patientAge'] = real_df['patientAge'].fillna(np.random.randint(18, 90))
        real_df['diabetic'] = 0
        real_df['pregnant'] = 0
        real_df['region'] = 'Unknown'
        # Create sample_id for real
        real_df['sample_id'] = [f'real_{i:06d}' for i in range(len(real_df))]
        # Ensure columns present in synthetic schema
        for col in ['hemoglobin_g_dL','rbc_count','mcv_fL','mch_pg','mchc_g_dL','neutrophils_abs','lymphocytes_abs','monocytes_abs']:
            if col not in real_df.columns:
                real_df[col] = np.nan
        # Reorder and select minimal columns
        cols = list(df.columns)
        # Keep only columns that exist in real_df
        keep = [c for c in cols if c in real_df.columns]
        merged = pd.concat([df, real_df.reindex(columns=df.columns)], ignore_index=True, sort=False)
    else:
        merged = df

    # Fill small missing values
    merged['patientGender'] = merged['patientGender'].fillna('Unknown')
    merged['region'] = merged['region'].fillna('Unknown')
    merged['diabetic'] = merged['diabetic'].fillna(0).astype(int)
    merged['pregnant'] = merged['pregnant'].fillna(0).astype(int)

    # Apply labeling rules
    merged = label_rowwise(merged)

    # Create holdout
    rng = np.random.default_rng(seed+3)
    mask = rng.choice([True, False], size=len(merged), p=[0.9, 0.1])
    train_df = merged[mask].reset_index(drop=True)
    holdout_df = merged[~mask].reset_index(drop=True)

    out_train = DATA_DIR / 'processed_cbc_training.csv'
    out_hold = DATA_DIR / 'processed_cbc_holdout.csv'
    sample10 = DATA_DIR / 'sample_10_rows.csv'

    train_df.to_csv(out_train, index=False)
    holdout_df.to_csv(out_hold, index=False)
    train_df.head(10).to_csv(sample10, index=False)

    # Dump schema and label rules
    schema = {"columns": list(train_df.columns)}
    with open(DATA_DIR / 'schema.json', 'w', encoding='utf-8') as f:
        json.dump(schema, f, indent=2)
    with open(DATA_DIR / 'label_rules.json', 'w', encoding='utf-8') as f:
        json.dump(DEFAULT_LABEL_RULES, f, indent=2)

    # Summary
    summary = []
    summary.append(f"Total rows generated or merged: {len(merged)}")
    summary.append(f"Training rows: {len(train_df)}, Holdout rows: {len(holdout_df)}")
    # per-label balances for a few parameters
    for col in ['hemoglobin_status','wbc_status','platelet_status','neutrophil_status','lymphocyte_status','rdw_status']:
        if col in train_df.columns:
            counts = train_df[col].value_counts().to_dict()
            summary.append(f"{col} counts: {counts}")

    with open(DATA_DIR / 'dataset_summary.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(summary))

    print('\n'.join(summary))
    print(f"Wrote: {out_train}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--n', type=int, default=50000, help='Number of synthetic samples to generate')
    parser.add_argument('--seed', type=int, default=42, help='Random seed')
    args = parser.parse_args()
    main(n=args.n, seed=args.seed)
