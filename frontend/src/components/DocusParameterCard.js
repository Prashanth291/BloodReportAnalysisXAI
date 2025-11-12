import React, { useState, useEffect } from "react";
import { getParameterInterpretation } from "../utils/parameterInterpretations";
import { getXAIInterpretation } from "../services/xaiService";

const DocusParameterCard = ({ parameter, allParameters = [], patientProfile = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis"); // 'analysis' or 'indicators'
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get status color scheme matching Docus.ai
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return {
          color: "text-teal-600",
          bg: "bg-teal-50",
          border: "border-teal-200",
          dot: "bg-teal-500",
          label: "Normal",
        };
      case "high":
        return {
          color: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-200",
          dot: "bg-orange-500",
          label: "Abnormal",
        };
      case "low":
        return {
          color: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-200",
          dot: "bg-orange-500",
          label: "Abnormal",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          dot: "bg-gray-500",
          label: "N/A",
        };
    }
  };

  const statusConfig = getStatusConfig(parameter.status);

  // Helper function to convert parameters to Flask format
  const convertParametersToFlaskFormat = () => {
    const paramMap = {
      "Hemoglobin": "hemoglobin_g_dL",
      "WBC Count": "wbc_10e9_L",
      "Platelet Count": "platelet_count",
      "RDW": "rdw_percent",
      "Neutrophils": "neutrophils_percent",
      "Lymphocytes": "lymphocytes_percent",
      "Monocytes": "monocytes_percent",
      "Eosinophils": "eosinophils_percent",
      "Basophils": "basophils_percent",
      "RBC Count": "rbc_count",
      "MCV": "mcv_fL",
      "MCH": "mch_pg",
      "MCHC": "mchc_g_dL",
    };

    const otherParams = {};
    allParameters.forEach((param) => {
      const flaskKey = paramMap[param.name];
      if (flaskKey && param.value) {
        // Convert value to number, handling units
        let numValue = parseFloat(param.value);
        
        // Special handling for WBC if given in cells/cu mm (need to convert to 10^9/L)
        if (flaskKey === "wbc_10e9_L" && numValue > 1000) {
          numValue = numValue / 1000; // Convert cells/cu mm to 10^9/L
        }
        
        // Special handling for Platelet if given in cells/cu mm (need to convert to 10^9/L for some calculations)
        // But keep as is since the model was trained with count values
        
        otherParams[flaskKey] = numValue;
      }
    });

    return otherParams;
  };

  // Caching: Use a simple in-memory cache (could be replaced with localStorage or backend cache)
  const cacheKey = `${parameter.name}|${parameter.status}|${
    parameter.value
  }|${JSON.stringify(parameter.referenceRange)}|${JSON.stringify(allParameters.map(p => p.value))}`;
  const cache =
    window.__xaiInterpretationCache || (window.__xaiInterpretationCache = {});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    // Check cache first
    if (cache[cacheKey]) {
      setInterpretation(cache[cacheKey]);
      setLoading(false);
      return;
    }
    // Fetch from Flask XAI API
    getXAIInterpretation({
      parameterName: parameter.name,
      value: parameter.value,
      status: parameter.status,
      referenceRange: parameter.referenceRange,
      otherParameters: convertParametersToFlaskFormat(),
      patientProfile: patientProfile,
      shap: true,
      token: "dev-secret-token",
    })
      .then((data) => {
        if (isMounted) {
          // mark source as XAI
          try {
            data.source = data.source || 'xai';
          } catch (e) {}
          setInterpretation(data);
          cache[cacheKey] = data;
        }
      })
      .catch((err) => {
        // Fallback to local logic if API fails
        if (isMounted) {
          setError("XAI service unavailable, using local interpretation.");
          const localInterp = getParameterInterpretation(
            parameter.name,
            parameter.status,
            parameter.value,
            parameter.referenceRange
          );
          // mark source as local so UI can indicate fallback
          try {
            localInterp.source = 'local';
          } catch (e) {}
          setInterpretation(localInterp);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  // Calculate position on range bar
  const calculateBarPosition = () => {
    if (!parameter.referenceRange) return 50;

    const value = parseFloat(parameter.value);
    let min, max;

    if (typeof parameter.referenceRange === "object") {
      min = parseFloat(parameter.referenceRange.min);
      max = parseFloat(parameter.referenceRange.max);
    } else if (typeof parameter.referenceRange === "string") {
      const match = parameter.referenceRange.match(
        /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/
      );
      if (match) {
        min = parseFloat(match[1]);
        max = parseFloat(match[2]);
      }
    }

    if (isNaN(value) || isNaN(min) || isNaN(max)) return 50;

    // Calculate percentage position
    const range = max - min;
    const position = ((value - min) / range) * 100;

    // Clamp between 0 and 100, but allow slight overflow for visual effect
    return Math.max(0, Math.min(100, position));
  };

  const barPosition = calculateBarPosition();

  // Format reference range for display
  const formatReferenceRange = () => {
    if (!parameter.referenceRange) return "Not specified";

    if (typeof parameter.referenceRange === "object") {
      return (
        parameter.referenceRange.range ||
        `${parameter.referenceRange.min}-${parameter.referenceRange.max} ${
          parameter.unit || ""
        }`
      );
    }
    return parameter.referenceRange;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
      {/* Main Card Content - Always Visible */}
      <div className="p-6">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          {/* Parameter Name */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {parameter.name}
            </h3>
            {/* Source badge - shows if interpretation came from XAI or local fallback */}
            {interpretation && interpretation.source && (
              <div className="mt-1">
                <span className="text-xs inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  {interpretation.source === 'xai' ? 'XAI interpretation' : 'Local interpretation (fallback)'}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status:</span>
              <span
                className={`flex items-center text-sm font-medium ${statusConfig.color}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${statusConfig.dot} mr-1.5`}
                ></span>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Value */}
          <div className="text-right">
            <div className="flex items-baseline justify-end">
              <span className={`text-2xl font-bold ${statusConfig.color}`}>
                {parameter.value}
              </span>
              {parameter.unit && (
                <span className="ml-1 text-base text-gray-600">
                  {parameter.unit}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Normal Range */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Normal Range:</span>
            <span className="text-gray-900 font-medium">
              {formatReferenceRange()}
            </span>
          </div>

          {/* Visual Range Bar */}
          <div className="relative">
            {/* Background bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              {/* Normal range indicator (green section) */}
              <div className="h-full bg-teal-100 absolute inset-0"></div>
            </div>

            {/* Current value indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
              style={{ left: `${barPosition}%` }}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 border-white ${statusConfig.dot} shadow-md`}
              ></div>
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span>
            {isExpanded ? "Hide Details" : "View Analysis & Insights"}
          </span>
          {/* Triangle Icon */}
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Expandable Section - Detailed Analysis */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 animate-fade-in-up">
          <div className="p-6 space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "analysis"
                    ? "text-white bg-primary-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Analysis & Insights
              </button>
              <button
                onClick={() => setActiveTab("indicators")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === "indicators"
                    ? "text-white bg-primary-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Indicators
              </button>
            </div>

            {/* Loading/Error State */}
            {loading && (
              <div className="text-center py-8 text-gray-500">
                Loading XAI interpretation...
              </div>
            )}
            {error && (
              <div className="text-center py-2 text-orange-600 text-sm">
                {error}
              </div>
            )}

            {/* Only render content if interpretation is available */}
            {interpretation && activeTab === "analysis" && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  Screening Interpretation
                </h4>

                {/* Introduction */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                    Introduction
                  </h5>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {interpretation.introduction}
                  </p>
                </div>

                {/* General Interpretation */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <h5 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                    General Interpretation
                  </h5>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {interpretation.generalInterpretation}
                  </p>

                  {/* Detailed Explanation */}
                  {interpretation.detailedExplanation && (
                    <div className="space-y-2">
                      {interpretation.detailedExplanation.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 mr-2 flex-shrink-0"></span>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            <strong className="font-semibold text-gray-900">
                              {item.label}:
                            </strong>{" "}
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Abnormal Findings (if applicable) */}
                {parameter.status !== "normal" &&
                  interpretation.abnormalFindings && (
                    <div
                      className={`rounded-lg p-4 mb-4 border ${statusConfig.bg} ${statusConfig.border}`}
                    >
                      <h5
                        className="text-xs font-semibold uppercase mb-3 flex items-center"
                        style={{
                          color: statusConfig.color.replace("text-", ""),
                        }}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Abnormal Findings
                      </h5>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {interpretation.abnormalFindings.primaryFinding}
                      </p>

                      {/* Potential Causes */}
                      {interpretation.abnormalFindings.potentialCauses && (
                        <div className="mt-3">
                          <h6 className="text-xs font-semibold text-gray-700 mb-2">
                            Potential Causes:
                          </h6>
                          <ul className="space-y-1">
                            {interpretation.abnormalFindings.potentialCauses.map(
                              (cause, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-sm text-gray-700"
                                >
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 mr-2 flex-shrink-0"></span>
                                  <span>{cause}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Disease Conditions */}
                      {interpretation.abnormalFindings.diseaseConditions && (
                        <div className="mt-3">
                          <h6 className="text-xs font-semibold text-gray-700 mb-2">
                            Associated Conditions:
                          </h6>
                          <ul className="space-y-1">
                            {interpretation.abnormalFindings.diseaseConditions.map(
                              (condition, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-sm text-gray-700"
                                >
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-2 mr-2 flex-shrink-0"></span>
                                  <span>{condition}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                {/* Recommendations */}
                {interpretation.recommendations &&
                  interpretation.recommendations.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="text-xs font-semibold text-blue-900 mb-3 uppercase flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Recommended Actions
                      </h5>
                      <ul className="space-y-2">
                        {interpretation.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-blue-900"
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2 flex-shrink-0"></span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-xs text-yellow-800 flex items-start">
                    <svg
                      className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      <strong>
                        ⚠️ This AI-generated analysis is for informational
                        purposes only and may contain errors.
                      </strong>{" "}
                      It is not a diagnosis or prescription. Please consult a
                      doctor before making any decisions.
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Indicators Tab Content */}
            {activeTab === "indicators" && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Parameter Indicators
                </h4>

                {/* SHAP/Feature Importance Visualization */}
                {interpretation &&
                  interpretation.shap_values &&
                  interpretation.feature_names && (
                    <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
                      <h5 className="text-xs font-semibold text-purple-700 mb-3 uppercase flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        XAI Feature Importance (SHAP)
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr>
                              <th className="text-left py-1 px-2">Feature</th>
                              <th className="text-left py-1 px-2">
                                SHAP Value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {interpretation.feature_names.map((name, idx) => (
                              <tr key={name}>
                                <td className="py-1 px-2 font-medium text-gray-900">
                                  {name}
                                </td>
                                <td className="py-1 px-2 text-gray-700">
                                  {interpretation.shap_values[idx]?.toFixed(3)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Current Value Card */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase">
                      Current Value
                    </h5>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-baseline mb-2">
                    <span
                      className={`text-3xl font-bold ${statusConfig.color}`}
                    >
                      {parameter.value}
                    </span>
                    {parameter.unit && (
                      <span className="ml-2 text-lg text-gray-600">
                        {parameter.unit}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Normal Range:{" "}
                    <span className="font-semibold text-gray-900">
                      {formatReferenceRange()}
                    </span>
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <h5 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                    Status Indicator
                  </h5>
                  <div className="space-y-3">
                    {/* Visual bar with zones */}
                    <div className="relative h-8 bg-gradient-to-r from-yellow-200 via-teal-200 to-yellow-200 rounded-lg overflow-hidden">
                      {/* Low zone */}
                      <div className="absolute left-0 w-1/3 h-full bg-yellow-100 opacity-50"></div>
                      {/* Normal zone */}
                      <div className="absolute left-1/3 w-1/3 h-full bg-teal-100 opacity-50"></div>
                      {/* High zone */}
                      <div className="absolute right-0 w-1/3 h-full bg-orange-100 opacity-50"></div>

                      {/* Current position marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-gray-800 transition-all duration-300"
                        style={{ left: `${barPosition}%` }}
                      >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-800"></div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-gray-800"></div>
                      </div>
                    </div>

                    {/* Zone labels */}
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Low</span>
                      <span className="font-semibold text-teal-600">
                        Normal
                      </span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                {/* Parameter Details */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h5 className="text-xs font-semibold text-gray-500 mb-3 uppercase">
                    Parameter Details
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Test Name</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {parameter.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Current Value
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {parameter.value} {parameter.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Reference Range
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatReferenceRange()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Status</span>
                      <span
                        className={`text-sm font-semibold ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    {parameter.category && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Category</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {parameter.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Significance */}
                {parameter.status !== "normal" && (
                  <div
                    className={`mt-4 rounded-lg p-4 border ${statusConfig.bg} ${statusConfig.border}`}
                  >
                    <h5
                      className="text-xs font-semibold uppercase mb-2 flex items-center"
                      style={{ color: statusConfig.color.replace("text-", "") }}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Clinical Significance
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Your {parameter.name} level is{" "}
                      <strong>{parameter.status}</strong>, which requires
                      medical attention. Please consult your healthcare provider
                      to discuss this result and determine appropriate next
                      steps.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocusParameterCard;
