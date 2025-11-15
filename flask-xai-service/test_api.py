"""
Quick API test to verify Flask app.py is working with clinical fallback.
"""
import requests
import json

BASE_URL = "http://localhost:5001"
TOKEN = "dev-secret-token"

print("="*70)
print("FLASK API INTEGRATION TEST")
print("="*70)

# Test 1: Health check
print("\n[Test 1] Health Check...")
try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    if response.status_code == 200:
        print(f"  ✓ Status: {response.status_code}")
        print(f"  ✓ Response: {response.json()}")
    else:
        print(f"  ✗ Status: {response.status_code}")
except Exception as e:
    print(f"  ✗ Error: {e}")
    print("  ⚠ Make sure Flask API is running: python app.py")

# Test 2: WBC interpretation (clinical fallback)
print("\n[Test 2] WBC Interpretation (Low - Clinical Fallback)...")
try:
    payload = {
        "parameter": "WBC Count",
        "value": 3.1,
        "patientAge": 45,
        "patientGender": "Male",
        "otherParameters": {}
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/interpret",
        json=payload,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        timeout=10
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"  ✓ Status: {response.status_code}")
        print(f"  ✓ Prediction: {result['explainability']['modelPrediction']}")
        print(f"  ✓ Confidence: {result['explainability']['confidence']}")
        print(f"  ✓ Introduction: {result['introduction'][:80]}...")
        if 'riskAssessments' in result:
            print(f"  ✓ Risk Assessments: {len(result['riskAssessments'])} scores")
        else:
            print(f"  ⚠ No risk assessments (need patient data)")
    else:
        print(f"  ✗ Status: {response.status_code}")
        print(f"  ✗ Response: {response.text}")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 3: Hemoglobin with risk assessment
print("\n[Test 3] Hemoglobin with Risk Assessment...")
try:
    payload = {
        "parameter": "Hemoglobin (Hb)",
        "value": 10.5,
        "patientAge": 35,
        "patientGender": "Female",
        "diabetic": True,
        "otherParameters": {
            "wbc_10e9_L": 12.5,
            "platelet_count": 180000,
            "random_blood_sugar_mg_dL": 180,
            "hba1c_percent": 7.2,
            "neutrophils_percent": 75,
            "lymphocytes_percent": 20
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/interpret",
        json=payload,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        timeout=10
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"  ✓ Status: {response.status_code}")
        print(f"  ✓ Prediction: {result['explainability']['modelPrediction']}")
        if 'riskAssessments' in result:
            risks = result['riskAssessments']
            print(f"  ✓ Risk Assessments:")
            for risk_name, risk_data in list(risks.items())[:3]:
                level = risk_data.get('level', risk_data.get('status', 'N/A'))
                print(f"    - {risk_name}: {level}")
        else:
            print(f"  ⚠ No risk assessments returned")
    else:
        print(f"  ✗ Status: {response.status_code}")
        print(f"  ✗ Response: {response.text}")
except Exception as e:
    print(f"  ✗ Error: {e}")

print("\n" + "="*70)
print("API TEST COMPLETE")
print("="*70)
print("\nNOTE: If tests failed, make sure Flask API is running:")
print("  cd flask-xai-service")
print("  python app.py")
print("="*70)
