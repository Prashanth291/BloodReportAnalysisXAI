import Report from "../models/Report.js";
import {
  analyzeBloodReport,
  analyzePDFReport,
} from "../services/geminiService.js";
import fs from "fs";

// @desc    Upload and analyze blood report
// @route   POST /api/analysis/upload
// @access  Private
export const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const { path: filePath, mimetype, originalname } = req.file;

    // Analyze the report based on file type
    let analysisResult;

    if (mimetype === "application/pdf") {
      analysisResult = await analyzePDFReport(filePath);
    } else {
      analysisResult = await analyzeBloodReport(filePath, mimetype);
    }

    // Process parameters from extracted data
    const processedParameters = processParameters(analysisResult.data);

    // Save report to database with structured parameters
    const report = await Report.create({
      userId: req.user._id,
      fileName: originalname,
      fileType: mimetype,
      filePath: filePath,
      parameters: processedParameters,
      extractedData: analysisResult.data, // Keep original for reference
      rawText: analysisResult.rawText,
      status: "completed",
    });

    res.status(200).json({
      success: true,
      message: "Report analyzed successfully",
      data: {
        reportId: report._id,
        fileName: report.fileName,
        fileType: report.fileType,
        parameters: report.parameters,
        extractedData: report.extractedData,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload report error:", error);

    // Clean up uploaded file if analysis fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    // Determine appropriate status code and error message
    let statusCode = 500;
    let errorMessage = error.message || "Failed to analyze report";

    // Handle specific error types
    if (error.message && error.message.includes("does not appear to be a blood test report")) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message && error.message.includes("Failed to analyze")) {
      statusCode = 422;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: {
        type: statusCode === 400 ? 'INVALID_DOCUMENT_TYPE' : 'ANALYSIS_FAILED',
        details: statusCode === 400 
          ? 'Please upload a medical blood test report (CBC, Lipid Profile, Liver Function, Kidney Function, etc.)'
          : 'The document could not be processed. Please ensure it is a clear, readable blood test report.'
      }
    });
  }
};

// Helper function to process and structure parameters
const normalizeParameterName = (name) => {
  if (!name) return "Unknown";
  const n = name.trim().toLowerCase();
  // CBC (match model filenames exactly)
  if (n.includes("hemoglobin") || n === "hb" || n === "hgb") return "hemoglobin";
  if (n.includes("wbc")) return "wbc";
  if (n.includes("rbc")) return "rbc";
  if (n.includes("platelet")) return "platelet";
  if (n.includes("lymphocyte")) return "lymphocyte";
  if (n.includes("neutrophil")) return "neutrophil";
  if (n.includes("eosinophil")) return "eosinophil";
  if (n.includes("monocyte")) return "monocyte";
  if (n.includes("basophil")) return "basophil";
  if (n.includes("pcv") || n.includes("hematocrit")) return "pcv";
  if (n.includes("mcv")) return "mcv";
  if (n.includes("mchc")) return "mchc";
  if (n.includes("mch")) return "mch";
  // Add more mappings as needed
  return n;
};

const processParameters = (extractedData) => {
  const parameters = [];

  if (!extractedData || !extractedData.parameters) {
    return parameters;
  }

  extractedData.parameters.forEach((param) => {
    const normalizedName = normalizeParameterName(param.name);
    const processedParam = {
      name: normalizedName,
      value: param.value || "N/A",
      unit: param.unit || "",
      referenceRange: {},
      status: param.status?.toLowerCase() || "unknown",
      category: categorizeParameter(normalizedName),
      originalName: param.name || "Unknown", // for traceability
    };

    // Process reference range
    if (param.referenceRange) {
      const range = param.referenceRange.toString();
      processedParam.referenceRange.range = range;

      // Try to extract min/max from range like "10-20" or "10.5-20.5"
      const rangeMatch = range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
      if (rangeMatch) {
        processedParam.referenceRange.min = parseFloat(rangeMatch[1]);
        processedParam.referenceRange.max = parseFloat(rangeMatch[2]);
      }
    }

    parameters.push(processedParam);
  });

  return parameters;
};

