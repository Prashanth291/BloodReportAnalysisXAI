"""
Medical text generator that converts model predictions and SHAP values
into human-readable medical interpretations matching the frontend contract.

Output format matches parameterInterpretations.js structure:
{
  "introduction": "...",
  "generalInterpretation": "...",
  "detailedExplanation": [...],
  "abnormalFindings": {
    "primaryFinding": "...",
    "potentialCauses": [...],
    "diseaseConditions": [...]
  },
  "recommendations": [...],
  "explainability": {
    "modelPrediction": "Normal/Low/High/Critical",
    "confidence": 0.95,
    "featureImportances": [
      {"feature": "Age", "impact": 0.3, "direction": "increases"}
    ],
    "shapExplanation": "..."
  }
}
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"

# Load clinical thresholds
def load_clinical_thresholds():
    path = DATA_DIR / 'clinical_thresholds.json'
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

THRESHOLDS = load_clinical_thresholds()

STATUS_NAMES = {
    0: "Normal",
    1: "Low",
    2: "High",
    3: "Critical"
}

# Medical templates per parameter
TEMPLATES = {
    "hemoglobin": {
        "Normal": {
            "intro": "Your Hemoglobin level is within the normal range.",
            "general": "This indicates healthy oxygen-carrying capacity in your blood.",
            "detailed": [
                "Normal hemoglobin levels suggest adequate red blood cell production",
                "Your body is effectively transporting oxygen to tissues",
                "No immediate concerns related to anemia or polycythemia"
            ],
            "recommendations": [
                "Maintain a balanced diet rich in iron",
                "Continue regular health checkups",
                "Stay hydrated and maintain healthy lifestyle"
            ]
        },
        "Low": {
            "intro": "Your Hemoglobin level is below the normal range, indicating possible anemia.",
            "general": "Low hemoglobin reduces oxygen delivery to tissues, which can cause fatigue and weakness.",
            "detailed": [
                "Reduced hemoglobin may indicate iron deficiency",
                "Could be related to chronic disease or nutritional deficiency",
                "May cause symptoms like fatigue, pale skin, and shortness of breath"
            ],
            "abnormal_primary": "Low Hemoglobin (Anemia)",
            "potential_causes": [
                "Iron deficiency",
                "Vitamin B12 or folate deficiency",
                "Chronic kidney disease",
                "Blood loss (menstruation, GI bleeding)",
                "Bone marrow disorders"
            ],
            "disease_conditions": ["Iron deficiency anemia", "Pernicious anemia", "Chronic disease anemia", "Thalassemia"],
            "recommendations": [
                "Consult your healthcare provider for further evaluation",
                "Consider iron-rich foods (red meat, spinach, lentils)",
                "Request Complete Blood Count (CBC) and iron studies",
                "Investigate potential sources of blood loss"
            ]
        },
        "High": {
            "intro": "Your Hemoglobin level is above the normal range.",
            "general": "Elevated hemoglobin can indicate polycythemia or dehydration.",
            "detailed": [
                "High hemoglobin increases blood viscosity",
                "May be related to chronic hypoxia or dehydration",
                "Could indicate polycythemia vera or secondary causes"
            ],
            "abnormal_primary": "Elevated Hemoglobin (Polycythemia)",
            "potential_causes": [
                "Dehydration",
                "Living at high altitude",
                "Chronic lung disease (COPD)",
                "Smoking",
                "Polycythemia vera (bone marrow disorder)"
            ],
            "disease_conditions": ["Polycythemia vera", "COPD", "Chronic hypoxia", "Dehydration"],
            "recommendations": [
                "Consult your healthcare provider immediately",
                "Stay well-hydrated",
                "Avoid smoking and high-altitude exposure if possible",
                "Consider evaluation for lung or heart conditions"
            ]
        },
        "Critical": {
            "intro": "Your Hemoglobin level is critically abnormal and requires immediate medical attention.",
            "general": "Critical hemoglobin levels can be life-threatening and require urgent intervention.",
            "detailed": [
                "Critically low: severe anemia requiring transfusion",
                "Critically high: risk of thrombosis and stroke"
            ],
            "abnormal_primary": "Critical Hemoglobin Level",
            "potential_causes": [
                "Severe bleeding",
                "Severe bone marrow failure",
                "Severe dehydration or polycythemia"
            ],
            "disease_conditions": ["Severe anemia", "Acute blood loss", "Polycythemia vera"],
            "recommendations": [
                "SEEK IMMEDIATE MEDICAL ATTENTION",
                "Do not delay - this may require emergency treatment",
                "Prepare for possible blood transfusion or urgent therapy"
            ]
        }
    },
    "wbc": {
        "Normal": {
            "intro": "Your White Blood Cell count is within the normal range.",
            "general": "This indicates a healthy immune system response.",
            "detailed": [
                "Normal WBC count suggests adequate immune function",
                "No signs of infection or immune suppression"
            ],
            "recommendations": [
                "Maintain a healthy lifestyle",
                "Continue regular health checkups"
            ]
        },
        "Low": {
            "intro": "Your White Blood Cell count is below normal (Leukopenia).",
            "general": "Low WBC increases infection risk due to weakened immune response.",
            "detailed": [
                "Leukopenia indicates reduced immune cell production",
                "May be related to bone marrow suppression or autoimmune conditions"
            ],
            "abnormal_primary": "Low WBC Count (Leukopenia)",
            "potential_causes": [
                "Viral infections",
                "Bone marrow disorders",
                "Autoimmune diseases",
                "Certain medications (chemotherapy, immunosuppressants)",
                "Nutritional deficiencies"
            ],
            "disease_conditions": ["Leukopenia", "Aplastic anemia", "Lupus", "HIV/AIDS"],
            "recommendations": [
                "Consult your healthcare provider",
                "Avoid exposure to infections",
                "Consider evaluation for bone marrow or autoimmune disorders"
            ]
        },
        "High": {
            "intro": "Your White Blood Cell count is above normal (Leukocytosis).",
            "general": "Elevated WBC often indicates infection, inflammation, or stress response.",
            "detailed": [
                "Leukocytosis can be reactive (infection/inflammation) or neoplastic (leukemia)",
                "Neutrophil predominance suggests bacterial infection"
            ],
            "abnormal_primary": "High WBC Count (Leukocytosis)",
            "potential_causes": [
                "Bacterial or viral infections",
                "Inflammation or tissue damage",
                "Stress or physical exertion",
                "Smoking",
                "Leukemia or myeloproliferative disorders"
            ],
            "disease_conditions": ["Infection", "Leukemia", "Inflammatory disorders", "Stress response"],
            "recommendations": [
                "Consult your healthcare provider",
                "Investigate for infection or inflammation",
                "Consider differential WBC count and blood smear"
            ]
        },
        "Critical": {
            "intro": "Your WBC count is critically abnormal.",
            "general": "Critical WBC levels require urgent evaluation for severe infection or blood disorder.",
            "detailed": [],
            "abnormal_primary": "Critical WBC Count",
            "potential_causes": ["Severe infection/sepsis", "Leukemia", "Bone marrow failure"],
            "disease_conditions": ["Sepsis", "Acute leukemia", "Severe immune suppression"],
            "recommendations": [
                "SEEK IMMEDIATE MEDICAL ATTENTION",
                "Urgent blood work and specialist consultation required"
            ]
        }
    },
    "platelet": {
        "Normal": {
            "intro": "Your Platelet count is within the normal range.",
            "general": "This indicates normal blood clotting function.",
            "detailed": ["Adequate platelet count for normal hemostasis"],
            "recommendations": ["Maintain healthy diet", "Continue routine monitoring"]
        },
        "Low": {
            "intro": "Your Platelet count is low (Thrombocytopenia).",
            "general": "Low platelet count increases bleeding risk.",
            "detailed": ["Thrombocytopenia can cause easy bruising and prolonged bleeding"],
            "abnormal_primary": "Low Platelet Count (Thrombocytopenia)",
            "potential_causes": ["Immune thrombocytopenia (ITP)", "Bone marrow disorders", "Viral infections", "Medications", "Spleen sequestration"],
            "disease_conditions": ["ITP", "Aplastic anemia", "Leukemia", "Cirrhosis"],
            "recommendations": [
                "Consult your healthcare provider",
                "Avoid activities with high injury risk",
                "Consider bone marrow evaluation if severe"
            ]
        },
        "High": {
            "intro": "Your Platelet count is elevated (Thrombocytosis).",
            "general": "High platelet count can increase clotting risk.",
            "detailed": ["Thrombocytosis may be reactive or due to myeloproliferative disorders"],
            "abnormal_primary": "High Platelet Count (Thrombocytosis)",
            "potential_causes": ["Iron deficiency", "Inflammation", "Infection", "Post-surgery", "Essential thrombocythemia"],
            "disease_conditions": ["Essential thrombocythemia", "Reactive thrombocytosis", "Polycythemia vera"],
            "recommendations": [
                "Consult your healthcare provider",
                "Evaluate for inflammatory or myeloproliferative disorders",
                "Consider aspirin therapy if high thrombosis risk"
            ]
        },
        "Critical": {
            "intro": "Your Platelet count is critically abnormal.",
            "general": "Critical platelet levels require urgent medical evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical Platelet Count",
            "potential_causes": ["Severe thrombocytopenia", "DIC", "Severe bone marrow failure"],
            "disease_conditions": ["DIC", "Severe ITP", "Leukemia"],
            "recommendations": [
                "SEEK IMMEDIATE MEDICAL ATTENTION",
                "Risk of spontaneous bleeding or thrombosis"
            ]
        }
    },
    "rbc": {
        "Normal": {
            "intro": "Your Red Blood Cell (RBC) count is within the normal range.",
            "general": "This indicates healthy red cell production and oxygen transport.",
            "detailed": ["Normal RBC count supports adequate tissue oxygenation."],
            "recommendations": ["Maintain a balanced diet and regular checkups."]
        },
        "Low": {
            "intro": "Your RBC count is low (Erythropenia).",
            "general": "Low RBC may cause anemia symptoms like fatigue and pallor.",
            "detailed": ["May be due to blood loss, nutritional deficiency, or bone marrow issues."],
            "abnormal_primary": "Low RBC Count (Erythropenia)",
            "potential_causes": ["Iron deficiency", "Chronic disease", "Bone marrow suppression"],
            "disease_conditions": ["Anemia", "Aplastic anemia", "Chronic kidney disease"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "High": {
            "intro": "Your RBC count is elevated (Erythrocytosis).",
            "general": "High RBC can increase blood viscosity and risk of clotting.",
            "detailed": ["May be due to dehydration, chronic hypoxia, or polycythemia vera."],
            "abnormal_primary": "High RBC Count (Erythrocytosis)",
            "potential_causes": ["Dehydration", "High altitude", "Polycythemia vera"],
            "disease_conditions": ["Polycythemia vera", "Chronic hypoxia"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "Critical": {
            "intro": "Your RBC count is critically abnormal.",
            "general": "Critical RBC levels require urgent medical attention.",
            "detailed": [],
            "abnormal_primary": "Critical RBC Count",
            "potential_causes": ["Severe anemia", "Severe polycythemia"],
            "disease_conditions": ["Severe anemia", "Polycythemia vera"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "mcv": {
        "Normal": {
            "intro": "Your Mean Corpuscular Volume (MCV) is within the normal range.",
            "general": "This suggests normal red blood cell size.",
            "detailed": ["Normal MCV indicates normocytic red blood cells."],
            "recommendations": ["Maintain a balanced diet."]
        },
        "Low": {
            "intro": "Your MCV is low (Microcytosis).",
            "general": "Low MCV suggests small red blood cells, often due to iron deficiency.",
            "detailed": ["May indicate iron deficiency anemia or thalassemia."],
            "abnormal_primary": "Low MCV (Microcytosis)",
            "potential_causes": ["Iron deficiency", "Thalassemia"],
            "disease_conditions": ["Iron deficiency anemia", "Thalassemia"],
            "recommendations": ["Consult your doctor for iron studies."]
        },
        "High": {
            "intro": "Your MCV is high (Macrocytosis).",
            "general": "High MCV suggests large red blood cells, often due to B12 or folate deficiency.",
            "detailed": ["May indicate vitamin B12 or folate deficiency, or liver disease."],
            "abnormal_primary": "High MCV (Macrocytosis)",
            "potential_causes": ["Vitamin B12 deficiency", "Folate deficiency", "Liver disease"],
            "disease_conditions": ["Megaloblastic anemia", "Liver disease"],
            "recommendations": ["Consult your doctor for vitamin studies."]
        },
        "Critical": {
            "intro": "Your MCV is critically abnormal.",
            "general": "Critical MCV levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical MCV",
            "potential_causes": ["Severe deficiency", "Severe anemia"],
            "disease_conditions": ["Severe anemia"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "mch": {
        "Normal": {
            "intro": "Your Mean Corpuscular Hemoglobin (MCH) is within the normal range.",
            "general": "This suggests normal hemoglobin content per red cell.",
            "detailed": ["Normal MCH indicates normochromic red blood cells."],
            "recommendations": ["Maintain a balanced diet."]
        },
        "Low": {
            "intro": "Your MCH is low (Hypochromia).",
            "general": "Low MCH suggests less hemoglobin per red cell, often due to iron deficiency.",
            "detailed": ["May indicate iron deficiency anemia or thalassemia."],
            "abnormal_primary": "Low MCH (Hypochromia)",
            "potential_causes": ["Iron deficiency", "Thalassemia"],
            "disease_conditions": ["Iron deficiency anemia", "Thalassemia"],
            "recommendations": ["Consult your doctor for iron studies."]
        },
        "High": {
            "intro": "Your MCH is high (Hyperchromia).",
            "general": "High MCH suggests more hemoglobin per red cell, may be seen in macrocytic anemias.",
            "detailed": ["May indicate macrocytic anemia or hereditary spherocytosis."],
            "abnormal_primary": "High MCH (Hyperchromia)",
            "potential_causes": ["Macrocytic anemia", "Hereditary spherocytosis"],
            "disease_conditions": ["Megaloblastic anemia", "Spherocytosis"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "Critical": {
            "intro": "Your MCH is critically abnormal.",
            "general": "Critical MCH levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical MCH",
            "potential_causes": ["Severe deficiency", "Severe anemia"],
            "disease_conditions": ["Severe anemia"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "mchc": {
        "Normal": {
            "intro": "Your Mean Corpuscular Hemoglobin Concentration (MCHC) is within the normal range.",
            "general": "This suggests normal hemoglobin concentration in red cells.",
            "detailed": ["Normal MCHC indicates normochromic red blood cells."],
            "recommendations": ["Maintain a balanced diet."]
        },
        "Low": {
            "intro": "Your MCHC is low (Hypochromia).",
            "general": "Low MCHC suggests diluted hemoglobin in red cells, often due to iron deficiency.",
            "detailed": ["May indicate iron deficiency anemia or chronic blood loss."],
            "abnormal_primary": "Low MCHC (Hypochromia)",
            "potential_causes": ["Iron deficiency", "Chronic blood loss"],
            "disease_conditions": ["Iron deficiency anemia"],
            "recommendations": ["Consult your doctor for iron studies."]
        },
        "High": {
            "intro": "Your MCHC is high (Hyperchromia).",
            "general": "High MCHC may be seen in hereditary spherocytosis or severe dehydration.",
            "detailed": ["May indicate spherocytosis or hemolysis."],
            "abnormal_primary": "High MCHC (Hyperchromia)",
            "potential_causes": ["Hereditary spherocytosis", "Hemolysis", "Dehydration"],
            "disease_conditions": ["Spherocytosis", "Hemolytic anemia"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "Critical": {
            "intro": "Your MCHC is critically abnormal.",
            "general": "Critical MCHC levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical MCHC",
            "potential_causes": ["Severe deficiency", "Severe anemia"],
            "disease_conditions": ["Severe anemia"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "rdw": {
        "Normal": {
            "intro": "Your Red Cell Distribution Width (RDW) is within the normal range.",
            "general": "This suggests uniform red blood cell size.",
            "detailed": ["Normal RDW indicates little variation in red cell size."],
            "recommendations": ["Maintain a balanced diet."]
        },
        "Low": {
            "intro": "Your RDW is low (rare).",
            "general": "Low RDW is uncommon and usually not clinically significant.",
            "detailed": ["May be seen in some inherited conditions."],
            "abnormal_primary": "Low RDW",
            "potential_causes": ["Hereditary conditions"],
            "disease_conditions": ["Hereditary elliptocytosis"],
            "recommendations": ["Consult your doctor if symptomatic."]
        },
        "High": {
            "intro": "Your RDW is high (Anisocytosis).",
            "general": "High RDW suggests increased variation in red cell size, often due to anemia.",
            "detailed": ["May indicate iron deficiency, B12/folate deficiency, or recent transfusion."],
            "abnormal_primary": "High RDW (Anisocytosis)",
            "potential_causes": ["Iron deficiency", "Vitamin B12/folate deficiency", "Recent transfusion"],
            "disease_conditions": ["Iron deficiency anemia", "Megaloblastic anemia"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "Critical": {
            "intro": "Your RDW is critically abnormal.",
            "general": "Critical RDW levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical RDW",
            "potential_causes": ["Severe anemia"],
            "disease_conditions": ["Severe anemia"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "neutrophils": {
        "Normal": {
            "intro": "Your Neutrophil count is within the normal range.",
            "general": "This suggests normal innate immune function.",
            "detailed": ["Normal neutrophil count supports infection defense."],
            "recommendations": ["Maintain a healthy lifestyle."]
        },
        "Low": {
            "intro": "Your Neutrophil count is low (Neutropenia).",
            "general": "Low neutrophils increase infection risk.",
            "detailed": ["May be due to viral infection, bone marrow suppression, or autoimmune disease."],
            "abnormal_primary": "Low Neutrophil Count (Neutropenia)",
            "potential_causes": ["Viral infection", "Bone marrow suppression", "Autoimmune disease"],
            "disease_conditions": ["Neutropenia", "Aplastic anemia"],
            "recommendations": ["Consult your doctor and avoid infection exposure."]
        },
        "High": {
            "intro": "Your Neutrophil count is high (Neutrophilia).",
            "general": "High neutrophils may indicate bacterial infection or inflammation.",
            "detailed": ["May be due to infection, stress, or myeloproliferative disorder."],
            "abnormal_primary": "High Neutrophil Count (Neutrophilia)",
            "potential_causes": ["Bacterial infection", "Inflammation", "Stress", "Myeloproliferative disorder"],
            "disease_conditions": ["Infection", "Leukemia"],
            "recommendations": ["Consult your doctor for infection workup."]
        },
        "Critical": {
            "intro": "Your Neutrophil count is critically abnormal.",
            "general": "Critical neutrophil levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical Neutrophil Count",
            "potential_causes": ["Severe infection", "Severe bone marrow failure"],
            "disease_conditions": ["Sepsis", "Aplastic anemia"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "lymphocytes": {
        "Normal": {
            "intro": "Your Lymphocyte count is within the normal range.",
            "general": "This suggests normal adaptive immune function.",
            "detailed": ["Normal lymphocyte count supports immune memory and defense."],
            "recommendations": ["Maintain a healthy lifestyle."]
        },
        "Low": {
            "intro": "Your Lymphocyte count is low (Lymphopenia).",
            "general": "Low lymphocytes may increase infection risk.",
            "detailed": ["May be due to viral infection, immunosuppression, or autoimmune disease."],
            "abnormal_primary": "Low Lymphocyte Count (Lymphopenia)",
            "potential_causes": ["Viral infection", "Immunosuppression", "Autoimmune disease"],
            "disease_conditions": ["Lymphopenia", "HIV/AIDS"],
            "recommendations": ["Consult your doctor and avoid infection exposure."]
        },
        "High": {
            "intro": "Your Lymphocyte count is high (Lymphocytosis).",
            "general": "High lymphocytes may indicate viral infection or leukemia.",
            "detailed": ["May be due to viral infection, chronic inflammation, or lymphocytic leukemia."],
            "abnormal_primary": "High Lymphocyte Count (Lymphocytosis)",
            "potential_causes": ["Viral infection", "Chronic inflammation", "Leukemia"],
            "disease_conditions": ["Lymphocytosis", "Leukemia"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "Critical": {
            "intro": "Your Lymphocyte count is critically abnormal.",
            "general": "Critical lymphocyte levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical Lymphocyte Count",
            "potential_causes": ["Severe infection", "Severe immunosuppression"],
            "disease_conditions": ["Sepsis", "Severe immunodeficiency"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "monocytes": {
        "Normal": {
            "intro": "Your Monocyte count is within the normal range.",
            "general": "This suggests normal monocyte function.",
            "detailed": ["Normal monocyte count supports immune defense and tissue repair."],
            "recommendations": ["Maintain a healthy lifestyle."]
        },
        "Low": {
            "intro": "Your Monocyte count is low (Monocytopenia).",
            "general": "Low monocytes are rare but may occur in bone marrow suppression.",
            "detailed": ["May be due to bone marrow failure or severe infection."],
            "abnormal_primary": "Low Monocyte Count (Monocytopenia)",
            "potential_causes": ["Bone marrow failure", "Severe infection"],
            "disease_conditions": ["Aplastic anemia", "Sepsis"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "High": {
            "intro": "Your Monocyte count is high (Monocytosis).",
            "general": "High monocytes may indicate chronic infection or inflammation.",
            "detailed": ["May be due to tuberculosis, chronic inflammation, or leukemia."],
            "abnormal_primary": "High Monocyte Count (Monocytosis)",
            "potential_causes": ["Chronic infection", "Inflammation", "Leukemia"],
            "disease_conditions": ["Monocytosis", "Leukemia"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "Critical": {
            "intro": "Your Monocyte count is critically abnormal.",
            "general": "Critical monocyte levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical Monocyte Count",
            "potential_causes": ["Severe infection", "Severe bone marrow failure"],
            "disease_conditions": ["Sepsis", "Aplastic anemia"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "eosinophils": {
        "Normal": {
            "intro": "Your Eosinophil count is within the normal range.",
            "general": "This suggests no active allergic or parasitic process.",
            "detailed": ["Normal eosinophil count supports healthy immune balance."],
            "recommendations": ["Maintain a healthy lifestyle."]
        },
        "Low": {
            "intro": "Your Eosinophil count is low (rare).",
            "general": "Low eosinophils are usually not clinically significant.",
            "detailed": ["May be seen in stress or steroid use."],
            "abnormal_primary": "Low Eosinophil Count",
            "potential_causes": ["Stress", "Steroid use"],
            "disease_conditions": ["None"],
            "recommendations": ["No action needed unless symptomatic."]
        },
        "High": {
            "intro": "Your Eosinophil count is high (Eosinophilia).",
            "general": "High eosinophils may indicate allergy, asthma, or parasitic infection.",
            "detailed": ["May be due to allergic reaction, asthma, or parasitic infection."],
            "abnormal_primary": "High Eosinophil Count (Eosinophilia)",
            "potential_causes": ["Allergy", "Asthma", "Parasitic infection"],
            "disease_conditions": ["Eosinophilia", "Asthma", "Parasitic infection"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "Critical": {
            "intro": "Your Eosinophil count is critically abnormal.",
            "general": "Critical eosinophil levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical Eosinophil Count",
            "potential_causes": ["Severe allergy", "Severe infection"],
            "disease_conditions": ["Severe allergy", "Severe infection"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    "basophils": {
        "Normal": {
            "intro": "Your Basophil count is within the normal range.",
            "general": "This suggests no active allergic or myeloproliferative process.",
            "detailed": ["Normal basophil count supports healthy immune balance."],
            "recommendations": ["Maintain a healthy lifestyle."]
        },
        "Low": {
            "intro": "Your Basophil count is low (rare).",
            "general": "Low basophils are usually not clinically significant.",
            "detailed": ["May be seen in acute infection or stress."],
            "abnormal_primary": "Low Basophil Count",
            "potential_causes": ["Acute infection", "Stress"],
            "disease_conditions": ["None"],
            "recommendations": ["No action needed unless symptomatic."]
        },
        "High": {
            "intro": "Your Basophil count is high (Basophilia).",
            "general": "High basophils may indicate allergy, chronic inflammation, or myeloproliferative disorder.",
            "detailed": ["May be due to allergy, chronic inflammation, or blood disorder."],
            "abnormal_primary": "High Basophil Count (Basophilia)",
            "potential_causes": ["Allergy", "Chronic inflammation", "Myeloproliferative disorder"],
            "disease_conditions": ["Basophilia", "Myeloproliferative disorder"],
            "recommendations": ["Consult your doctor for further evaluation."]
        },
        "Critical": {
            "intro": "Your Basophil count is critically abnormal.",
            "general": "Critical basophil levels require urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical Basophil Count",
            "potential_causes": ["Severe allergy", "Severe blood disorder"],
            "disease_conditions": ["Severe allergy", "Severe blood disorder"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    }
}

def generate_interpretation(parameter_name, value, prediction_status, confidence=0.9, feature_importances=None):
    """
    Generate full medical interpretation for a parameter.
    
    Args:
        parameter_name: e.g., "hemoglobin", "wbc", "platelet"
        value: numeric value of the parameter
        prediction_status: 0 (Normal), 1 (Low), 2 (High), 3 (Critical)
        confidence: model confidence (0-1)
        feature_importances: list of dicts with feature contributions
    
    Returns:
        dict matching frontend contract
    """
    status_label = STATUS_NAMES.get(prediction_status, "Unknown")
    template = TEMPLATES.get(parameter_name, {}).get(status_label, {})
    
    if not template:
        # Fallback generic template
        template = {
            "intro": f"Your {parameter_name} level is {value}.",
            "general": f"Status: {status_label}",
            "detailed": [],
            "recommendations": ["Consult your healthcare provider for interpretation"]
        }
    
    # Build explainability section
    explainability = {
        "modelPrediction": status_label,
        "confidence": round(confidence, 3),
        "featureImportances": feature_importances if feature_importances else [],
        "shapExplanation": generate_shap_explanation(feature_importances) if feature_importances else ""
    }
    
    # Build output
    output = {
        "introduction": template.get("intro", ""),
        "generalInterpretation": template.get("general", ""),
        "detailedExplanation": template.get("detailed", []),
        "recommendations": template.get("recommendations", []),
        "explainability": explainability
    }
    
    # Add abnormalFindings if not Normal
    if prediction_status != 0:
        output["abnormalFindings"] = {
            "primaryFinding": template.get("abnormal_primary", f"{status_label} {parameter_name}"),
            "potentialCauses": template.get("potential_causes", []),
            "diseaseConditions": template.get("disease_conditions", [])
        }
    
    return output

def generate_shap_explanation(feature_importances):
    """Convert SHAP feature importances to natural language."""
    if not feature_importances or len(feature_importances) == 0:
        return "Model prediction based on all available features."
    
    # Sort by absolute impact
    sorted_features = sorted(feature_importances, key=lambda x: abs(x['impact']), reverse=True)
    top_3 = sorted_features[:3]
    
    explanations = []
    for feat in top_3:
        direction_text = "increases" if feat['impact'] > 0 else "decreases"
        explanations.append(f"{feat['feature']} {direction_text} the prediction (impact: {abs(feat['impact']):.2f})")
    
    return "Key factors influencing this prediction: " + "; ".join(explanations)

# Example usage
if __name__ == '__main__':
    # Test
    result = generate_interpretation(
        parameter_name="hemoglobin",
        value=10.5,
        prediction_status=1,  # Low
        confidence=0.92,
        feature_importances=[
            {"feature": "Age", "impact": 0.3, "direction": "increases"},
            {"feature": "Gender", "impact": -0.1, "direction": "decreases"},
            {"feature": "Pregnancy", "impact": 0.2, "direction": "increases"}
        ]
    )
    print(json.dumps(result, indent=2))
