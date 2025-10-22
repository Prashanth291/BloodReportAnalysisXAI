import pandas as pd

# Load dataset
df = pd.read_csv('data/health_blood_test.csv')

# Convert 'gender' to numeric
df['gender'] = df['gender'].map({'Male': 1, 'Female': 0, 'M': 1, 'F': 0})

# Convert 'smoking_history' to numeric (example encoding)
smoking_map = {'never': 0, 'former': 1, 'current': 2}
df['smoking_history'] = df['smoking_history'].map(smoking_map)

# Fill missing numeric values with median
df = df.fillna(df.median(numeric_only=True))

# Target column 'diabetes' is presumably binary (0/1)
print(df['diabetes'].value_counts())

# Optionally drop any columns not needed (like location/race if not relevant)
df = df.drop(['year', 'location', 'race:AfricanAmerican', 'race:Asian', 
              'race:Caucasian', 'race:Hispanic', 'race:Other'], axis=1)

# Save cleaned processed CSV
df.to_csv('data/processed_health.csv', index=False)
print("Preprocessing complete. Processed data saved to 'data/processed_health.csv'.")