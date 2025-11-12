# 📡 API Documentation

Complete API reference for the Blood Report Analysis XAI system.

---

## 🌐 Base URLs

| Service | Base URL | Port |
|---------|----------|------|
| Node.js Backend | `http://localhost:5000` | 5000 |
| Flask XAI Service | `http://localhost:5001` | 5001 |
| React Frontend | `http://localhost:3000` | 3000 |

---

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Get the token by logging in via `/api/auth/login`.

---

## 📚 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Analysis APIs](#analysis-apis)
3. [Parameter APIs](#parameter-apis)
4. [XAI Interpretation APIs](#xai-interpretation-apis)
5. [Error Responses](#error-responses)

---

## Authentication APIs

### Register User

Create a new user account and send email verification.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "userId": "65abc123...",
    "email": "john@example.com",
    "isVerified": false
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already registered

---

### Verify Email (OTP)

Verify email address using the 6-digit OTP sent via email.

**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired OTP
- `404 Not Found`: User not found

---

### Resend OTP

Request a new OTP if the previous one expired.

**Endpoint:** `POST /api/auth/resend-otp`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "New OTP sent to your email"
}
```

---

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing credentials
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Email not verified

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "65abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "isVerified": true,
    "createdAt": "2024-11-12T10:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

---

## Analysis APIs

### Upload Blood Report

Upload a blood test report (JPG, PNG, or PDF) for analysis.

**Endpoint:** `POST /api/analysis/upload`

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `report`: File (required) - Blood test report
- `reportDate`: String (optional) - Date of the report (ISO 8601 format)
- `notes`: String (optional) - Additional notes

**Example using curl:**
```bash
curl -X POST http://localhost:5000/api/analysis/upload \
  -H "Authorization: Bearer <jwt-token>" \
  -F "report=@blood-test.jpg" \
  -F "reportDate=2024-11-12" \
  -F "notes=Routine checkup"
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Report uploaded and analyzed successfully",
  "data": {
    "reportId": "65abc456...",
    "extractedParameters": {
      "hemoglobin": {
        "value": 13.7,
        "unit": "g/dL",
        "normalRange": "13.0-17.0"
      },
      "wbc": {
        "value": 6200,
        "unit": "cells/μL",
        "normalRange": "4000-11000"
      },
      "platelets": {
        "value": 250000,
        "unit": "cells/μL",
        "normalRange": "150000-450000"
      }
    },
    "reportDate": "2024-11-12",
    "uploadedAt": "2024-11-12T15:30:00Z"
  }
}
```

**File Restrictions:**
- **Max Size**: 10 MB
- **Allowed Types**: image/jpeg, image/png, application/pdf

**Error Responses:**
- `400 Bad Request`: Invalid file or validation error
- `413 Payload Too Large`: File exceeds 10 MB
- `415 Unsupported Media Type`: Invalid file type

---

### Get User's Reports

Retrieve all blood reports for the authenticated user.

**Endpoint:** `GET /api/analysis/reports`

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page`: Number (optional, default: 1)
- `limit`: Number (optional, default: 10)
- `sortBy`: String (optional, default: "uploadedAt")
- `order`: String (optional, "asc" or "desc", default: "desc")

**Example:**
```
GET /api/analysis/reports?page=1&limit=5&sortBy=reportDate&order=desc
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "reportId": "65abc456...",
        "reportDate": "2024-11-12",
        "extractedParameters": {...},
        "uploadedAt": "2024-11-12T15:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalReports": 15,
      "limit": 5
    }
  }
}
```

---

### Get Single Report

Retrieve a specific blood report by ID.

**Endpoint:** `GET /api/analysis/reports/:reportId`

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportId": "65abc456...",
    "userId": "65abc123...",
    "reportDate": "2024-11-12",
    "extractedParameters": {
      "hemoglobin": {...},
      "wbc": {...}
    },
    "rawText": "Complete Blood Count Report...",
    "fileUrl": "/uploads/reports/abc123.jpg",
    "uploadedAt": "2024-11-12T15:30:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Report not found or doesn't belong to user

---

### Delete Report

Delete a blood report.

**Endpoint:** `DELETE /api/analysis/reports/:reportId`

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## Parameter APIs

### Get All Parameters

Get reference information for all supported blood parameters.

**Endpoint:** `GET /api/parameters`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "parameterId": "65abc789...",
      "name": "Hemoglobin",
      "unit": "g/dL",
      "normalRange": {
        "male": "13.0-17.0",
        "female": "12.0-15.5"
      },
      "description": "Protein in red blood cells that carries oxygen",
      "lowIndicates": "Anemia, blood loss, nutritional deficiency",
      "highIndicates": "Dehydration, lung disease, polycythemia"
    }
  ]
}
```

---

### Get Single Parameter

Get detailed information about a specific parameter.

**Endpoint:** `GET /api/parameters/:parameterName`

**Example:**
```
GET /api/parameters/hemoglobin
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "name": "Hemoglobin",
    "unit": "g/dL",
    "normalRange": {
      "male": "13.0-17.0",
      "female": "12.0-15.5"
    },
    "description": "Protein in red blood cells that carries oxygen",
    "lowIndicates": "Anemia, blood loss, nutritional deficiency",
    "highIndicates": "Dehydration, lung disease, polycythemia",
    "relatedParameters": ["RBC", "Hematocrit", "MCV"]
  }
}
```

---

## XAI Interpretation APIs

### Get Parameter Interpretation

Get AI-powered interpretation with explainability for a specific parameter value.

**Endpoint:** `POST http://localhost:5001/api/v1/interpret`

