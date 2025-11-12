# 🩸 Blood Report Analysis with Explainable AI

> *Making medical test results understandable for everyone*

## 💡 What is This?

Ever received blood test results and felt confused by all the medical jargon? This platform is built to solve exactly that problem.

**Blood Report Analysis XAI** is an intelligent healthcare application that takes your blood test reports (yes, even those scanned images or PDFs) and transforms them into clear, actionable health insights. Using cutting-edge AI and machine learning, we don't just tell you what's abnormal—we explain *why* it matters and what you can do about it.

Think of it as having a knowledgeable friend who can read your medical reports and explain everything in plain English, backed by real science.

---

## ✨ Key Features

### 🔍 **Smart Report Processing**
- Upload blood reports in **JPG, PNG, or PDF** format
- AI-powered text extraction using **Google Gemini**
- Automatically identifies and extracts 15+ CBC parameters

### 🧠 **Explainable AI (XAI) Analysis**
- **12 trained ML models** (99.6-100% accuracy) for parameter classification
- **SHAP-based explanations** showing which factors influenced each result
- Clear interpretations: "Low", "Normal", or "High" for each parameter
- Human-friendly medical descriptions

### 🔐 **Secure & Professional**
- JWT-based authentication
- Email verification with OTP
- MongoDB for secure data storage
- HIPAA-conscious design principles

### 📊 **Comprehensive Parameter Coverage**
Currently supports analysis for:
- **Hemoglobin** (Hb)
- **White Blood Cells** (WBC)
- **Platelets**
- **Red Blood Cell Distribution Width** (RDW)
- **Neutrophils** & **Lymphocytes**
- **Red Blood Cells** (RBC)
- **MCV, MCH, MCHC** (Red cell indices)
- **Eosinophils** & **Basophils**

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
- **SHAP** - Explaiability framework
- **scikit-learn** - ML utilities
- **Pandas & NumPy** - Data processing

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
│   ├── app.py                     # Flask API server
│   ├── medical_text_generator.py  # Medical interpretations
│   ├── mongo_cache.py             # Result caching
│   ├── models/                    # Trained ML models (.joblib)
│   │   ├── hemoglobin_model.joblib
│   │   ├── hemoglobin_explainer.joblib
│   │   └── ... (24 files total)
│   ├── data/                      # Training datasets
│   │   ├── clinical_thresholds.json
│   │   └── processed_cbc_training_complete.csv (50,000 rows)
│   ├── scripts/                   # Training scripts
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

### Step 3: Get AI Interpretation
1. View extracted parameters
2. Click on any parameter (e.g., Hemoglobin)
3. See:
   - **Status**: Low/Normal/High
   - **Medical Interpretation**: What it means
   - **Contributing Factors**: SHAP-based feature importance
   - **Confidence Score**: How certain the AI is

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
  "prediction": "Normal",
  "confidence": 0.95,
  "medicalInterpretation": "Your hemoglobin level is within the normal range...",
  "featureImportance": [
    { "feature": "age", "importance": 0.23 },
    { "feature": "rdw_percent", "importance": 0.18 }
  ]
}
```

---

## 🧪 ML Model Details

### Training Dataset
- **Size**: 50,000 synthetic samples
- **Features**: 31 clinical parameters
- **Methodology**: 80/20 train-test split with stratification
- **Data Generation**: Clinically correlated synthetic CBC data

### Model Performance
All 12 models achieved exceptional accuracy on the test set (10,000 samples):

| Parameter | Test Accuracy | F1 Score |
|-----------|--------------|----------|
| Hemoglobin | 99.95% | 0.9995 |
| WBC | 99.91% | 0.9991 |
| Platelets | 99.87% | 0.9987 |
| RDW | 99.62% | 0.9962 |
| Neutrophils | 100.0% | 1.0000 |
| Lymphocytes | 99.98% | 0.9998 |
| RBC | 99.94% | 0.9994 |
| MCV | 99.89% | 0.9989 |
| MCH | 99.93% | 0.9993 |
| MCHC | 99.91% | 0.9991 |
| Eosinophils | 99.88% | 0.9988 |
| Basophils | 99.85% | 0.9985 |

### Retraining Models

If you need to retrain the models:

```bash
cd flask-xai-service

# 1. Generate fresh dataset
python scripts/generate_cbc_dataset.py

# 2. Train models
python scripts/train_cbc_models.py

# Models will be saved to models/ directory
```

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

- **Google Gemini AI** for text extraction capabilities
- **SHAP Library** for explainability framework
- **XGBoost** for high-performance ML models
- The open-source community for amazing tools

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
