# Blood Report Analysis Platform - Setup Guide

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional, for version control)
- **Gmail account** with 2-Factor Authentication enabled (for SMTP)
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

---

## 📋 Step-by-Step Setup

### Step 1: Install Backend Dependencies

1. Open PowerShell/Terminal and navigate to the backend folder:

```powershell
cd backend
```

2. Install all required packages:

```powershell
npm install
```

This will install:

- express (Web framework)
- mongoose (MongoDB ODM)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT authentication)
- nodemailer (Email service)
- multer (File upload)
- @google/generative-ai (Gemini AI)
- cors, dotenv, uuid, express-validator

### Step 2: Configure Backend Environment

1. Copy the example environment file:

```powershell
copy .env.example .env
```

2. Open `.env` file and configure the following:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/blood-report-analysis
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/blood-report-analysis

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (Generate a random 32+ character string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_character_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=Blood Report Analysis

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
```

### Step 3: Setup Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select app: **Mail**
5. Select device: **Other** (Custom name: "Blood Report Analysis")
6. Click **Generate**
7. Copy the 16-character password (no spaces)
8. Paste it in your `.env` file as `SMTP_PASSWORD`

### Step 4: Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Select or create a Google Cloud project
4. Copy the generated API key
5. Paste it in your `.env` file as `GEMINI_API_KEY`

### Step 5: Setup MongoDB

**Option A: Local MongoDB**

1. Install MongoDB Community Server
2. Start MongoDB service:

```powershell
# Windows (as Administrator)
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

3. Use connection string: `mongodb://localhost:27017/blood-report-analysis`

**Option B: MongoDB Atlas (Cloud)**

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (Free tier available)
3. Create a database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and replace in `.env`:

```
mongodb+srv://username:password@cluster.mongodb.net/blood-report-analysis
```

### Step 6: Start Backend Server

```powershell
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

You should see:

```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

---

### Step 7: Install Frontend Dependencies

1. Open a NEW PowerShell/Terminal window
2. Navigate to the frontend folder:

```powershell
cd frontend
```

3. Install all required packages:

```powershell
npm install
```

This will install:

- react & react-dom
- react-router-dom (Routing)
- axios (HTTP client)
- Testing libraries

### Step 8: Start Frontend Application

```powershell
npm start
```

The application will automatically open in your browser at:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 🧪 Testing the Application

### 1. User Registration Flow

1. Go to http://localhost:3000
2. Click **"Register"**
3. Fill in the registration form:
   - Name: Test User
   - Email: your_test_email@gmail.com
   - Password: test123 (min 6 characters)
4. Click **"Register"**
5. Check your email for verification link
6. Click the verification link
7. You'll be redirected to login

### 2. Login

1. Enter your email and password
2. Click **"Login"**
3. You'll be redirected to the dashboard

### 3. Upload Blood Report

1. Click **"New Analysis"** or **"Upload New Report"**
2. Click to upload or drag & drop:
   - Sample JPG/PNG blood report image
   - OR PDF blood report
3. Click **"Analyze Report"**
4. Wait for AI analysis (15-30 seconds)
5. View extracted parameters in JSON format
6. Click **"View Detailed Report"** for formatted view

---

## 📁 Project Structure

```
BloodReportAnalysisXAI/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── analysisController.js # Report analysis logic
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   ├── errorMiddleware.js # Error handling
│   │   └── uploadMiddleware.js # File upload config
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Report.js          # Report schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── analysisRoutes.js  # Analysis endpoints
│   ├── services/
│   │   ├── emailService.js    # Email sending
│   │   └── geminiService.js   # Gemini AI integration
│   ├── utils/
│   │   └── jwt.js             # JWT utilities
│   ├── uploads/               # Uploaded files storage
│   ├── .env                   # Environment variables
│   ├── .env.example           # Example environment file
│   ├── package.json           # Dependencies
│   └── server.js              # Express server
│
├── frontend/
│   ├── public/
│   │   ├── index.html         # HTML template
│   │   └── manifest.json      # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js      # Navigation component
│   │   │   └── PrivateRoute.js # Protected route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication state
│   │   ├── pages/
│   │   │   ├── Home.js        # Landing page
│   │   │   ├── Register.js    # Registration page
│   │   │   ├── Login.js       # Login page
│   │   │   ├── VerifyEmail.js # Email verification
│   │   │   ├── Dashboard.js   # Reports dashboard
│   │   │   ├── AnalysisUpload.js # Upload page
│   │   │   └── ReportDetails.js # Report detail view
│   │   ├── services/
│   │   │   └── analysisService.js # API calls
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # App styles
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Global styles
│   └── package.json           # Dependencies
│
└── README.md                  # Project documentation
```

---

## 🔧 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error:** `MongoNetworkError: connect ECONNREFUSED`
**Solution:**

- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, verify IP whitelist and credentials

### Issue 2: Email Not Sending

**Error:** `Invalid login: 535-5.7.8 Username and Password not accepted`
**Solution:**

- Verify 2FA is enabled on Gmail
- Generate a new App Password
- Use the 16-character password (no spaces)
- Ensure SMTP settings are correct

### Issue 3: Gemini API Error

**Error:** `API key not valid`
**Solution:**

- Verify API key is correct in `.env`
- Check API key hasn't been restricted
- Ensure Gemini API is enabled in Google Cloud Console

### Issue 4: Port Already in Use

**Error:** `Port 3000/5000 is already in use`
**Solution:**

```powershell
# Find process using the port
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Issue 5: CORS Error

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`
**Solution:**

- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env`
- Verify CORS configuration in `server.js`

---

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/resend-verification` - Resend verification email

### Analysis

- `POST /api/analysis/upload` - Upload blood report (Protected)
- `GET /api/analysis/reports` - Get all user reports (Protected)
- `GET /api/analysis/reports/:id` - Get single report (Protected)
- `DELETE /api/analysis/reports/:id` - Delete report (Protected)

---

## 🎯 Phase 1 Features Completed

✅ User Registration with validation
✅ Email verification via SMTP
✅ Secure password hashing (bcrypt)
✅ JWT-based authentication
✅ User login/logout
✅ Protected routes
✅ Blood report upload (JPG, PNG, PDF)
✅ Gemini AI integration
✅ Parameter extraction from reports
✅ JSON output display
✅ Reports dashboard
✅ Detailed report view
✅ Report deletion
✅ Responsive UI design

---

## 🚀 Next Steps (Future Phases)

### Phase 2: Advanced Analysis

- Parameter standardization
- Abnormality detection with reference ranges
- Visual indicators for out-of-range values
- Statistical analysis

### Phase 3: Explainability

- SHAP-based explanations
- AI reasoning transparency
- Parameter correlation analysis

### Phase 4: Recommendations

- Doctor-verified suggestions
- Personalized health recommendations
- Lifestyle guidance

### Phase 5: Tracking & Visualization

- Historical data tracking
- Trend graphs and charts
- Comparative analysis
- PDF report generation

---

## 💡 Development Tips

1. **Keep Both Servers Running:** Backend (5000) and Frontend (3000)
2. **Check Console for Errors:** Both browser console and terminal
3. **Use MongoDB Compass:** GUI tool for viewing database
4. **Test Email in Development:** Use Mailtrap or similar for testing
5. **Use Postman:** For testing API endpoints directly

---

## 📞 Support & Resources

- **Node.js Docs:** https://nodejs.org/docs
- **React Docs:** https://react.dev
- **MongoDB Docs:** https://docs.mongodb.com
- **Express Docs:** https://expressjs.com
- **Gemini API Docs:** https://ai.google.dev/docs

---

## 🎉 Congratulations!

You've successfully set up the Blood Report Analysis Platform (Phase 1). Start by registering an account and uploading your first blood report!

For questions or issues, please check the troubleshooting section above or review the error messages in the terminal/console.
