// Health insights and recommendations for blood parameters

export const getParameterInsight = (parameterName, status, value, referenceRange) => {
  const normalizedName = parameterName?.toLowerCase() || '';
  const normalizedStatus = status?.toLowerCase() || 'unknown';

  // Parameter-specific insights
  const insights = {
    // Complete Blood Count (CBC)
    'hemoglobin': {
      high: {
        message: 'High hemoglobin levels detected.',
        explanation: 'This may indicate dehydration, lung disease, or living at high altitude. In some cases, it could be a sign of polycythemia.',
        recommendations: [
          'Stay well-hydrated',
          'Consult your doctor for evaluation',
          'Avoid smoking if applicable'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low hemoglobin levels detected - possible anemia.',
        explanation: 'Low hemoglobin reduces oxygen delivery to tissues. Common causes include iron deficiency, vitamin B12 deficiency, or chronic diseases.',
        recommendations: [
          'Increase iron-rich foods (spinach, red meat, lentils)',
          'Consider iron supplements after consulting doctor',
          'Get tested for vitamin B12 and folate levels',
          'Avoid tea/coffee with meals (reduces iron absorption)'
        ],
        severity: 'moderate'
      }
    },
    'wbc': {
      high: {
        message: 'Elevated white blood cell count detected.',
        explanation: 'High WBC may indicate infection, inflammation, stress, or immune response. In rare cases, it could suggest blood disorders.',
        recommendations: [
          'Monitor for signs of infection (fever, pain)',
          'Reduce stress levels',
          'Consult doctor if persistent',
          'Stay hydrated'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low white blood cell count detected.',
        explanation: 'Low WBC weakens immune system, making you more susceptible to infections. Causes include viral infections, medications, or bone marrow disorders.',
        recommendations: [
          'Practice good hygiene to avoid infections',
          'Avoid crowded places during flu season',
          'Consult doctor about medication review',
          'Get adequate rest and nutrition'
        ],
        severity: 'high'
      }
    },
    'platelets': {
      high: {
        message: 'High platelet count detected.',
        explanation: 'Elevated platelets may increase risk of blood clots. Common causes include iron deficiency, inflammation, or bone marrow disorders.',
        recommendations: [
          'Stay well-hydrated',
          'Avoid prolonged sitting',
          'Consult hematologist if significantly elevated',
          'Monitor for unusual bruising or bleeding'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low platelet count detected - increased bleeding risk.',
        explanation: 'Low platelets (thrombocytopenia) can cause easy bruising and bleeding. Causes include viral infections, medications, or autoimmune conditions.',
        recommendations: [
          'Avoid contact sports and activities with injury risk',
          'Be cautious with medications like aspirin',
          'Report unusual bruising to your doctor immediately',
          'Avoid alcohol consumption'
        ],
        severity: 'high'
      }
    },
    'rbc': {
      high: {
        message: 'High red blood cell count detected.',
        explanation: 'Elevated RBC may indicate lung disease, heart disease, dehydration, or living at high altitude.',
        recommendations: [
          'Stay well-hydrated',
          'Monitor oxygen levels if you have lung/heart conditions',
          'Consult doctor for evaluation'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low red blood cell count - anemia detected.',
        explanation: 'Low RBC reduces oxygen carrying capacity. Common causes include blood loss, nutritional deficiencies, or chronic diseases.',
        recommendations: [
          'Increase iron, B12, and folate intake',
          'Eat iron-rich foods with vitamin C',
          'Get evaluated for internal bleeding if unexplained',
          'Consider supplements after doctor consultation'
        ],
        severity: 'moderate'
      }
    },

    // Lipid Profile
    'cholesterol': {
      high: {
        message: 'High cholesterol levels detected - cardiovascular risk.',
        explanation: 'Elevated cholesterol increases risk of heart disease and stroke by causing plaque buildup in arteries.',
        recommendations: [
          'Reduce saturated and trans fats in diet',
          'Increase fiber intake (oats, beans, fruits)',
          'Exercise regularly (30+ min daily)',
          'Maintain healthy weight',
          'Consider statin therapy after doctor consultation'
        ],
        severity: 'high'
      },
      low: {
        message: 'Low cholesterol detected.',
        explanation: 'While generally good, very low cholesterol may indicate malnutrition, liver disease, or hyperthyroidism.',
        recommendations: [
          'Ensure balanced diet with healthy fats',
          'Get thyroid function tested',
          'Consult doctor if accompanied by other symptoms'
        ],
        severity: 'low'
      }
    },
    'ldl': {
      high: {
        message: 'High LDL (bad cholesterol) - significant cardiovascular risk.',
        explanation: 'LDL cholesterol deposits plaque in arteries, leading to atherosclerosis, heart attacks, and strokes.',
        recommendations: [
          'Eliminate trans fats completely',
          'Reduce red meat and full-fat dairy',
          'Add nuts, olive oil, and fatty fish to diet',
          'Exercise 150+ minutes per week',
          'Medication may be necessary - consult cardiologist'
        ],
        severity: 'high'
      },
      low: {
        message: 'Excellent LDL levels - good cardiovascular health.',
        explanation: 'Low LDL cholesterol reduces risk of heart disease and stroke.',
        recommendations: [
          'Maintain current healthy lifestyle',
          'Continue regular exercise',
          'Keep balanced diet'
        ],
        severity: 'low'
      }
    },
    'hdl': {
      high: {
        message: 'Excellent HDL (good cholesterol) levels.',
        explanation: 'High HDL protects against heart disease by removing excess cholesterol from arteries.',
        recommendations: [
          'Maintain current healthy lifestyle',
          'Continue regular exercise',
          'Include healthy fats in diet'
        ],
        severity: 'low'
      },
      low: {
        message: 'Low HDL (good cholesterol) - cardiovascular risk.',
        explanation: 'Low HDL increases heart disease risk. HDL helps remove cholesterol from arteries.',
        recommendations: [
          'Exercise regularly (cardio exercises boost HDL)',
          'Quit smoking if applicable',
          'Lose weight if overweight',
          'Include healthy fats: nuts, olive oil, fatty fish',
          'Limit refined carbohydrates and sugar'
        ],
        severity: 'high'
      }
    },
    'triglycerides': {
      high: {
        message: 'High triglyceride levels - metabolic risk.',
        explanation: 'Elevated triglycerides increase risk of heart disease, pancreatitis, and metabolic syndrome.',
        recommendations: [
          'Limit sugar and refined carbohydrates',
          'Reduce alcohol consumption significantly',
          'Increase omega-3 fatty acids (fish, flaxseed)',
          'Lose weight if overweight',
          'Exercise regularly',
          'Consider medication if very high'
        ],
        severity: 'high'
      },
      low: {
        message: 'Excellent triglyceride levels.',
        explanation: 'Low triglycerides indicate good metabolic health.',
        recommendations: [
          'Maintain current healthy lifestyle'
        ],
        severity: 'low'
      }
    },

    // Blood Sugar
    'glucose': {
      high: {
        message: 'High blood glucose - diabetes risk or poor control.',
        explanation: 'Elevated glucose damages blood vessels, nerves, kidneys, and eyes over time. May indicate prediabetes or diabetes.',
        recommendations: [
          'Limit sugar and refined carbohydrates',
          'Choose low glycemic index foods',
          'Exercise regularly to improve insulin sensitivity',
          'Monitor blood sugar regularly',
          'Get HbA1c test to assess long-term control',
          'Consult endocrinologist for diabetes management'
        ],
        severity: 'high'
      },
      low: {
        message: 'Low blood glucose - hypoglycemia detected.',
        explanation: 'Low glucose can cause dizziness, confusion, and loss of consciousness. Common in diabetics on medication or those who skip meals.',
        recommendations: [
          'Eat regular, balanced meals',
          'Carry quick sugar source (juice, candy)',
          'Review diabetes medications with doctor',
          'Avoid excessive alcohol',
          'Monitor glucose if symptomatic'
        ],
        severity: 'high'
      }
    },
    'hba1c': {
      high: {
        message: 'High HbA1c - poor long-term glucose control.',
        explanation: 'HbA1c reflects average blood sugar over 3 months. High levels indicate increased risk of diabetes complications.',
        recommendations: [
          'Strict blood sugar control needed',
          'Follow diabetic diet plan',
          'Regular exercise program',
          'Medication adjustment may be needed',
          'Monitor blood sugar frequently',
          'Regular eye and kidney check-ups'
        ],
        severity: 'high'
      },
      low: {
        message: 'Excellent long-term glucose control.',
        explanation: 'Low HbA1c indicates good blood sugar management over the past 3 months.',
        recommendations: [
          'Maintain current diabetes management',
          'Continue healthy lifestyle'
        ],
        severity: 'low'
      }
    },

    // Liver Function
    'sgpt': {
      high: {
        message: 'Elevated liver enzyme (SGPT/ALT) - liver stress detected.',
        explanation: 'High SGPT indicates liver cell damage. Common causes include fatty liver, alcohol, medications, or hepatitis.',
        recommendations: [
          'Avoid alcohol completely',
          'Lose weight if overweight',
          'Review medications with doctor',
          'Get tested for viral hepatitis',
          'Reduce fatty and processed foods',
          'Consider liver ultrasound'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Normal liver enzyme levels.',
        explanation: 'Low SGPT is generally not concerning.',
        recommendations: [],
        severity: 'low'
      }
    },
    'sgot': {
      high: {
        message: 'Elevated liver enzyme (SGOT/AST) detected.',
        explanation: 'High SGOT may indicate liver damage, heart problems, or muscle injury.',
        recommendations: [
          'Avoid alcohol',
          'Get comprehensive liver function tests',
          'Rule out heart and muscle problems',
          'Maintain healthy weight',
          'Follow up with gastroenterologist'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Normal liver enzyme levels.',
        explanation: 'Low SGOT is generally not concerning.',
        recommendations: [],
        severity: 'low'
      }
    },
    'bilirubin': {
      high: {
        message: 'High bilirubin - possible jaundice or liver dysfunction.',
        explanation: 'Elevated bilirubin causes yellowing of skin/eyes. May indicate liver disease, bile duct obstruction, or hemolysis.',
        recommendations: [
          'Monitor for yellowing of skin or eyes',
          'Avoid alcohol completely',
          'Get liver ultrasound',
          'Test for hepatitis viruses',
          'Consult gastroenterologist urgently if jaundiced',
          'Stay well-hydrated'
        ],
        severity: 'high'
      },
      low: {
        message: 'Normal bilirubin levels.',
        explanation: 'Low bilirubin is not typically concerning.',
        recommendations: [],
        severity: 'low'
      }
    },

    // Kidney Function
    'creatinine': {
      high: {
        message: 'High creatinine - kidney function impairment.',
        explanation: 'Elevated creatinine indicates reduced kidney filtration. Causes include dehydration, kidney disease, or certain medications.',
        recommendations: [
          'Stay well-hydrated',
          'Limit protein intake',
          'Avoid NSAIDs (ibuprofen, etc.)',
          'Control blood pressure and diabetes strictly',
          'Get kidney ultrasound and GFR calculation',
          'Consult nephrologist if persistently high'
        ],
        severity: 'high'
      },
      low: {
        message: 'Low creatinine detected.',
        explanation: 'Low creatinine may indicate low muscle mass or liver disease.',
        recommendations: [
          'Ensure adequate protein intake',
          'Consider strength training exercises',
          'Get liver function evaluated if other symptoms present'
        ],
        severity: 'low'
      }
    },
    'urea': {
      high: {
        message: 'High blood urea - kidney stress or dehydration.',
        explanation: 'Elevated urea may indicate kidney problems, dehydration, or high protein diet.',
        recommendations: [
          'Increase water intake significantly',
          'Moderate protein intake',
          'Get kidney function tests',
          'Check for urinary obstruction',
          'Monitor blood pressure'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low blood urea detected.',
        explanation: 'Low urea may indicate liver disease or low protein diet.',
        recommendations: [
          'Ensure adequate protein in diet',
          'Get liver function evaluated'
        ],
        severity: 'low'
      }
    },

    // Thyroid
    'tsh': {
      high: {
        message: 'High TSH - hypothyroidism (underactive thyroid).',
        explanation: 'Elevated TSH indicates low thyroid hormone production, slowing metabolism.',
        recommendations: [
          'Get T3 and T4 levels tested',
          'Thyroid hormone replacement may be needed',
          'Ensure adequate iodine intake',
          'Consult endocrinologist',
          'Monitor for symptoms: fatigue, weight gain, cold intolerance'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low TSH - hyperthyroidism (overactive thyroid).',
        explanation: 'Low TSH indicates excess thyroid hormone production, speeding metabolism.',
        recommendations: [
          'Get T3 and T4 levels tested',
          'Thyroid ultrasound may be needed',
          'Consult endocrinologist urgently',
          'Monitor for symptoms: anxiety, palpitations, weight loss',
          'Avoid excess iodine intake'
        ],
        severity: 'moderate'
      }
    },
    't3': {
      high: {
        message: 'High T3 - hyperthyroidism detected.',
        explanation: 'Elevated T3 indicates overactive thyroid, causing rapid metabolism.',
        recommendations: [
          'Consult endocrinologist promptly',
          'Antithyroid medications may be needed',
          'Monitor heart rate and blood pressure',
          'Reduce stress levels',
          'Avoid caffeine and stimulants'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low T3 - hypothyroidism indication.',
        explanation: 'Low T3 suggests underactive thyroid or conversion issues.',
        recommendations: [
          'Get full thyroid panel',
          'Consult endocrinologist',
          'Thyroid medication adjustment may be needed',
          'Ensure adequate selenium and zinc intake'
        ],
        severity: 'moderate'
      }
    },
    't4': {
      high: {
        message: 'High T4 - hyperthyroidism detected.',
        explanation: 'Elevated T4 indicates overactive thyroid function.',
        recommendations: [
          'Consult endocrinologist',
          'Antithyroid treatment may be needed',
          'Monitor cardiovascular symptoms',
          'Get thyroid ultrasound'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low T4 - hypothyroidism detected.',
        explanation: 'Low T4 indicates underactive thyroid function.',
        recommendations: [
          'Thyroid hormone replacement needed',
          'Consult endocrinologist',
          'Regular monitoring required',
          'Take medication on empty stomach'
        ],
        severity: 'moderate'
      }
    },

    // Vitamins
    'vitamin d': {
      high: {
        message: 'High vitamin D levels detected.',
        explanation: 'Excessive vitamin D can cause calcium buildup and kidney problems.',
        recommendations: [
          'Reduce or stop vitamin D supplements',
          'Avoid excessive sun exposure',
          'Monitor calcium levels',
          'Consult doctor about supplementation'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Vitamin D deficiency detected.',
        explanation: 'Low vitamin D weakens bones, immunity, and mood. Very common, especially in areas with limited sunlight.',
        recommendations: [
          'Get 15-20 minutes of sunlight daily',
          'Take vitamin D3 supplements (consult doctor for dosage)',
          'Eat vitamin D-rich foods: fatty fish, egg yolks, fortified milk',
          'Recheck levels after 3 months of supplementation'
        ],
        severity: 'moderate'
      }
    },
    'vitamin b12': {
      high: {
        message: 'High vitamin B12 levels.',
        explanation: 'Elevated B12 is usually not harmful but may indicate liver disease or certain blood disorders.',
        recommendations: [
          'Review B12 supplements',
          'Get liver function tested',
          'Consult doctor if persistently elevated'
        ],
        severity: 'low'
      },
      low: {
        message: 'Vitamin B12 deficiency detected.',
        explanation: 'Low B12 causes fatigue, nerve damage, and anemia. Common in vegetarians and elderly.',
        recommendations: [
          'Take B12 supplements (oral or injections)',
          'Eat B12-rich foods: meat, fish, dairy, fortified cereals',
          'Consider monthly B12 injections if severe',
          'Monitor for nerve symptoms: tingling, numbness',
          'Vegetarians should supplement regularly'
        ],
        severity: 'moderate'
      }
    },

    // Electrolytes
    'sodium': {
      high: {
        message: 'High sodium - hypernatremia detected.',
        explanation: 'Elevated sodium causes dehydration and can affect brain function.',
        recommendations: [
          'Increase water intake significantly',
          'Reduce salt in diet',
          'Monitor fluid balance',
          'Seek medical attention if symptomatic (confusion, seizures)'
        ],
        severity: 'high'
      },
      low: {
        message: 'Low sodium - hyponatremia detected.',
        explanation: 'Low sodium can cause confusion, seizures, and coma. Common causes include medications, heart/kidney/liver disease.',
        recommendations: [
          'Seek medical attention urgently if symptomatic',
          'Review medications with doctor (especially diuretics)',
          'Moderate water intake (avoid over-hydration)',
          'May need IV sodium in severe cases'
        ],
        severity: 'high'
      }
    },
    'potassium': {
      high: {
        message: 'High potassium - hyperkalemia detected.',
        explanation: 'Elevated potassium can cause dangerous heart rhythm problems.',
        recommendations: [
          'Seek immediate medical attention if very high',
          'Limit high-potassium foods: bananas, oranges, potatoes, tomatoes',
          'Review medications (ACE inhibitors, potassium-sparing diuretics)',
          'Check kidney function',
          'Monitor heart rhythm'
        ],
        severity: 'high'
      },
      low: {
        message: 'Low potassium - hypokalemia detected.',
        explanation: 'Low potassium causes muscle weakness, cramps, and heart rhythm problems.',
        recommendations: [
          'Eat potassium-rich foods: bananas, oranges, spinach, potatoes',
          'Take potassium supplements if prescribed',
          'Review diuretic medications',
          'Monitor for muscle weakness or cramps',
          'Check magnesium levels'
        ],
        severity: 'high'
      }
    },
    'calcium': {
      high: {
        message: 'High calcium - hypercalcemia detected.',
        explanation: 'Elevated calcium may indicate parathyroid problems, excess vitamin D, or certain cancers.',
        recommendations: [
          'Increase water intake',
          'Review calcium and vitamin D supplements',
          'Get parathyroid hormone tested',
          'Limit calcium-rich foods temporarily',
          'Consult endocrinologist'
        ],
        severity: 'moderate'
      },
      low: {
        message: 'Low calcium - hypocalcemia detected.',
        explanation: 'Low calcium weakens bones and can cause muscle spasms, tingling.',
        recommendations: [
          'Increase calcium-rich foods: dairy, leafy greens, fortified foods',
          'Take calcium supplements with vitamin D',
          'Get vitamin D and parathyroid hormone tested',
          'Ensure adequate magnesium intake',
          'Consider bone density scan'
        ],
        severity: 'moderate'
      }
    }
  };

  // Find matching parameter insight
  let insight = null;
  for (const [key, value] of Object.entries(insights)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      insight = value[normalizedStatus];
      break;
    }
  }

  // If no specific insight found, provide generic advice
  if (!insight) {
    if (normalizedStatus === 'high') {
      return {
        message: `Elevated ${parameterName} detected.`,
        explanation: `Your ${parameterName} level is above the normal range. This parameter is outside optimal levels.`,
        recommendations: [
          'Consult your healthcare provider for evaluation',
          'Discuss lifestyle modifications',
          'Follow up testing may be recommended'
        ],
        severity: 'moderate'
      };
    } else if (normalizedStatus === 'low') {
      return {
        message: `Low ${parameterName} detected.`,
        explanation: `Your ${parameterName} level is below the normal range. This parameter is outside optimal levels.`,
        recommendations: [
          'Consult your healthcare provider for evaluation',
          'Discuss dietary and lifestyle changes',
          'Follow up testing may be recommended'
        ],
        severity: 'moderate'
      };
    } else {
      return {
        message: `${parameterName} is within normal range.`,
        explanation: `Your ${parameterName} level is optimal. This indicates good health in this parameter.`,
        recommendations: [
          'Maintain current healthy lifestyle',
          'Continue regular health monitoring'
        ],
        severity: 'low'
      };
    }
  }

  return insight;
};

// Get severity color
export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high':
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-800',
        icon: 'text-red-600'
      };
    case 'moderate':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-800',
        icon: 'text-yellow-600'
      };
    default:
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-800',
        icon: 'text-green-600'
      };
  }
};
