import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Initialize Gemini AI (will be initialized after env is loaded)
let genAI;

// Function to initialize and verify API key
export const initializeGeminiAPI = () => {
  console.log("\n🔑 Gemini API Key Verification:");
  console.log("================================");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is NOT set in environment variables");
    return false;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("✅ GEMINI_API_KEY is present");
  console.log(`   Length: ${apiKey.length} characters`);
  console.log(`   First 10 chars: ${apiKey.substring(0, 10)}...`);
  console.log(`   Last 5 chars: ...${apiKey.substring(apiKey.length - 5)}`);

  // Check for common issues
  if (apiKey.startsWith('"') || apiKey.endsWith('"')) {
    console.warn(
      "⚠️  WARNING: API key contains quotes - this may cause authentication errors!"
    );
  }
  if (apiKey.includes(" ")) {
    console.warn(
      "⚠️  WARNING: API key contains spaces - this may cause authentication errors!"
    );
  }
  if (apiKey.length < 30) {
    console.warn(
      "⚠️  WARNING: API key seems too short - typical keys are 39+ characters"
    );
  }

  console.log("================================\n");

  // Initialize Gemini AI
  genAI = new GoogleGenerativeAI(apiKey);
  return true;
};

// Convert file to Gemini format
const fileToGenerativePart = (path, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
};

