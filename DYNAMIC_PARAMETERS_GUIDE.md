# Dynamic Blood Parameters Storage - Implementation Guide

## ✅ What's Been Implemented

Your blood report analysis system now stores **ALL parameters dynamically** in a structured MongoDB database with powerful querying capabilities.

---

## 🗄️ Database Schema

### Enhanced Report Model

Each report now stores:

```javascript
{
  userId: ObjectId,
  fileName: String,
  fileType: String,
  filePath: String,

  // 🆕 Structured Parameters Array
  parameters: [
    {
      name: "Hemoglobin",
      value: "14.5",
      unit: "g/dL",
      referenceRange: {
        min: 13.0,
        max: 17.0,
        range: "13.0-17.0"
      },
      status: "normal", // normal|high|low|abnormal|unknown
      category: "Complete Blood Count (CBC)"
    },
    {
      name: "Cholesterol",
      value: "220",
      unit: "mg/dL",
      referenceRange: {
        min: 0,
        max: 200,
        range: "< 200"
      },
      status: "high",
      category: "Lipid Profile"
    }
    // ... more parameters
  ],

  // Original AI response (for backup)
  extractedData: Mixed,
  rawText: String,

  status: "completed",
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 Automatic Categorization

Parameters are automatically categorized into:

1. **Complete Blood Count (CBC)**

   - Hemoglobin, RBC, WBC, Platelets, MCV, MCH, MCHC, Hematocrit
   - Neutrophils, Lymphocytes, Eosinophils, Monocytes

2. **Lipid Profile**

   - Total Cholesterol, LDL, HDL, Triglycerides, VLDL

3. **Liver Function Tests**

   - SGOT, SGPT, ALT, AST, Bilirubin, Alkaline Phosphatase, GGT

4. **Kidney Function Tests**

   - Creatinine, Urea, BUN, Uric Acid

5. **Thyroid Function**

   - TSH, T3, T4

6. **Blood Sugar**

   - Glucose (Fasting/Random), HbA1c

7. **Electrolytes**

   - Sodium, Potassium, Chloride, Calcium, Magnesium

8. **Vitamins**

   - Vitamin D, B12, etc.

9. **Other Tests**
   - Any other detected parameters

---

## 🔌 New API Endpoints

### 1. **Upload Report** (Enhanced)

```
POST /api/analysis/upload
```

**Response includes structured parameters:**

```json
{
  "success": true,
  "data": {
    "reportId": "...",
    "fileName": "blood_report.pdf",
    "parameters": [
      {
        "name": "Hemoglobin",
        "value": "14.5",
        "unit": "g/dL",
        "status": "normal",
        "category": "Complete Blood Count (CBC)",
        "referenceRange": { "min": 13, "max": 17, "range": "13-17" }
      }
    ]
  }
}
```

### 2. **Get All Parameters**

```
GET /api/analysis/parameters/list
```

**Returns all unique parameters across user's reports:**

```json
{
  "success": true,
  "totalParameters": 25,
  "data": {
    "all": [
      {
        "name": "Hemoglobin",
        "category": "Complete Blood Count (CBC)",
        "unit": "g/dL",
        "count": 5  // Appears in 5 reports
      }
    ],
    "byCategory": {
      "Complete Blood Count (CBC)": [...],
      "Lipid Profile": [...],
      "Liver Function Tests": [...]
    }
  }
}
```

### 3. **Get Parameter Trends**

```
GET /api/analysis/parameters/trends/:parameterName
```

**Example:** `/api/analysis/parameters/trends/Hemoglobin`

**Track a specific parameter over time:**

```json
{
  "success": true,
  "parameterName": "Hemoglobin",
  "count": 5,
  "data": [
    {
      "date": "2025-01-15",
      "reportId": "...",
      "fileName": "report_jan.pdf",
      "value": "13.5",
      "unit": "g/dL",
      "status": "normal",
      "referenceRange": { "range": "13-17" }
    },
    {
      "date": "2025-03-20",
      "value": "14.2",
      "status": "normal"
    }
  ]
}
```

### 4. **Search by Parameters**

```
GET /api/analysis/parameters/search?status=high&category=Lipid Profile
```

**Query Parameters:**

- `status`: `normal`, `high`, `low`, `abnormal`
- `category`: Category name
- `parameterName`: Search by parameter name

**Returns reports with matching parameters:**

```json
{
  "success": true,
  "count": 2,
  "filters": {
    "status": "high",
    "category": "Lipid Profile"
  },
  "data": [
    {
      "reportId": "...",
      "fileName": "report1.pdf",
      "createdAt": "2025-03-15",
      "parameters": [
        {
          "name": "Cholesterol",
          "value": "220",
          "status": "high",
          "category": "Lipid Profile"
        }
      ]
    }
  ]
}
```

---

## 💡 Use Cases

### 1. **Track Health Trends**

Monitor how specific parameters change over time:

```javascript
// Get Hemoglobin trends
GET / api / analysis / parameters / trends / Hemoglobin;

// Get Glucose trends
GET / api / analysis / parameters / trends / Glucose;
```

### 2. **Find Abnormal Results**

Quickly find all reports with high cholesterol:

```javascript
GET /api/analysis/parameters/search?status=high&parameterName=Cholesterol
```

### 3. **Category-wise Analysis**

Get all kidney function test results:

```javascript
GET /api/analysis/parameters/search?category=Kidney Function Tests
```

### 4. **Dashboard Overview**

Get all unique parameters to build a health dashboard:

```javascript
GET / api / analysis / parameters / list;
```

---

## 🔍 MongoDB Indexes

For fast queries, these indexes are automatically created:

- `userId + createdAt` (for user reports)
- `parameters.name` (for parameter searches)
- `parameters.status` (for status filters)

---

## 📱 Frontend Integration Examples

### Display Parameter Trends Chart

```javascript
const getTrends = async (parameterName) => {
  const response = await fetch(
    `/api/analysis/parameters/trends/${parameterName}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();

  // data.data contains time-series values
  // Plot on chart: dates vs values
};
```

### Show All Abnormal Parameters

```javascript
const getAbnormalResults = async () => {
  const response = await fetch("/api/analysis/parameters/search?status=high", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  // Display reports with high values
};
```

### Build Parameter Filter

```javascript
const getAllParams = async () => {
  const response = await fetch("/api/analysis/parameters/list", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  // Use data.data.byCategory to build categorized filters
};
```

---

## 🎯 Benefits

✅ **Structured Storage** - All parameters stored in organized format  
✅ **Fast Queries** - MongoDB indexes for instant searches  
✅ **Trend Analysis** - Track parameters over time  
✅ **Smart Categorization** - Auto-categorizes into medical groups  
✅ **Flexible Search** - Filter by status, category, name  
✅ **Backward Compatible** - Original data still in `extractedData`  
✅ **Scalable** - Can handle unlimited parameters dynamically

---

## 🚀 Next Steps

1. **Test the API** - Upload a blood report and see structured parameters
2. **Build Dashboards** - Use parameter trends for visualizations
3. **Add Alerts** - Notify users when parameters are abnormal
4. **ML Integration** - Use historical data for predictions
5. **Compare Reports** - Side-by-side parameter comparison

---

## 📝 Example: Complete Flow

1. **User uploads report** → AI extracts parameters
2. **System processes** → Categorizes, validates, stores
3. **User views dashboard** → Sees all parameters by category
4. **User clicks "Hemoglobin"** → Sees trend chart over 6 months
5. **System alerts** → "Your cholesterol is high in 3 reports"

All of this is now **fully dynamic** - any parameter AI extracts is automatically stored and queryable! 🎉
