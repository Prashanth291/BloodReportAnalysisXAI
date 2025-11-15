import joblib
import numpy as np
import json

# Load model
data = joblib.load('models/neutrophils_model.joblib')
model = data['model']
booster = model.get_booster()

print("="*60)
print("CHECKING XGBOOST INTERNAL ATTRIBUTES")
print("="*60)

# Check base_score
print("\n1. Base Score:")
print(f"   Type: {type(model.base_score)}")
print(f"   Value: {model.base_score}")
print(f"   Is String: {isinstance(model.base_score, str)}")

# Check booster config
print("\n2. Booster Config:")
config = json.loads(booster.save_config())
print(f"   learner.attributes keys: {list(config.get('learner', {}).get('attributes', {}).keys())}")

# Check for scikit_learn_serialization_type attribute
if 'learner' in config and 'attributes' in config['learner']:
    attrs = config['learner']['attributes']
    for key, val in attrs.items():
        print(f"   {key}: {str(val)[:100]} (type: {type(val).__name__})")

# Check if base_margin or base_score is stored as string
print("\n3. Checking for string arrays in model attributes:")
for attr_name in dir(model):
    if not attr_name.startswith('_'):
        try:
            attr_val = getattr(model, attr_name)
            if isinstance(attr_val, str) and '[' in attr_val and 'E' in attr_val:
                print(f"   ❌ FOUND STRING ARRAY: {attr_name} = {attr_val[:100]}")
        except:
            pass

# Check booster attributes
print("\n4. Checking booster attributes:")
try:
    booster_attrs = booster.attributes()
    print(f"   Booster attributes: {booster_attrs}")
    for key, val in booster_attrs.items():
        if isinstance(val, str) and '[' in val and 'E' in val:
            print(f"   ❌ FOUND STRING ARRAY: {key} = {val[:100]}")
except Exception as e:
    print(f"   Error getting attributes: {e}")

# Check raw booster bytes
print("\n5. Checking raw booster save:")
try:
    raw_bytes = booster.save_raw()
    raw_str = raw_bytes.decode('utf-8', errors='ignore')[:500]
    if '[' in raw_str and 'E-' in raw_str:
        print(f"   ⚠️  Raw booster contains array strings")
        print(f"   Sample: {raw_str[:200]}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "="*60)
