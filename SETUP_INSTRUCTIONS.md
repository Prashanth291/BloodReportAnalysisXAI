# 🚀 Complete Setup Instructions

This guide will walk you through setting up the Blood Report Analysis XAI system from scratch. Follow these steps carefully!

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Getting API Keys](#getting-api-keys)
4. [Installation](#installation)
5. [Database Setup](#database-setup)
6. [Training ML Models](#training-ml-models)
7. [Running the Application](#running-the-application)
8. [Verification](#verification)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Install the following software before proceeding:

| Software | Minimum Version | Download Link |
|----------|----------------|---------------|
| Node.js | v18.0+ | [nodejs.org](https://nodejs.org/) |
| Python | v3.8+ | [python.org](https://www.python.org/) |
| MongoDB | v5.0+ | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Check Your Installations

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
python --version  # Should show 3.8.x or higher
mongod --version  # Should show 5.0.x or higher
git --version     # Any recent version
```

---

## System Requirements

### Hardware
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 5GB free space
- **CPU**: Multi-core processor recommended

### Operating System
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu 20.04+

---

## Getting API Keys

### 1. Google Gemini API Key

Used for AI-powered text extraction from blood reports.

**Steps:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key (starts with `AIza...`)
5. Save it securely - you'll need it in the `.env` file

**Cost:** Free tier includes 60 requests per minute.

### 2. Gmail App Password

Used for sending email verification OTPs.

**Steps:**
1. Go to your [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Navigate to **App Passwords** (appears after 2FA is enabled)
4. Select:
   - **App**: Mail
   - **Device**: Other (Custom name) → Enter "Blood Report App"
5. Click **Generate**
6. Copy the 16-character password (no spaces)
7. Save it securely

**Important:** This is NOT your regular Gmail password!

---

## Installation

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/Prashanth291/BloodReportAnalysisXAI.git
cd BloodReportAnalysisXAI
```

### Step 2: Backend Setup (Node.js)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your actual credentials
# Use notepad (Windows), nano (Linux), or any text editor
notepad .env   # Windows
nano .env      # Linux/Mac
```

**Edit the `.env` file and update:**

```env
# Your MongoDB connection
MONGODB_URI=mongodb://localhost:27017/blood-report-analysis

# Generate a secure JWT secret (or use the command below)
JWT_SECRET=your-super-secure-random-string-here

# Your Gmail credentials
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com

# Your Gemini API key
GEMINI_API_KEY=AIzaYourActualKeyHere
```

**Generate a secure JWT secret:**

```bash
# Run this in terminal to generate a random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3: Flask XAI Service Setup (Python)

```bash
# Navigate to Flask service
cd ../flask-xai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env file
notepad .env   # Windows
nano .env      # Linux/Mac
```

**Edit the `.env` file:**

```env
DEV_AUTH_TOKEN=dev-secret-token
MONGODB_URI=mongodb://localhost:27017/blood-report-analysis
```

### Step 4: Frontend Setup (React)

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file
notepad .env   # Windows
nano .env      # Linux/Mac
```

**Edit the `.env` file:**

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## Database Setup

### Option 1: Local MongoDB

**Start MongoDB:**

```bash
# Windows (as Administrator)
net start MongoDB

# Or run manually
mongod --dbpath C:\data\db

# Mac/Linux
sudo systemctl start mongod
# Or
sudo service mongod start
```

**Verify it's running:**

```bash
# Should connect without errors
mongosh
# Or for older versions
mongo
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free M0 tier)
4. Wait for cluster to deploy (~5 minutes)
5. Click **"Connect"** → **"Connect your application"**
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Use this string in all `.env` files

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.abc123.mongodb.net/blood-report-analysis?retryWrites=true&w=majority
```

### Seed Database (Optional)

```bash
# From project root
cd backend
node seedDatabase.js
```

This creates:
- Default parameter references
- Clinical threshold data
- Sample test user (optional)

---

## Training ML Models

The ML models need to be trained before the Flask XAI service can provide interpretations.

### Generate Training Dataset

```bash
# Navigate to Flask service
cd flask-xai-service

# Activate virtual environment if not already active
venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux

# Generate 50,000 synthetic blood test samples
python scripts/generate_cbc_dataset.py
```

**Output:**
- Creates `data/processed_cbc_training_complete.csv` (50,000 rows)
- Takes ~2-3 minutes to generate

### Train All Models

```bash
# Train 12 classification models
python scripts/train_cbc_models.py
```

**What happens:**
- Trains 12 XGBoost models (one per parameter)
- Creates SHAP explainers for each model
- Saves 24 files to `models/` directory:
  - `*_model.joblib` (12 files)
  - `*_explainer.joblib` (12 files)

**Expected output:**
```
Training hemoglobin model...
Test Accuracy: 99.95%
Training wbc model...
Test Accuracy: 99.91%
...
All models trained successfully!
```

**Time:** ~10-15 minutes depending on your CPU.

### Verify Models

```bash
# Check that all 24 files were created
ls models/*.joblib   # Mac/Linux
dir models\*.joblib  # Windows

# Should see:
# hemoglobin_model.joblib
# hemoglobin_explainer.joblib
# wbc_model.joblib
# wbc_explainer.joblib
# ... (24 files total)
```

---

## Running the Application

You need to run **3 services** simultaneously. Open 3 separate terminal windows:

### Terminal 1: MongoDB

```bash
# If not already running
mongod --dbpath C:\data\db  # Windows
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # Mac
```

### Terminal 2: Backend (Node.js)

```bash
cd backend
npm run dev

# Should see:
# ✅ MongoDB connected
# 🚀 Server running on port 5000
```

### Terminal 3: Flask XAI Service

```bash
cd flask-xai-service
venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux

python app.py

# Should see:
# ✅ MongoDB connected for caching
# 🔬 Loaded 12 ML models
# 🚀 Flask XAI Service running on port 5001
```

### Terminal 4: Frontend (React)

```bash
cd frontend
npm start

# Should automatically open http://localhost:3000
# If not, manually navigate to it in your browser
```

---

## Verification

### 1. Check All Services

Open these URLs in your browser:

| Service | URL | Expected Response |
|---------|-----|-------------------|
| Frontend | http://localhost:3000 | Login page |
| Backend | http://localhost:5000 | "Blood Report Analysis API" |
| Flask XAI | http://localhost:5001 | "Flask XAI Service Running" |
| MongoDB | Use Compass/mongosh | Should connect |

### 2. Test Registration

1. Go to http://localhost:3000
2. Click **"Sign Up"**
3. Enter:
   - Name: Test User
   - Email: your-actual-email@gmail.com (must be real!)
   - Password: Test@1234
4. Click **"Register"**
5. Check your email for OTP
6. Enter OTP to verify

### 3. Test Upload

1. Login with your credentials
2. Go to **"Upload Report"**
3. Upload a sample blood test report (JPG/PDF)
4. Verify parameters are extracted
5. Click on any parameter to see XAI interpretation

### 4. Test XAI API Directly

Using PowerShell (Windows):

```powershell
$body = @{
  parameter = "hemoglobin"
  value = 13.7
  patientAge = 34
  patientGender = "Male"
  otherParameters = @{
    hemoglobin_g_dL = 13.7
    wbc_10e9_L = 6.2
    platelet_count = 250
  }
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri http://localhost:5001/api/v1/interpret -Body $body -ContentType 'application/json' -Headers @{ Authorization = 'Bearer dev-secret-token' }
```

Using curl (Mac/Linux):

```bash
curl -X POST http://localhost:5001/api/v1/interpret \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dev-secret-token" \
  -d '{
    "parameter": "hemoglobin",
    "value": 13.7,
    "patientAge": 34,
    "patientGender": "Male",
    "otherParameters": {
      "hemoglobin_g_dL": 13.7,
      "wbc_10e9_L": 6.2,
      "platelet_count": 250
    }
  }'
```

**Expected response:**
```json
{
  "success": true,
  "parameter": "hemoglobin",
  "prediction": "Normal",
  "confidence": 0.95,
  "medicalInterpretation": "Your hemoglobin level is within normal range..."
}
```

---

## Troubleshooting

### Backend Issues

**Problem:** "Cannot connect to MongoDB"

```bash
# Solution 1: Check if MongoDB is running
mongosh  # Should connect

# Solution 2: Check connection string
echo $MONGODB_URI  # Should show valid URI

# Solution 3: Restart MongoDB
sudo systemctl restart mongod  # Linux
brew services restart mongodb-community  # Mac
net stop MongoDB && net start MongoDB  # Windows (as Admin)
```

**Problem:** "Invalid API key" (Gemini)

```bash
# Verify API key in .env
cat backend/.env | grep GEMINI_API_KEY

# Make sure it starts with AIza
# Get new key from: https://makersuite.google.com/app/apikey
```

**Problem:** Email not sending

```bash
# Check SMTP settings in .env
# Make sure you're using App Password, not regular password
# Test with a different email if Gmail blocks it

# Enable "Less secure app access" might be needed
# Or use a different SMTP provider
```

### Flask Service Issues

**Problem:** "Models not found"

```bash
# Check models directory
ls flask-xai-service/models/*.joblib

# If empty, train models:
cd flask-xai-service
python scripts/generate_cbc_dataset.py
python scripts/train_cbc_models.py
```

**Problem:** "ModuleNotFoundError"

```bash
# Make sure virtual environment is activated
# You should see (venv) in your terminal prompt

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Problem:** Port 5001 already in use

```bash
# Find and kill process using port 5001
# Windows:
netstat -ano | findstr :5001
taskkill /PID <process_id> /F

# Mac/Linux:
lsof -ti:5001 | xargs kill -9

# Or change port in flask-xai-service/app.py
# app.run(port=5002)  # Use different port
```

### Frontend Issues

**Problem:** "Network Error" when calling API

```bash
# Check REACT_APP_API_URL in frontend/.env
# Should be: http://localhost:5000

# Check CORS in backend
# Should allow http://localhost:3000

# Restart both frontend and backend
```

**Problem:** Build fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use specific Node version
nvm use 18  # If using nvm
```

### General Issues

**Problem:** Services start but don't communicate

```bash
# Check all services are running:
curl http://localhost:5000  # Backend
curl http://localhost:5001  # Flask
curl http://localhost:3000  # Frontend

# Check firewall isn't blocking ports
# Temporarily disable firewall to test

# Check environment variables are loaded
# Restart all services after editing .env files
```

---

## 🎉 Success!

If all services are running and you can:
1. ✅ Register and login
2. ✅ Upload a blood report
3. ✅ See parameter extraction
4. ✅ Get XAI interpretations

**Congratulations! Your system is fully operational! 🚀**

---

## 📞 Need Help?

- 📧 Create an issue: [GitHub Issues](https://github.com/Prashanth291/BloodReportAnalysisXAI/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Prashanth291/BloodReportAnalysisXAI/discussions)

---

## 📚 Next Steps

- Read the [API Documentation](API_DOCUMENTATION.md)
- Learn about [Model Training](MODEL_TRAINING.md)
- Explore [Deployment Guide](DEPLOYMENT.md)

---

**Happy coding! 🩺💻**