**Headers:**
```http
Authorization: Bearer dev-secret-token
Content-Type: application/json
```

**Request Body:**
```json
{
  "parameter": "hemoglobin",
  "value": 13.7,
  "patientAge": 34,
  "patientGender": "Male",
  "otherParameters": {
    "hemoglobin_g_dL": 13.7,
    "wbc_10e9_L": 6.2,
    "platelet_count": 250,
    "rdw_percent": 13.5,
    "neutrophil_percent": 60,
    "lymphocyte_percent": 30
  }
}
```

**Required Fields:**
- `parameter`: String - Name of the parameter (lowercase, e.g., "hemoglobin", "wbc")
- `value`: Number - The measured value
- `patientAge`: Number - Patient's age in years
- `patientGender`: String - "Male" or "Female"
- `otherParameters`: Object - Other CBC parameters for context

**Supported Parameters:**
- `hemoglobin`
- `wbc` (White Blood Cells)
- `platelet`
- `rdw` (Red Cell Distribution Width)
- `neutrophil`
- `lymphocyte`
- `rbc` (Red Blood Cells)
- `mcv` (Mean Corpuscular Volume)
- `mch` (Mean Corpuscular Hemoglobin)
- `mchc` (Mean Corpuscular Hemoglobin Concentration)
- `eosinophil`
- `basophil`

**Success Response (200 OK):**
```json
{
  "success": true,
  "parameter": "hemoglobin",
  "value": 13.7,
  "prediction": "Normal",
  "confidence": 0.9547,
  "medicalInterpretation": "Your hemoglobin level of 13.7 g/dL is within the normal range for males (13.0-17.0 g/dL). This indicates healthy oxygen-carrying capacity in your blood. Hemoglobin is crucial for transporting oxygen from your lungs to tissues throughout your body.",
  "featureImportance": [
    {
      "feature": "age",
      "importance": 0.2341,
      "description": "Age-related normal variations"
    },
    {
      "feature": "rdw_percent",
      "importance": 0.1876,
      "description": "Red cell distribution width correlation"
    },
    {
      "feature": "gender_male",
      "importance": 0.1523,
      "description": "Gender-specific reference ranges"
    }
  ],
  "clinicalContext": {
    "normalRange": "13.0-17.0 g/dL (Male)",
    "status": "Normal",
    "severity": null
  },
  "cached": false,
  "modelVersion": "1.0"
}
```

**Prediction Values:**
- `"Low"` - Below normal range
- `"Normal"` - Within normal range
- `"High"` - Above normal range

