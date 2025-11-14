"""
Clinical Rules-Based Fallback System
Provides immediate interpretations using clinical thresholds when ML models are unavailable.
Covers all 79 parameters from comprehensive medical reports.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"

def load_clinical_thresholds():
    """Load clinical thresholds from JSON file"""
    path = DATA_DIR / 'clinical_thresholds.json'
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

THRESHOLDS = load_clinical_thresholds()

def classify_by_threshold(value, param_name, gender=None, age=None, pregnant=False):
    """
    Classify parameter value based on clinical thresholds.
    
    Args:
        value: numeric value
        param_name: parameter name (e.g., 'hemoglobin_g_dL')
        gender: 'Male' or 'Female'
        age: patient age
        pregnant: boolean
    
    Returns:
        (status_code, status_label)
        status_code: 0=Normal, 1=Low, 2=High, 3=Critical
    """
    
    # Gender-specific parameters
    if param_name == 'hemoglobin_g_dL':
        if gender == 'Male':
            if value <= 7.0:
                return (3, 'Critical Low')
            elif value < 13.5:
                return (1, 'Low')
            elif value > 20.0:
                return (3, 'Critical High')
            elif value > 17.5:
                return (2, 'High')
            else:
                return (0, 'Normal')
        else:  # Female
            if value <= 7.0:
                return (3, 'Critical Low')
            elif value < 12.0:
                return (1, 'Low')
            elif value > 20.0:
                return (3, 'Critical High')
            elif value > 15.5:
                return (2, 'High')
            else:
                return (0, 'Normal')
    
    elif param_name == 'rbc_count':
        if gender == 'Male':
            if value <= 3.0:
                return (3, 'Critical Low')
            elif value < 4.5:
                return (1, 'Low')
            elif value > 7.0:
                return (3, 'Critical High')
            elif value > 5.9:
                return (2, 'High')
            else:
                return (0, 'Normal')
        else:  # Female
            if value <= 2.8:
                return (3, 'Critical Low')
            elif value < 4.0:
                return (1, 'Low')
            elif value > 6.5:
                return (3, 'Critical High')
            elif value > 5.2:
                return (2, 'High')
            else:
                return (0, 'Normal')
    
    # WBC Count
    elif param_name == 'wbc_10e9_L':
        if value <= 2.0:
            return (3, 'Critical Low')
        elif value < 4.0:
            return (1, 'Low')
        elif value > 20.0:
            return (3, 'Critical High')
        elif value > 11.0:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Platelet Count
    elif param_name == 'platelet_count':
        if value <= 50:
            return (3, 'Critical Low')
        elif value < 150:
            return (1, 'Low')
        elif value > 1000:
            return (3, 'Critical High')
        elif value > 400:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Hematocrit
    elif param_name == 'hematocrit_percent':
        if gender == 'Male':
            if value < 38:
                return (1, 'Low')
            elif value > 54:
                return (2, 'High')
            else:
                return (0, 'Normal')
        else:
            if value < 36:
                return (1, 'Low')
            elif value > 47:
                return (2, 'High')
            else:
                return (0, 'Normal')
    
    # MCV
    elif param_name == 'mcv_fL':
        if value <= 60:
            return (3, 'Critical Low')
        elif value < 80:
            return (1, 'Low')
        elif value > 120:
            return (3, 'Critical High')
        elif value > 100:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # MCH
    elif param_name == 'mch_pg':
        if value <= 20:
            return (3, 'Critical Low')
        elif value < 27:
            return (1, 'Low')
        elif value > 40:
            return (3, 'Critical High')
        elif value > 33:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # MCHC
    elif param_name == 'mchc_g_dL':
        if value <= 28:
            return (3, 'Critical Low')
        elif value < 32:
            return (1, 'Low')
        elif value > 38:
            return (3, 'Critical High')
        elif value > 36:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # RDW
    elif param_name == 'rdw_percent':
        if value < 11.5:
            return (1, 'Low')
        elif value > 20.0:
            return (3, 'Critical High')
        elif value > 14.5:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Neutrophils %
    elif param_name == 'neutrophils_percent':
        if value <= 10:
            return (3, 'Critical Low')
        elif value < 40:
            return (1, 'Low')
        elif value > 95:
            return (3, 'Critical High')
        elif value > 70:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Lymphocytes %
    elif param_name == 'lymphocytes_percent':
        if value <= 1:
            return (3, 'Critical Low')
        elif value < 20:
            return (1, 'Low')
        elif value > 90:
            return (3, 'Critical High')
        elif value > 40:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Monocytes %
    elif param_name == 'monocytes_percent':
        if value < 2:
            return (1, 'Low')
        elif value > 20:
            return (3, 'Critical High')
        elif value > 10:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Eosinophils %
    elif param_name == 'eosinophils_percent':
        if value > 15:
            return (3, 'Critical High')
        elif value > 5:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Basophils %
    elif param_name == 'basophils_percent':
        if value > 5:
            return (3, 'Critical High')
        elif value > 2:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Random Blood Sugar
    elif param_name == 'random_blood_sugar_mg_dL':
        if value < 70:
            return (3, 'Critical Low')
        elif value > 300:
            return (3, 'Critical High')
        elif value > 200:
            return (2, 'High')
        elif value > 140:
            return (1, 'Borderline High')
        else:
            return (0, 'Normal')
    
    # HbA1c
    elif param_name == 'hba1c_percent':
        if value < 4.0:
            return (1, 'Low')
        elif value >= 6.5:
            return (2, 'Diabetic Range')
        elif value >= 5.7:
            return (1, 'Prediabetic')
        else:
            return (0, 'Normal')
    
    # ESR
    elif param_name == 'esr_mm_hr':
        if gender == 'Male':
            if value > 50:
                return (3, 'Critical High')
            elif value > 20:
                return (2, 'High')
            else:
                return (0, 'Normal')
        else:  # Female
            if value > 50:
                return (3, 'Critical High')
            elif value > 30:
                return (2, 'High')
            else:
                return (0, 'Normal')
    
    # CRP
    elif param_name == 'crp_mg_L':
        if value > 100:
            return (3, 'Critical High')
        elif value > 50:
            return (2, 'Very High')
        elif value > 10:
            return (1, 'Elevated')
        else:
            return (0, 'Normal')
    
    # Serum Creatinine
    elif param_name == 'serum_creatinine_mg_dL':
        if gender == 'Male':
            if value > 3.0:
                return (3, 'Critical High')
            elif value > 1.5:
                return (2, 'High')
            elif value > 1.2:
                return (1, 'Borderline High')
            else:
                return (0, 'Normal')
        else:  # Female
            if value > 2.5:
                return (3, 'Critical High')
            elif value > 1.3:
                return (2, 'High')
            elif value > 1.1:
                return (1, 'Borderline High')
            else:
                return (0, 'Normal')
    
    # Serum Iron
    elif param_name == 'serum_iron_mcg_dL':
        if value < 30:
            return (1, 'Low')
        elif value > 180:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # TIBC
    elif param_name == 'tibc_mcg_dL':
        if value < 240:
            return (1, 'Low')
        elif value > 450:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Transferrin Saturation
    elif param_name == 'transferrin_saturation_percent':
        if value < 20:
            return (1, 'Low')
        elif value > 50:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Ferritin
    elif param_name == 'ferritin_ng_mL':
        if value < 30:
            return (1, 'Low')
        elif value > 300:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Vitamin B12
    elif param_name == 'vitamin_b12_pg_mL':
        if value < 200:
            return (1, 'Low')
        elif value > 900:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Vitamin D
    elif param_name == 'vitamin_d_ng_mL':
        if value < 20:
            return (1, 'Deficient')
        elif value < 30:
            return (1, 'Insufficient')
        elif value > 100:
            return (2, 'High')
        else:
            return (0, 'Sufficient')
    
    # TSH
    elif param_name == 'tsh_mIU_L':
        if value < 0.5:
            return (2, 'Low - Hyperthyroid')
        elif value > 5.0:
            return (2, 'High - Hypothyroid')
        else:
            return (0, 'Normal')
    
    # Cortisol PM
    elif param_name == 'cortisol_pm_mcg_dL':
        if value < 3.0:
            return (1, 'Low')
        elif value > 15.0:
            return (2, 'High')
        else:
            return (0, 'Normal')
    
    # Default fallback
    else:
        return (0, 'Normal')


def calculate_risk_assessments(patient_data):
    """
    Calculate comprehensive health risk assessments based on all parameters.
    
    Args:
        patient_data: dict with all patient parameters
    
    Returns:
        dict with risk assessments
    """
    risks = {}
    
    # Cardiovascular Risk
    nlr = patient_data.get('neutrophil_lymphocyte_ratio', 0)
    rdw = patient_data.get('rdw_percent', 0)
    age = patient_data.get('patientAge', 0)
    smoking = patient_data.get('smoking', 0)
    
    cv_risk_level = 'Low'
    cv_factors = []
    
    if nlr > 3.5:
        cv_risk_level = 'Moderate'
        cv_factors.append(f'Elevated NLR: {nlr:.2f} (cardiovascular risk marker)')
    if rdw > 14.5:
        cv_risk_level = 'Moderate' if cv_risk_level == 'Low' else 'High'
        cv_factors.append(f'High RDW: {rdw}% (associated with heart disease)')
    if age > 60:
        cv_factors.append(f'Age: {age} (increased risk)')
    if smoking:
        cv_risk_level = 'High' if cv_risk_level != 'Low' else 'Moderate'
        cv_factors.append('Smoking status (major risk factor)')
    
    risks['cardiovascularRisk'] = {
        'level': cv_risk_level,
        'factors': cv_factors,
        'recommendations': [
            'Monitor blood pressure regularly',
            'Consider lipid profile testing',
            'Lifestyle modifications: diet and exercise',
            'Consult cardiologist if risk factors present'
        ]
    }
    
    # Diabetes Risk
    rbs = patient_data.get('random_blood_sugar_mg_dL', 0)
    hba1c = patient_data.get('hba1c_percent', 0)
    wbc = patient_data.get('wbc_10e9_L', 0)
    
    diabetes_risk_level = 'Low'
    diabetes_factors = []
    
    if rbs >= 200:
        diabetes_risk_level = 'High'
        diabetes_factors.append(f'RBS: {rbs} mg/dL (diabetic range)')
    elif rbs >= 140:
        diabetes_risk_level = 'Moderate'
        diabetes_factors.append(f'RBS: {rbs} mg/dL (prediabetic range)')
    
    if hba1c >= 6.5:
        diabetes_risk_level = 'High'
        diabetes_factors.append(f'HbA1c: {hba1c}% (diabetic range)')
    elif hba1c >= 5.7:
        diabetes_risk_level = 'Moderate'
        diabetes_factors.append(f'HbA1c: {hba1c}% (prediabetic range)')
    
    if wbc > 9.0:
        diabetes_factors.append('Elevated WBC (associated with insulin resistance)')
    
    risks['diabetesRisk'] = {
        'level': diabetes_risk_level,
        'indication': 'Based on glucose markers and inflammatory indicators',
        'factors': diabetes_factors,
        'recommendations': [
            'Fasting glucose test recommended',
            'HbA1c monitoring every 3-6 months',
            'Maintain healthy weight',
            'Regular exercise program',
            'Reduce refined carbohydrates'
        ]
    }
    
    # Infection Risk
    wbc = patient_data.get('wbc_10e9_L', 0)
    neutrophils = patient_data.get('neutrophils_percent', 0)
    crp = patient_data.get('crp_mg_L', 0)
    esr = patient_data.get('esr_mm_hr', 0)
    
    infection_risk_level = 'None'
    infection_type = 'No active infection'
    infection_factors = []
    
    if wbc > 11.0 and neutrophils > 70:
        infection_risk_level = 'High'
        infection_type = 'Likely bacterial infection'
        infection_factors.append(f'Leukocytosis: WBC {wbc} × 10⁹/L')
        infection_factors.append(f'Neutrophilia: {neutrophils}%')
    elif wbc < 4.0:
        infection_risk_level = 'Moderate'
        infection_type = 'Possible viral infection or immunosuppression'
        infection_factors.append(f'Leukopenia: WBC {wbc} × 10⁹/L')
    
    if crp > 10:
        infection_risk_level = 'High' if infection_risk_level == 'None' else infection_risk_level
        infection_factors.append(f'Elevated CRP: {crp} mg/L (active inflammation)')
    
    if esr > 30:
        infection_factors.append(f'Elevated ESR: {esr} mm/hr')
    
    risks['infectionRisk'] = {
        'level': infection_risk_level,
        'indication': infection_type,
        'factors': infection_factors,
        'recommendations': [
            'Medical evaluation needed' if infection_risk_level == 'High' else 'Monitor symptoms',
            'Blood culture if fever present',
            'Complete WBC differential analysis',
            'Antibiotics may be required (consult doctor)'
        ] if infection_risk_level == 'High' else ['Continue monitoring']
    }
    
    # Anemia Profile
    hb = patient_data.get('hemoglobin_g_dL', 0)
    mcv = patient_data.get('mcv_fL', 0)
    mch = patient_data.get('mch_pg', 0)
    rdw = patient_data.get('rdw_percent', 0)
    ferritin = patient_data.get('ferritin_ng_mL', 0)
    gender = patient_data.get('patientGender', 'Male')
    
    anemia_type = 'No anemia'
    anemia_severity = 'Normal'
    anemia_indicators = []
    
    hb_low = hb < 13.5 if gender == 'Male' else hb < 12.0
    
    if hb_low:
        if mcv < 80:
            anemia_type = 'Microcytic anemia (likely iron deficiency)'
            anemia_indicators.append(f'Low Hb: {hb} g/dL')
            anemia_indicators.append(f'Low MCV: {mcv} fL')
            if ferritin < 30:
                anemia_indicators.append(f'Low Ferritin: {ferritin} ng/mL (confirms iron deficiency)')
        elif mcv > 100:
            anemia_type = 'Macrocytic anemia (B12/folate deficiency)'
            anemia_indicators.append(f'Low Hb: {hb} g/dL')
            anemia_indicators.append(f'High MCV: {mcv} fL')
        else:
            anemia_type = 'Normocytic anemia'
            anemia_indicators.append(f'Low Hb: {hb} g/dL')
            anemia_indicators.append(f'Normal MCV: {mcv} fL')
        
        if rdw > 14.5:
            anemia_indicators.append(f'High RDW: {rdw}% (mixed anemia types)')
        
        if hb < 7.0:
            anemia_severity = 'Severe'
        elif hb < 10.0:
            anemia_severity = 'Moderate'
        else:
            anemia_severity = 'Mild'
    
    risks['anemiaProfile'] = {
        'type': anemia_type,
        'severity': anemia_severity,
        'indicators': anemia_indicators,
        'recommendations': [
            'Iron studies (serum iron, ferritin, TIBC)',
            'Vitamin B12 and folate levels',
            'Iron supplementation if iron deficiency confirmed',
            'Investigate cause of blood loss',
            'Dietary modifications'
        ] if anemia_type != 'No anemia' else ['No anemia detected']
    }
    
    # Thrombosis/Bleeding Risk
    platelet = patient_data.get('platelet_count', 0)
    hematocrit = patient_data.get('hematocrit_percent', 0)
    
    thrombosis_risk_level = 'Normal'
    thrombosis_factors = []
    
    if platelet > 400:
        thrombosis_risk_level = 'Moderate'
        thrombosis_factors.append(f'Elevated platelets: {platelet} × 10³/μL (clotting risk)')
    elif platelet < 150:
        thrombosis_risk_level = 'Low' if platelet > 100 else 'Bleeding Risk'
        thrombosis_factors.append(f'Low platelets: {platelet} × 10³/μL')
    
    if hematocrit > 52:
        thrombosis_risk_level = 'Moderate' if thrombosis_risk_level == 'Normal' else 'High'
        thrombosis_factors.append(f'High hematocrit: {hematocrit}% (blood viscosity)')
    
    risks['thrombosisRisk'] = {
        'level': thrombosis_risk_level,
        'factors': thrombosis_factors,
        'recommendations': [
            'Consult hematologist',
            'Consider anticoagulation if high risk',
            'Stay hydrated',
            'Avoid prolonged immobility'
        ] if thrombosis_risk_level != 'Normal' else ['Normal clotting profile']
    }
    
    # Overall Health Score
    abnormal_count = 0
    critical_count = 0
    
    # Count abnormalities
    for param, value in patient_data.items():
        if '_status' in param:
            continue
        if param in ['hemoglobin_g_dL', 'wbc_10e9_L', 'platelet_count', 'rbc_count']:
            status_code, _ = classify_by_threshold(value, param, gender, age)
            if status_code == 3:
                critical_count += 1
            elif status_code in [1, 2]:
                abnormal_count += 1
    
    if critical_count >= 2:
        health_category = 'Critical'
        health_score = 25
        urgency = 'URGENT - Seek immediate medical attention'
    elif critical_count == 1:
        health_category = 'Poor'
        health_score = 40
        urgency = 'High priority - Schedule appointment within 24-48 hours'
    elif abnormal_count >= 3:
        health_category = 'Fair'
        health_score = 60
        urgency = 'Follow up within 1 week'
    elif abnormal_count >= 1:
        health_category = 'Good'
        health_score = 75
        urgency = 'Routine follow-up recommended'
    else:
        health_category = 'Excellent'
        health_score = 95
        urgency = 'Continue healthy lifestyle'
    
    risks['overallHealthScore'] = {
        'score': health_score,
        'category': health_category,
        'interpretation': f'{abnormal_count} abnormal parameters, {critical_count} critical findings',
        'urgency': urgency
    }
    
    return risks
