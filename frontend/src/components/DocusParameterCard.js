import React, { useState, useEffect } from "react";
import { getParameterInterpretation } from "../utils/parameterInterpretations";
import { getXAIInterpretation } from "../services/xaiService";

const DocusParameterCard = ({ parameter, allParameters = [], patientProfile = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Enhanced status config with medical theme
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return {
          color: "text-emerald-600",
          bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
          border: "border-emerald-300",
          dot: "bg-emerald-500",
          label: "Normal",
          icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          ringColor: "ring-emerald-500/20",
        };
      case "high":
        return {
          color: "text-rose-600",
          bg: "bg-gradient-to-br from-rose-50 to-red-50",
          border: "border-rose-300",
          dot: "bg-rose-500",
          label: "Elevated",
          icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ),
          ringColor: "ring-rose-500/20",
        };
      case "low":
        return {
          color: "text-amber-600",
          bg: "bg-gradient-to-br from-amber-50 to-orange-50",
          border: "border-amber-300",
          dot: "bg-amber-500",
          label: "Below Range",
          icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          ),
          ringColor: "ring-amber-500/20",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gradient-to-br from-gray-50 to-slate-50",
          border: "border-gray-300",
          dot: "bg-gray-500",
          label: "N/A",
          icon: (props) => (
            <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          ringColor: "ring-gray-500/20",
        };
    }
  };

  const statusConfig = getStatusConfig(parameter.status);
  const StatusIcon = statusConfig.icon;

  // Helper function to convert parameters to Flask format
  const convertParametersToFlaskFormat = () => {
    const paramMap = {
      "Hemoglobin": "hemoglobin_g_dL",
      "Haemoglobin": "hemoglobin_g_dL",
      "Haemoglobin (Hb)": "hemoglobin_g_dL",
      "Hemoglobin (Hb)": "hemoglobin_g_dL",
      "Hb": "hemoglobin_g_dL",
      "WBC Count": "wbc_10e9_L",
      "Total WBC Count": "wbc_10e9_L",
      "WBC": "wbc_10e9_L",
      "White Blood Cell Count": "wbc_10e9_L",
      "Platelet Count": "platelet_count",
      "Platelets Count": "platelet_count",
      "Platelets": "platelet_count",
      "RBC Count": "rbc_count",
      "Total Red Cell Count (RBC)": "rbc_count",
      "Red Blood Cell Count": "rbc_count",
      "RBC": "rbc_count",
      "RDW": "rdw_percent",
      "Neutrophils": "neutrophils_percent",
      "Lymphocytes": "lymphocytes_percent",
      "Monocytes": "monocytes_percent",
      "Eosinophils": "eosinophils_percent",
      "Basophils": "basophils_percent",
      "MCV": "mcv_fL",
      "Mean Corpuscular Volume (MCV)": "mcv_fL",
      "MCH": "mch_pg",
      "Mean Corpuscular Haemoglobin (MCH)": "mch_pg",
      "Mean Corpuscular Hemoglobin (MCH)": "mch_pg",
      "MCHC": "mchc_g_dL",
      "Mean Corpuscular Haemoglobin Concentration (MCHC)": "mchc_g_dL",
      "Mean Corpuscular Hemoglobin Concentration (MCHC)": "mchc_g_dL",
    };

    const otherParams = {};
    allParameters.forEach((param) => {
      const flaskKey = paramMap[param.name];
      if (flaskKey && param.value) {
        let numValue = parseFloat(param.value);
        if (isNaN(numValue)) return;
        
        if (flaskKey === "wbc_10e9_L" && numValue > 1000) {
          numValue = numValue / 1000;
        }
        
        if (flaskKey === "platelet_count") {
          if (numValue < 10) {
            numValue = numValue * 100;
          } else if (numValue > 1000) {
            numValue = numValue / 1000;
          }
        }
        
        otherParams[flaskKey] = numValue;
      }
    });

    return otherParams;
  };

  const cacheKey = `${parameter.name}|${parameter.status}|${parameter.value}|${JSON.stringify(parameter.referenceRange)}|${JSON.stringify(allParameters.map(p => p.value))}`;
  const cache = window.__xaiInterpretationCache || (window.__xaiInterpretationCache = {});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    
    if (cache[cacheKey]) {
      setInterpretation(cache[cacheKey]);
      setLoading(false);
      return;
    }
    
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
          try {
            data.source = data.source || 'xai';
          } catch (e) {}
          setInterpretation(data);
          cache[cacheKey] = data;
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("XAI service unavailable, using local interpretation.");
          const localInterp = getParameterInterpretation(
            parameter.name,
            parameter.status,
            parameter.value,
            parameter.referenceRange
          );
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
  }, [cacheKey]);

  const calculateBarPosition = () => {
    if (!parameter.referenceRange) return 50;

    const value = parseFloat(parameter.value);
    let min, max;

    if (typeof parameter.referenceRange === "object") {
      min = parseFloat(parameter.referenceRange.min);
      max = parseFloat(parameter.referenceRange.max);
    } else if (typeof parameter.referenceRange === "string") {
      const match = parameter.referenceRange.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
      if (match) {
        min = parseFloat(match[1]);
        max = parseFloat(match[2]);
      }
    }

    if (isNaN(value) || isNaN(min) || isNaN(max)) return 50;

    const range = max - min;
    const position = ((value - min) / range) * 100;

    return Math.max(0, Math.min(100, position));
  };

  const barPosition = calculateBarPosition();

  const formatReferenceRange = () => {
    if (!parameter.referenceRange) return "Not specified";

    if (typeof parameter.referenceRange === "object") {
      return parameter.referenceRange.range || `${parameter.referenceRange.min}-${parameter.referenceRange.max} ${parameter.unit || ""}`;
    }
    return parameter.referenceRange;
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl hover:shadow-2xl hover:border-blue-300 transition-all duration-300 overflow-hidden">
      {/* Main Card Content */}
      <div className="p-6 bg-gradient-to-br from-white to-gray-50">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-5">
          {/* Parameter Name with Icon */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${statusConfig.bg} border ${statusConfig.border} shadow-sm`}>
                <svg className={`w-5 h-5 ${statusConfig.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {parameter.name}
                </h3>
                {interpretation && interpretation.source && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {interpretation.source === 'xai' ? (
                      <>
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="text-xs font-medium text-purple-600">AI-Powered Analysis</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-500">Standard Analysis</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-14">
              <span className="text-sm text-gray-500 font-medium">Status:</span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bg} border ${statusConfig.border} shadow-sm`}>
                <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.color}`} />
                <span className={`text-sm font-semibold ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Value Display */}
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className={`text-4xl font-bold ${statusConfig.color} tabular-nums tracking-tight`}>
                {parameter.value}
              </span>
              {parameter.unit && (
                <span className="text-lg text-gray-600 font-medium">
                  {parameter.unit}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Range Display */}
        <div className="mb-5 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0-6C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
              <span className="text-gray-600 font-medium">Reference Range:</span>
            </div>
            <span className="text-gray-900 font-bold">
              {formatReferenceRange()}
            </span>
          </div>

          {/* Enhanced Visual Range Bar */}
          <div className="relative">
            <div className="h-3 bg-gradient-to-r from-amber-200 via-emerald-200 to-amber-200 rounded-full overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-emerald-100 opacity-50"></div>
            </div>

            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
              style={{ left: `${barPosition}%` }}
            >
              <div className={`relative ${statusConfig.ringColor} ring-4`}>
                <div className={`w-5 h-5 rounded-full border-3 border-white ${statusConfig.dot} shadow-lg`}></div>
                <div className={`absolute inset-0 w-5 h-5 rounded-full ${statusConfig.dot} animate-ping opacity-20`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-sm py-3.5 px-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group"
        >
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>{isExpanded ? "Hide Detailed Analysis" : "View AI-Powered Insights"}</span>
          <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
          <div className="p-6 space-y-6">
            {/* Enhanced Tabs */}
            <div className="flex gap-2 bg-white p-1.5 rounded-xl border-2 border-gray-200 shadow-sm">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === "analysis"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Clinical Analysis
              </button>
              <button
                onClick={() => setActiveTab("indicators")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === "indicators"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Indicators
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0"></div>
                </div>
                <p className="text-gray-600 font-medium">Analyzing with AI...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-800">{error}</p>
              </div>
            )}

            {/* Analysis Tab */}
            {interpretation && activeTab === "analysis" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Clinical Interpretation
                  </h4>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-xl p-5 border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                      Overview
                    </h5>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {interpretation.introduction}
                  </p>
                </div>

                {/* General Interpretation */}
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                      Detailed Interpretation
                    </h5>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {interpretation.generalInterpretation}
                  </p>

                  {interpretation.detailedExplanation && (
                    <div className="space-y-3">
                      {interpretation.detailedExplanation.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            <strong className="font-bold text-gray-900">{item.label}:</strong>{" "}
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Abnormal Findings */}
                {parameter.status !== "normal" && interpretation.abnormalFindings && (
                  <div className={`rounded-xl p-5 border-2 ${statusConfig.border} ${statusConfig.bg} shadow-md`}>
                    <div className="flex items-center gap-2 mb-3">
                      <svg className={`w-5 h-5 ${statusConfig.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h5 className={`text-xs font-bold uppercase tracking-wide ${statusConfig.color}`}>
                        Abnormal Findings
                      </h5>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed mb-4 font-medium">
                      {interpretation.abnormalFindings.primaryFinding}
                    </p>

                    {interpretation.abnormalFindings.potentialCauses && (
                      <div className="mb-4">
                        <h6 className="text-xs font-bold text-gray-800 mb-3 uppercase">Potential Causes:</h6>
                        <div className="space-y-2">
                          {interpretation.abnormalFindings.potentialCauses.map((cause, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-gray-700 bg-white bg-opacity-70 p-3 rounded-lg">
                              <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mt-2 flex-shrink-0`}></div>
                              <span>{cause}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {interpretation.abnormalFindings.diseaseConditions && (
                      <div>
                        <h6 className="text-xs font-bold text-gray-800 mb-3 uppercase">Associated Conditions:</h6>
                        <div className="space-y-2">
                          {interpretation.abnormalFindings.diseaseConditions.map((condition, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-gray-700 bg-white bg-opacity-70 p-3 rounded-lg">
                              <svg className={`w-4 h-4 ${statusConfig.color} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{condition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations */}
                {interpretation.recommendations && interpretation.recommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                        Recommended Actions
                      </h5>
                    </div>
                    <div className="space-y-2">
                      {interpretation.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm text-blue-900 bg-white bg-opacity-60 p-3 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Indicators Tab */}
            {activeTab === "indicators" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Parameter Indicators
                  </h4>
                </div>

                {/* SHAP Values */}
                {interpretation?.shap_values && interpretation?.feature_names && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border-2 border-purple-200 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <h5 className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                        XAI Feature Importance (SHAP)
                      </h5>
                    </div>
                    <div className="bg-white rounded-lg overflow-hidden border border-purple-200">
                      <table className="min-w-full">
                        <thead className="bg-purple-100">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs font-bold text-purple-900 uppercase">Feature</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-purple-900 uppercase">SHAP Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                          {interpretation.feature_names.map((name, idx) => (
                            <tr key={name} className="hover:bg-purple-50 transition-colors">
                              <td className="py-3 px-4 text-sm font-semibold text-gray-900">{name}</td>
                              <td className="py-3 px-4 text-sm text-gray-700 font-mono">{interpretation.shap_values[idx]?.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Current Value */}
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Value</h5>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border} shadow-sm`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-baseline mb-3">
                    <span className={`text-5xl font-bold ${statusConfig.color} tabular-nums`}>{parameter.value}</span>
                    {parameter.unit && <span className="ml-3 text-xl text-gray-600 font-medium">{parameter.unit}</span>}
                  </div>
                  <p className="text-sm text-gray-600">
                    Reference Range: <span className="font-bold text-gray-900">{formatReferenceRange()}</span>
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                  <h5 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide">Visual Range Indicator</h5>
                  <div className="space-y-4">
                    <div className="relative h-10 bg-gradient-to-r from-amber-200 via-emerald-200 to-rose-200 rounded-xl overflow-hidden shadow-inner">
                      <div className="absolute left-0 w-1/3 h-full bg-amber-100 opacity-40"></div>
                      <div className="absolute left-1/3 w-1/3 h-full bg-emerald-100 opacity-40"></div>
                      <div className="absolute right-0 w-1/3 h-full bg-rose-100 opacity-40"></div>

                      <div className="absolute top-0 bottom-0 w-1 bg-gray-900 transition-all duration-500" style={{ left: `${barPosition}%` }}>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-gray-900 shadow-lg"></div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-gray-900 shadow-lg"></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-amber-600">Below</span>
                      <span className="text-emerald-600">Normal Range</span>
                      <span className="text-rose-600">Above</span>
                    </div>
                  </div>
                </div>

                {/* Parameter Details */}
                <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                  <h5 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide">Clinical Details</h5>
                  <div className="space-y-3">
                    {[
                      { label: "Test Name", value: parameter.name },
                      { label: "Current Value", value: `${parameter.value} ${parameter.unit}` },
                      { label: "Reference Range", value: formatReferenceRange() },
                      { label: "Status", value: statusConfig.label, colored: true },
                      parameter.category && { label: "Category", value: parameter.category },
                    ].filter(Boolean).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                        <span className={`text-sm font-bold ${item.colored ? statusConfig.color : 'text-gray-900'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Significance */}
                {parameter.status !== "normal" && (
                  <div className={`rounded-xl p-5 border-2 ${statusConfig.border} ${statusConfig.bg} shadow-md`}>
                    <div className="flex items-center gap-2 mb-3">
                      <svg className={`w-5 h-5 ${statusConfig.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h5 className={`text-xs font-bold uppercase tracking-wide ${statusConfig.color}`}>
                        Clinical Significance
                      </h5>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      Your {parameter.name} level is <strong className="font-bold">{parameter.status}</strong>, which may require medical attention. 
                      Please consult your healthcare provider to discuss this result and determine appropriate next steps.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DocusParameterCard;