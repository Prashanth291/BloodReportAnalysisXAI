"""
Add missing status columns for RBC, MCV, MCH, MCHC, monocytes, eosinophils, basophils
based on clinical reference ranges.
"""
import pandas as pd
import numpy as np
from pathlib import Path

DATA_PATH = Path(__file__).parent / 'data' / 'processed_cbc_training.csv'
OUTPUT_PATH = Path(__file__).parent / 'data' / 'processed_cbc_training_complete.csv'

print("="*60)
print("ADDING MISSING STATUS COLUMNS")
print("="*60)

# Load data
print(f"Loading: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)
print(f"Original shape: {df.shape}")

# Clinical reference ranges for classification
# Status: 0=Low, 1=Normal, 2=High (3=Very High for some)

def classify_rbc(value, gender):
    """RBC count classification (million cells/μL)"""
    if gender == 'Male':
        if value < 4.5:
            return 0  # Low
        elif value <= 5.5:
            return 1  # Normal
        else:
            return 2  # High
    else:  # Female
        if value < 4.0:
            return 0  # Low
        elif value <= 5.0:
            return 1  # Normal
        else:
            return 2  # High

def classify_mcv(value):
    """MCV (Mean Corpuscular Volume) classification (fL)"""
    if value < 80:
        return 0  # Low (Microcytic)
    elif value <= 100:
        return 1  # Normal (Normocytic)
    else:
        return 2  # High (Macrocytic)

def classify_mch(value):
    """MCH (Mean Corpuscular Hemoglobin) classification (pg)"""
    if value < 27:
        return 0  # Low
    elif value <= 33:
        return 1  # Normal
    else:
        return 2  # High

def classify_mchc(value):
    """MCHC (Mean Corpuscular Hemoglobin Concentration) classification (g/dL)"""
    if value < 32:
        return 0  # Low
    elif value <= 36:
        return 1  # Normal
    else:
        return 2  # High

def classify_monocytes(value):
    """Monocytes percentage classification (%)"""
    if value < 2:
        return 0  # Low
    elif value <= 10:
        return 1  # Normal
    elif value <= 15:
        return 2  # High
    else:
        return 3  # Very High

def classify_eosinophils(value):
    """Eosinophils percentage classification (%)"""
    if value < 1:
        return 0  # Low
    elif value <= 5:
        return 1  # Normal
    elif value <= 10:
        return 2  # High
    else:
        return 3  # Very High

def classify_basophils(value):
    """Basophils percentage classification (%)"""
    if value < 0.5:
        return 0  # Low
    elif value <= 2:
        return 1  # Normal
    elif value <= 3:
        return 2  # High
    else:
        return 3  # Very High

# Add RBC status
if 'rbc_count' in df.columns:
    print("Adding rbc_status...")
    df['rbc_status'] = df.apply(
        lambda row: classify_rbc(row['rbc_count'], row.get('patientGender', 'Male')),
        axis=1
    )
    print(f"  ✓ rbc_status: {df['rbc_status'].value_counts().to_dict()}")

# Add MCV status
if 'mcv_fL' in df.columns:
    print("Adding mcv_status...")
    df['mcv_status'] = df['mcv_fL'].apply(classify_mcv)
    print(f"  ✓ mcv_status: {df['mcv_status'].value_counts().to_dict()}")

# Add MCH status
if 'mch_pg' in df.columns:
    print("Adding mch_status...")
    df['mch_status'] = df['mch_pg'].apply(classify_mch)
    print(f"  ✓ mch_status: {df['mch_status'].value_counts().to_dict()}")

# Add MCHC status
if 'mchc_g_dL' in df.columns:
    print("Adding mchc_status...")
    df['mchc_status'] = df['mchc_g_dL'].apply(classify_mchc)
    print(f"  ✓ mchc_status: {df['mchc_status'].value_counts().to_dict()}")

# Add Monocytes status
if 'monocytes_percent' in df.columns:
    print("Adding monocytes_status...")
    df['monocytes_status'] = df['monocytes_percent'].apply(classify_monocytes)
    print(f"  ✓ monocytes_status: {df['monocytes_status'].value_counts().to_dict()}")

# Add Eosinophils status
if 'eosinophils_percent' in df.columns:
    print("Adding eosinophils_status...")
    df['eosinophils_status'] = df['eosinophils_percent'].apply(classify_eosinophils)
    print(f"  ✓ eosinophils_status: {df['eosinophils_status'].value_counts().to_dict()}")

# Add Basophils status
if 'basophils_percent' in df.columns:
    print("Adding basophils_status...")
    df['basophils_status'] = df['basophils_percent'].apply(classify_basophils)
    print(f"  ✓ basophils_status: {df['basophils_status'].value_counts().to_dict()}")

# Save updated dataset
print(f"\nSaving to: {OUTPUT_PATH}")
df.to_csv(OUTPUT_PATH, index=False)
print(f"New shape: {df.shape}")
print(f"New columns added: {df.shape[1] - pd.read_csv(DATA_PATH).shape[1]}")

# List all status columns
status_cols = [col for col in df.columns if 'status' in col]
print(f"\nAll status columns ({len(status_cols)}):")
for col in sorted(status_cols):
    print(f"  - {col}")

print("="*60)
print("✅ COMPLETE! Updated dataset saved.")
print(f"Next: Update train_models_proper.py to use {OUTPUT_PATH.name}")
print("="*60)
