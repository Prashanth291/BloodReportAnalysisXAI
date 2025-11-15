import React from "react";

const CategoryAnalysis = ({ category, parameters }) => {
  const getCategoryHealth = () => {
    const total = parameters.length;
    const normal = parameters.filter((p) => p.status === "normal").length;

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
        bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
        border: "border-emerald-300",
        text: "text-emerald-700",
        badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        progress: "bg-gradient-to-r from-emerald-500 to-teal-500",
        glow: "shadow-emerald-100",
      },
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
        border: "border-blue-300",
        text: "text-blue-700",
        badge: "bg-blue-100 text-blue-800 border border-blue-200",
        progress: "bg-gradient-to-r from-blue-500 to-cyan-500",
        glow: "shadow-blue-100",
      },
      yellow: {
        bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
        border: "border-amber-300",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-800 border border-amber-200",
        progress: "bg-gradient-to-r from-amber-500 to-yellow-500",
        glow: "shadow-amber-100",
      },
      red: {
        bg: "bg-gradient-to-br from-red-50 to-rose-50",
        border: "border-red-300",
        text: "text-red-700",
        badge: "bg-red-100 text-red-800 border border-red-200",
        progress: "bg-gradient-to-r from-red-500 to-rose-500",
        glow: "shadow-red-100",
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

  const totalAbnormal = highCount + lowCount;

  return (
    <div
      className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${colors.glow} hover:scale-[1.02] backdrop-blur-sm`}
    >
      {/* Header with Medical Icon */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${colors.badge} shadow-sm`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">
              {category}
            </h3>
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600">
                {parameters.length} parameters analyzed
              </p>
            </div>
          </div>
        </div>
        <div className={`text-3xl ${colors.text} font-bold`}>
          {health.icon}
        </div>
      </div>

      {/* Health Score with Enhanced Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Health Score
          </span>
          <span className={`text-2xl font-bold ${colors.text} tabular-nums`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className={`${colors.progress} h-full transition-all duration-700 ease-out rounded-full relative overflow-hidden`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Status Badge with Icon */}
      <div className="mb-5">
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${colors.badge} shadow-sm`}
        >
          {health.status === "Excellent" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {health.status === "Needs Attention" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {health.status}
        </span>
      </div>

      {/* Enhanced Parameter Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-emerald-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mb-1 tabular-nums">
            {normalCount}
          </div>
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Normal
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-1 tabular-nums">
            {highCount}
          </div>
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Elevated
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-amber-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-amber-600 mb-1 tabular-nums">
            {lowCount}
          </div>
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Below Range
          </div>
        </div>
      </div>

      {/* Enhanced Abnormal Parameters List */}
      {totalAbnormal > 0 && (
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Abnormal Values ({totalAbnormal})
            </p>
          </div>
          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {parameters
              .filter((p) => p.status === "high" || p.status === "low")
              .map((param, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <span className="text-sm text-gray-800 font-medium">
                    {param.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-semibold tabular-nums">
                      {param.value} {param.unit}
                    </span>
                    {param.status === "high" ? (
                      <div className="p-1 bg-red-100 rounded-md">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    ) : (
                      <div className="p-1 bg-amber-100 rounded-md">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Enhanced Recommendations */}
      {health.status !== "Excellent" && (
        <div className="mt-5 p-4 bg-blue-50/70 backdrop-blur-sm border-l-4 border-blue-400 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Clinical Recommendation
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                {highCount > 0 &&
                  lowCount > 0 &&
                  "Multiple parameters are outside normal range. "}
                {highCount > 0 && lowCount === 0 && "Some values are elevated. "}
                {lowCount > 0 && highCount === 0 && "Some values are below range. "}
                Schedule a consultation with your healthcare provider for detailed assessment.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default CategoryAnalysis;