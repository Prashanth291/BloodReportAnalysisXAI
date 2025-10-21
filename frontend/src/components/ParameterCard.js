import React, { useState } from "react";
import { getParameterInsight, getSeverityColor } from "../utils/parameterInsights";

const ParameterCard = ({ parameter }) => {
  const [showInsight, setShowInsight] = useState(false);
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          badge: "bg-green-100 text-green-800",
          icon: "text-green-600",
        };
      case "high":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
          icon: "text-red-600",
        };
      case "low":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
          icon: "text-yellow-600",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          icon: "text-gray-600",
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return (
          <svg
            className="w-5 h-5"
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
        );
      case "high":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        );
      case "low":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        );
    }
  };

  const getTrendIcon = (current, previous) => {
    if (!previous) return null;

    const currentVal = parseFloat(current.value);
    const previousVal = parseFloat(previous.value);

    if (isNaN(currentVal) || isNaN(previousVal)) return null;

    if (currentVal > previousVal) {
      return (
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 text-red-500 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <span>+{(currentVal - previousVal).toFixed(1)}</span>
        </div>
      );
    } else if (currentVal < previousVal) {
      return (
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 text-green-500 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <span>{(currentVal - previousVal).toFixed(1)}</span>
        </div>
      );
    }

    return <div className="text-sm text-gray-400">No change</div>;
  };

  const colors = getStatusColor(parameter.status);
  
  // Get health insight for abnormal parameters
  const insight = parameter.status !== 'normal' && parameter.status !== 'unknown' 
    ? getParameterInsight(parameter.name, parameter.status, parameter.value, parameter.referenceRange)
    : null;

  return (
    <div
      className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {parameter.name}
          </h3>
          {parameter.category && (
            <p className="text-xs text-gray-500">{parameter.category}</p>
          )}
        </div>
        <div className={`${colors.icon}`}>
          {getStatusIcon(parameter.status)}
        </div>
      </div>

      {/* Value */}
      <div className="mb-4">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">
            {parameter.value}
          </span>
          {parameter.unit && (
            <span className="ml-2 text-lg text-gray-600">{parameter.unit}</span>
          )}
        </div>

        {/* Trend vs Previous */}
        {parameter.previous && (
          <div className="mt-2">
            {getTrendIcon(parameter, parameter.previous)}
          </div>
        )}
      </div>

      {/* Reference Range */}
      {parameter.referenceRange && parameter.referenceRange.range && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            Normal:{" "}
            <span className="font-medium">
              {parameter.referenceRange.range}
            </span>
          </p>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}
        >
          {parameter.status
            ? parameter.status.charAt(0).toUpperCase() +
              parameter.status.slice(1)
            : "Unknown"}
        </span>

        {/* Visual Range Indicator */}
        {parameter.referenceRange &&
          parameter.referenceRange.min &&
          parameter.referenceRange.max && (
            <div className="flex-1 ml-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                {(() => {
                  const val = parseFloat(parameter.value);
                  const min = parseFloat(parameter.referenceRange.min);
                  const max = parseFloat(parameter.referenceRange.max);

                  if (isNaN(val) || isNaN(min) || isNaN(max)) return null;

                  const range = max - min;
                  const position = ((val - min) / range) * 100;
                  const clampedPosition = Math.max(0, Math.min(100, position));

                  return (
                    <div
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${clampedPosition}%` }}
                    />
                  );
                })()}
              </div>
            </div>
          )}
      </div>

      {/* Health Insight Section - Show for abnormal parameters */}
      {insight && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowInsight(!showInsight)}
            className="flex items-center justify-between w-full text-left focus:outline-none"
          >
            <span className="text-sm font-semibold text-gray-700 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
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
              What does this mean?
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                showInsight ? "rotate-180" : ""
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

          {/* Expandable Insight Content */}
          {showInsight && (
            <div className="mt-3 space-y-3 animate-fadeIn">
              {/* Alert Message */}
              <div className={`p-3 rounded-lg border ${getSeverityColor(insight.severity).bg} ${getSeverityColor(insight.severity).border}`}>
                <div className="flex items-start">
                  <svg
                    className={`w-5 h-5 mr-2 mt-0.5 ${getSeverityColor(insight.severity).icon} flex-shrink-0`}
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
                  <div>
                    <p className={`font-semibold text-sm ${getSeverityColor(insight.severity).text}`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">Why is this important?</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {insight.explanation}
                </p>
              </div>

              {/* Recommendations */}
              {insight.recommendations && insight.recommendations.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
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
                    Recommended Actions:
                  </h4>
                  <ul className="space-y-1.5">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-800 flex items-start">
                        <span className="mr-2 text-blue-600 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <p className="text-xs text-gray-600 italic">
                  ⚕️ This information is for educational purposes only. Always consult your healthcare provider for medical advice.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParameterCard;