// Analyze blood report with Gemini
export const analyzeBloodReport = async (filePath, mimeType) => {
  try {
    console.log("\n📊 Analyzing blood report (Image/Document):");
    console.log(`   File: ${filePath}`);
    console.log(`   MIME Type: ${mimeType}`);
    console.log(`   Model: gemini-2.5-pro`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are a medical AI assistant specialized in analyzing blood test reports. 

Analyze this blood test report image/document and extract medical parameters with their values and units.

**PRIORITY: Complete Blood Count (CBC) parameters are MOST IMPORTANT. Extract these first:**
- Hemoglobin (Hb/Haemoglobin)
- WBC (Total WBC Count/White Blood Cells/Leukocytes)
- Platelets (Platelet Count)
- Neutrophils (Neutrophil %)
- Lymphocytes (Lymphocyte %)
- RBC (Red Blood Cell Count)
- MCV, MCH, MCHC
- Hematocrit/PCV

**Then extract other common parameters if present:**
- Blood Sugar: Glucose (Fasting/Random), HbA1c
- Kidney: Creatinine, Urea, BUN
- Inflammatory: ESR, CRP
- Liver: SGOT, SGPT, Bilirubin
- Lipid: Cholesterol, LDL, HDL, Triglycerides
- Thyroid: TSH, T3, T4
- Electrolytes: Sodium, Potassium, Chloride

**Skip or deprioritize:**
- Serological tests (Widal, antibody tests)
- Culture reports
- Specialized infection markers (unless no CBC found)

Return the response in the following JSON format ONLY (no additional text):
{
  "patientInfo": {
    "name": "patient name if found",
    "age": "age if found",
    "gender": "gender if found",
    "reportDate": "date if found"
  },
  "parameters": [
    {
      "name": "parameter name (e.g., Hemoglobin, WBC, RBC)",
      "value": "numeric value",
      "unit": "unit of measurement",
      "referenceRange": "normal range if mentioned",
      "status": "normal/high/low based on reference range"
    }
  ],
  "labInfo": {
    "labName": "laboratory name if found",
    "reportId": "report ID if found"
  }
}

Extract common blood parameters such as:
- Complete Blood Count (CBC): Hemoglobin, RBC, WBC, Platelets, MCV, MCH, MCHC, Hematocrit
- Lipid Profile: Total Cholesterol, LDL, HDL, Triglycerides
- Liver Function: SGOT, SGPT, Bilirubin, Alkaline Phosphatase
- Kidney Function: Creatinine, Urea, BUN
- Thyroid: TSH, T3, T4
- Blood Sugar: Glucose (Fasting/Random), HbA1c
- Electrolytes: Sodium, Potassium, Chloride
- And any other parameters found in the report

**Focus on extracting CBC parameters first as they are most important for analysis.**`;

    const imagePart = fileToGenerativePart(filePath, mimeType);

    console.log("   🚀 Sending request to Gemini API...");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log("   ✅ Received response from Gemini API");
    console.log(`   Response length: ${text.length} characters\n`);

    // Clean the response to extract JSON
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    // Parse JSON
    const parsedData = JSON.parse(jsonText);

    return {
      success: true,
      data: parsedData,
      rawText: text,
    };
  } catch (error) {
    console.error("\n❌ Error analyzing blood report:");
    console.error(`   Error Type: ${error.constructor.name}`);
    console.error(`   Error Message: ${error.message}`);
    if (error.message.includes("API_KEY_INVALID")) {
      console.error("\n🔑 API Key Issue Detected:");
      console.error(
        "   - Check that GEMINI_API_KEY in .env file has no quotes"
      );
      console.error("   - Check that GEMINI_API_KEY has no spaces");
      console.error(
        "   - Verify the API key is valid at https://makersuite.google.com/app/apikey"
      );
    }
    throw new Error(`Failed to analyze blood report: ${error.message}`);
  }
};

// Analyze PDF report (extract text first)
export const analyzePDFReport = async (filePath) => {
  try {
    console.log("\n📄 Analyzing blood report (PDF):");
    console.log(`   File: ${filePath}`);
    console.log(`   Model: gemini-2.5-pro`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are a medical AI assistant specialized in analyzing blood test reports. 

Analyze this blood test report PDF and extract medical parameters with their values and units.

**PRIORITY: Complete Blood Count (CBC) parameters are MOST IMPORTANT. Extract these first:**
- Hemoglobin (Hb/Haemoglobin)
- WBC (Total WBC Count/White Blood Cells/Leukocytes)
- Platelets (Platelet Count)
- Neutrophils (Neutrophil %)
- Lymphocytes (Lymphocyte %)
- RBC (Red Blood Cell Count)
- MCV, MCH, MCHC
- Hematocrit/PCV

**Then extract other common parameters if present:**
- Blood Sugar: Glucose (Fasting/Random), HbA1c
- Kidney: Creatinine, Urea, BUN
- Inflammatory: ESR, CRP
- Liver: SGOT, SGPT, Bilirubin
- Lipid: Cholesterol, LDL, HDL, Triglycerides
- Thyroid: TSH, T3, T4
- Electrolytes: Sodium, Potassium, Chloride

**Skip or deprioritize:**
- Serological tests (Widal, antibody tests)
- Culture reports
- Specialized infection markers (unless no CBC found)

Return the response in the following JSON format ONLY (no additional text):
{
  "patientInfo": {
    "name": "patient name if found",
    "age": "age if found",
    "gender": "gender if found",
    "reportDate": "date if found"
  },
  "parameters": [
    {
      "name": "parameter name (e.g., Hemoglobin, WBC, RBC)",
      "value": "numeric value",
      "unit": "unit of measurement",
      "referenceRange": "normal range if mentioned",
      "status": "normal/high/low based on reference range"
    }
  ],
  "labInfo": {
    "labName": "laboratory name if found",
    "reportId": "report ID if found"
  }
}

Extract common blood parameters such as:
- Complete Blood Count (CBC): Hemoglobin, RBC, WBC, Platelets, MCV, MCH, MCHC, Hematocrit
- Lipid Profile: Total Cholesterol, LDL, HDL, Triglycerides
- Liver Function: SGOT, SGPT, Bilirubin, Alkaline Phosphatase
- Kidney Function: Creatinine, Urea, BUN
- Thyroid: TSH, T3, T4
- Blood Sugar: Glucose (Fasting/Random), HbA1c
- Electrolytes: Sodium, Potassium, Chloride
- And any other parameters found in the report

**Focus on extracting CBC parameters first as they are most important for analysis.**`;

    const pdfPart = fileToGenerativePart(filePath, "application/pdf");

    console.log("   🚀 Sending PDF to Gemini API...");
    const result = await model.generateContent([prompt, pdfPart]);
    const response = await result.response;
    const text = response.text();
    console.log("   ✅ Received response from Gemini API");
    console.log(`   Response length: ${text.length} characters\n`);

    // Clean the response to extract JSON
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    // Parse JSON
    const parsedData = JSON.parse(jsonText);

    return {
      success: true,
      data: parsedData,
      rawText: text,
    };
  } catch (error) {
    console.error("\n❌ Error analyzing PDF report:");
    console.error(`   Error Type: ${error.constructor.name}`);
    console.error(`   Error Message: ${error.message}`);
    if (error.message.includes("API_KEY_INVALID")) {
      console.error("\n🔑 API Key Issue Detected:");
      console.error(
        "   - Check that GEMINI_API_KEY in .env file has no quotes"
      );
      console.error("   - Check that GEMINI_API_KEY has no spaces");
      console.error(
        "   - Verify the API key is valid at https://makersuite.google.com/app/apikey"
      );
    }
    throw new Error(`Failed to analyze PDF report: ${error.message}`);
  }
};

// Verify Gemini API connection on module load
export const verifyGeminiConnection = async () => {
  try {
    console.log("🔍 Testing Gemini API connection...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent([
      "Say 'Connected' if you can read this.",
    ]);
    const response = await result.response;
    const text = response.text();
    console.log("✅ Gemini API connection successful!");
    console.log(`   Test response: ${text.substring(0, 50)}...\n`);
    return true;
  } catch (error) {
    console.error("❌ Gemini API connection test failed:");
    console.error(`   ${error.message}\n`);
    return false;
  }
};