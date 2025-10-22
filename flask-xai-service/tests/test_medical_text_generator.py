"""
Unit tests for medical_text_generator.py
Run: pytest tests/test_medical_text_generator.py
"""
import pytest

import sys
from pathlib import Path
# Add parent directory to sys.path for import
sys.path.append(str(Path(__file__).resolve().parents[1]))
import medical_text_generator as mtg


def test_templates_complete():
    # Check that all major CBC parameters are present
    for param in [
        "hemoglobin", "wbc", "platelet", "rbc", "mcv", "mch", "mchc", "rdw",
        "neutrophils", "lymphocytes", "monocytes", "eosinophils", "basophils"
    ]:
        assert param in mtg.TEMPLATES, f"Missing template for {param}"
        for status in ["Normal", "Low", "High", "Critical"]:
            assert status in mtg.TEMPLATES[param], f"Missing {status} for {param}"


def test_template_fields():
    # Check that each template has required fields
    for param, statuses in mtg.TEMPLATES.items():
        for status, tpl in statuses.items():
            assert "intro" in tpl
            assert "general" in tpl
            assert "detailed" in tpl
            assert "recommendations" in tpl
