import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Get all parameter references
 */
export const getAllParameters = async (category = null) => {
  try {
    const url = category
      ? `${API_URL}/parameters?category=${category}`
      : `${API_URL}/parameters`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching parameters:", error);
    throw error;
  }
};

/**
 * Get specific parameter reference
 */
export const getParameterReference = async (parameterName) => {
  try {
    const response = await axios.get(`${API_URL}/parameters/${parameterName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching parameter ${parameterName}:`, error);
    throw error;
  }
};

/**
 * Analyze a report with user profile
 */
export const analyzeReport = async (reportId, userProfile = null) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_URL}/parameters/analyze`,
      {
        reportId,
        userProfile,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error analyzing report:", error);
    throw error;
  }
};

/**
 * Seed parameter references (admin only)
 */
export const seedParameters = async () => {
  try {
    const response = await axios.post(`${API_URL}/parameters/seed`);
    return response.data;
  } catch (error) {
    console.error("Error seeding parameters:", error);
    throw error;
  }
};

/**
 * Get parameter categories
 */
export const getParameterCategories = () => {
  return [
    "CBC",
    "Lipid Profile",
    "Liver Function",
    "Kidney Function",
    "Thyroid Function",
    "Blood Sugar",
    "Electrolytes",
    "Vitamins",
    "Other",
  ];
};

/**
 * Format parameter analysis for display
 */
export const formatParameterAnalysis = (parameter) => {
  if (!parameter.analysis) return null;

  const { status, severity, isOptimal, range, reason, recommendations } =
    parameter.analysis;

  return {
    name: parameter.name,
    value: parameter.value,
    unit: parameter.unit,
    status,
    severity,
    isOptimal,
    range: range ? `${range.min} - ${range.max}` : "N/A",
    optimalRange: range?.optimal
      ? `${range.optimal.min} - ${range.optimal.max}`
      : null,
    statusColor: getStatusColor(status, severity),
    statusIcon: getStatusIcon(status, severity),
    message:
      reason ||
      (status === "normal" ? "Within normal range" : "No analysis available"),
    recommendations: recommendations || [],
    requiresAttention: severity === "critical" || severity === "abnormal",
  };
};

/**
 * Get color based on status and severity
 */
const getStatusColor = (status, severity) => {
  if (severity === "critical") return "red";
  if (status === "normal") return "green";
  if (status === "high" || status === "low") return "yellow";
  return "gray";
};

/**
 * Get icon based on status and severity
 */
const getStatusIcon = (status, severity) => {
  if (severity === "critical") return "⚠️";
  if (status === "normal") return "✓";
  if (status === "high") return "↑";
  if (status === "low") return "↓";
  return "?";
};

/**
 * Format pattern analysis for display
 */
export const formatPatternAnalysis = (patterns) => {
  return patterns.map((pattern) => ({
    name: pattern.name,
    severity: pattern.severity,
    description: pattern.description,
    affectedParameters: pattern.affectedParameters,
    recommendations: pattern.recommendations,
    severityColor: pattern.severity === "critical" ? "red" : "yellow",
    icon: pattern.severity === "critical" ? "🚨" : "⚠️",
  }));
};

/**
 * Format trend analysis for display
 */
export const formatTrendAnalysis = (trends) => {
  return trends.map((trend) => ({
    parameter: trend.parameter,
    direction: trend.direction,
    changePercent: trend.changePercent,
    previousValue: trend.previousValue,
    currentValue: trend.currentValue,
    isConcerning: trend.isConcerning,
    message: trend.message,
    trendIcon: trend.direction === "increased" ? "📈" : "📉",
    trendColor: trend.isConcerning ? "red" : "blue",
  }));
};

export default {
  getAllParameters,
  getParameterReference,
  analyzeReport,
  seedParameters,
  getParameterCategories,
  formatParameterAnalysis,
  formatPatternAnalysis,
  formatTrendAnalysis,
};
