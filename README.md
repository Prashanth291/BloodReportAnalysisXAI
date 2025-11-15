# 🩸 Blood Report Analysis with Explainable AI (XAI)

> *Transforming complex medical test results into clear, actionable health insights with AI-powered transparency*

## 💡 What is This?

Ever received blood test results and felt overwhelmed by medical terminology, numerical values, and cryptic abbreviations? **Blood Report Analysis XAI** solves this exact problem by combining artificial intelligence with medical expertise to make healthcare information accessible to everyone.

This intelligent healthcare platform is more than just a report reader—it's a comprehensive medical interpretation system that:

- 📄 **Extracts** blood test data from images and PDFs using advanced AI (Google Gemini)
- 🧠 **Analyzes** each parameter with 12 highly accurate machine learning models (99.6-100% accuracy)
- 🔍 **Explains** results using SHAP (SHapley Additive exPlanations), showing *exactly why* the AI made each prediction
- 📊 **Interprets** clinical significance with comprehensive medical knowledge templates covering 28+ blood parameters
- 💊 **Recommends** actionable next steps based on clinical evidence

**The Key Differentiator: Explainable AI (XAI)**

Unlike black-box AI systems that just give you results, our platform shows you the reasoning behind every prediction. When the system identifies low hemoglobin, it doesn't just tell you—it explains which factors contributed to this conclusion (age, RBC count, MCV values) and combines this with detailed medical knowledge about causes, associated conditions, and evidence-based recommendations.

Think of it as having both a **medical expert** (comprehensive clinical templates) and a **transparent AI assistant** (SHAP-based explanations) working together to help you understand your health.

---

## ✨ Key Features

### 🔍 **Smart Report Processing**
- Upload blood reports in **JPG, PNG, or PDF** format
- AI-powered text extraction using **Google Gemini**
- Automatically identifies and extracts 15+ CBC parameters

### 🧠 **Explainable AI (XAI) Analysis**
- **12 trained ML models** (99.6-100% accuracy) using XGBoost for parameter classification
- **SHAP TreeExplainer** providing feature attribution for every prediction
- **Dual-layer interpretation system**:
  - **AI Transparency Layer**: SHAP values showing which features (age, other blood parameters) contributed to the prediction
  - **Medical Knowledge Layer**: Comprehensive templates with potential causes, disease conditions, and recommendations
- **Clinical Status Override**: Prioritizes reference range analysis over model predictions when conflicts occur
- Clear status classification: "Low", "Normal", "High", "Critical" for each parameter
- Natural language explanations: "Key factors: hemoglobin_zscore increases prediction (4.09); rbc_count contributes (2.21)"

### 🔐 **Secure & Professional**
- JWT-based authentication
- Email verification with OTP
- MongoDB for secure data storage
- HIPAA-conscious design principles

### 📊 **Comprehensive Parameter Coverage**
Currently supports **28 parameters** across multiple test categories:

**Complete Blood Count (CBC) - 13 parameters:**
- Hemoglobin (Hb), Red Blood Cell (RBC) Count, White Blood Cell (WBC) Count
- Platelet Count, Hematocrit (PCV)
- Red cell indices: MCV, MCH, MCHC, RDW
- WBC Differential: Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils

**Diabetes & Glucose - 3 parameters:**
- Random Blood Sugar (RBS), HbA1c, Fasting Blood Sugar

**Inflammatory Markers - 2 parameters:**
- Erythrocyte Sedimentation Rate (ESR), C-Reactive Protein (CRP)

**Kidney Function - 1 parameter:**
- Serum Creatinine

**Iron Studies - 4 parameters:**
- Serum Iron, TIBC, Transferrin Saturation, Ferritin

**Vitamins & Hormones - 4 parameters:**
- Vitamin B12, Vitamin D, TSH (Thyroid), Cortisol PM

**Lipid Profile - 1 parameter:**
- Total Cholesterol

Each parameter includes:
✅ Detailed medical interpretations for all status levels (Normal, Low, High, Critical)
✅ 5+ potential causes per abnormal status
✅ 4+ associated disease conditions
✅ 5+ evidence-based recommendations
✅ Gender-specific reference ranges where applicable

---

## 🏗️ Architecture