**Error Responses:**

`400 Bad Request` - Invalid request:
```json
{
  "success": false,
  "error": "Missing required field: parameter"
}
```

`404 Not Found` - Model not available:
```json
{
  "success": false,
  "error": "Model not found for parameter: unknown_param",
  "availableParameters": ["hemoglobin", "wbc", "platelet", ...]
}
```

`500 Internal Server Error` - Server error:
```json
{
  "success": false,
  "error": "Failed to load model",
  "details": "Error message here"
}
```

---

### Health Check (Flask Service)

Check if the Flask XAI service is running.

**Endpoint:** `GET http://localhost:5001/`

**Success Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "Flask XAI Service",
  "version": "1.0",
  "modelsLoaded": 12,
  "availableParameters": [
    "hemoglobin",
    "wbc",
    "platelet",
    "rdw",
    "neutrophil",
    "lymphocyte",
    "rbc",
    "mcv",
    "mch",
    "mchc",
    "eosinophil",
    "basophil"
  ]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "details": "Additional details (if available)"
}
```

### Common HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created (e.g., new user, new report) |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Email not verified or insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 413 | Payload Too Large | File size exceeds limit |
| 415 | Unsupported Media Type | Invalid file type |
| 500 | Internal Server Error | Server-side error |

---

## Rate Limiting

**Current Status:** Not implemented (recommended for production)

**Recommended for Production:**
- 100 requests per 15 minutes per IP
- 1000 requests per day per user
- Use Express rate-limit middleware

---

## CORS Policy

**Allowed Origins:**
- `http://localhost:3000` (Development)
- Configure production URLs in backend `.env`

**Allowed Methods:**
- GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:**
- Content-Type, Authorization

---

## Example Workflows

### Complete User Registration Flow

```javascript
// 1. Register
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123'
  })
});

// 2. Check email for OTP (user action)

// 3. Verify email
const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    otp: '123456'
  })
});

const { token } = await verifyResponse.json();

// 4. Now use token for authenticated requests
```

### Upload and Analyze Report

```javascript
// 1. Upload report
const formData = new FormData();
formData.append('report', fileInput.files[0]);
formData.append('reportDate', '2024-11-12');

const uploadResponse = await fetch('http://localhost:5000/api/analysis/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { data } = await uploadResponse.json();

// 2. Get XAI interpretation for a parameter
const interpretResponse = await fetch('http://localhost:5001/api/v1/interpret', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dev-secret-token'
  },
  body: JSON.stringify({
    parameter: 'hemoglobin',
    value: data.extractedParameters.hemoglobin.value,
    patientAge: 34,
    patientGender: 'Male',
    otherParameters: {
      hemoglobin_g_dL: data.extractedParameters.hemoglobin.value,
      wbc_10e9_L: data.extractedParameters.wbc.value / 1000,
      platelet_count: data.extractedParameters.platelets.value / 1000
    }
  })
});

const interpretation = await interpretResponse.json();
console.log(interpretation.medicalInterpretation);
```

---

## Testing with Postman

1. Import this collection: [Download Postman Collection](#) (coming soon)
2. Set environment variables:
   - `BASE_URL`: http://localhost:5000
   - `FLASK_URL`: http://localhost:5001
   - `TOKEN`: (will be set after login)
3. Run the collection

---

## Security Notes

### Production Checklist

- [ ] Change all default secrets
- [ ] Use HTTPS for all endpoints
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Enable CORS only for trusted origins
- [ ] Use environment-specific tokens
- [ ] Implement API key rotation
- [ ] Add request logging
- [ ] Use secure session management
- [ ] Implement CSRF protection

---

## Need Help?

- 📖 [Setup Guide](SETUP_INSTRUCTIONS.md)
- 💬 [Discussions](https://github.com/Prashanth291/BloodReportAnalysisXAI/discussions)
- 🐛 [Report Bug](https://github.com/Prashanth291/BloodReportAnalysisXAI/issues)

---

**Last Updated:** November 12, 2024
