# Explainable AI-Based Blood Test Report Analysis

## Overview

This project bridges the gap between raw blood test reports and understandable, actionable health insights for patients and healthcare professionals. Leveraging OCR, Explainable AI (XAI), and data visualization, the platform extracts, analyzes, and explains laboratory parameters to empower users in health management.

## Features

- **Multi-format Report Upload**: Supports scanned images (JPG) and PDFs
- **Intelligent Data Extraction**: Uses Gemini AI for robust text extraction
- **Medical Parameter Mapping**: Converts raw text into standardized parameters (e.g., Hemoglobin, WBC)
- **OTP-Based Email Verification**: Secure 6-digit OTP verification via email
- **Automated Abnormality Detection**: Flags out-of-range values using reference ranges
- **Explainable AI Integration**: Provides transparent, human-friendly decision explanations
- **Doctor-verified Recommendations**: Personalized recovery or lifestyle suggestions
- **Long-term Monitoring and Visualization**: Secure storage, trend graphs, and data tracking
- **Clean, User-centric Interface**: Accessible frontend for all users

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI**: Google Gemini API
- **Authentication**: JWT, Email Verification (SMTP)

## Project Structure

```
BloodReportAnalysisXAI/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Gmail account with App Password (for SMTP)
- Google Gemini API Key

### Backend Setup

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your credentials:

   - MongoDB URI
   - JWT Secret
   - SMTP credentials (Gmail App Password)
   - Gemini API Key

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account > Security > 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in your `.env` file

### Gemini API Key Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## Phase 1 Features (Current)

- ✅ User Registration with email verification
- ✅ Email verification via SMTP
- ✅ User Login with JWT authentication
- ✅ Home/Dashboard page
- ✅ Blood report upload (JPG/PDF)
- ✅ Gemini API integration for parameter extraction
- ✅ Display extracted parameters in JSON format

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Analysis

- `POST /api/analysis/upload` - Upload blood report (protected)

## Future Phases

- Phase 2: Parameter standardization and abnormality detection
- Phase 3: SHAP-based explainability integration
- Phase 4: Doctor recommendations and visualizations
- Phase 5: Historical data tracking and trend analysis

## License

MIT