This is a **full-stack microservices architecture** designed for scalability and maintainability:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  React Frontend │─────▶│  Node.js Backend│─────▶│    MongoDB      │
│   (Port 3000)   │      │   (Port 5000)   │      │    Database     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │  Flask XAI API  │
                         │   (Port 5001)   │
                         │  • ML Models    │
                         │  • SHAP Engine  │
                         └─────────────────┘
```

### **Technology Stack**

#### Frontend
- **React 18** - Modern UI with hooks
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

#### Backend (Node.js)
- **Express.js** - REST API framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Nodemailer** - Email verification
- **Multer** - File uploads
- **Google Gemini AI** - Text extraction

#### ML Service (Python/Flask)
- **Flask** - Microservice API
- **XGBoost** - Classification models (12 trained models)
- **SHAP TreeExplainer** - Feature attribution and explainability framework
- **scikit-learn** - ML utilities and preprocessing
- **Pandas & NumPy** - Data processing
- **MongoDB** - Result caching with 3600s TTL
- **Comprehensive Medical Templates** - 28 parameters with clinical knowledge

---

## 📁 Project Structure

```
BloodReportAnalysisXAI/
│
├── 📂 backend/                    # Node.js REST API
│   ├── config/                    # Database configuration
│   ├── controllers/               # Route handlers
│   │   ├── authController.js      # Authentication logic
│   │   ├── analysisController.js  # Report analysis
│   │   └── parameterController.js # Parameter management
│   ├── middleware/                # Express middleware
│   ├── models/                    # MongoDB schemas
│   ├── routes/                    # API routes
│   ├── services/                  # Business logic
│   │   ├── emailService.js        # Email/OTP
│   │   └── geminiService.js       # AI text extraction
│   ├── utils/                     # Helpers
│   ├── uploads/                   # Uploaded reports
│   └── server.js                  # Entry point
│
├── 📂 frontend/                   # React SPA
│   ├── public/
│   └── src/
│       ├── components/            # Reusable UI components
│       ├── context/               # React Context (Auth)
│       ├── pages/                 # Route pages
│       ├── services/              # API calls
│       └── App.js
│
├── 📂 flask-xai-service/          # Python ML Microservice
│   ├── app.py                     # Flask API server (SHAP computation, clinical override)
│   ├── medical_text_generator.py  # Medical interpretation generator
│   ├── medical_text_templates_comprehensive.py  # 28 parameter templates
│   ├── mongo_cache.py             # Result caching (SHA256 hashing, 3600s TTL)
│   ├── models/                    # Trained ML models (.joblib)
│   │   ├── hemoglobin_model.joblib
│   │   ├── hemoglobin_explainer.joblib (SHAP TreeExplainer)
│   │   └── ... (24 files total - 12 models + 12 explainers)
│   ├── data/                      # Training datasets
│   │   ├── clinical_thresholds.json
│   │   ├── processed_cbc_training.csv (50,000 rows)
│   │   ├── processed_cbc_holdout.csv (10,000 rows for testing)
│   │   └── label_rules.json (status classification logic)
│   ├── scripts/                   # Training & preprocessing scripts
│   │   ├── generate_cbc_dataset.py
│   │   ├── train_cbc_models.py
│   │   └── preprocess_cbc_data.py
│   └── requirements.txt
│
└── README.md                      # You are here!
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **MongoDB** (local or [Atlas cloud](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### API Keys You'll Need

1. **Google Gemini API Key** (Free tier available)
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

2. **Gmail App Password** (for email verification)
   - Enable 2FA on your Google Account
   - Generate app password: [Google Account Security](https://myaccount.google.com/security)

---

## 📦 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Prashanth291/BloodReportAnalysisXAI.git
cd BloodReportAnalysisXAI
```

### 2️⃣ Backend Setup (Node.js)

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/blood-report-analysis
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Service (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Flask XAI Service
FLASK_XAI_URL=http://localhost:5001
```

Start the backend:

```bash
npm run dev
```

✅ Backend running at `http://localhost:5000`

### 3️⃣ Flask XAI Service Setup (Python)

```bash
cd flask-xai-service
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `flask-xai-service/` directory:

```env
DEV_AUTH_TOKEN=dev-secret-token
MONGODB_URI=mongodb://localhost:27017/blood-report-analysis
```

**Important:** Train the ML models (or download pre-trained ones):

```bash
# Generate synthetic dataset (50,000 samples)
python scripts/generate_cbc_dataset.py

# Train all 12 models
python scripts/train_cbc_models.py
```

This will create 24 files in `models/` directory:
- 12 model files (`*_model.joblib`)
- 12 explainer files (`*_explainer.joblib`)

Start the Flask service:

```bash
python app.py
```

✅ Flask XAI running at `http://localhost:5001`

### 4️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

✅ Frontend running at `http://localhost:3000`

---

## 🎯 Usage Guide

### Step 1: Create an Account
1. Navigate to `http://localhost:3000`
2. Click "Sign Up"
3. Enter your details (name, email, password)
4. Check your email for the verification OTP
5. Enter the OTP to activate your account

### Step 2: Upload a Blood Report
1. Log in with your credentials
2. Go to "Upload Report"
3. Select a blood test report (JPG, PNG, or PDF)
4. The system will extract parameters using AI

### Step 3: Get AI-Powered Interpretation
1. View extracted parameters with color-coded status indicators
2. Click on any parameter (e.g., Hemoglobin = 11.7 g/dL)
3. See comprehensive analysis:
   - **Status**: Low/Normal/High/Critical (with clinical override when applicable)
   - **Introduction**: Brief overview of the finding
   - **General Interpretation**: What this result means medically
   - **Detailed Explanation**: 3+ specific points about your result
   - **Potential Causes**: 5+ possible reasons (e.g., "Iron deficiency", "Vitamin B12 deficiency")
   - **Associated Conditions**: 4+ related diseases (e.g., "Iron deficiency anemia", "Thalassemia")
   - **Recommendations**: 5+ actionable next steps (e.g., "Complete iron studies", "Iron-rich diet")
   - **Explainability Section** (XAI):
     - Feature Importances: Top 5 contributing factors with impact scores
     - SHAP Explanation: Natural language description (e.g., "Key factors: hemoglobin_zscore decreases prediction (-4.09)")
   - **Confidence Score**: AI prediction confidence (0-1 scale)

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Analysis Endpoints

#### Upload Blood Report
```http
POST /api/analysis/upload
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data

{
  "report": <file>,
  "reportDate": "2024-11-12"
}
```

### XAI Endpoints (Flask Service)

#### Get Parameter Interpretation
```http
POST http://localhost:5001/api/v1/interpret
Authorization: Bearer dev-secret-token
Content-Type: application/json

{
  "parameter": "hemoglobin",
  "value": 13.7,
  "patientAge": 34,
  "patientGender": "Male",
  "otherParameters": {
    "hemoglobin_g_dL": 13.7,
    "wbc_10e9_L": 6.2,
    "platelet_count": 250,
    "rdw_percent": 13.5
  }
}
```

Response:
```json
{
  "success": true,
  "parameter": "hemoglobin",
  "normalizedParameter": "hemoglobin_g_dL",
  "prediction": 1,
  "predictionLabel": "Low",
  "confidence": 0.95,
  "clinicalStatus": "abnormal",
  "clinicalStatusDetailed": "Low",
  "interpretation": {
    "intro": "Your Hemoglobin level is below the normal range, indicating possible anemia.",
    "general": "Low hemoglobin reduces oxygen delivery to tissues, which can cause fatigue and weakness.",
    "detailedExplanation": [
      { "label": "", "text": "Reduced hemoglobin may indicate iron deficiency" },
      { "label": "", "text": "Could be related to chronic disease or nutritional deficiency" },
      { "label": "", "text": "May cause symptoms like fatigue, pale skin, and shortness of breath" }
    ],
    "abnormalFindings": "Low Hemoglobin (Anemia)",
    "potentialCauses": [
      "Iron deficiency",
      "Vitamin B12 or folate deficiency",
      "Chronic kidney disease",
      "Blood loss (menstruation, GI bleeding)",
      "Bone marrow disorders"
    ],
    "diseaseConditions": [
      "Iron deficiency anemia",
      "Pernicious anemia",
      "Chronic disease anemia",
      "Thalassemia"
    ],
    "recommendations": [
      "Consult your healthcare provider for further evaluation",
      "Consider iron-rich foods (red meat, spinach, lentils)",
      "Request Complete Blood Count (CBC) and iron studies",
      "Investigate potential sources of blood loss"
    ],
    "explainability": {
      "featureImportances": [
        { "feature": "hemoglobin_g_dL_zscore", "impact": -4.0944, "direction": "decreases" },
        { "feature": "rbc_count", "impact": 2.2068, "direction": "increases" },
        { "feature": "mcv_fL", "impact": 1.5432, "direction": "increases" }
      ],
      "shapExplanation": "Key factors influencing this prediction: hemoglobin_g_dL_zscore decreases the prediction (impact: 4.09); rbc_count increases the prediction (impact: 2.21); mcv_fL increases the prediction (impact: 1.54)"
    }
  },
  "timestamp": "2024-11-16T10:30:45Z"
}
```

---

## 🧪 ML Model Details & XAI Pipeline

### How Explainable AI Works

Our system implements a sophisticated 6-step XAI pipeline that combines machine learning predictions with transparent explanations:

**Step 1: SHAP Value Computation**
```python
# For each parameter, compute feature contributions using TreeExplainer
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(patient_data)
# Example output: hemoglobin_zscore: -4.09, rbc_count: +2.21
```

**Step 2: Feature Importance Extraction**
- Filter features with |impact| > 0.01
- Sort by absolute impact
- Select top 5 contributors
- Log each with direction (increases/decreases prediction)

**Step 3: Natural Language Generation**
```python
# Convert SHAP values to human-readable text
"Key factors: hemoglobin_zscore decreases prediction (-4.09); rbc_count increases (2.21)"
```

**Step 4: Clinical Status Override**
- Parse reference ranges from database
- Compare patient value to min/max thresholds
- If ML predicts "Normal" but value is outside range → Override to "Low/High"
- Prioritizes clinical evidence over model predictions

**Step 5: Medical Template Selection**
- Use normalized parameter name + clinical status
- Retrieve comprehensive template:
  - Introduction, General interpretation, Detailed points
  - Potential causes (5+), Disease conditions (4+)
  - Evidence-based recommendations (5+)

**Step 6: Complete Response Assembly**
- Combine ML prediction + SHAP explainability + Medical knowledge
- Frontend displays both "AI reasoning" and "clinical expertise"
- Users see WHY the prediction was made AND WHAT it means medically

### Training Dataset
- **Size**: 50,000 training samples + 10,000 holdout samples
- **Features**: 31 clinical parameters (z-scores, raw values, ratios)
- **Methodology**: 80/20 train-test split with stratification by status class
- **Data Generation**: Clinically correlated synthetic CBC data with realistic distributions
- **Label Generation**: Rule-based status assignment using clinical_thresholds.json

### Model Performance
All 12 models achieved exceptional accuracy on the holdout test set (10,000 samples):

| Parameter | Test Accuracy | Precision | Recall | F1 Score | Classes |
|-----------|--------------|-----------|--------|----------|---------|
| Hemoglobin | 99.95% | 0.9995 | 0.9995 | 0.9995 | 4 (Normal, Low, High, Critical) |
| WBC | 99.91% | 0.9991 | 0.9991 | 0.9991 | 4 (Normal, Low, High, Critical) |
| Platelets | 99.87% | 0.9987 | 0.9987 | 0.9987 | 4 (Normal, Low, High, Critical) |
| RDW | 99.62% | 0.9962 | 0.9962 | 0.9962 | 4 (Normal, Low, High, Critical) |
| Neutrophils | 100.0% | 1.0000 | 1.0000 | 1.0000 | 4 (Normal, Low, High, Critical) |
| Lymphocytes | 99.98% | 0.9998 | 0.9998 | 0.9998 | 4 (Normal, Low, High, Critical) |
| RBC | 99.94% | 0.9994 | 0.9994 | 0.9994 | 4 (Normal, Low, High, Critical) |
| MCV | 99.89% | 0.9989 | 0.9989 | 0.9989 | 4 (Normal, Low, High, Critical) |
| MCH | 99.93% | 0.9993 | 0.9993 | 0.9993 | 4 (Normal, Low, High, Critical) |
| MCHC | 99.91% | 0.9991 | 0.9991 | 0.9991 | 4 (Normal, Low, High, Critical) |
| Eosinophils | 99.88% | 0.9988 | 0.9988 | 0.9988 | 4 (Normal, Low, High, Critical) |
| Basophils | 99.85% | 0.9985 | 0.9985 | 0.9985 | 4 (Normal, Low, High, Critical) |

**Model Architecture**: XGBoost Classifier with optimized hyperparameters  
**Explainability**: Each model paired with SHAP TreeExplainer for feature attribution  
**Average Accuracy**: 99.91% across all 12 parameters  
**Cross-validation**: 5-fold stratified CV used during training

### Retraining Models

If you need to retrain the models with new data or parameters:

```bash
cd flask-xai-service

# 1. Generate fresh dataset (50,000 training + 10,000 holdout)
python scripts/generate_cbc_dataset.py

# 2. Train all 12 models with SHAP explainers
python scripts/train_cbc_models.py

# Models and explainers will be saved to models/ directory
# Training report will show accuracy, F1 scores, and feature importances
```

**What Gets Generated:**
- 12 XGBoost classifier models (`*_model.joblib`)
- 12 SHAP TreeExplainer objects (`*_explainer.joblib`)
- Training report with performance metrics
- Feature importance rankings per model

### Key XAI Features

✅ **SHAP TreeExplainer**: Computes exact Shapley values for tree-based models  
✅ **Feature Attribution**: Shows which parameters influenced each prediction  
✅ **Natural Language Explanations**: Converts SHAP values to readable text  
✅ **Clinical Override Logic**: Prioritizes reference ranges over ML predictions  
✅ **Confidence Scores**: Provides prediction certainty (0-1 scale)  
✅ **Comprehensive Templates**: 28 parameters with medical knowledge  
✅ **Dual Transparency**: Both AI reasoning AND clinical expertise visible

---

## 🔒 Security Considerations

- ✅ Passwords hashed with **bcrypt**
- ✅ JWT tokens with expiration
- ✅ Email verification required
- ✅ File upload validation (type, size)
- ✅ MongoDB injection protection
- ✅ CORS configured properly
- ⚠️ **Production Note**: Change all default secrets, use HTTPS, and implement rate limiting

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongod --version

# Check if port 5000 is free
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux
```

### Flask service errors
```bash
# Ensure models are trained
ls flask-xai-service/models/*.joblib

# Should see 24 .joblib files
```

### Frontend can't connect
```bash
# Verify backend URL in frontend/.env
REACT_APP_API_URL=http://localhost:5000

# Check CORS is enabled in backend
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Prashanth**

- GitHub: [@Prashanth291](https://github.com/Prashanth291)
- Repository: [BloodReportAnalysisXAI](https://github.com/Prashanth291/BloodReportAnalysisXAI)

---

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced text extraction from medical documents
- **SHAP (SHapley Additive exPlanations)** by Scott Lundberg for the explainability framework
- **XGBoost** for high-performance gradient boosting models
- **MongoDB** for flexible data storage
- **React & Node.js** communities for robust web frameworks
- The open-source community for making healthcare AI accessible

## 🎓 Research & References

This project implements concepts from:
- Lundberg & Lee (2017): "A Unified Approach to Interpreting Model Predictions" (SHAP)
- Chen & Guestrin (2016): "XGBoost: A Scalable Tree Boosting System"
- Clinical Laboratory Reference Ranges (ARUP, Mayo Clinic, LabCorp)

## 🔮 Future Enhancements

- [ ] Add 40+ more parameters (Liver function, Lipid profile, Electrolytes, Urine analysis)
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Spanish, Hindi, Mandarin)
- [ ] Historical trend analysis with visualizations
- [ ] Integration with EHR systems (HL7 FHIR)
- [ ] Voice-based report reading for accessibility
- [ ] PDF report generation with insights
- [ ] Telemedicine consultation booking integration

---

## 📞 Support

Having issues? Found a bug?

- 📧 Open an [Issue](https://github.com/Prashanth291/BloodReportAnalysisXAI/issues)
- 💬 Start a [Discussion](https://github.com/Prashanth291/BloodReportAnalysisXAI/discussions)

---

<div align="center">

**Made with ❤️ for better healthcare accessibility**

⭐ Star this repo if you find it helpful!

</div>
