// Parameter interpretation database with detailed medical explanations
// This uses if-else logic for now - can be replaced with XAI model later

export const getParameterInterpretation = (
  parameterName,
  status,
  value,
  referenceRange
) => {
  const param = parameterName?.toLowerCase().trim();
  const statusLower = status?.toLowerCase();

  // Base interpretation structure
  const interpretation = {
    introduction: "",
    generalInterpretation: "",
    detailedExplanation: [],
    abnormalFindings: null,
    recommendations: [],
  };

  // HEMOGLOBIN
  if (param.includes("haemoglobin") || param === "hb" || param === "hgb") {
    interpretation.introduction = `Hemoglobin is a protein in red blood cells that carries oxygen throughout the body. Your level is ${value} g/dL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your hemoglobin level is within the normal range, indicating healthy oxygen-carrying capacity of your blood. This suggests adequate iron levels and proper red blood cell production.`;
      interpretation.detailedExplanation = [
        {
          label: "Haemoglobin",
          text: `Measures the amount of haemoglobin in the blood. Your level is ${value} g/dL, which is within the normal range for your demographics.`,
        },
      ];
      interpretation.recommendations = [
        "Maintain a balanced diet rich in iron (red meat, spinach, legumes)",
        "Continue regular health check-ups",
        "Stay hydrated and maintain healthy lifestyle habits",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your hemoglobin level is elevated above the normal range. While sometimes temporary, persistently high hemoglobin may indicate dehydration or underlying health conditions.`;
      interpretation.detailedExplanation = [
        {
          label: "Hemoglobin",
          text: `Your count is ${value} g/dL, which is significantly higher than the normal range.`,
        },
        {
          label: "RBC Count",
          text: "May also be elevated, indicating polycythemia or increased red blood cell production.",
        },
      ];
      interpretation.abnormalFindings = {
        primaryFinding: `The primary abnormal finding is an elevated hemoglobin count of ${value} g/dL, which is above the normal range.`,
        potentialCauses: [
          "Dehydration (most common temporary cause)",
          "Living at high altitudes",
          "Smoking or exposure to carbon monoxide",
          "Chronic lung diseases (COPD)",
          "Congenital heart disease",
        ],
        diseaseConditions: [
          "Polycythemia vera (bone marrow disorder)",
          "Sleep apnea",
          "Pulmonary fibrosis",
          "Kidney tumors producing excess erythropoietin",
        ],
      };
      interpretation.recommendations = [
        "Consult your healthcare provider for follow-up testing",
        "Ensure adequate hydration",
        "Consider testing oxygen saturation levels",
        "Discuss smoking cessation if applicable",
        "May need bone marrow examination if persistently elevated",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your hemoglobin level is below the normal range, indicating anemia. This means your blood may not be carrying enough oxygen to your body's tissues.`;
      interpretation.detailedExplanation = [
        {
          label: "Hemoglobin",
          text: `Your level is ${value} g/dL, which is below the normal range, indicating anemia.`,
        },
        {
          label: "PCV (Packed Cell Volume)",
          text: "Also known as hematocrit, this measures the proportion of blood volume occupied by red blood cells.",
        },
      ];
      interpretation.abnormalFindings = {
        primaryFinding: `The primary abnormal finding is a low hemoglobin level of ${value} g/dL, indicating anemia.`,
        potentialCauses: [
          "Iron deficiency (most common)",
          "Vitamin B12 or folate deficiency",
          "Chronic blood loss (menstruation, GI bleeding)",
          "Poor nutrition or malabsorption",
          "Chronic kidney disease",
        ],
        diseaseConditions: [
          "Iron deficiency anemia",
          "Pernicious anemia (B12 deficiency)",
          "Thalassemia",
          "Sickle cell disease",
          "Bone marrow disorders",
          "Chronic inflammatory conditions",
        ],
      };
      interpretation.recommendations = [
        "Consult your doctor about iron supplementation",
        "Increase iron-rich foods (red meat, leafy greens, fortified cereals)",
        "Consider vitamin C with meals to improve iron absorption",
        "Check for vitamin B12 and folate levels",
        "Investigate potential sources of blood loss",
        "May need further testing: ferritin, TIBC, vitamin B12 levels",
      ];
    }
  }

  // WBC (White Blood Cells)
  else if (
    param.includes("wbc") ||
    param.includes("white blood cell") ||
    param === "total wbc count"
  ) {
    interpretation.introduction = `White Blood Cell (WBC) count measures the number of white blood cells in your blood. Your count is ${value}/cu.mm.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your WBC count is within the normal range, indicating a healthy immune system with no signs of infection or immune disorders.`;
      interpretation.detailedExplanation = [
        {
          label: "Total WBC Count",
          text: `Indicates the number of white blood cells. Your count is ${value}/cu.mm, which is within the normal range (4,000-11,000/cu.mm).`,
        },
      ];
      interpretation.recommendations = [
        "Continue healthy lifestyle to support immune function",
        "Maintain balanced diet with adequate vitamins and minerals",
        "Get regular exercise and adequate sleep",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your WBC count is elevated (leukocytosis), which typically indicates an active infection, inflammation, or immune response in your body.`;
      interpretation.detailedExplanation = [
        {
          label: "Total WBC Count",
          text: `Your count is ${value}/cu.mm, which is above the normal range of 4,000-11,000/cu.mm.`,
        },
        {
          label: "Differential WBC Count",
          text: "May show which type of white blood cells is elevated (neutrophils, lymphocytes, monocytes, eosinophils, or basophils).",
        },
      ];
      interpretation.abnormalFindings = {
        primaryFinding: `The primary abnormal finding is an elevated WBC count of ${value}/cu.mm.`,
        potentialCauses: [
          "Bacterial or viral infection",
          "Inflammation or tissue injury",
          "Allergic reactions",
          "Physical or emotional stress",
          "Smoking",
          "Certain medications (corticosteroids)",
        ],
        diseaseConditions: [
          "Acute infections (bacterial, viral, fungal)",
          "Inflammatory conditions (rheumatoid arthritis, IBD)",
          "Leukemia or bone marrow disorders",
          "Severe allergic reactions",
          "Tissue damage (burns, heart attack)",
        ],
      };
      interpretation.recommendations = [
        "Consult your healthcare provider immediately",
        "Complete differential WBC count to identify elevated cell type",
        "Check for signs of infection (fever, pain, swelling)",
        "May need blood culture if infection suspected",
        "Avoid self-medication; follow medical advice",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your WBC count is below normal (leukopenia), which may indicate a weakened immune system or bone marrow problem.`;
      interpretation.detailedExplanation = [
        {
          label: "Total WBC Count",
          text: `Your count is ${value}/cu.mm, which is below the normal range of 4,000-11,000/cu.mm.`,
        },
      ];
      interpretation.abnormalFindings = {
        primaryFinding: `The primary abnormal finding is a low WBC count of ${value}/cu.mm, indicating leukopenia.`,
        potentialCauses: [
          "Viral infections (HIV, hepatitis)",
          "Bone marrow disorders or failure",
          "Autoimmune diseases (lupus)",
          "Medications (chemotherapy, antibiotics)",
          "Nutritional deficiencies (B12, folate, copper)",
          "Radiation therapy",
        ],
        diseaseConditions: [
          "Bone marrow failure syndromes",
          "Aplastic anemia",
          "Myelodysplastic syndromes",
          "Hypersplenism (enlarged spleen)",
          "Severe infections overwhelming the system",
        ],
      };
      interpretation.recommendations = [
        "Seek immediate medical evaluation",
        "Avoid exposure to infections (practice good hygiene)",
        "May need bone marrow examination",
        "Review all medications with your doctor",
        "Check for nutritional deficiencies",
        "Avoid raw foods and practice food safety",
      ];
    }
  }

  // PLATELETS
  else if (param.includes("platelet") || param === "plt") {
    interpretation.introduction = `Platelets are blood cells that help with clotting. Your platelet count is ${value}/cu.mm.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your platelet count is within the normal range, indicating proper blood clotting function.`;
      interpretation.detailedExplanation = [
        {
          label: "Platelet Count",
          text: `Measures the number of platelets. Your count is ${value}/cu.mm, which is within the normal range (150,000-450,000/cu.mm).`,
        },
      ];
      interpretation.recommendations = [
        "Maintain balanced diet",
        "Continue regular health monitoring",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your platelet count is elevated (thrombocytosis), which may increase the risk of abnormal blood clotting.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated platelet count of ${value}/cu.mm, which is significantly higher than the normal range.`,
        potentialCauses: [
          "Iron deficiency anemia",
          "Chronic inflammatory conditions",
          "Recent surgery or tissue damage",
          "Infections",
          "Cancer",
        ],
        diseaseConditions: [
          "Essential thrombocythemia (bone marrow disorder)",
          "Polycythemia vera",
          "Chronic myelogenous leukemia",
          "Inflammatory bowel disease",
        ],
      };
      interpretation.recommendations = [
        "Consult hematologist for evaluation",
        "May need bone marrow biopsy",
        "Monitor for symptoms of clotting (chest pain, shortness of breath)",
        "Possible aspirin therapy to prevent clots",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your platelet count is low (thrombocytopenia), which increases bleeding risk.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low platelet count of ${value}/cu.mm indicates thrombocytopenia.`,
        potentialCauses: [
          "Medications (heparin, antibiotics)",
          "Autoimmune disorders (ITP)",
          "Viral infections",
          "Bone marrow disorders",
          "Excessive alcohol consumption",
        ],
        diseaseConditions: [
          "Immune thrombocytopenic purpura (ITP)",
          "Thrombotic thrombocytopenic purpura (TTP)",
          "Leukemia or lymphoma",
          "Aplastic anemia",
          "Liver cirrhosis",
        ],
      };
      interpretation.recommendations = [
        "Seek immediate medical attention",
        "Avoid activities that may cause injury",
        "No aspirin or NSAIDs (ibuprofen) without doctor approval",
        "Watch for signs of bleeding (bruising, nosebleeds, blood in stool)",
        "May need platelet transfusion if severely low",
      ];
    }
  }

  // GLUCOSE / BLOOD SUGAR
  else if (
    param.includes("glucose") ||
    param.includes("blood sugar") ||
    param === "fbs" ||
    param === "rbs"
  ) {
    interpretation.introduction = `Blood glucose measures the amount of sugar in your blood. Your level is ${value} mg/dL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your blood glucose level is within the normal range, indicating good blood sugar control.`;
      interpretation.detailedExplanation = [
        {
          label: "Glucose",
          text: `Your level is ${value} mg/dL, which is within the normal fasting range (70-100 mg/dL).`,
        },
      ];
      interpretation.recommendations = [
        "Maintain healthy diet with complex carbohydrates",
        "Regular exercise to maintain insulin sensitivity",
        "Continue monitoring if you have diabetes risk factors",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your blood glucose level is elevated, which may indicate prediabetes or diabetes.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated blood glucose level of ${value} mg/dL.`,
        potentialCauses: [
          "Type 1 or Type 2 diabetes",
          "Prediabetes",
          "Stress or illness",
          "Medications (steroids)",
          "Pancreatic disorders",
        ],
        diseaseConditions: [
          "Type 2 diabetes mellitus",
          "Type 1 diabetes mellitus",
          "Gestational diabetes (in pregnancy)",
          "Cushing syndrome",
          "Pancreatitis or pancreatic cancer",
        ],
      };
      interpretation.recommendations = [
        "Consult endocrinologist or diabetes specialist",
        "Get HbA1c test to assess long-term sugar control",
        "Reduce refined carbohydrates and sugary foods",
        "Increase physical activity (30 min daily)",
        "May need glucose tolerance test",
        "Check for diabetic complications (eyes, kidneys, nerves)",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your blood glucose level is low (hypoglycemia), which can cause symptoms like dizziness, confusion, and shakiness.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low blood glucose level of ${value} mg/dL.`,
        potentialCauses: [
          "Excessive diabetes medication",
          "Skipping meals or inadequate food intake",
          "Excessive alcohol consumption",
          "Intense exercise without adequate nutrition",
          "Hormonal deficiencies",
        ],
        diseaseConditions: [
          "Insulin overdose in diabetics",
          "Insulinoma (insulin-producing tumor)",
          "Adrenal insufficiency",
          "Severe liver disease",
        ],
      };
      interpretation.recommendations = [
        "Consume quick-acting carbohydrates immediately (juice, glucose tablets)",
        "Eat regular meals and snacks",
        "Review diabetes medications with doctor",
        "Carry glucose tablets if prone to hypoglycemia",
        "May need continuous glucose monitoring",
      ];
    }
  }

  // CHOLESTEROL (Total)
  else if (
    param.includes("cholesterol") &&
    !param.includes("hdl") &&
    !param.includes("ldl")
  ) {
    interpretation.introduction = `Total cholesterol measures all cholesterol in your blood. Your level is ${value} mg/dL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your total cholesterol is within the desirable range (< 200 mg/dL), indicating good heart health.`;
      interpretation.recommendations = [
        "Continue heart-healthy diet",
        "Regular exercise (150 minutes/week)",
        "Monitor cholesterol annually",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your total cholesterol is elevated, which increases the risk of heart disease and stroke.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated total cholesterol of ${value} mg/dL.`,
        potentialCauses: [
          "High saturated fat diet",
          "Lack of exercise",
          "Obesity",
          "Genetics (familial hypercholesterolemia)",
          "Hypothyroidism",
        ],
        diseaseConditions: [
          "Atherosclerosis (plaque buildup in arteries)",
          "Coronary artery disease",
          "Increased risk of heart attack and stroke",
        ],
      };
      interpretation.recommendations = [
        "Reduce saturated fats (red meat, butter, cheese)",
        "Increase fiber intake (oats, beans, fruits)",
        "Exercise regularly (cardio and strength training)",
        "May need statin medications",
        "Get lipid profile (LDL, HDL, triglycerides)",
      ];
    }
  }

  // LDL (Bad Cholesterol)
  else if (param.includes("ldl")) {
    interpretation.introduction = `LDL (Low-Density Lipoprotein) is known as "bad" cholesterol. Your level is ${value} mg/dL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your LDL cholesterol is at a healthy level (< 100 mg/dL optimal).`;
      interpretation.recommendations = [
        "Maintain current healthy habits",
        "Continue low saturated fat diet",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your LDL cholesterol is elevated, which can lead to plaque buildup in arteries.`;
      interpretation.abnormalFindings = {
        primaryFinding: `High LDL cholesterol of ${value} mg/dL increases cardiovascular risk.`,
        potentialCauses: [
          "High saturated and trans fat intake",
          "Sedentary lifestyle",
          "Smoking",
          "Diabetes",
        ],
        diseaseConditions: [
          "Atherosclerosis",
          "Coronary artery disease",
          "Peripheral artery disease",
        ],
      };
      interpretation.recommendations = [
        "Limit saturated fats to < 7% of daily calories",
        "Eliminate trans fats",
        "Add plant sterols/stanols",
        "Consider statin therapy",
        "Increase physical activity",
      ];
    }
  }

  // HDL (Good Cholesterol)
  else if (param.includes("hdl")) {
    interpretation.introduction = `HDL (High-Density Lipoprotein) is "good" cholesterol that helps remove bad cholesterol. Your level is ${value} mg/dL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your HDL cholesterol is at a protective level (> 40 mg/dL for men, > 50 mg/dL for women).`;
      interpretation.recommendations = [
        "Continue regular exercise",
        "Maintain healthy weight",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your HDL cholesterol is low, which increases heart disease risk even if total cholesterol is normal.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low HDL cholesterol of ${value} mg/dL reduces cardiovascular protection.`,
        potentialCauses: [
          "Lack of physical activity",
          "Smoking",
          "Obesity",
          "Type 2 diabetes",
        ],
        diseaseConditions: [
          "Increased risk of heart disease",
          "Metabolic syndrome",
        ],
      };
      interpretation.recommendations = [
        "Increase aerobic exercise (30+ min daily)",
        "Quit smoking",
        "Lose weight if overweight",
        "Add healthy fats (olive oil, nuts, fish)",
        "Limit refined carbohydrates",
      ];
    }
  }

  // TRIGLYCERIDES
  else if (param.includes("triglyceride")) {
    interpretation.introduction = `Triglycerides are a type of fat in your blood. Your level is ${value} mg/dL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your triglyceride level is normal (< 150 mg/dL).`;
      interpretation.recommendations = [
        "Maintain current dietary habits",
        "Continue limiting sugar and alcohol",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your triglyceride level is elevated, which increases risk of heart disease and pancreatitis.`;
      interpretation.abnormalFindings = {
        primaryFinding: `High triglycerides of ${value} mg/dL.`,
        potentialCauses: [
          "High sugar and refined carb intake",
          "Excessive alcohol consumption",
          "Obesity",
          "Uncontrolled diabetes",
        ],
        diseaseConditions: [
          "Metabolic syndrome",
          "Type 2 diabetes",
          "Pancreatitis (if very high)",
          "Fatty liver disease",
        ],
      };
      interpretation.recommendations = [
        "Reduce sugar and refined carbohydrates drastically",
        "Limit alcohol consumption",
        "Increase omega-3 fatty acids (fish oil)",
        "Lose weight if overweight",
        "May need fibrate medications",
      ];
    }
  }

  // HbA1c (Glycated Hemoglobin)
  else if (
    param.includes("hba1c") ||
    param.includes("a1c") ||
    param.includes("glycated")
  ) {
    interpretation.introduction = `HbA1c measures your average blood sugar over the past 2-3 months. Your level is ${value}%.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your HbA1c is within the normal range (< 5.7%), indicating good long-term blood sugar control.`;
      interpretation.recommendations = [
        "Maintain balanced diet",
        "Continue regular exercise",
        "Monitor annually",
      ];
    } else if (statusLower === "high") {
      const hba1cValue = parseFloat(value);
      let diabetesStatus = "";
      if (hba1cValue >= 6.5) {
        diabetesStatus = "indicates diabetes";
      } else if (hba1cValue >= 5.7) {
        diabetesStatus = "indicates prediabetes";
      }

      interpretation.generalInterpretation = `Your HbA1c of ${value}% ${diabetesStatus}, showing elevated average blood sugar over the past 2-3 months.`;
      interpretation.abnormalFindings = {
        primaryFinding: `HbA1c of ${value}% is elevated.`,
        potentialCauses: [
          "Uncontrolled Type 2 diabetes",
          "Type 1 diabetes",
          "Poor medication adherence",
          "Inadequate insulin dosing",
        ],
        diseaseConditions: [
          "Type 2 diabetes mellitus",
          "Type 1 diabetes mellitus",
          "Risk of diabetic complications (retinopathy, nephropathy, neuropathy)",
        ],
      };
      interpretation.recommendations = [
        "Consult endocrinologist immediately",
        "Adjust diabetes medications or insulin",
        "Follow diabetic diet strictly",
        "Check blood sugar regularly",
        "Screen for diabetic complications",
        "HbA1c target: < 7% for most diabetics",
      ];
    }
  }

  // CREATININE
  else if (param.includes("creatinine")) {
    interpretation.introduction = `Creatinine is a waste product filtered by kidneys. Your level is ${value} mg/dL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your creatinine level is within the normal range, indicating proper kidney function.`;
      interpretation.recommendations = [
        "Stay well hydrated",
        "Maintain healthy blood pressure",
        "Control diabetes if present",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your creatinine level is elevated, which may indicate reduced kidney function.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated creatinine of ${value} mg/dL suggests impaired kidney function.`,
        potentialCauses: [
          "Chronic kidney disease",
          "Acute kidney injury",
          "Dehydration",
          "High protein diet",
          "Muscle breakdown",
        ],
        diseaseConditions: [
          "Chronic kidney disease (CKD)",
          "Diabetic nephropathy",
          "Hypertensive nephropathy",
          "Glomerulonephritis",
          "Kidney stones or obstruction",
        ],
      };
      interpretation.recommendations = [
        "Consult nephrologist urgently",
        "Get eGFR (estimated glomerular filtration rate) calculated",
        "Check for proteinuria",
        "Control blood pressure strictly",
        "Manage diabetes if present",
        "Limit protein intake as advised",
        "Avoid nephrotoxic medications (NSAIDs)",
      ];
    }
  }

  // TSH (Thyroid Stimulating Hormone)
  else if (param.includes("tsh")) {
    interpretation.introduction = `TSH (Thyroid Stimulating Hormone) regulates thyroid function. Your level is ${value} mIU/L.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your TSH level is within the normal range (0.4-4.0 mIU/L), indicating proper thyroid function.`;
      interpretation.recommendations = [
        "Continue regular monitoring",
        "Ensure adequate iodine intake",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your TSH level is elevated, which typically indicates an underactive thyroid (hypothyroidism).`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated TSH of ${value} mIU/L indicates hypothyroidism.`,
        potentialCauses: [
          "Hashimoto's thyroiditis (autoimmune)",
          "Iodine deficiency",
          "Thyroid surgery or radiation",
          "Certain medications",
        ],
        diseaseConditions: [
          "Primary hypothyroidism",
          "Hashimoto's thyroiditis",
          "Subclinical hypothyroidism",
        ],
      };
      interpretation.recommendations = [
        "Consult endocrinologist",
        "Get T3 and T4 levels checked",
        "Check thyroid antibodies (TPO, TG)",
        "May need thyroid ultrasound",
        "Likely need levothyroxine (Synthroid) medication",
        "Monitor symptoms: fatigue, weight gain, cold intolerance",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your TSH level is low, which typically indicates an overactive thyroid (hyperthyroidism).`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low TSH of ${value} mIU/L indicates hyperthyroidism.`,
        potentialCauses: [
          "Graves' disease (autoimmune)",
          "Toxic nodular goiter",
          "Thyroiditis",
          "Excessive thyroid medication",
        ],
        diseaseConditions: [
          "Graves' disease",
          "Toxic multinodular goiter",
          "Thyrotoxicosis",
        ],
      };
      interpretation.recommendations = [
        "Consult endocrinologist immediately",
        "Get T3 and T4 levels checked",
        "Thyroid ultrasound or scan",
        "May need anti-thyroid medications",
        "Monitor symptoms: weight loss, rapid heartbeat, anxiety, tremors",
        "Avoid excessive iodine",
      ];
    }
  }

  // VITAMIN D
  else if (
    param.includes("vitamin d") ||
    param.includes("vit d") ||
    param === "25-oh vitamin d"
  ) {
    interpretation.introduction = `Vitamin D is crucial for bone health and immune function. Your level is ${value} ng/mL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your vitamin D level is sufficient (> 30 ng/mL).`;
      interpretation.recommendations = [
        "Continue sun exposure (15-20 min daily)",
        "Maintain vitamin D rich foods",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your vitamin D level is deficient, which can affect bone health and immunity.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Vitamin D deficiency with level of ${value} ng/mL.`,
        potentialCauses: [
          "Insufficient sun exposure",
          "Dark skin pigmentation",
          "Obesity",
          "Malabsorption disorders",
          "Lack of dietary vitamin D",
        ],
        diseaseConditions: [
          "Osteoporosis and osteomalacia",
          "Increased fracture risk",
          "Muscle weakness",
          "Increased infection susceptibility",
        ],
      };
      interpretation.recommendations = [
        "Take vitamin D3 supplement (1000-2000 IU daily)",
        "Increase sun exposure safely",
        "Eat vitamin D rich foods (fatty fish, fortified milk)",
        "Check calcium levels",
        "Recheck levels after 3 months of supplementation",
      ];
    }
  }

  // RBC COUNT (Red Blood Cell Count)
  else if (param.includes("rbc count") || param === "rbc") {
    interpretation.introduction = `Red Blood Cell (RBC) count measures the number of red blood cells in your blood. Your count is ${value} million/cu.mm.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your RBC count is within the normal range, indicating healthy red blood cell production and no signs of anemia or polycythemia.`;
      interpretation.detailedExplanation = [
        {
          label: "RBC Count",
          text: `Your count is ${value} million/cu.mm, which is within the normal range.`,
        },
      ];
      interpretation.recommendations = [
        "Maintain balanced diet with adequate iron and vitamins",
        "Continue regular health monitoring",
        "Stay hydrated",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your RBC count is elevated (erythrocytosis), which may indicate dehydration or underlying conditions affecting red blood cell production.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated RBC count of ${value} million/cu.mm.`,
        potentialCauses: [
          "Dehydration or fluid loss",
          "Living at high altitudes",
          "Chronic lung disease (COPD)",
          "Smoking",
          "Kidney tumors producing excess erythropoietin",
        ],
        diseaseConditions: [
          "Polycythemia vera (bone marrow disorder)",
          "Secondary polycythemia",
          "Chronic hypoxia",
        ],
      };
      interpretation.recommendations = [
        "Ensure adequate hydration",
        "Consult healthcare provider for further testing",
        "May need serum erythropoietin levels checked",
        "Smoking cessation if applicable",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your RBC count is below normal, indicating anemia. This means your body may not be producing enough red blood cells or losing them excessively.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low RBC count of ${value} million/cu.mm indicates anemia.`,
        potentialCauses: [
          "Iron deficiency",
          "Vitamin B12 or folate deficiency",
          "Chronic blood loss",
          "Bone marrow disorders",
          "Chronic kidney disease",
        ],
        diseaseConditions: [
          "Iron deficiency anemia",
          "Megaloblastic anemia",
          "Aplastic anemia",
          "Hemolytic anemia",
        ],
      };
      interpretation.recommendations = [
        "Check iron, B12, and folate levels",
        "Investigate potential sources of blood loss",
        "May need bone marrow examination if severe",
        "Iron-rich diet or supplementation",
      ];
    }
  }

  // PCV / HEMATOCRIT
  else if (
    param.includes("pcv") ||
    param.includes("hematocrit") ||
    param === "hct"
  ) {
    interpretation.introduction = `PCV (Packed Cell Volume) or Hematocrit measures the percentage of blood volume occupied by red blood cells. Your level is ${value}%.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your PCV/Hematocrit is within the normal range, indicating proper blood volume and red blood cell proportion.`;
      interpretation.detailedExplanation = [
        {
          label: "PCV/Hematocrit",
          text: `Your level is ${value}%, which is within the normal range of 35-45% for most adults.`,
        },
      ];
      interpretation.recommendations = [
        "Maintain adequate hydration",
        "Continue balanced diet",
        "Regular monitoring during health check-ups",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your PCV/Hematocrit is elevated, which means your blood is thicker than normal. This can increase risk of blood clots.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated PCV/Hematocrit of ${value}%.`,
        potentialCauses: [
          "Dehydration (most common)",
          "Polycythemia vera",
          "Chronic lung disease",
          "Living at high altitude",
          "Smoking",
        ],
        diseaseConditions: [
          "Polycythemia vera",
          "Secondary polycythemia",
          "Increased risk of thrombosis (blood clots)",
        ],
      };
      interpretation.recommendations = [
        "Increase fluid intake immediately",
        "Consult hematologist if persistently elevated",
        "May need phlebotomy (blood removal) if very high",
        "Avoid dehydration and smoking",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your PCV/Hematocrit is low, indicating anemia or reduced red blood cell volume in your blood.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low PCV/Hematocrit of ${value}% indicates anemia.`,
        potentialCauses: [
          "Iron deficiency",
          "Vitamin deficiencies (B12, folate)",
          "Blood loss (menstruation, GI bleeding)",
          "Overhydration",
          "Chronic disease",
        ],
        diseaseConditions: [
          "Iron deficiency anemia",
          "Anemia of chronic disease",
          "Hemorrhage or blood loss",
        ],
      };
      interpretation.recommendations = [
        "Check hemoglobin and iron studies",
        "Investigate sources of blood loss",
        "Iron supplementation if deficient",
        "Consult doctor for comprehensive anemia workup",
      ];
    }
  }

  // MCV (Mean Corpuscular Volume)
  else if (param.includes("mcv") || param === "mean corpuscular volume") {
    interpretation.introduction = `MCV (Mean Corpuscular Volume) measures the average size of your red blood cells. Your value is ${value} fL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your MCV is within the normal range (80-99 fL), indicating normal-sized red blood cells (normocytic).`;
      interpretation.detailedExplanation = [
        {
          label: "MCV",
          text: `Your value is ${value} fL, which indicates normal red blood cell size.`,
        },
      ];
      interpretation.recommendations = [
        "Continue balanced nutrition",
        "Maintain adequate B12, folate, and iron intake",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your MCV is elevated (macrocytic), meaning your red blood cells are larger than normal. This often indicates vitamin B12 or folate deficiency.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated MCV of ${value} fL indicates macrocytosis (large red blood cells).`,
        potentialCauses: [
          "Vitamin B12 deficiency",
          "Folate (Folic acid) deficiency",
          "Excessive alcohol consumption",
          "Hypothyroidism",
          "Liver disease",
          "Medications (methotrexate, anticonvulsants)",
        ],
        diseaseConditions: [
          "Megaloblastic anemia (B12/folate deficiency)",
          "Pernicious anemia",
          "Alcoholic liver disease",
          "Myelodysplastic syndrome",
        ],
      };
      interpretation.recommendations = [
        "Check vitamin B12 and folate levels urgently",
        "Consider B12 injections if severely deficient",
        "Reduce or eliminate alcohol consumption",
        "Check thyroid function (TSH)",
        "May need peripheral smear examination",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your MCV is low (microcytic), meaning your red blood cells are smaller than normal. This most commonly indicates iron deficiency.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low MCV of ${value} fL indicates microcytosis (small red blood cells).`,
        potentialCauses: [
          "Iron deficiency (most common)",
          "Thalassemia",
          "Chronic disease",
          "Lead poisoning",
          "Sideroblastic anemia",
        ],
        diseaseConditions: [
          "Iron deficiency anemia",
          "Thalassemia minor or major",
          "Anemia of chronic disease",
        ],
      };
      interpretation.recommendations = [
        "Check serum iron, ferritin, and TIBC",
        "Iron supplementation if deficient",
        "Investigate source of iron loss (GI bleeding, menstruation)",
        "Consider hemoglobin electrophoresis to rule out thalassemia",
        "Increase iron-rich foods in diet",
      ];
    }
  }

  // MCH (Mean Corpuscular Hemoglobin)
  else if (param.includes("mch") && !param.includes("mchc")) {
    interpretation.introduction = `MCH (Mean Corpuscular Hemoglobin) measures the average amount of hemoglobin in each red blood cell. Your value is ${value} pg.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your MCH is within the normal range (28-32 pg), indicating normal hemoglobin content in your red blood cells.`;
      interpretation.recommendations = [
        "Continue balanced diet with adequate iron",
        "Maintain current healthy habits",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your MCH is elevated, meaning each red blood cell contains more hemoglobin than normal. This often correlates with high MCV.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated MCH of ${value} pg.`,
        potentialCauses: [
          "Vitamin B12 deficiency",
          "Folate deficiency",
          "Liver disease",
          "Hypothyroidism",
        ],
        diseaseConditions: ["Megaloblastic anemia", "Pernicious anemia"],
      };
      interpretation.recommendations = [
        "Check B12 and folate levels",
        "Correlate with MCV results",
        "May need vitamin supplementation",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your MCH is low, meaning each red blood cell contains less hemoglobin than normal. This often indicates iron deficiency.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low MCH of ${value} pg.`,
        potentialCauses: ["Iron deficiency", "Thalassemia", "Chronic disease"],
        diseaseConditions: ["Iron deficiency anemia", "Thalassemia"],
      };
      interpretation.recommendations = [
        "Check iron studies (serum iron, ferritin, TIBC)",
        "Iron supplementation if deficient",
        "Consider thalassemia screening if family history",
      ];
    }
  }

  // MCHC (Mean Corpuscular Hemoglobin Concentration)
  else if (param.includes("mchc")) {
    interpretation.introduction = `MCHC (Mean Corpuscular Hemoglobin Concentration) measures the concentration of hemoglobin in red blood cells. Your value is ${value}%.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your MCHC is within the normal range (30-34%), indicating normal hemoglobin concentration in red blood cells.`;
      interpretation.recommendations = [
        "Continue healthy diet",
        "No specific intervention needed",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your MCHC is elevated, which is less common. It may indicate hereditary spherocytosis or laboratory error.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated MCHC of ${value}%.`,
        potentialCauses: [
          "Hereditary spherocytosis",
          "Severe burns",
          "Laboratory artifact or error",
          "Hemolytic anemia",
        ],
        diseaseConditions: [
          "Hereditary spherocytosis",
          "Autoimmune hemolytic anemia",
        ],
      };
      interpretation.recommendations = [
        "Repeat test to rule out laboratory error",
        "May need peripheral blood smear",
        "Consult hematologist if confirmed",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your MCHC is low (hypochromic), meaning red blood cells have lower hemoglobin concentration. This typically indicates iron deficiency.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low MCHC of ${value}% indicates hypochromia.`,
        potentialCauses: ["Iron deficiency", "Thalassemia", "Chronic disease"],
        diseaseConditions: ["Iron deficiency anemia", "Thalassemia"],
      };
      interpretation.recommendations = [
        "Check serum iron and ferritin",
        "Iron supplementation if deficient",
        "Rule out thalassemia with hemoglobin electrophoresis",
      ];
    }
  }

  // RDW (Red Cell Distribution Width)
  else if (param.includes("rdw") || param.includes("red cell distribution")) {
    interpretation.introduction = `RDW (Red Cell Distribution Width) measures the variation in size of your red blood cells. Your value is ${value} fL.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your RDW is within the normal range (9-17 fL), indicating uniform red blood cell sizes.`;
      interpretation.recommendations = [
        "No specific intervention needed",
        "Continue healthy habits",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your RDW is elevated, meaning there's significant variation in red blood cell sizes (anisocytosis). This suggests mixed anemia causes or early nutritional deficiency.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated RDW of ${value} fL indicates anisocytosis.`,
        potentialCauses: [
          "Iron deficiency developing",
          "B12 or folate deficiency developing",
          "Mixed anemia (combined deficiencies)",
          "Hemolytic anemia",
          "Post-transfusion state",
        ],
        diseaseConditions: [
          "Early iron deficiency",
          "Combined nutritional deficiencies",
          "Hemolytic anemia",
          "Myelodysplastic syndrome",
        ],
      };
      interpretation.recommendations = [
        "Check complete iron panel, B12, and folate",
        "Peripheral blood smear examination",
        "Investigate underlying causes of anemia",
        "Nutritional supplementation as needed",
      ];
    }
  }

  // NEUTROPHILS
  else if (param.includes("neutrophil")) {
    interpretation.introduction = `Neutrophils are the most abundant type of white blood cells and are crucial for fighting bacterial infections. Your level is ${value}%.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your neutrophil percentage is within the normal range (40-75%), indicating healthy immune function against bacterial infections.`;
      interpretation.recommendations = [
        "Continue healthy lifestyle",
        "Maintain good hygiene practices",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your neutrophil count is elevated (neutrophilia), which typically indicates an active bacterial infection or inflammatory response.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated neutrophil percentage of ${value}%.`,
        potentialCauses: [
          "Bacterial infection",
          "Inflammation or tissue injury",
          "Physical or emotional stress",
          "Smoking",
          "Corticosteroid medications",
        ],
        diseaseConditions: [
          "Acute bacterial infections (pneumonia, UTI)",
          "Inflammatory conditions",
          "Tissue necrosis (heart attack, burns)",
          "Chronic myeloid leukemia (rare)",
        ],
      };
      interpretation.recommendations = [
        "Look for signs of infection (fever, pain, redness)",
        "Complete blood count with absolute neutrophil count",
        "Consult doctor if symptoms present",
        "May need antibiotics if bacterial infection confirmed",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your neutrophil count is low (neutropenia), which increases your risk of bacterial infections.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low neutrophil percentage of ${value}%.`,
        potentialCauses: [
          "Viral infections",
          "Bone marrow disorders",
          "Medications (chemotherapy, antibiotics)",
          "Autoimmune conditions",
          "Severe infections overwhelming the system",
        ],
        diseaseConditions: [
          "Bone marrow suppression",
          "Aplastic anemia",
          "Leukemia",
          "Drug-induced neutropenia",
        ],
      };
      interpretation.recommendations = [
        "Avoid exposure to infections",
        "Practice excellent hygiene",
        "Report fever immediately to doctor",
        "May need growth factors (G-CSF) if severe",
        "Review all medications with doctor",
      ];
    }
  }

  // LYMPHOCYTES
  else if (param.includes("lymphocyte")) {
    interpretation.introduction = `Lymphocytes are white blood cells that fight viral infections and produce antibodies. Your level is ${value}%.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your lymphocyte percentage is within the normal range (20-45%), indicating healthy immune function.`;
      interpretation.recommendations = [
        "Continue healthy immune-supporting habits",
        "Adequate sleep and stress management",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your lymphocyte count is elevated (lymphocytosis), which often indicates a viral infection or immune response.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated lymphocyte percentage of ${value}%.`,
        potentialCauses: [
          "Viral infections (mononucleosis, CMV, HIV)",
          "Chronic infections",
          "Autoimmune disorders",
          "Smoking",
        ],
        diseaseConditions: [
          "Infectious mononucleosis (Epstein-Barr virus)",
          "Chronic lymphocytic leukemia (CLL)",
          "Pertussis (whooping cough)",
          "Tuberculosis",
        ],
      };
      interpretation.recommendations = [
        "Check for viral infection symptoms",
        "May need Epstein-Barr virus (EBV) testing",
        "If persistently elevated, consult hematologist",
        "Flow cytometry if malignancy suspected",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your lymphocyte count is low (lymphopenia), which may weaken your immune response to infections.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low lymphocyte percentage of ${value}%.`,
        potentialCauses: [
          "Viral infections (HIV, hepatitis)",
          "Corticosteroid medications",
          "Autoimmune diseases (lupus)",
          "Bone marrow disorders",
          "Malnutrition",
        ],
        diseaseConditions: [
          "HIV/AIDS",
          "Bone marrow failure",
          "Immunodeficiency disorders",
        ],
      };
      interpretation.recommendations = [
        "Consider HIV testing if risk factors present",
        "Review immunosuppressive medications",
        "Ensure adequate nutrition",
        "May need immunoglobulin levels checked",
      ];
    }
  }

  // EOSINOPHILS
  else if (param.includes("eosinophil")) {
    interpretation.introduction = `Eosinophils are white blood cells involved in allergic reactions and fighting parasitic infections. Your level is ${value}%.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your eosinophil percentage is within the normal range (0-6%), indicating no significant allergies or parasitic infections.`;
      interpretation.recommendations = [
        "No specific intervention needed",
        "Monitor for allergies or asthma symptoms",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your eosinophil count is elevated (eosinophilia), which suggests allergies, asthma, or parasitic infections.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated eosinophil percentage of ${value}%.`,
        potentialCauses: [
          "Allergic conditions (asthma, hay fever, eczema)",
          "Parasitic infections (worms)",
          "Drug allergies",
          "Autoimmune diseases",
        ],
        diseaseConditions: [
          "Asthma",
          "Allergic rhinitis",
          "Parasitic infections (roundworm, hookworm)",
          "Eosinophilic esophagitis",
          "Hypereosinophilic syndrome (rare)",
        ],
      };
      interpretation.recommendations = [
        "Allergy testing if symptoms present",
        "Stool examination for parasites",
        "Review medications for drug allergies",
        "May need pulmonary function tests if asthma suspected",
        "Consider deworming medication if parasites found",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your eosinophil count is low, which is usually not clinically significant.`;
      interpretation.recommendations = [
        "No specific intervention typically needed",
        "May be seen with stress or corticosteroid use",
      ];
    }
  }

  // MONOCYTES
  else if (param.includes("monocyte")) {
    interpretation.introduction = `Monocytes are white blood cells that become macrophages and help fight chronic infections and remove dead tissue. Your level is ${value}%.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your monocyte percentage is within the normal range (0-10%), indicating normal immune function.`;
      interpretation.recommendations = [
        "Continue healthy habits",
        "No specific intervention needed",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your monocyte count is elevated (monocytosis), which often indicates chronic infection or inflammatory conditions.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated monocyte percentage of ${value}%.`,
        potentialCauses: [
          "Chronic infections (tuberculosis, endocarditis)",
          "Inflammatory bowel disease",
          "Recovery phase from acute infection",
          "Autoimmune diseases",
        ],
        diseaseConditions: [
          "Tuberculosis",
          "Chronic myelomonocytic leukemia (CMML)",
          "Sarcoidosis",
          "Ulcerative colitis or Crohn's disease",
        ],
      };
      interpretation.recommendations = [
        "Screen for tuberculosis if risk factors present",
        "Check for signs of chronic infection",
        "If persistently elevated, may need bone marrow examination",
        "Consult hematologist for further evaluation",
      ];
    } else if (statusLower === "low") {
      interpretation.generalInterpretation = `Your monocyte count is low, which is uncommon and may indicate bone marrow issues.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Low monocyte percentage of ${value}%.`,
        potentialCauses: [
          "Bone marrow suppression",
          "Certain medications",
          "Hairy cell leukemia (rare)",
        ],
        diseaseConditions: ["Aplastic anemia", "Bone marrow failure"],
      };
      interpretation.recommendations = [
        "Review medications with doctor",
        "May need bone marrow examination if other counts abnormal",
      ];
    }
  }

  // BASOPHILS
  else if (param.includes("basophil")) {
    interpretation.introduction = `Basophils are the least common white blood cells and are involved in allergic reactions. Your level is ${value}%.`;

    if (statusLower === "normal") {
      interpretation.generalInterpretation = `Your basophil percentage is within the normal range (0-1%), which is expected.`;
      interpretation.recommendations = [
        "No intervention needed",
        "Basophils are normally present in very small numbers",
      ];
    } else if (statusLower === "high") {
      interpretation.generalInterpretation = `Your basophil count is elevated (basophilia), which is uncommon and may indicate certain blood disorders.`;
      interpretation.abnormalFindings = {
        primaryFinding: `Elevated basophil percentage of ${value}%.`,
        potentialCauses: [
          "Chronic myeloid leukemia (CML)",
          "Myeloproliferative disorders",
          "Severe allergic reactions",
          "Hypothyroidism",
        ],
        diseaseConditions: [
          "Chronic myeloid leukemia",
          "Polycythemia vera",
          "Myelofibrosis",
        ],
      };
      interpretation.recommendations = [
        "Consult hematologist immediately",
        "May need BCR-ABL test for CML",
        "Bone marrow examination may be required",
        "Check thyroid function",
      ];
    }
  }

  // Default for unknown parameters
  else {
    interpretation.introduction = `This blood test measures ${parameterName}. Your value is ${value}.`;
    interpretation.generalInterpretation = `Your ${parameterName} level is currently ${statusLower}. Please consult with your healthcare provider for detailed interpretation specific to your health situation.`;
    interpretation.recommendations = [
      "Discuss results with your healthcare provider",
      "Consider comprehensive metabolic panel if not done recently",
      "Maintain regular health check-ups",
    ];

    if (statusLower !== "normal") {
      interpretation.abnormalFindings = {
        primaryFinding: `Your ${parameterName} is ${statusLower} at ${value}.`,
        potentialCauses: [
          "Various medical conditions may affect this parameter",
          "Medications or supplements",
          "Dietary factors",
        ],
        diseaseConditions: [
          "Consult healthcare provider for specific conditions related to this parameter",
        ],
      };
    }
  }

  return interpretation;
};
