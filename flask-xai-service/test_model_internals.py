import joblib
import json
import numpy as np

# Load model
data = joblib.load('models/neutrophils_model.joblib')
model = data['model']
booster = model.get_booster()

print("="*60)
print("MODEL INTERNAL STRUCTURE CHECK")
print("="*60)

# Get trees in JSON format
trees = booster.get_dump(dump_format='json')
print(f"\nTotal trees: {len(trees)}")

# Parse first tree
tree0 = json.loads(trees[0])

# Recursive function to check leaf node types
def check_leaf_types(node, leaf_values=None):
    if leaf_values is None:
        leaf_values = []
    
    if 'leaf' in node:
        leaf_val = node['leaf']
        leaf_values.append({
            'type': type(leaf_val).__name__,
            'value': leaf_val,
            'is_string': isinstance(leaf_val, str)
        })
    elif 'children' in node:
        for child in node['children']:
            check_leaf_types(child, leaf_values)
    
    return leaf_values

# Check first tree
leaf_values = check_leaf_types(tree0)

print(f"\nLeaf nodes in first tree: {len(leaf_values)}")
print("\nFirst 5 leaf values:")
for i, leaf in enumerate(leaf_values[:5]):
    print(f"  {i+1}. Type: {leaf['type']}, Value: {str(leaf['value'])[:60]}, Is String: {leaf['is_string']}")

# Check if any leaves are strings
string_leaves = [l for l in leaf_values if l['is_string']]
if string_leaves:
    print(f"\n❌ PROBLEM FOUND: {len(string_leaves)} leaf nodes are STRINGS!")
    print("Sample string leaf:", string_leaves[0]['value'])
else:
    print("\n✅ All leaf nodes are numeric (float/int)")

# Test SHAP with this model
print("\n" + "="*60)
print("TESTING SHAP WITH THIS MODEL")
print("="*60)

try:
    import shap
    
    # Create sample data
    feature_names = booster.feature_names
    X_sample = np.random.randn(10, len(feature_names)).astype(np.float64)
    
    print(f"Sample data shape: {X_sample.shape}, dtype: {X_sample.dtype}")
    
    # Try TreeExplainer with model
    print("\nAttempting TreeExplainer with model object...")
    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_sample)
        print(f"✅ TreeExplainer(model) SUCCESS! SHAP shape: {np.array(shap_values).shape}")
    except Exception as e:
        print(f"❌ TreeExplainer(model) FAILED: {str(e)[:100]}")
    
    # Try TreeExplainer with booster
    print("\nAttempting TreeExplainer with booster object...")
    try:
        explainer = shap.TreeExplainer(booster)
        shap_values = explainer.shap_values(X_sample)
        print(f"✅ TreeExplainer(booster) SUCCESS! SHAP shape: {np.array(shap_values).shape}")
    except Exception as e:
        print(f"❌ TreeExplainer(booster) FAILED: {str(e)[:100]}")
    
except Exception as e:
    print(f"❌ SHAP test failed: {e}")

print("\n" + "="*60)
