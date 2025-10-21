import mongoose from "mongoose";

const parameterReferenceSchema = new mongoose.Schema(
  {
    parameterName: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
    },
    alternateUnits: [
      {
        unit: String,
        conversionFactor: Number, // Multiply by this to convert to standard unit
      },
    ],
    category: {
      type: String,
      enum: [
        "CBC",
        "Lipid Profile",
        "Liver Function",
        "Kidney Function",
        "Thyroid Function",
        "Blood Sugar",
        "Electrolytes",
        "Vitamins",
        "Other",
      ],
      default: "Other",
    },
    ranges: [
      {
        gender: {
          type: String,
          enum: ["male", "female", "any"],
          default: "any",
        },
        ageMin: {
          type: Number,
          default: 0,
        },
        ageMax: {
          type: Number,
          default: 120,
        },
        condition: {
          type: String,
          default: "normal",
        }, // 'normal', 'pregnant', 'diabetic', 'hypertensive', etc.
        ethnicity: {
          type: String,
          default: "general",
        },
        min: {
          type: Number,
          required: true,
        },
        max: {
          type: Number,
          required: true,
        },
        optimal: {
          min: Number,
          max: Number,
        },
        critical: {
          min: Number, // Below this is critical
          max: Number, // Above this is critical
        },
      },
    ],
    reasons: {
      high: {
        type: String,
        required: true,
      },
      low: {
        type: String,
        required: true,
      },
      criticalHigh: String,
      criticalLow: String,
    },
    recommendations: {
      high: [String],
      low: [String],
      critical: [String],
    },
    clinicalSignificance: {
      type: String,
      default: "",
    },
    relatedParameters: [String], // Parameters that should be checked together
    testFrequency: {
      normal: String, // "Annually", "Every 6 months", etc.
      abnormal: String,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: "Medical guidelines",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
parameterReferenceSchema.index({ parameterName: 1 });
parameterReferenceSchema.index({ category: 1 });
parameterReferenceSchema.index({ isActive: 1 });

// Method to find applicable range for a user
parameterReferenceSchema.methods.getApplicableRange = function (userProfile) {
  const { age, gender, conditions = [], ethnicity = "general" } = userProfile;

  let bestMatch = null;
  let bestScore = 0;

  for (const range of this.ranges) {
    let score = 0;

    // Check age range
    if (age >= range.ageMin && age <= range.ageMax) {
      score += 3;
    } else {
      continue; // Skip if age doesn't match
    }

    // Check gender
    if (range.gender === gender) {
      score += 2;
    } else if (range.gender === "any") {
      score += 1;
    } else {
      continue; // Skip if gender doesn't match
    }

    // Check special conditions (pregnant, diabetic, etc.)
    if (conditions.includes(range.condition)) {
      score += 5; // Highest priority
    } else if (range.condition === "normal") {
      score += 1;
    } else {
      continue; // Skip if condition doesn't match
    }

    // Check ethnicity
    if (range.ethnicity === ethnicity) {
      score += 2;
    } else if (range.ethnicity === "general") {
      score += 1;
    }

    // Keep the best matching range
    if (score > bestScore) {
      bestScore = score;
      bestMatch = range;
    }
  }

  return bestMatch;
};

// Method to analyze a parameter value
parameterReferenceSchema.methods.analyzeValue = function (value, userProfile) {
  const range = this.getApplicableRange(userProfile);

  if (!range) {
    return {
      status: "unknown",
      message: "No reference range available for your profile",
      range: null,
      reason: null,
      recommendations: [],
    };
  }

  const numericValue = parseFloat(value);

  if (isNaN(numericValue)) {
    return {
      status: "invalid",
      message: "Invalid numeric value",
      range: range,
      reason: null,
      recommendations: [],
    };
  }

  let status;
  let severity = "normal";

  // Check critical ranges first
  if (range.critical) {
    if (numericValue < range.critical.min) {
      status = "low";
      severity = "critical";
    } else if (numericValue > range.critical.max) {
      status = "high";
      severity = "critical";
    }
  }

  // Check normal ranges
  if (!severity || severity === "normal") {
    if (numericValue < range.min) {
      status = "low";
      severity = "abnormal";
    } else if (numericValue > range.max) {
      status = "high";
      severity = "abnormal";
    } else {
      status = "normal";
      severity = "normal";
    }
  }

  // Check optimal range
  let isOptimal = false;
  if (range.optimal && status === "normal") {
    isOptimal =
      numericValue >= range.optimal.min && numericValue <= range.optimal.max;
  }

  // Get appropriate reason and recommendations
  let reason = null;
  let recommendations = [];

  if (status !== "normal") {
    if (severity === "critical") {
      reason =
        this.reasons[
          `critical${status.charAt(0).toUpperCase() + status.slice(1)}`
        ] || this.reasons[status];
      recommendations =
        this.recommendations.critical || this.recommendations[status] || [];
    } else {
      reason = this.reasons[status];
      recommendations = this.recommendations[status] || [];
    }
  }

  return {
    status,
    severity,
    isOptimal,
    value: numericValue,
    range: {
      min: range.min,
      max: range.max,
      optimal: range.optimal,
      critical: range.critical,
    },
    reason,
    recommendations,
    relatedParameters: this.relatedParameters,
    testFrequency:
      status === "normal"
        ? this.testFrequency.normal
        : this.testFrequency.abnormal,
  };
};

const ParameterReference = mongoose.model(
  "ParameterReference",
  parameterReferenceSchema
);

export default ParameterReference;
