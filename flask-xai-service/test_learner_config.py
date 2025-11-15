import joblib
import json

# Load model
data = joblib.load('models/neutrophils_model.joblib')
model = data['model']
booster = model.get_booster()

print("="*60)
print("CHECKING LEARNER MODEL PARAM")
print("="*60)

# Get full config
config = json.loads(booster.save_config())

print("\nFull learner config structure:")
print(json.dumps(config.get('learner', {}), indent=2)[:2000])

# Specifically check learner_model_param
if 'learner' in config:
    learner = config['learner']
    if 'learner_model_param' in learner:
        print("\n" + "="*60)
        print("LEARNER_MODEL_PARAM:")
        print("="*60)
        learner_model_param = learner['learner_model_param']
        for key, val in learner_model_param.items():
            val_type = type(val).__name__
            val_str = str(val)
            is_array_string = isinstance(val, str) and '[' in val and 'E' in val
            print(f"  {key}:")
            print(f"    Type: {val_type}")
            print(f"    Value: {val_str[:100]}")
            if is_array_string:
                print(f"    ❌ THIS IS THE PROBLEM! Array stored as string")

print("\n" + "="*60)
