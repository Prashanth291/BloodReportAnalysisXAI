import React from "react";

const ParameterCard = ({ parameter }) => {
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
    </div>
  );
};

export default ParameterCard;
