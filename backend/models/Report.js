import mongoose from "mongoose";

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
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
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

const Report = mongoose.model("Report", reportSchema);

export default Report;