// Helper function to categorize blood parameters
const categorizeParameter = (paramName) => {
  const name = paramName?.toLowerCase() || "";

  // Complete Blood Count (CBC)
  if (
    name.includes("hemoglobin") ||
    name.includes("hb") ||
    name.includes("rbc") ||
    name.includes("wbc") ||
    name.includes("platelet") ||
    name.includes("mcv") ||
    name.includes("mch") ||
    name.includes("hematocrit") ||
    name.includes("eosinophil") ||
    name.includes("neutrophil") ||
    name.includes("lymphocyte") ||
    name.includes("monocyte")
  ) {
    return "Complete Blood Count (CBC)";
  }

  // Lipid Profile
  if (
    name.includes("cholesterol") ||
    name.includes("ldl") ||
    name.includes("hdl") ||
    name.includes("triglyceride") ||
    name.includes("vldl")
  ) {
    return "Lipid Profile";
  }

  // Liver Function Tests
  if (
    name.includes("sgot") ||
    name.includes("sgpt") ||
    name.includes("alt") ||
    name.includes("ast") ||
    name.includes("bilirubin") ||
    name.includes("alkaline") ||
    name.includes("alp") ||
    name.includes("ggt")
  ) {
    return "Liver Function Tests";
  }

  // Kidney Function Tests
  if (
    name.includes("creatinine") ||
    name.includes("urea") ||
    name.includes("bun") ||
    name.includes("uric acid")
  ) {
    return "Kidney Function Tests";
  }

  // Thyroid Function
  if (
    name.includes("tsh") ||
    name.includes("t3") ||
    name.includes("t4") ||
    name.includes("thyroid")
  ) {
    return "Thyroid Function";
  }

  // Blood Sugar
  if (
    name.includes("glucose") ||
    name.includes("sugar") ||
    name.includes("hba1c") ||
    name.includes("glycated")
  ) {
    return "Blood Sugar";
  }

  // Electrolytes
  if (
    name.includes("sodium") ||
    name.includes("potassium") ||
    name.includes("chloride") ||
    name.includes("calcium") ||
    name.includes("magnesium")
  ) {
    return "Electrolytes";
  }

  // Vitamins
  if (name.includes("vitamin") || name.includes("vit")) {
    return "Vitamins";
  }

  return "Other Tests";
};

// @desc    Get all reports for a user
// @route   GET /api/analysis/reports
// @access  Private
export const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-filePath -rawText");

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reports",
    });
  }
};

// @desc    Get single report details
// @route   GET /api/analysis/reports/:id
// @access  Private
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch report",
    });
  }
};

// @desc    Delete a report
// @route   DELETE /api/analysis/reports/:id
// @access  Private
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Delete file from filesystem
    if (report.filePath && fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath);
    }

    // Delete from database
    await Report.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete report",
    });
  }
};

// @desc    Get parameter trends across multiple reports
// @route   GET /api/analysis/parameters/trends/:parameterName
// @access  Private
export const getParameterTrends = async (req, res) => {
  try {
    const { parameterName } = req.params;

    const reports = await Report.find({
      userId: req.user._id,
      status: "completed",
    })
      .sort({ createdAt: 1 })
      .select("parameters createdAt fileName");

    // Extract the specific parameter from each report
    const trends = reports
      .map((report) => {
        const param = report.parameters.find(
          (p) => p.name.toLowerCase() === parameterName.toLowerCase()
        );

        if (param) {
          return {
            date: report.createdAt,
            reportId: report._id,
            fileName: report.fileName,
            value: param.value,
            unit: param.unit,
            status: param.status,
            referenceRange: param.referenceRange,
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    res.status(200).json({
      success: true,
      parameterName,
      count: trends.length,
      data: trends,
    });
  } catch (error) {
    console.error("Get parameter trends error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch parameter trends",
    });
  }
};

// @desc    Get all unique parameters across user's reports
// @route   GET /api/analysis/parameters/list
// @access  Private
export const getAllParameters = async (req, res) => {
  try {
    const reports = await Report.find({
      userId: req.user._id,
      status: "completed",
    }).select("parameters");

    // Extract unique parameter names with their categories
    const parameterMap = new Map();

    reports.forEach((report) => {
      report.parameters.forEach((param) => {
        if (!parameterMap.has(param.name)) {
          parameterMap.set(param.name, {
            name: param.name,
            category: param.category,
            unit: param.unit,
            count: 1,
          });
        } else {
          parameterMap.get(param.name).count++;
        }
      });
    });

    const parameters = Array.from(parameterMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Group by category
    const groupedByCategory = parameters.reduce((acc, param) => {
      const category = param.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(param);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      totalParameters: parameters.length,
      data: {
        all: parameters,
        byCategory: groupedByCategory,
      },
    });
  } catch (error) {
    console.error("Get all parameters error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch parameters",
    });
  }
};

// @desc    Search reports by parameter status
// @route   GET /api/analysis/parameters/search?status=high&category=CBC
// @access  Private
export const searchByParameters = async (req, res) => {
  try {
    const { status, category, parameterName } = req.query;

    const query = {
      userId: req.user._id,
      status: "completed",
    };

    // Build parameter filter
    if (status) {
      query["parameters.status"] = status.toLowerCase();
    }
    if (category) {
      query["parameters.category"] = category;
    }
    if (parameterName) {
      query["parameters.name"] = new RegExp(parameterName, "i");
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .select("-filePath -rawText");

    // Filter parameters in results if specific criteria provided
    const filteredReports = reports.map((report) => {
      const reportObj = report.toObject();

      if (status || category || parameterName) {
        reportObj.parameters = reportObj.parameters.filter((param) => {
          let match = true;
          if (status && param.status !== status.toLowerCase()) match = false;
          if (category && param.category !== category) match = false;
          if (
            parameterName &&
            !param.name.toLowerCase().includes(parameterName.toLowerCase())
          )
            match = false;
          return match;
        });
      }

      return reportObj;
    });

    res.status(200).json({
      success: true,
      count: filteredReports.length,
      filters: { status, category, parameterName },
      data: filteredReports,
    });
  } catch (error) {
    console.error("Search parameters error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search parameters",
    });
  }
};
