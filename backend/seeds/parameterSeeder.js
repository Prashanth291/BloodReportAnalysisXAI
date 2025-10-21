import ParameterReference from "../models/ParameterReference.js";

/**
 * Seed initial parameter references
 * Run this once to populate the database
 */
const seedParameterReferences = async () => {
  try {
    const parameters = [
      // ============ CBC (Complete Blood Count) ============
      {
        parameterName: "Hemoglobin",
        unit: "g/dL",
        alternateUnits: [{ unit: "g/L", conversionFactor: 10 }],
        category: "CBC",
        ranges: [
          // Males
          {
            gender: "male",
            ageMin: 18,
            ageMax: 64,
            condition: "normal",
            min: 13.5,
            max: 17.5,
            optimal: { min: 14, max: 16 },
          },
          {
            gender: "male",
            ageMin: 65,
            ageMax: 120,
            condition: "normal",
            min: 12.5,
            max: 16.5,
          },
          // Females
          {
            gender: "female",
            ageMin: 18,
            ageMax: 64,
            condition: "normal",
            min: 12,
            max: 15.5,
            optimal: { min: 12.5, max: 14.5 },
          },
          {
            gender: "female",
            ageMin: 65,
            ageMax: 120,
            condition: "normal",
            min: 11.5,
            max: 15,
          },
          {
            gender: "female",
            ageMin: 18,
            ageMax: 45,
            condition: "pregnant",
            min: 11,
            max: 14,
          },
        ],
        reasons: {
          high: "May indicate dehydration, polycythemia, lung disease, or living at high altitude",
          low: "May indicate anemia, blood loss, nutritional deficiency (iron, B12, folate), or chronic disease",
          criticalHigh:
            "Dangerously high levels increase blood viscosity - immediate medical attention required",
          criticalLow: "Severe anemia - immediate medical attention required",
        },
        recommendations: {
          high: [
            "Stay well hydrated",
            "Consult doctor to rule out polycythemia",
            "Avoid smoking",
          ],
          low: [
            "Increase iron-rich foods (red meat, spinach, lentils)",
            "Take iron supplements as prescribed",
            "Check for sources of blood loss",
            "Ensure adequate vitamin B12 and folate intake",
          ],
          critical: [
            "Seek immediate medical attention",
            "May require blood transfusion",
            "Emergency consultation required",
          ],
        },
        clinicalSignificance: "Measures oxygen-carrying capacity of blood",
        relatedParameters: ["RBC Count", "Hematocrit", "MCV", "MCH", "MCHC"],
        testFrequency: {
          normal: "Annually during routine checkup",
          abnormal: "Every 1-3 months until normalized",
        },
      },

      {
        parameterName: "WBC Count",
        unit: "cells/μL",
        alternateUnits: [{ unit: "10³/μL", conversionFactor: 1000 }],
        category: "CBC",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 4000,
            max: 11000,
            critical: { min: 2000, max: 30000 },
          },
        ],
        reasons: {
          high: "May indicate infection, inflammation, stress, smoking, or blood disorders like leukemia",
          low: "May indicate bone marrow problems, autoimmune disorders, viral infections, or medication side effects",
          criticalHigh:
            "Possible severe infection or blood cancer - immediate evaluation needed",
          criticalLow:
            "Severe immune compromise - high infection risk, immediate medical attention required",
        },
        recommendations: {
          high: [
            "Identify and treat underlying infection",
            "Avoid smoking",
            "Manage stress levels",
            "Repeat test to confirm",
          ],
          low: [
            "Avoid exposure to infections",
            "Maintain good hygiene",
            "Review medications with doctor",
            "Boost immune system with healthy diet",
          ],
          critical: [
            "Immediate medical evaluation required",
            "May need hospitalization",
            "Avoid crowded places if low count",
          ],
        },
        clinicalSignificance:
          "Indicates immune system function and ability to fight infections",
        relatedParameters: [
          "Neutrophils",
          "Lymphocytes",
          "Monocytes",
          "Eosinophils",
          "Basophils",
        ],
        testFrequency: {
          normal: "Annually",
          abnormal: "Weekly to monthly depending on severity",
        },
      },

      {
        parameterName: "Platelet Count",
        unit: "cells/μL",
        alternateUnits: [{ unit: "10³/μL", conversionFactor: 1000 }],
        category: "CBC",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 150000,
            max: 450000,
            critical: { min: 50000, max: 1000000 },
          },
        ],
        reasons: {
          high: "May indicate iron deficiency, inflammation, infection, or blood disorders",
          low: "May indicate bone marrow problems, autoimmune disorders, medications, or heavy alcohol use",
          criticalHigh: "Risk of blood clots - immediate evaluation needed",
          criticalLow:
            "Severe bleeding risk - immediate medical attention required",
        },
        recommendations: {
          high: [
            "Check for iron deficiency",
            "Evaluate for inflammatory conditions",
            "Avoid aspirin unless prescribed",
            "Stay hydrated",
          ],
          low: [
            "Avoid activities with injury risk",
            "Avoid aspirin and NSAIDs",
            "Report any unusual bleeding immediately",
            "Avoid alcohol",
          ],
          critical: [
            "Emergency medical evaluation",
            "May require platelet transfusion",
            "Avoid any trauma",
          ],
        },
        clinicalSignificance: "Essential for blood clotting",
        relatedParameters: ["MPV", "PDW"],
        testFrequency: {
          normal: "Annually",
          abnormal: "Weekly to monthly",
        },
      },

      // ============ Lipid Profile ============
      {
        parameterName: "Total Cholesterol",
        unit: "mg/dL",
        alternateUnits: [{ unit: "mmol/L", conversionFactor: 0.0259 }],
        category: "Lipid Profile",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 125,
            max: 200,
            optimal: { min: 125, max: 180 },
            critical: { min: 0, max: 240 },
          },
        ],
        reasons: {
          high: "May indicate unhealthy diet, lack of exercise, obesity, diabetes, hypothyroidism, or genetic factors",
          low: "May indicate malnutrition, liver disease, hyperthyroidism, or malabsorption",
          criticalHigh:
            "Very high cardiovascular disease risk - immediate intervention needed",
        },
        recommendations: {
          high: [
            "Reduce saturated and trans fats",
            "Increase fiber intake (oats, beans, fruits)",
            "Regular exercise (30 min daily)",
            "Maintain healthy weight",
            "Quit smoking",
            "Limit alcohol",
          ],
          low: [
            "Ensure adequate calorie intake",
            "Include healthy fats (nuts, avocado, olive oil)",
            "Check thyroid function",
            "Rule out liver disease",
          ],
          critical: [
            "Immediate doctor consultation",
            "May require statin medication",
            "Aggressive lifestyle modification",
            "Consider cardiology referral",
          ],
        },
        clinicalSignificance: "Indicator of cardiovascular disease risk",
        relatedParameters: [
          "LDL Cholesterol",
          "HDL Cholesterol",
          "Triglycerides",
          "VLDL",
        ],
        testFrequency: {
          normal: "Every 4-6 years if healthy",
          abnormal: "Every 3-12 months",
        },
      },

      {
        parameterName: "LDL Cholesterol",
        unit: "mg/dL",
        alternateUnits: [{ unit: "mmol/L", conversionFactor: 0.0259 }],
        category: "Lipid Profile",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 0,
            max: 100,
            optimal: { min: 0, max: 70 },
          },
        ],
        reasons: {
          high: "Increases risk of heart disease and stroke by depositing cholesterol in arteries",
          low: "Generally not a concern; very low levels are optimal for heart health",
        },
        recommendations: {
          high: [
            "Reduce saturated fats and trans fats",
            "Increase soluble fiber",
            "Exercise regularly",
            "Consider plant sterols/stanols",
            "May need statin medication",
          ],
          low: [
            "No action needed - this is optimal",
            "Maintain healthy lifestyle",
          ],
        },
        clinicalSignificance:
          "Bad cholesterol - major risk factor for cardiovascular disease",
        relatedParameters: [
          "Total Cholesterol",
          "HDL Cholesterol",
          "Triglycerides",
        ],
        testFrequency: {
          normal: "Every 4-6 years",
          abnormal: "Every 3-6 months",
        },
      },

      {
        parameterName: "HDL Cholesterol",
        unit: "mg/dL",
        alternateUnits: [{ unit: "mmol/L", conversionFactor: 0.0259 }],
        category: "Lipid Profile",
        ranges: [
          {
            gender: "male",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 40,
            max: 200,
            optimal: { min: 60, max: 200 },
          },
          {
            gender: "female",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 50,
            max: 200,
            optimal: { min: 60, max: 200 },
          },
        ],
        reasons: {
          high: "Excellent! Higher HDL is protective against heart disease",
          low: "Increases risk of heart disease; HDL removes cholesterol from arteries",
        },
        recommendations: {
          high: [
            "Great job! Maintain current lifestyle",
            "Continue regular exercise",
            "Keep healthy diet",
          ],
          low: [
            "Increase physical activity (aerobic exercise)",
            "Quit smoking",
            "Lose weight if overweight",
            "Include healthy fats (olive oil, nuts, fish)",
            "Limit refined carbohydrates",
          ],
        },
        clinicalSignificance:
          "Good cholesterol - protects against heart disease",
        relatedParameters: [
          "Total Cholesterol",
          "LDL Cholesterol",
          "Triglycerides",
        ],
        testFrequency: {
          normal: "Every 4-6 years",
          abnormal: "Every 6-12 months",
        },
      },

      {
        parameterName: "Triglycerides",
        unit: "mg/dL",
        alternateUnits: [{ unit: "mmol/L", conversionFactor: 0.0113 }],
        category: "Lipid Profile",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 0,
            max: 150,
            optimal: { min: 0, max: 100 },
            critical: { min: 0, max: 500 },
          },
        ],
        reasons: {
          high: "May indicate high carbohydrate diet, diabetes, obesity, excessive alcohol, hypothyroidism, kidney disease",
          low: "Usually not concerning; may indicate malnutrition or hyperthyroidism",
          criticalHigh:
            "Risk of pancreatitis - immediate medical attention required",
        },
        recommendations: {
          high: [
            "Reduce sugar and refined carbohydrates",
            "Limit alcohol consumption",
            "Increase omega-3 fatty acids (fish, flaxseed)",
            "Lose weight if overweight",
            "Regular exercise",
            "Control diabetes if present",
          ],
          low: [
            "No action needed if otherwise healthy",
            "Ensure adequate nutrition",
          ],
          critical: [
            "Immediate medical evaluation",
            "Risk of acute pancreatitis",
            "May require medication (fibrates)",
          ],
        },
        clinicalSignificance:
          "Type of fat in blood; high levels increase heart disease risk",
        relatedParameters: [
          "Total Cholesterol",
          "LDL Cholesterol",
          "HDL Cholesterol",
          "Glucose",
        ],
        testFrequency: {
          normal: "Every 4-6 years",
          abnormal: "Every 3-6 months",
        },
      },

      // ============ Blood Sugar ============
      {
        parameterName: "Glucose (Fasting)",
        unit: "mg/dL",
        alternateUnits: [{ unit: "mmol/L", conversionFactor: 0.0555 }],
        category: "Blood Sugar",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 70,
            max: 100,
            optimal: { min: 80, max: 95 },
          },
          {
            gender: "female",
            ageMin: 18,
            ageMax: 45,
            condition: "pregnant",
            min: 60,
            max: 95,
          },
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "diabetic",
            min: 80,
            max: 130,
            critical: { min: 40, max: 250 },
          },
        ],
        reasons: {
          high: "May indicate prediabetes, diabetes, insulin resistance, stress, or certain medications",
          low: "May indicate hypoglycemia, excessive insulin, fasting, or certain medications",
          criticalHigh:
            "Risk of diabetic ketoacidosis - immediate medical attention",
          criticalLow:
            "Risk of loss of consciousness, seizures - immediate medical attention",
        },
        recommendations: {
          high: [
            "Reduce refined carbohydrates and sugar",
            "Increase physical activity",
            "Maintain healthy weight",
            "Check HbA1c for long-term glucose control",
            "May need diabetes medication",
          ],
          low: [
            "Eat regular balanced meals",
            "Include complex carbohydrates",
            "Avoid excessive fasting",
            "Carry glucose tablets if diabetic",
            "Review medications with doctor",
          ],
          critical: [
            "Emergency medical care needed",
            "For high: Check for ketones, hydrate",
            "For low: Consume 15g fast-acting carbs immediately",
          ],
        },
        clinicalSignificance: "Screening and monitoring for diabetes",
        relatedParameters: ["HbA1c", "Insulin", "C-Peptide"],
        testFrequency: {
          normal: "Every 3 years if low risk, annually if risk factors",
          abnormal: "Every 3-6 months or as directed",
        },
      },

      {
        parameterName: "HbA1c",
        unit: "%",
        category: "Blood Sugar",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 4,
            max: 5.6,
            optimal: { min: 4, max: 5.4 },
          },
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "diabetic",
            min: 5.7,
            max: 7,
            critical: { min: 0, max: 9 },
          },
        ],
        reasons: {
          high: "Indicates poor blood sugar control over past 2-3 months; risk of diabetes complications",
          low: "Generally good, but very low may indicate hypoglycemia risk in diabetics",
        },
        recommendations: {
          high: [
            "Improve blood sugar control",
            "Review diabetes medications",
            "Follow diabetic diet strictly",
            "Increase physical activity",
            "Regular blood sugar monitoring",
          ],
          low: [
            "Excellent control if non-diabetic",
            "If diabetic on medication: check for hypoglycemia episodes",
          ],
          critical: [
            "Very poor diabetes control",
            "High risk of complications",
            "Immediate endocrinologist consultation",
            "Medication adjustment needed",
          ],
        },
        clinicalSignificance:
          "Reflects average blood sugar over past 2-3 months",
        relatedParameters: ["Glucose (Fasting)", "Glucose (Postprandial)"],
        testFrequency: {
          normal: "Every 3 years",
          abnormal: "Every 3-6 months for diabetics",
        },
      },

      // ============ Kidney Function ============
      {
        parameterName: "Creatinine",
        unit: "mg/dL",
        alternateUnits: [{ unit: "μmol/L", conversionFactor: 88.4 }],
        category: "Kidney Function",
        ranges: [
          {
            gender: "male",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 0.7,
            max: 1.3,
            critical: { min: 0, max: 2.0 },
          },
          {
            gender: "female",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 0.6,
            max: 1.1,
            critical: { min: 0, max: 1.8 },
          },
        ],
        reasons: {
          high: "May indicate kidney dysfunction, dehydration, urinary obstruction, or high protein intake",
          low: "May indicate muscle loss, liver disease, or malnutrition",
          criticalHigh:
            "Severe kidney dysfunction - immediate nephrologist consultation needed",
        },
        recommendations: {
          high: [
            "Stay well hydrated",
            "Check kidney function (eGFR)",
            "Control blood pressure and diabetes",
            "Avoid NSAIDs",
            "Limit protein if advised",
            "Consult nephrologist",
          ],
          low: [
            "Not usually concerning",
            "Ensure adequate protein intake",
            "Check for liver disease if very low",
          ],
          critical: [
            "Immediate nephrologist consultation",
            "May need dialysis",
            "Avoid nephrotoxic medications",
            "Strict dietary restrictions may be needed",
          ],
        },
        clinicalSignificance: "Key indicator of kidney function",
        relatedParameters: ["BUN", "eGFR", "Uric Acid", "Electrolytes"],
        testFrequency: {
          normal: "Annually",
          abnormal: "Every 1-3 months",
        },
      },

      {
        parameterName: "BUN",
        unit: "mg/dL",
        alternateUnits: [{ unit: "mmol/L", conversionFactor: 0.357 }],
        category: "Kidney Function",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 7,
            max: 20,
            critical: { min: 0, max: 50 },
          },
        ],
        reasons: {
          high: "May indicate kidney dysfunction, dehydration, high protein diet, heart failure, or GI bleeding",
          low: "May indicate liver disease, malnutrition, or overhydration",
        },
        recommendations: {
          high: [
            "Stay hydrated",
            "Check kidney function",
            "Moderate protein intake",
            "Control blood pressure",
            "Rule out GI bleeding",
          ],
          low: [
            "Ensure adequate protein intake",
            "Check liver function",
            "Usually not concerning",
          ],
          critical: [
            "Emergency evaluation needed",
            "Severe kidney dysfunction",
            "May require hospitalization",
          ],
        },
        clinicalSignificance:
          "Blood urea nitrogen - waste product filtered by kidneys",
        relatedParameters: ["Creatinine", "eGFR"],
        testFrequency: {
          normal: "Annually",
          abnormal: "Every 1-3 months",
        },
      },

      // ============ Liver Function ============
      {
        parameterName: "ALT (SGPT)",
        unit: "U/L",
        category: "Liver Function",
        ranges: [
          {
            gender: "male",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 7,
            max: 56,
          },
          {
            gender: "female",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 7,
            max: 45,
          },
        ],
        reasons: {
          high: "May indicate liver damage, hepatitis, fatty liver, alcohol abuse, or certain medications",
          low: "Usually not clinically significant",
        },
        recommendations: {
          high: [
            "Limit alcohol consumption",
            "Lose weight if overweight",
            "Avoid hepatotoxic medications",
            "Check for viral hepatitis",
            "Consider ultrasound of liver",
            "Review all medications with doctor",
          ],
          low: ["No action needed", "This is normal"],
        },
        clinicalSignificance: "Enzyme released when liver cells are damaged",
        relatedParameters: [
          "AST (SGOT)",
          "Alkaline Phosphatase",
          "Bilirubin",
          "GGT",
        ],
        testFrequency: {
          normal: "Annually",
          abnormal: "Every 1-6 months depending on severity",
        },
      },

      {
        parameterName: "AST (SGOT)",
        unit: "U/L",
        category: "Liver Function",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 10,
            max: 40,
          },
        ],
        reasons: {
          high: "May indicate liver disease, heart attack, muscle injury, or hemolysis",
          low: "Usually not clinically significant",
        },
        recommendations: {
          high: [
            "Check AST/ALT ratio",
            "Evaluate liver health",
            "Limit alcohol",
            "Rule out heart problems if very high",
            "Check for muscle disorders",
          ],
          low: ["No action needed"],
        },
        clinicalSignificance: "Enzyme found in liver, heart, and muscles",
        relatedParameters: ["ALT (SGPT)", "Alkaline Phosphatase", "Bilirubin"],
        testFrequency: {
          normal: "Annually",
          abnormal: "Every 1-6 months",
        },
      },

      // ============ Thyroid Function ============
      {
        parameterName: "TSH",
        unit: "μIU/mL",
        alternateUnits: [{ unit: "mIU/L", conversionFactor: 1 }],
        category: "Thyroid Function",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 0.4,
            max: 4.0,
            optimal: { min: 1.0, max: 2.5 },
          },
        ],
        reasons: {
          high: "May indicate hypothyroidism (underactive thyroid) causing fatigue, weight gain, cold intolerance",
          low: "May indicate hyperthyroidism (overactive thyroid) causing weight loss, anxiety, rapid heartbeat",
        },
        recommendations: {
          high: [
            "Consult endocrinologist",
            "May need thyroid hormone replacement",
            "Check T3, T4, thyroid antibodies",
            "Ensure adequate iodine intake",
            "Take levothyroxine if prescribed",
          ],
          low: [
            "Consult endocrinologist",
            "May need anti-thyroid medication",
            "Check T3, T4 levels",
            "Monitor heart rate and blood pressure",
            "Avoid excessive iodine",
          ],
        },
        clinicalSignificance:
          "Thyroid stimulating hormone - regulates thyroid function",
        relatedParameters: ["Free T3", "Free T4", "Thyroid Antibodies"],
        testFrequency: {
          normal: "Every 5 years or if symptoms",
          abnormal: "Every 6-8 weeks until stabilized, then every 6-12 months",
        },
      },

      // ============ Vitamins ============
      {
        parameterName: "Vitamin D",
        unit: "ng/mL",
        alternateUnits: [{ unit: "nmol/L", conversionFactor: 2.5 }],
        category: "Vitamins",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 30,
            max: 100,
            optimal: { min: 40, max: 60 },
          },
        ],
        reasons: {
          high: "Rare; may indicate excessive supplementation",
          low: "Very common; causes weak bones, muscle weakness, increased infection risk, depression",
        },
        recommendations: {
          high: [
            "Stop or reduce vitamin D supplements",
            "Check calcium levels",
            "Consult doctor",
          ],
          low: [
            "Take vitamin D3 supplement (1000-2000 IU daily)",
            "Get sunlight exposure (15-20 min daily)",
            "Eat vitamin D rich foods (fatty fish, egg yolks)",
            "Recheck levels after 3 months",
          ],
        },
        clinicalSignificance:
          "Essential for bone health, immune function, mood",
        relatedParameters: [
          "Calcium",
          "Parathyroid Hormone",
          "Alkaline Phosphatase",
        ],
        testFrequency: {
          normal: "Annually",
          abnormal: "Every 3 months until normalized",
        },
      },

      {
        parameterName: "Vitamin B12",
        unit: "pg/mL",
        alternateUnits: [{ unit: "pmol/L", conversionFactor: 0.738 }],
        category: "Vitamins",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 200,
            max: 900,
            optimal: { min: 400, max: 900 },
          },
        ],
        reasons: {
          high: "Usually not concerning; excess is excreted",
          low: "May cause anemia, fatigue, nerve damage, memory problems; common in vegetarians/vegans and elderly",
        },
        recommendations: {
          high: [
            "No action needed if no supplements",
            "Reduce B12 supplements if taking",
          ],
          low: [
            "Take B12 supplement (1000 mcg daily)",
            "Eat B12-rich foods (meat, eggs, dairy, fortified cereals)",
            "Check for pernicious anemia",
            "May need B12 injections if severe",
            "Rule out malabsorption",
          ],
        },
        clinicalSignificance:
          "Essential for nerve function, red blood cell formation, DNA synthesis",
        relatedParameters: ["Folate", "Hemoglobin", "MCV", "Homocysteine"],
        testFrequency: {
          normal: "Every 1-2 years for high-risk groups",
          abnormal: "Every 3-6 months",
        },
      },

      // ============ Electrolytes ============
      {
        parameterName: "Sodium",
        unit: "mEq/L",
        alternateUnits: [{ unit: "mmol/L", conversionFactor: 1 }],
        category: "Electrolytes",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 136,
            max: 145,
            critical: { min: 125, max: 155 },
          },
        ],
        reasons: {
          high: "May indicate dehydration, diabetes insipidus, or excessive salt intake",
          low: "May indicate heart failure, kidney disease, SIADH, or excessive water intake",
          criticalHigh: "Risk of seizures and brain damage",
          criticalLow: "Risk of seizures, coma, and death",
        },
        recommendations: {
          high: [
            "Increase water intake",
            "Reduce salt consumption",
            "Check for dehydration",
            "Monitor closely",
          ],
          low: [
            "Limit water intake",
            "Increase salt intake (as advised)",
            "Treat underlying condition",
            "Monitor closely",
          ],
          critical: [
            "Emergency medical care required",
            "May need IV fluids or medication",
            "Hospitalization likely needed",
          ],
        },
        clinicalSignificance: "Major electrolyte; regulates fluid balance",
        relatedParameters: ["Potassium", "Chloride", "Bicarbonate"],
        testFrequency: {
          normal: "As part of routine panel",
          abnormal: "Daily to weekly depending on severity",
        },
      },

      {
        parameterName: "Potassium",
        unit: "mEq/L",
        alternateUnits: [{ unit: "mmol/L", conversionFactor: 1 }],
        category: "Electrolytes",
        ranges: [
          {
            gender: "any",
            ageMin: 18,
            ageMax: 120,
            condition: "normal",
            min: 3.5,
            max: 5.0,
            critical: { min: 2.5, max: 6.0 },
          },
        ],
        reasons: {
          high: "May indicate kidney failure, dehydration, acidosis, or certain medications",
          low: "May indicate diarrhea, vomiting, diuretics, or inadequate intake",
          criticalHigh: "Risk of cardiac arrest - life-threatening",
          criticalLow:
            "Risk of cardiac arrhythmias, muscle weakness, paralysis",
        },
        recommendations: {
          high: [
            "Reduce potassium-rich foods",
            "Review medications (ACE inhibitors, potassium-sparing diuretics)",
            "Check kidney function",
            "Treat underlying cause",
          ],
          low: [
            "Increase potassium-rich foods (bananas, oranges, potatoes, spinach)",
            "Potassium supplements if prescribed",
            "Correct underlying cause",
            "Monitor heart rhythm",
          ],
          critical: [
            "Emergency medical care immediately",
            "Risk of fatal cardiac arrhythmia",
            "May need urgent dialysis or IV treatment",
            "Continuous cardiac monitoring",
          ],
        },
        clinicalSignificance:
          "Critical for heart function and muscle contraction",
        relatedParameters: ["Sodium", "Chloride", "Bicarbonate", "Creatinine"],
        testFrequency: {
          normal: "As part of routine panel",
          abnormal: "Daily to weekly depending on severity",
        },
      },
    ];

    // Clear existing data (optional - remove if you want to keep existing data)
    // await ParameterReference.deleteMany({});

    // Insert or update parameters
    for (const param of parameters) {
      await ParameterReference.findOneAndUpdate(
        { parameterName: param.parameterName },
        param,
        { upsert: true, new: true }
      );
    }

    console.log(
      `✅ Successfully seeded ${parameters.length} parameter references`
    );
    return { success: true, count: parameters.length };
  } catch (error) {
    console.error("❌ Error seeding parameter references:", error);
    throw error;
  }
};

export { seedParameterReferences };
