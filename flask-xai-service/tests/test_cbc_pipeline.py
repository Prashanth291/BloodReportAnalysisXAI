"""
Unit tests for CBC data generation, preprocessing, and model training scripts.
Run: pytest tests/test_cbc_pipeline.py
"""
import pytest
import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
SCRIPTS_DIR = Path(__file__).resolve().parents[1] / "scripts"


def test_processed_cbc_training_exists():
    path = DATA_DIR / "processed_cbc_training.csv"
    assert path.exists(), f"{path} not found. Run generate_cbc_dataset.py first."
    df = pd.read_csv(path)
    assert len(df) > 1000, "CBC training data too small."
    assert "hemoglobin_g_dL" in df.columns
    assert "patientAge" in df.columns


def test_preprocessing_outputs():
    train_path = DATA_DIR / "features_train.csv"
    test_path = DATA_DIR / "features_test.csv"
    assert train_path.exists(), "features_train.csv missing. Run preprocess_cbc_data.py."
    assert test_path.exists(), "features_test.csv missing. Run preprocess_cbc_data.py."
    df_train = pd.read_csv(train_path)
    df_test = pd.read_csv(test_path)
    assert "hemoglobin_g_dL_zscore" in df_train.columns
    assert "nlr" in df_train.columns or "nlr" in df_test.columns


def test_model_files_exist():
    models_dir = Path(__file__).resolve().parents[1] / "models"
    for param in ["hemoglobin", "wbc", "platelet"]:
        model_path = models_dir / f"{param}_model.joblib"
        assert model_path.exists(), f"Model file missing: {model_path}"


def test_sample_data_consistency():
    sample_path = DATA_DIR / "sample_10_rows.csv"
    assert sample_path.exists(), "sample_10_rows.csv missing. Run generate_cbc_dataset.py."
    df = pd.read_csv(sample_path)
    assert len(df) == 10, "Sample file should have 10 rows."
    assert df.isnull().sum().sum() < 5, "Too many missing values in sample."
