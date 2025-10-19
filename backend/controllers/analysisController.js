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

    // Save report to database
    const report = await Report.create({
      userId: req.user._id,
      fileName: originalname,
      fileType: mimetype,
      filePath: filePath,
      extractedData: analysisResult.data,
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

    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze report",
    });
  }
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
