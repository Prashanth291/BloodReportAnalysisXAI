"""
Comprehensive Medical Text Templates for All Parameters
Covers CBC, Diabetes, Kidney, Iron, Vitamins, Hormones, Inflammatory markers, and Urine analysis
"""

# Template structure for each parameter and status
COMPREHENSIVE_TEMPLATES = {
    
    # ═══════════════════════════════════════════════════════════════
    # COMPLETE BLOOD COUNT (CBC) - 19 parameters
    # ═══════════════════════════════════════════════════════════════
    
    "hemoglobin_g_dL": {
        "parameter_name": "Hemoglobin (Hb)",
        "unit": "g/dL",
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
                "Polycythemia vera"
            ],
            "disease_conditions": ["Polycythemia vera", "Secondary polycythemia", "Chronic hypoxia"],
            "recommendations": [
                "Ensure adequate hydration",
                "Consult hematologist for evaluation",
                "May need bone marrow biopsy",
                "Monitor for thrombosis risk"
            ]
        },
        "Critical": {
            "intro": "Your Hemoglobin level is critically abnormal and requires immediate medical attention.",
            "general": "Critical hemoglobin levels can be life-threatening and need urgent evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical Hemoglobin Level",
            "potential_causes": ["Severe anemia", "Acute blood loss", "Severe polycythemia"],
            "disease_conditions": ["Life-threatening anemia", "Severe polycythemia", "Medical emergency"],
            "recommendations": [
                "SEEK IMMEDIATE MEDICAL ATTENTION",
                "May require blood transfusion",
                "Urgent hospitalization may be necessary"
            ]
        }
    },
    
    "rbc_count": {
        "parameter_name": "Red Blood Cell (RBC) Count",
        "unit": "×10⁶/μL",
        "Normal": {
            "intro": "Your Red Blood Cell (RBC) count is within the normal range.",
            "general": "This indicates healthy red cell production and oxygen transport.",
            "detailed": ["Normal RBC count supports adequate tissue oxygenation"],
            "recommendations": ["Maintain a balanced diet and regular checkups"]
        },
        "Low": {
            "intro": "Your RBC count is low (Erythropenia).",
            "general": "Low RBC may cause anemia symptoms like fatigue and pallor.",
            "detailed": ["May be due to blood loss, nutritional deficiency, or bone marrow issues"],
            "abnormal_primary": "Low RBC Count (Erythropenia)",
            "potential_causes": ["Blood loss", "Nutritional deficiency", "Bone marrow disease", "Chronic disease"],
            "disease_conditions": ["Anemia", "Bone marrow failure", "Hemolytic disorders"],
            "recommendations": [
                "Complete blood count with indices",
                "Iron studies and vitamin B12 levels",
                "Investigate underlying cause"
            ]
        },
        "High": {
            "intro": "Your RBC count is elevated (Erythrocytosis).",
            "general": "High RBC count increases blood viscosity and thrombosis risk.",
            "detailed": ["May indicate dehydration, chronic hypoxia, or polycythemia"],
            "abnormal_primary": "Elevated RBC Count (Erythrocytosis)",
            "potential_causes": ["Dehydration", "Chronic lung disease", "Living at altitude", "Polycythemia vera"],
            "disease_conditions": ["Polycythemia vera", "Secondary erythrocytosis"],
            "recommendations": ["Hematology consultation", "Hydration", "Monitor for clotting complications"]
        },
        "Critical": {
            "intro": "Your RBC count is critically abnormal.",
            "general": "Requires urgent medical evaluation.",
            "detailed": [],
            "abnormal_primary": "Critical RBC Count",
            "potential_causes": ["Severe anemia", "Severe polycythemia"],
            "disease_conditions": ["Medical emergency"],
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]
        }
    },
    
    "wbc_10e9_L": {
        "parameter_name": "White Blood Cell (WBC) Count",
        "unit": "×10⁹/L",
        "Normal": {
            "intro": "Your White Blood Cell count is within the normal range.",
            "general": "This indicates a healthy immune system response.",
            "detailed": ["Normal WBC count suggests no active infection or inflammation"],
            "recommendations": ["Maintain good hygiene", "Continue healthy lifestyle"]
        },
        "Low": {
            "intro": "Your White Blood Cell count is low (Leukopenia).",
            "general": "Low WBC count may increase your susceptibility to infections.",
            "detailed": [
                "Leukopenia can be caused by viral infections, medications, or bone marrow issues",
                "Increased risk of bacterial and fungal infections"
            ],
            "abnormal_primary": "Low WBC Count (Leukopenia)",
            "potential_causes": [
                "Viral infections",
                "Bone marrow suppression",
                "Autoimmune disorders",
                "Medications (chemotherapy, antibiotics)",
                "Nutritional deficiencies"
            ],
            "disease_conditions": ["Aplastic anemia", "Leukemia", "HIV/AIDS", "Autoimmune disorders"],
            "recommendations": [
                "Consult your healthcare provider",
                "Avoid sick contacts",
                "Practice excellent hygiene",
                "May need bone marrow evaluation"
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
            "intro": "Your WBC count is critically abnormal and requires urgent evaluation.",
            "general": "Critical WBC levels may indicate severe infection, leukemia, or life-threatening condition.",
            "detailed": [],
            "abnormal_primary": "Critical WBC Count",
            "potential_causes": ["Severe infection/sepsis", "Acute leukemia", "Bone marrow failure"],
            "disease_conditions": ["Sepsis", "Acute leukemia", "Medical emergency"],
            "recommendations": [
                "SEEK IMMEDIATE MEDICAL ATTENTION",
                "Emergency evaluation needed",
                "May require hospitalization"
            ]
        }
    },
    
    "platelet_count": {
        "parameter_name": "Platelet Count",
        "unit": "×10³/μL",
        "Normal": {
            "intro": "Your Platelet count is within the normal range.",
            "general": "This indicates healthy blood clotting function.",
            "detailed": ["Normal platelet count ensures proper hemostasis and clotting"],
            "recommendations": ["Continue regular monitoring", "No specific intervention needed"]
        },
        "Low": {
            "intro": "Your Platelet count is low (Thrombocytopenia).",
            "general": "Low platelets increase bleeding and bruising risk.",
            "detailed": ["May be due to decreased production or increased destruction"],
            "abnormal_primary": "Low Platelet Count (Thrombocytopenia)",
            "potential_causes": [
                "ITP (Immune Thrombocytopenic Purpura)",
                "Bone marrow disorders",
                "Medications",
                "Viral infections",
                "Liver disease"
            ],
            "disease_conditions": ["ITP", "Aplastic anemia", "Leukemia", "Liver cirrhosis"],
            "recommendations": [
                "Avoid activities that may cause injury",
                "No aspirin or NSAIDs without doctor approval",
                "Watch for bleeding signs",
                "Hematology consultation"
            ]
        },
        "High": {
            "intro": "Your Platelet count is elevated (Thrombocytosis).",
            "general": "High platelets may increase risk of abnormal clotting.",
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
    
    # Additional CBC parameters (abbreviated for space)
    "hematocrit_percent": {
        "parameter_name": "Hematocrit (PCV)",
        "unit": "%",
        "Normal": {"intro": "Your Hematocrit is normal.", "general": "Indicates healthy blood volume and RBC proportion.", "detailed": [], "recommendations": ["Continue regular monitoring"]},
        "Low": {"intro": "Low Hematocrit indicates anemia.", "general": "May cause fatigue and weakness.", "abnormal_primary": "Low Hematocrit", "potential_causes": ["Anemia", "Blood loss", "Overhydration"], "disease_conditions": ["Anemia"], "recommendations": ["Check hemoglobin", "Iron studies"]},
        "High": {"intro": "High Hematocrit.", "general": "Increases blood viscosity.", "abnormal_primary": "Elevated Hematocrit", "potential_causes": ["Dehydration", "Polycythemia"], "disease_conditions": ["Polycythemia"], "recommendations": ["Hydration", "Hematology consultation"]},
        "Critical": {"intro": "Critical Hematocrit level.", "general": "Urgent evaluation needed.", "abnormal_primary": "Critical Hematocrit", "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION"]}
    },
    
    "mcv_fL": {
        "parameter_name": "Mean Corpuscular Volume (MCV)",
        "unit": "fL",
        "Normal": {"intro": "Your MCV is normal.", "general": "RBC size is normal.", "detailed": [], "recommendations": ["Continue monitoring"]},
        "Low": {"intro": "Low MCV (Microcytic).", "general": "Small RBCs suggest iron deficiency or thalassemia.", "abnormal_primary": "Microcytic Anemia", "potential_causes": ["Iron deficiency", "Thalassemia", "Chronic disease"], "disease_conditions": ["Iron deficiency anemia", "Thalassemia"], "recommendations": ["Iron studies", "Hemoglobin electrophoresis"]},
        "High": {"intro": "High MCV (Macrocytic).", "general": "Large RBCs suggest B12/folate deficiency.", "abnormal_primary": "Macrocytic Anemia", "potential_causes": ["Vitamin B12 deficiency", "Folate deficiency", "Liver disease"], "disease_conditions": ["Pernicious anemia", "Megaloblastic anemia"], "recommendations": ["B12 and folate levels", "Liver function tests"]},
        "Critical": {"intro": "Critical MCV.", "abnormal_primary": "Critical MCV", "recommendations": ["Medical evaluation needed"]}
    },
    
    "mch_pg": {
        "parameter_name": "Mean Corpuscular Hemoglobin (MCH)",
        "unit": "pg",
        "Normal": {"intro": "Your MCH is normal.", "general": "Hemoglobin content per RBC is adequate.", "recommendations": []},
        "Low": {"intro": "Low MCH.", "general": "Low hemoglobin per RBC.", "abnormal_primary": "Low MCH", "potential_causes": ["Iron deficiency", "Thalassemia"], "recommendations": ["Iron studies"]},
        "High": {"intro": "High MCH.", "general": "High hemoglobin per RBC.", "abnormal_primary": "High MCH", "potential_causes": ["B12/folate deficiency"], "recommendations": ["Vitamin levels"]},
        "Critical": {"intro": "Critical MCH.", "recommendations": ["Medical evaluation"]}
    },
    
    "mchc_g_dL": {
        "parameter_name": "Mean Corpuscular Hemoglobin Concentration (MCHC)",
        "unit": "g/dL",
        "Normal": {"intro": "Your MCHC is normal.", "general": "Hemoglobin concentration is adequate.", "recommendations": []},
        "Low": {"intro": "Low MCHC.", "general": "Hypochromic anemia.", "abnormal_primary": "Low MCHC", "potential_causes": ["Iron deficiency"], "recommendations": ["Iron studies"]},
        "High": {"intro": "High MCHC.", "general": "Rarely elevated.", "abnormal_primary": "High MCHC", "potential_causes": ["Hereditary spherocytosis", "Lab error"], "recommendations": ["Blood smear review"]},
        "Critical": {"intro": "Critical MCHC.", "recommendations": ["Medical evaluation"]}
    },
    
    "rdw_percent": {
        "parameter_name": "Red Cell Distribution Width (RDW)",
        "unit": "%",
        "Normal": {"intro": "Your RDW is normal.", "general": "RBC sizes are uniform.", "recommendations": []},
        "Low": {"intro": "Low RDW is rare.", "general": "Very uniform RBC size.", "recommendations": []},
        "High": {"intro": "High RDW indicates mixed RBC sizes.", "general": "Suggests anemia or nutritional deficiency.", "abnormal_primary": "Elevated RDW", "potential_causes": ["Iron deficiency", "B12/folate deficiency", "Mixed anemia", "Cardiovascular disease"], "disease_conditions": ["Anemia", "Heart failure risk"], "recommendations": ["Complete iron and vitamin studies", "Cardiovascular risk assessment"]},
        "Critical": {"intro": "Very high RDW.", "general": "Severe anemia or cardiovascular risk.", "abnormal_primary": "Critical RDW", "recommendations": ["Urgent medical evaluation"]}
    },
    
    # WBC Differential
    "neutrophils_percent": {
        "parameter_name": "Neutrophils",
        "unit": "%",
        "Normal": {"intro": "Neutrophil percentage is normal.", "general": "Adequate bacterial defense.", "recommendations": []},
        "Low": {"intro": "Low Neutrophils (Neutropenia).", "general": "Increased infection risk.", "abnormal_primary": "Neutropenia", "potential_causes": ["Viral infection", "Bone marrow suppression", "Autoimmune"], "disease_conditions": ["Aplastic anemia", "Drug toxicity"], "recommendations": ["Avoid sick contacts", "Monitor for fever", "Hematology consultation"]},
        "High": {"intro": "High Neutrophils (Neutrophilia).", "general": "Suggests bacterial infection or inflammation.", "abnormal_primary": "Neutrophilia", "potential_causes": ["Bacterial infection", "Inflammation", "Stress", "Smoking"], "disease_conditions": ["Bacterial infection", "Inflammatory disorders"], "recommendations": ["Investigate for infection", "Blood culture if febrile"]},
        "Critical": {"intro": "Critical Neutrophil level.", "abnormal_primary": "Critical Neutrophilia/Neutropenia", "recommendations": ["URGENT MEDICAL ATTENTION"]}
    },
    
    "lymphocytes_percent": {
        "parameter_name": "Lymphocytes",
        "unit": "%",
        "Normal": {"intro": "Lymphocyte percentage is normal.", "general": "Healthy immune function.", "recommendations": []},
        "Low": {"intro": "Low Lymphocytes (Lymphopenia).", "general": "Reduced immune response.", "abnormal_primary": "Lymphopenia", "potential_causes": ["HIV", "Immunosuppression", "Corticosteroids"], "disease_conditions": ["HIV/AIDS", "Immunodeficiency"], "recommendations": ["HIV screening", "Immunology consultation"]},
        "High": {"intro": "High Lymphocytes (Lymphocytosis).", "general": "Often seen in viral infections.", "abnormal_primary": "Lymphocytosis", "potential_causes": ["Viral infection", "Chronic lymphocytic leukemia", "Stress"], "disease_conditions": ["Viral infection", "CLL"], "recommendations": ["Monitor for symptoms", "Blood smear review"]},
        "Critical": {"intro": "Critical Lymphocyte level.", "recommendations": ["Urgent evaluation"]}
    },
    
    "monocytes_percent": {
        "parameter_name": "Monocytes",
        "unit": "%",
        "Normal": {"intro": "Monocyte percentage is normal.", "recommendations": []},
        "Low": {"intro": "Low Monocytes.", "general": "Rarely clinically significant.", "recommendations": []},
        "High": {"intro": "High Monocytes (Monocytosis).", "general": "Chronic infection or inflammation.", "abnormal_primary": "Monocytosis", "potential_causes": ["Chronic infection", "TB", "Inflammatory bowel disease"], "disease_conditions": ["Tuberculosis", "Chronic inflammation"], "recommendations": ["Investigate for chronic infection"]},
        "Critical": {"intro": "Critical Monocyte level.", "recommendations": ["Medical evaluation"]}
    },
    
    "eosinophils_percent": {
        "parameter_name": "Eosinophils",
        "unit": "%",
        "Normal": {"intro": "Eosinophil percentage is normal.", "recommendations": []},
        "High": {"intro": "High Eosinophils (Eosinophilia).", "general": "Allergies or parasitic infection.", "abnormal_primary": "Eosinophilia", "potential_causes": ["Allergies", "Asthma", "Parasitic infection", "Drug reaction"], "disease_conditions": ["Allergic disorders", "Parasitic infection"], "recommendations": ["Allergy testing", "Stool examination for parasites"]},
        "Critical": {"intro": "Very high Eosinophils.", "recommendations": ["Hematology consultation"]}
    },
    
    "basophils_percent": {
        "parameter_name": "Basophils",
        "unit": "%",
        "Normal": {"intro": "Basophil percentage is normal.", "recommendations": []},
        "High": {"intro": "High Basophils (Basophilia).", "general": "Rare finding.", "abnormal_primary": "Basophilia", "potential_causes": ["Myeloproliferative disorders", "Chronic inflammation"], "recommendations": ["Hematology evaluation"]},
        "Critical": {"intro": "Critical Basophil level.", "recommendations": ["Specialist consultation"]}
    },
    
    # ═══════════════════════════════════════════════════════════════
    # DIABETES & GLUCOSE - 3 parameters
    # ═══════════════════════════════════════════════════════════════
    
    "random_blood_sugar_mg_dL": {
        "parameter_name": "Random Blood Sugar (RBS)",
        "unit": "mg/dL",
        "Normal": {
            "intro": "Your Random Blood Sugar is within normal range.",
            "general": "No evidence of diabetes or hyperglycemia.",
            "detailed": ["Normal glucose metabolism"],
            "recommendations": ["Maintain healthy diet", "Regular exercise", "Annual screening"]
        },
        "Borderline High": {
            "intro": "Your Random Blood Sugar is borderline elevated.",
            "general": "May indicate prediabetes or postprandial hyperglycemia.",
            "abnormal_primary": "Borderline High Blood Sugar",
            "potential_causes": ["Prediabetes", "Recent meal", "Stress", "Insulin resistance"],
            "disease_conditions": ["Prediabetes", "Metabolic syndrome"],
            "recommendations": [
                "Fasting blood glucose test",
                "HbA1c test",
                "Reduce refined carbohydrates",
                "Weight management",
                "Regular exercise"
            ]
        },
        "High": {
            "intro": "Your Random Blood Sugar is elevated.",
            "general": "Indicates diabetes or significant hyperglycemia.",
            "abnormal_primary": "High Blood Sugar (Hyperglycemia)",
            "potential_causes": ["Type 2 diabetes", "Type 1 diabetes", "Steroid use", "Pancreatic disease"],
            "disease_conditions": ["Diabetes mellitus", "Pancreatic disorders"],
            "recommendations": [
                "Consult endocrinologist",
                "HbA1c and fasting glucose",
                "Diabetes medication may be needed",
                "Diet modification",
                "Blood sugar monitoring"
            ]
        },
        "Critical": {
            "intro": "Your blood sugar is critically high or low.",
            "general": "Requires immediate medical attention.",
            "abnormal_primary": "Critical Blood Sugar",
            "potential_causes": ["Diabetic emergency", "Hypoglycemia", "DKA"],
            "disease_conditions": ["Diabetic ketoacidosis", "Hypoglycemic shock"],
            "recommendations": [
                "SEEK IMMEDIATE EMERGENCY CARE",
                "Risk of diabetic coma",
                "Check for ketones"
            ]
        }
    },
    
    "hba1c_percent": {
        "parameter_name": "HbA1c (Glycated Hemoglobin)",
        "unit": "%",
        "Normal": {
            "intro": "Your HbA1c is in the normal range.",
            "general": "Excellent long-term blood sugar control.",
            "detailed": ["Average blood glucose over past 2-3 months is normal"],
            "recommendations": ["Continue healthy lifestyle", "Annual HbA1c screening"]
        },
        "Prediabetic": {
            "intro": "Your HbA1c indicates prediabetes.",
            "general": "You are at increased risk for developing type 2 diabetes.",
            "abnormal_primary": "Prediabetes (HbA1c 5.7-6.4%)",
            "potential_causes": ["Insulin resistance", "Obesity", "Sedentary lifestyle", "Family history"],
            "disease_conditions": ["Prediabetes", "Metabolic syndrome"],
            "recommendations": [
                "Lifestyle intervention CRITICAL",
                "Weight loss (5-10% of body weight)",
                "Exercise 150 min/week",
                "Low glycemic diet",
                "Repeat HbA1c in 3-6 months"
            ]
        },
        "Diabetic Range": {
            "intro": "Your HbA1c confirms diabetes.",
            "general": "Indicates diabetes with poor long-term control.",
            "abnormal_primary": "Diabetes (HbA1c ≥6.5%)",
            "potential_causes": ["Type 2 diabetes", "Type 1 diabetes", "Poor diabetes control"],
            "disease_conditions": ["Diabetes mellitus", "Risk of diabetic complications"],
            "recommendations": [
                "Urgent endocrinology consultation",
                "Start or adjust diabetes medication",
                "Regular blood sugar monitoring",
                "Diabetes education program",
                "Screen for complications (retinopathy, nephropathy, neuropathy)"
            ]
        },
        "Low": {
            "intro": "Your HbA1c is below normal.",
            "general": "Rare finding, may indicate hypoglycemia or hemolytic anemia.",
            "abnormal_primary": "Low HbA1c",
            "potential_causes": ["Frequent hypoglycemia", "Hemolytic anemia", "Recent blood loss"],
            "recommendations": ["Investigate for anemia", "Review medications"]
        }
    },
    
    # ═══════════════════════════════════════════════════════════════
    # INFLAMMATORY MARKERS - 2 parameters
    # ═══════════════════════════════════════════════════════════════
    
    "esr_mm_hr": {
        "parameter_name": "Erythrocyte Sedimentation Rate (ESR)",
        "unit": "mm/hr",
        "Normal": {
            "intro": "Your ESR is normal.",
            "general": "No significant inflammation detected.",
            "recommendations": ["Continue monitoring"]
        },
        "High": {
            "intro": "Your ESR is elevated.",
            "general": "Indicates inflammation or infection in the body.",
            "abnormal_primary": "Elevated ESR",
            "potential_causes": [
                "Infection",
                "Autoimmune disease",
                "Cancer",
                "Tissue injury",
                "Pregnancy"
            ],
            "disease_conditions": ["Rheumatoid arthritis", "Lupus", "Infections", "Temporal arteritis"],
            "recommendations": [
                "Investigate underlying cause",
                "Complete blood count",
                "CRP test",
                "Autoimmune workup if indicated"
            ]
        },
        "Critical": {
            "intro": "Your ESR is very high.",
            "general": "Suggests severe inflammation or serious disease.",
            "abnormal_primary": "Critically Elevated ESR",
            "potential_causes": ["Severe infection", "Active autoimmune disease", "Malignancy"],
            "recommendations": ["Urgent medical evaluation", "Comprehensive workup needed"]
        }
    },
    
    "crp_mg_L": {
        "parameter_name": "C-Reactive Protein (CRP)",
        "unit": "mg/L",
        "Normal": {
            "intro": "Your CRP is normal.",
            "general": "No acute inflammation detected.",
            "recommendations": []
        },
        "Elevated": {
            "intro": "Your CRP is elevated.",
            "general": "Indicates active inflammation.",
            "abnormal_primary": "Elevated CRP",
            "potential_causes": ["Infection", "Inflammation", "Tissue injury", "Cardiovascular disease"],
            "disease_conditions": ["Bacterial infection", "Inflammatory disorders", "Cardiovascular risk"],
            "recommendations": ["Investigate for infection", "Monitor cardiovascular risk"]
        },
        "High": {
            "intro": "Your CRP is significantly elevated.",
            "general": "Suggests serious infection or inflammation.",
            "abnormal_primary": "High CRP",
            "potential_causes": ["Severe bacterial infection", "Sepsis", "Major trauma"],
            "disease_conditions": ["Sepsis", "Severe infection", "Major inflammatory disease"],
            "recommendations": ["Urgent medical evaluation", "Blood cultures", "Antibiotic therapy may be needed"]
        },
        "Critical": {
            "intro": "Your CRP is critically elevated.",
            "general": "Medical emergency - possible sepsis.",
            "abnormal_primary": "Critical CRP Level",
            "recommendations": ["SEEK IMMEDIATE MEDICAL ATTENTION", "Emergency evaluation for sepsis"]
        }
    },
    
    # ═══════════════════════════════════════════════════════════════
    # KIDNEY FUNCTION - 1 parameter
    # ═══════════════════════════════════════════════════════════════
    
    "serum_creatinine_mg_dL": {
        "parameter_name": "Serum Creatinine",
        "unit": "mg/dL",
        "Normal": {
            "intro": "Your Serum Creatinine is normal.",
            "general": "Kidneys are functioning properly.",
            "recommendations": ["Continue healthy lifestyle", "Stay hydrated"]
        },
        "Borderline High": {
            "intro": "Your Serum Creatinine is borderline elevated.",
            "general": "May indicate early kidney dysfunction.",
            "abnormal_primary": "Borderline Elevated Creatinine",
            "potential_causes": ["Dehydration", "High protein diet", "Muscle mass", "Early kidney disease"],
            "recommendations": ["Repeat test", "Calculate eGFR", "Monitor blood pressure", "Stay hydrated"]
        },
        "High": {
            "intro": "Your Serum Creatinine is elevated.",
            "general": "Indicates impaired kidney function.",
            "abnormal_primary": "Elevated Creatinine - Kidney Dysfunction",
            "potential_causes": [
                "Chronic kidney disease",
                "Acute kidney injury",
                "Dehydration",
                "Diabetes complications",
                "Hypertension"
            ],
            "disease_conditions": ["Chronic kidney disease", "Acute kidney injury"],
            "recommendations": [
                "Nephrology consultation",
                "Complete kidney function tests (BUN, eGFR)",
                "Ultrasound kidneys",
                "Blood pressure control",
                "Limit protein intake"
            ]
        },
        "Critical": {
            "intro": "Your Serum Creatinine is critically elevated.",
            "general": "Severe kidney dysfunction - may need dialysis.",
            "abnormal_primary": "Severe Kidney Dysfunction",
            "potential_causes": ["End-stage renal disease", "Acute kidney failure"],
            "disease_conditions": ["Kidney failure"],
            "recommendations": [
                "URGENT NEPHROLOGY CONSULTATION",
                "May require dialysis",
                "Hospitalization may be necessary"
            ]
        }
    },
    
    # ═══════════════════════════════════════════════════════════════
    # IRON STUDIES - 5 parameters
    # ═══════════════════════════════════════════════════════════════
    
    "serum_iron_mcg_dL": {
        "parameter_name": "Serum Iron",
        "unit": "μg/dL",
        "Normal": {"intro": "Serum Iron is normal.", "recommendations": []},
        "Low": {
            "intro": "Low Serum Iron.",
            "general": "Suggests iron deficiency.",
            "abnormal_primary": "Low Serum Iron",
            "potential_causes": ["Iron deficiency anemia", "Chronic blood loss", "Poor dietary intake"],
            "disease_conditions": ["Iron deficiency anemia"],
            "recommendations": ["Iron supplementation", "Iron-rich diet", "Investigate blood loss"]
        },
        "High": {
            "intro": "High Serum Iron.",
            "general": "May indicate iron overload.",
            "abnormal_primary": "Iron Overload",
            "potential_causes": ["Hemochromatosis", "Iron supplementation", "Hemolysis"],
            "disease_conditions": ["Hemochromatosis"],
            "recommendations": ["Ferritin and transferrin saturation", "Genetic testing for hemochromatosis"]
        }
    },
    
    "tibc_mcg_dL": {
        "parameter_name": "Total Iron Binding Capacity (TIBC)",
        "unit": "μg/dL",
        "Normal": {"intro": "TIBC is normal.", "recommendations": []},
        "Low": {"intro": "Low TIBC.", "general": "May indicate chronic disease or inflammation.", "recommendations": ["Investigate for chronic illness"]},
        "High": {"intro": "High TIBC.", "general": "Suggests iron deficiency.", "abnormal_primary": "Elevated TIBC", "potential_causes": ["Iron deficiency"], "recommendations": ["Iron supplementation"]}
    },
    
    "transferrin_saturation_percent": {
        "parameter_name": "Transferrin Saturation",
        "unit": "%",
        "Normal": {"intro": "Transferrin Saturation is normal.", "recommendations": []},
        "Low": {"intro": "Low Transferrin Saturation.", "general": "Iron deficiency.", "abnormal_primary": "Low Transferrin Saturation", "potential_causes": ["Iron deficiency"], "recommendations": ["Iron supplementation"]},
        "High": {"intro": "High Transferrin Saturation.", "general": "Iron overload.", "abnormal_primary": "High Transferrin Saturation", "potential_causes": ["Hemochromatosis"], "recommendations": ["Genetic testing", "Phlebotomy may be needed"]}
    },
    
    "ferritin_ng_mL": {
        "parameter_name": "Ferritin",
        "unit": "ng/mL",
        "Normal": {"intro": "Ferritin is normal.", "general": "Adequate iron stores.", "recommendations": []},
        "Low": {
            "intro": "Low Ferritin.",
            "general": "Indicates depleted iron stores.",
            "abnormal_primary": "Low Ferritin - Iron Deficiency",
            "potential_causes": ["Iron deficiency anemia", "Blood loss", "Poor absorption"],
            "disease_conditions": ["Iron deficiency anemia"],
            "recommendations": ["Iron supplementation", "Iron-rich diet", "Investigate cause"]
        },
        "High": {
            "intro": "High Ferritin.",
            "general": "May indicate iron overload or inflammation.",
            "abnormal_primary": "Elevated Ferritin",
            "potential_causes": ["Hemochromatosis", "Inflammation", "Liver disease", "Malignancy"],
            "disease_conditions": ["Hemochromatosis", "Inflammatory disorders"],
            "recommendations": ["Transferrin saturation", "Liver function tests", "Rule out hemochromatosis"]
        }
    },
    
    # ═══════════════════════════════════════════════════════════════
    # VITAMINS & HORMONES - 4 parameters
    # ═══════════════════════════════════════════════════════════════
    
    "vitamin_b12_pg_mL": {
        "parameter_name": "Vitamin B12",
        "unit": "pg/mL",
        "Normal": {"intro": "Vitamin B12 is normal.", "recommendations": []},
        "Low": {
            "intro": "Low Vitamin B12.",
            "general": "Deficiency can cause anemia and neurological symptoms.",
            "abnormal_primary": "Vitamin B12 Deficiency",
            "potential_causes": ["Pernicious anemia", "Vegan diet", "Malabsorption", "Gastric surgery"],
            "disease_conditions": ["Pernicious anemia", "Megaloblastic anemia", "Neuropathy"],
            "recommendations": ["B12 supplementation (oral or injection)", "Investigate cause", "Monitor neurological symptoms"]
        },
        "High": {"intro": "High Vitamin B12.", "general": "Usually not harmful.", "recommendations": ["Review supplements"]}
    },
    
    "vitamin_d_ng_mL": {
        "parameter_name": "Vitamin D (25-Hydroxy)",
        "unit": "ng/mL",
        "Sufficient": {"intro": "Vitamin D is sufficient.", "recommendations": ["Continue sun exposure and diet"]},
        "Insufficient": {
            "intro": "Vitamin D is insufficient.",
            "general": "May affect bone health and immunity.",
            "abnormal_primary": "Vitamin D Insufficiency",
            "potential_causes": ["Limited sun exposure", "Poor diet", "Malabsorption"],
            "recommendations": ["Vitamin D supplementation (1000-2000 IU daily)", "Sun exposure 10-15 min/day"]
        },
        "Deficient": {
            "intro": "Vitamin D is deficient.",
            "general": "Increases risk of bone disease and immune dysfunction.",
            "abnormal_primary": "Vitamin D Deficiency",
            "potential_causes": ["Inadequate sun exposure", "Malabsorption", "Kidney disease"],
            "disease_conditions": ["Osteomalacia", "Rickets", "Osteoporosis risk"],
            "recommendations": ["High-dose Vitamin D (50,000 IU weekly)", "Calcium supplementation", "Bone density scan"]
        },
        "High": {"intro": "High Vitamin D.", "general": "May indicate toxicity.", "recommendations": ["Stop supplementation", "Monitor calcium levels"]}
    },
    
    "tsh_mIU_L": {
        "parameter_name": "Thyroid Stimulating Hormone (TSH)",
        "unit": "mIU/L",
        "Normal": {"intro": "TSH is normal.", "general": "Thyroid function is normal.", "recommendations": []},
        "Low": {
            "intro": "Low TSH.",
            "general": "Suggests hyperthyroidism.",
            "abnormal_primary": "Hyperthyroidism (Low TSH)",
            "potential_causes": ["Graves' disease", "Toxic nodular goiter", "Thyroiditis"],
            "disease_conditions": ["Hyperthyroidism", "Graves' disease"],
            "recommendations": ["Free T4 and T3 levels", "Thyroid ultrasound", "Endocrinology consultation", "Anti-thyroid medication may be needed"]
        },
        "High": {
            "intro": "High TSH.",
            "general": "Suggests hypothyroidism.",
            "abnormal_primary": "Hypothyroidism (High TSH)",
            "potential_causes": ["Hashimoto's thyroiditis", "Iodine deficiency", "Thyroid surgery"],
            "disease_conditions": ["Hypothyroidism", "Hashimoto's thyroiditis"],
            "recommendations": ["Free T4 level", "Thyroid antibodies", "Levothyroxine therapy", "Endocrinology consultation"]
        }
    },
    
    "cortisol_pm_mcg_dL": {
        "parameter_name": "Cortisol PM",
        "unit": "μg/dL",
        "Normal": {"intro": "PM Cortisol is normal.", "recommendations": []},
        "Low": {"intro": "Low PM Cortisol.", "general": "May suggest adrenal insufficiency.", "abnormal_primary": "Low Cortisol", "potential_causes": ["Addison's disease", "Adrenal insufficiency"], "recommendations": ["ACTH stimulation test", "Endocrinology consultation"]},
        "High": {"intro": "High PM Cortisol.", "general": "May suggest Cushing's syndrome.", "abnormal_primary": "High Cortisol", "potential_causes": ["Cushing's syndrome", "Stress"], "recommendations": ["24-hour urinary cortisol", "Dexamethasone suppression test"]}
    }
}


def get_template(parameter_name, status_label):
    """
    Get medical text template for a parameter and status.
    
    Args:
        parameter_name: e.g., "hemoglobin_g_dL", "wbc_10e9_L"
        status_label: e.g., "Normal", "Low", "High", "Critical"
    
    Returns:
        dict with template fields or None
    """
    param_templates = COMPREHENSIVE_TEMPLATES.get(parameter_name, {})
    return param_templates.get(status_label)


def get_all_parameters():
    """Return list of all parameters with templates"""
    return list(COMPREHENSIVE_TEMPLATES.keys())


# Additional note: Templates for urine parameters (qualitative) would use categorical status
# Example: urine_albumin: "Nil", "Trace", "+", "++", "+++"
# These can be added as needed with simple status-based templates
