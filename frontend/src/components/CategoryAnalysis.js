import React from "react";

const CategoryAnalysis = ({ category, parameters }) => {
  const getCategoryHealth = () => {
    const total = parameters.length;
    const normal = parameters.filter((p) => p.status === "normal").length;
    const abnormal = total - normal;

    const percentage = (normal / total) * 100;

    if (percentage === 100)
      return { status: "Excellent", color: "green", icon: "✓" };
    if (percentage >= 75) return { status: "Good", color: "blue", icon: "○" };
    if (percentage >= 50) return { status: "Fair", color: "yellow", icon: "!" };
    return { status: "Needs Attention", color: "red", icon: "⚠" };
  };

  const getColorClasses = (color) => {
    const colors = {
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        badge: "bg-green-100 text-green-800",
        progress: "bg-green-500",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        badge: "bg-blue-100 text-blue-800",
        progress: "bg-blue-500",
      },
      yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        badge: "bg-yellow-100 text-yellow-800",
        progress: "bg-yellow-500",
      },
      red: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        badge: "bg-red-100 text-red-800",
        progress: "bg-red-500",
      },
    };
    return colors[color] || colors.blue;
  };

  const health = getCategoryHealth();
  const colors = getColorClasses(health.color);

  const normalCount = parameters.filter((p) => p.status === "normal").length;
  const highCount = parameters.filter((p) => p.status === "high").length;
  const lowCount = parameters.filter((p) => p.status === "low").length;
  const percentage = (normalCount / parameters.length) * 100;

  return (
    <div
      className={`${colors.bg} border-2 ${colors.border} rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{category}</h3>
          <p className="text-sm text-gray-600">
            {parameters.length} parameters
          </p>
        </div>
        <span className={`text-2xl ${colors.text}`}>{health.icon}</span>
      </div>

      {/* Health Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Health Score
          </span>
          <span className={`text-sm font-bold ${colors.text}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`${colors.progress} h-full transition-all duration-500 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}
        >
          {health.status}
        </span>
      </div>

      {/* Parameter Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{normalCount}</div>
          <div className="text-xs text-gray-600">Normal</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{highCount}</div>
          <div className="text-xs text-gray-600">High</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{lowCount}</div>
          <div className="text-xs text-gray-600">Low</div>
        </div>
      </div>

      {/* Abnormal Parameters List */}
      {(highCount > 0 || lowCount > 0) && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Abnormal Values:
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {parameters
              .filter((p) => p.status === "high" || p.status === "low")
              .map((param, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 font-medium">
                    {param.name}
                  </span>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">
                      {param.value} {param.unit}
                    </span>
                    {param.status === "high" ? (
                      <svg
                        className="w-4 h-4 text-red-500"
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
                    ) : (
                      <svg
                        className="w-4 h-4 text-yellow-500"
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
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {health.status !== "Excellent" && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {highCount > 0 &&
              lowCount > 0 &&
              "Some values are outside normal range. "}
            {highCount > 0 && lowCount === 0 && "Some values are elevated. "}
            {lowCount > 0 && highCount === 0 && "Some values are low. "}
            Consider consulting with your healthcare provider.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryAnalysis;
