import ParameterReference from "../models/ParameterReference.js";

/**
 * Analyze a single parameter against reference ranges
 */
const analyzeParameter = async (parameter, userProfile) => {
  try {
    // Find the parameter reference in database
    const paramRef = await ParameterReference.findOne({
      parameterName: parameter.name,
      isActive: true,
    });

    if (!paramRef) {
      return {
        ...parameter,
        status: "unknown",
        analysis: {
          message: "No reference data available for this parameter",
          severity: "unknown",
        },
      };
    }

    // Analyze the value
    const analysis = paramRef.analyzeValue(parameter.value, userProfile);

    return {
      ...parameter,
      analysis,
    };
  } catch (error) {
    console.error("Error analyzing parameter:", error);
    return {
      ...parameter,
      status: "error",
      analysis: {
        message: "Error analyzing parameter",
        severity: "unknown",
      },
    };
  }
};

/**
 * Analyze all parameters in a report
 */
const analyzeReport = async (parameters, userProfile) => {
  const analyzedParameters = await Promise.all(
    parameters.map((param) => analyzeParameter(param, userProfile))
  );

  // Generate summary statistics
  const summary = {
    total: analyzedParameters.length,
    normal: 0,
    abnormal: 0,
    critical: 0,
    unknown: 0,
    abnormalParameters: [],
    criticalParameters: [],
  };

  analyzedParameters.forEach((param) => {
    if (param.analysis) {
      if (param.analysis.severity === "critical") {
        summary.critical++;
        summary.criticalParameters.push(param);
      } else if (
        param.analysis.status !== "normal" &&
        param.analysis.status !== "unknown"
      ) {
        summary.abnormal++;
        summary.abnormalParameters.push(param);
      } else if (param.analysis.status === "normal") {
        summary.normal++;
      } else {
        summary.unknown++;
      }
    }
  });

  return {
    parameters: analyzedParameters,
    summary,
  };
};

/**
 * Get parameter reference by name
 */
const getParameterReference = async (parameterName) => {
  return await ParameterReference.findOne({
    parameterName,
    isActive: true,
  });
};

/**
 * Get all parameter references
 */
const getAllParameterReferences = async (category = null) => {
  const query = { isActive: true };
  if (category) {
    query.category = category;
  }
  return await ParameterReference.find(query).sort({ parameterName: 1 });
};

/**
 * Detect patterns across multiple parameters
 */
const detectPatterns = (analyzedParameters) => {
  const patterns = [];

  // Pattern: Metabolic Syndrome
  const glucose = analyzedParameters.find((p) =>
    p.name.toLowerCase().includes("glucose")
  );
  const cholesterol = analyzedParameters.find((p) =>
    p.name.toLowerCase().includes("cholesterol")
  );
  const triglycerides = analyzedParameters.find((p) =>
    p.name.toLowerCase().includes("triglycerides")
  );

  if (
    glucose?.analysis?.status === "high" &&
    (cholesterol?.analysis?.status === "high" ||
      triglycerides?.analysis?.status === "high")
  ) {
    patterns.push({
      name: "Metabolic Syndrome Risk",
      severity: "warning",
      description: "Multiple parameters suggest metabolic syndrome risk",
      affectedParameters: [
        glucose.name,
        cholesterol?.name,
        triglycerides?.name,
      ].filter(Boolean),
      recommendations: [
        "Consult with your doctor about metabolic syndrome",
        "Consider lifestyle modifications: diet and exercise",
        "Regular monitoring of blood sugar and lipid levels",
      ],
    });
  }

  // Pattern: Anemia
  const hemoglobin = analyzedParameters.find((p) =>
    p.name.toLowerCase().includes("hemoglobin")
  );
  const iron = analyzedParameters.find((p) =>
    p.name.toLowerCase().includes("iron")
  );
  const ferritin = analyzedParameters.find((p) =>
    p.name.toLowerCase().includes("ferritin")
  );

  if (
    hemoglobin?.analysis?.status === "low" &&
    (iron?.analysis?.status === "low" || ferritin?.analysis?.status === "low")
  ) {
    patterns.push({
      name: "Iron Deficiency Anemia",
      severity: "warning",
      description:
        "Low hemoglobin with low iron stores suggests iron deficiency anemia",
      affectedParameters: [hemoglobin.name, iron?.name, ferritin?.name].filter(
        Boolean
      ),
      recommendations: [
        "Consult your doctor about iron supplementation",
        "Increase iron-rich foods: spinach, red meat, lentils",
        "Check for sources of blood loss",
      ],
    });
  }

  // Pattern: Kidney Dysfunction
  const creatinine = analyzedParameters.find((p) =>
    p.name.toLowerCase().includes("creatinine")
  );
  const urea = analyzedParameters.find((p) =>
    p.name.toLowerCase().includes("urea")
  );

  if (
    creatinine?.analysis?.status === "high" &&
    urea?.analysis?.status === "high"
  ) {
    patterns.push({
      name: "Kidney Function Concern",
      severity: "critical",
      description:
        "Elevated kidney function markers require immediate medical attention",
      affectedParameters: [creatinine.name, urea?.name].filter(Boolean),
      recommendations: [
        "Consult a nephrologist immediately",
        "Stay well hydrated",
        "Avoid nephrotoxic medications without doctor approval",
      ],
    });
  }

  return patterns;
};

/**
 * Compare with previous report and detect trends
 */
const analyzeTrends = (currentParams, previousParams) => {
  const trends = [];

  currentParams.forEach((currentParam) => {
    const previousParam = previousParams.find(
      (p) => p.name === currentParam.name
    );

    if (previousParam && currentParam.analysis && previousParam.analysis) {
      const currentValue = parseFloat(currentParam.value);
      const previousValue = parseFloat(previousParam.value);

      if (!isNaN(currentValue) && !isNaN(previousValue)) {
        const change = ((currentValue - previousValue) / previousValue) * 100;

        // Significant change threshold: 10%
        if (Math.abs(change) >= 10) {
          const direction = change > 0 ? "increased" : "decreased";
          const isConcerning =
            (change > 0 && currentParam.analysis.status === "high") ||
            (change < 0 && currentParam.analysis.status === "low");

          trends.push({
            parameter: currentParam.name,
            direction,
            changePercent: change.toFixed(1),
            previousValue,
            currentValue,
            isConcerning,
            message: `${currentParam.name} has ${direction} by ${Math.abs(
              change
            ).toFixed(1)}%`,
          });
        }
      }
    }
  });

  return trends;
};

export {
  analyzeParameter,
  analyzeReport,
  getParameterReference,
  getAllParameterReferences,
  detectPatterns,
  analyzeTrends,
};
