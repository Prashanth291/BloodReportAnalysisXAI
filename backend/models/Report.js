import mongoose from "mongoose";

// Sub-schema for individual blood parameters
const parameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Can be string or number
      required: true,
    },
    unit: {
      type: String,
    },
    referenceRange: {
      min: mongoose.Schema.Types.Mixed,
      max: mongoose.Schema.Types.Mixed,
      range: String, // e.g., "10-20" or "Negative"
    },
    status: {
      type: String,
      enum: ["normal", "high", "low", "abnormal", "unknown"],
      default: "unknown",
    },
    category: {
      type: String, // e.g., "Complete Blood Count", "Lipid Profile", etc.
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ["image/jpeg", "image/jpg", "image/png", "application/pdf"],
    },
    filePath: {
      type: String,
      required: true,
    },
    // Structured parameters array
    parameters: {
      type: [parameterSchema],
      default: [],
    },
    // Original extracted data (for backward compatibility)
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // AI analysis summary
    analysis: {
      summary: String,
      recommendations: [String],
      alerts: [String],
      overallHealth: {
        type: String,
        enum: ["excellent", "good", "fair", "poor", "unknown"],
        default: "unknown",
      },
    },
    rawText: {
      type: String,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ "parameters.name": 1 });
reportSchema.index({ "parameters.status": 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
