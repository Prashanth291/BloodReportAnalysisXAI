import pandas as pd

# Load each CSV
cbc_info = pd.read_excel('data/cbc information.xlsx')
covid_cbc = pd.read_csv('data/COVID-19_CBC_Data.csv')
diabetes_classification = pd.read_csv('data/Diabetes Classification.csv')
diabetes_dataset = pd.read_csv('data/diabetes_dataset.csv')

# Explore
print("CBC columns:", cbc_info.columns)
print("Diabetes columns:", diabetes_classification.columns)
print("Health columns:", diabetes_dataset.columns)
print("Covid CBC columns:", covid_cbc.columns)

print("CBC sample:", cbc_info.head())
print("Diabetes sample:", diabetes_classification.head())
print("Health sample:", diabetes_dataset.head())
print("Covid CBC sample:", covid_cbc.head())
# Repeat for others

# Check missing values
print(cbc_info.isnull().sum())
print(diabetes_dataset.isnull().sum())
print(diabetes_dataset.isnull().sum())
print(covid_cbc.isnull().sum())