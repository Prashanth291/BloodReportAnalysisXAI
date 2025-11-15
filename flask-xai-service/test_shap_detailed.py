import joblib
import numpy as np
import shap

# Load model
data = joblib.load('models/neutrophils_model.joblib')
model = data['model']

print("="*60)
print("DEBUGGING SHAP TREE EXPLAINER ISSUE")
print("="*60)

# Create sample data (exactly as Flask would)
feature_names = model.get_booster().feature_names
X_sample = np.zeros((1, len(feature_names)), dtype=np.float64)

# Set some realistic values
X_sample[0, 0] = 50  # age
X_sample[0, 18] = 12.9  # hemoglobin
X_sample[0, 23] = 10.8  # wbc
X_sample[0, 29] = 69  # neutrophils_percent
X_sample[0, 30] = 22  # lymphocytes_percent

print(f"\nSample data:")
print(f"  Shape: {X_sample.shape}")
print(f"  Dtype: {X_sample.dtype}")
print(f"  Values (first 10): {X_sample[0, :10]}")

# Test model prediction first
print(f"\n1. Testing model.predict_proba():")
try:
    proba = model.predict_proba(X_sample)
    print(f"   ✅ Prediction successful!")
    print(f"   Proba shape: {proba.shape}")
    print(f"   Proba dtype: {proba.dtype}")
    print(f"   Proba values: {proba[0]}")
    
    # Check if probabilities are strings
    if isinstance(proba[0, 0], str):
        print(f"   ❌ PROBABILITIES ARE STRINGS!")
    else:
        print(f"   ✅ Probabilities are numeric ({type(proba[0, 0])})")
except Exception as e:
    print(f"   ❌ Prediction failed: {e}")

# Try to create TreeExplainer and see where it fails
print(f"\n2. Creating SHAP TreeExplainer:")
try:
    print(f"   Attempting with model object...")
    explainer = shap.TreeExplainer(model)
    print(f"   ✅ Explainer created!")
    
    # Now try to get SHAP values
    print(f"\n3. Computing SHAP values:")
    shap_values = explainer.shap_values(X_sample)
    print(f"   ✅ SHAP computation successful!")
    print(f"   SHAP shape: {np.array(shap_values).shape}")
    print(f"   SHAP dtype: {np.array(shap_values).dtype}")
    
except Exception as e:
    print(f"   ❌ FAILED: {e}")
    print(f"\n   Error type: {type(e).__name__}")
    
    # Try to get more details
    import traceback
    print(f"\n   Full traceback:")
    traceback.print_exc()

print("\n" + "="*60)
