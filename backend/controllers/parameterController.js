import ParameterReference from "../models/ParameterReference.js";
import { seedParameterReferences } from "../seeds/parameterSeeder.js";
import {
  analyzeReport,
  detectPatterns,
  analyzeTrends,
} from "../utils/parameterAnalyzer.js";
import Report from "../models/Report.js";

/**
 * @desc    Get all parameter references
 * @route   GET /api/parameters
 * @access  Public
 */
const getAllParameters = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const parameters = await ParameterReference.find(query)
      .select("-ranges -recommendations") // Exclude detailed ranges for list view
      .sort({ parameterName: 1 });

    res.status(200).json({
      success: true,
      count: parameters.length,
      data: parameters,
    });
  } catch (error) {
    console.error("Error fetching parameters:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching parameter references",
      error: error.message,
    });
  }
};

/**
 * @desc    Get specific parameter reference with all details
 * @route   GET /api/parameters/:parameterName
 * @access  Public
 */
const getParameterByName = async (req, res) => {
  try {
    const { parameterName } = req.params;

    const parameter = await ParameterReference.findOne({
      parameterName: new RegExp(`^${parameterName}$`, "i"), // Case-insensitive
      isActive: true,
    });

    if (!parameter) {
      return res.status(404).json({
        success: false,
        message: "Parameter reference not found",
      });
    }

    res.status(200).json({
      success: true,
      data: parameter,
    });
  } catch (error) {
    console.error("Error fetching parameter:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching parameter reference",
      error: error.message,
    });
  }
};

/**
 * @desc    Analyze a report with user profile
 * @route   POST /api/parameters/analyze
 * @access  Private
 */
const analyzeUserReport = async (req, res) => {
  try {
    const { reportId, userProfile } = req.body;

    // Get the report
    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if user owns this report
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this report",
      });
    }

    // Use user profile from request or from user's stored profile
    const profile = userProfile ||
      req.user.profile || {
        age: 30,
        gender: "any",
        conditions: [],
        ethnicity: "general",
      };

    // Analyze all parameters in the report
    const analysisResult = await analyzeReport(report.parameters, profile);

    // Detect patterns
    const patterns = detectPatterns(analysisResult.parameters);

    // Get previous report for trend analysis
    const previousReport = await Report.findOne({
      userId: req.user._id,
      _id: { $ne: reportId },
      createdAt: { $lt: report.createdAt },
    }).sort({ createdAt: -1 });

    let trends = [];
    if (previousReport) {
      trends = analyzeTrends(report.parameters, previousReport.parameters);
    }

    res.status(200).json({
      success: true,
      data: {
        reportId: report._id,
        analyzedAt: new Date(),
        userProfile: profile,
        analysis: analysisResult,
        patterns,
        trends,
      },
    });
  } catch (error) {
    console.error("Error analyzing report:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing report",
      error: error.message,
    });
  }
};

/**
 * @desc    Seed parameter references (one-time setup)
 * @route   POST /api/parameters/seed
 * @access  Admin (should be protected in production)
 */
const seedParameters = async (req, res) => {
  try {
    const result = await seedParameterReferences();

    res.status(200).json({
      success: true,
      message: "Parameter references seeded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error seeding parameters:", error);
    res.status(500).json({
      success: false,
      message: "Error seeding parameter references",
      error: error.message,
    });
  }
};

export {
  getAllParameters,
  getParameterByName,
  analyzeUserReport,
  seedParameters,
};
