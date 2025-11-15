"""
Test script to verify the status determination logic
"""
import re

def test_status_determination():
    # Test case 1: Hemoglobin = 11.7, Female range 12.0-15.0, status='abnormal'
    value = 11.7
    frontend_status = 'abnormal'
    ref_range = 'Female: 12.0 - 15.0'
    prediction = 0  # Model says Normal
    
    print(f"\n=== Test Case 1 ===")
    print(f"Value: {value}")
    print(f"Frontend Status: {frontend_status}")
    print(f"Reference Range: {ref_range}")
    print(f"Model Prediction: {prediction} (Normal)")
    
    final_status = int(prediction)
    
    if frontend_status == 'abnormal':
        range_match = re.search(r'(\d+\.?\d*)\s*-\s*(\d+\.?\d*)', str(ref_range))
        if range_match:
            min_val = float(range_match.group(1))
            max_val = float(range_match.group(2))
            print(f"Parsed range: {min_val} - {max_val}")
            
            if value < min_val:
                final_status = 1  # Low
                print(f"✅ Value {value} < min {min_val} → Status: Low (1)")
            elif value > max_val:
                final_status = 2  # High
                print(f"✅ Value {value} > max {max_val} → Status: High (2)")
            else:
                print(f"⚠️ Value {value} in range [{min_val}-{max_val}] - using model: {final_status}")
    
    status_names = {0: 'Normal', 1: 'Low', 2: 'High', 3: 'Critical'}
    print(f"\n📊 FINAL STATUS: {final_status} ({status_names[final_status]})")
    print(f"Template lookup will use: '{status_names[final_status]}'")
    
    # Test case 2: MCHC = 30.6, range 31-35, status='abnormal'
    print(f"\n\n=== Test Case 2 ===")
    value2 = 30.6
    ref_range2 = '31 - 35'
    prediction2 = 0
    
    print(f"Value: {value2}")
    print(f"Frontend Status: abnormal")
    print(f"Reference Range: {ref_range2}")
    print(f"Model Prediction: {prediction2} (Normal)")
    
    final_status2 = int(prediction2)
    range_match2 = re.search(r'(\d+\.?\d*)\s*-\s*(\d+\.?\d*)', str(ref_range2))
    if range_match2:
        min_val2 = float(range_match2.group(1))
        max_val2 = float(range_match2.group(2))
        print(f"Parsed range: {min_val2} - {max_val2}")
        
        if value2 < min_val2:
            final_status2 = 1
            print(f"✅ Value {value2} < min {min_val2} → Status: Low (1)")
        elif value2 > max_val2:
            final_status2 = 2
            print(f"✅ Value {value2} > max {max_val2} → Status: High (2)")
    
    print(f"\n📊 FINAL STATUS: {final_status2} ({status_names[final_status2]})")

if __name__ == '__main__':
    test_status_determination()
