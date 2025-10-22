import pandas as pd
from sklearn.model_selection import train_test_split
import xgboost as xgb
import shap
import joblib

# Load dataset
data = pd.read_csv('data/cbc.csv')
X = data.drop('target', axis=1)
y = data['target']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
model.fit(X_train, y_train)

# SHAP explainer
explainer = shap.TreeExplainer(model)

# Save model and explainer
joblib.dump(model, 'model.joblib')
joblib.dump(explainer, 'explainer.joblib')
