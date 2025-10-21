import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserReports } from "../services/analysisService";
import LoadingScreen from "../components/LoadingScreen";
import ParameterCard from "../components/ParameterCard";
import CategoryAnalysis from "../components/CategoryAnalysis";

const HealthDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [previousReport, setPreviousReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getUserReports();

      // Handle different response structures
      let reportsData = [];
      if (response?.data?.data) {
        reportsData = response.data.data;
      } else if (response?.data) {
        reportsData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        reportsData = response;
      }

      // Sort reports by date (newest first)
      const sortedReports = [...reportsData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setReports(sortedReports);
      setLatestReport(sortedReports[0] || null);
      setPreviousReport(sortedReports[1] || null);
    } catch (err) {
      console.error("Fetch reports error:", err);
      setError(err.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const getParameterFromReport = (report, paramName) => {
    if (!report || !report.parameters) return null;
    return report.parameters.find(
      (p) => p.name.toLowerCase() === paramName.toLowerCase()
    );
  };

  const getKeyParameters = () => {
    if (!latestReport) return [];

    const keyParams = [
      "Hemoglobin",
      "WBC",
      "Platelets",
      "Cholesterol",
      "Glucose",
      "Creatinine",
    ];

    return keyParams
      .map((name) => {
        const current = getParameterFromReport(latestReport, name);
        const previous = previousReport
          ? getParameterFromReport(previousReport, name)
          : null;
        return current ? { ...current, previous } : null;
      })
      .filter((p) => p !== null);
  };

  const getAbnormalParameters = () => {
    if (!latestReport || !latestReport.parameters) return [];
    return latestReport.parameters.filter(
      (p) => p.status === "high" || p.status === "low"
    );
  };

  const getCategoryGroups = () => {
    if (!latestReport || !latestReport.parameters) return {};

    const groups = {};
    latestReport.parameters.forEach((param) => {
      const category = param.category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(param);
    });

    return groups;
  };

  if (loading) {
    return <LoadingScreen message="Loading your health dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!latestReport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Reports Yet
          </h2>
          <p className="text-gray-600 mb-6">
            Upload your first blood report to see your health dashboard
          </p>
          <Link
            to="/analysis"
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Upload Report
          </Link>
        </div>
      </div>
    );
  }

  const keyParameters = getKeyParameters();
  const abnormalParams = getAbnormalParameters();
  const categoryGroups = getCategoryGroups();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Dashboard
          </h1>
          <p className="text-gray-600">
            Latest report from{" "}
            {new Date(latestReport.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Alerts Section */}
        {abnormalParams.length > 0 && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
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
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  {abnormalParams.length} Abnormal Parameter
                  {abnormalParams.length > 1 ? "s" : ""} Detected
                </h3>
                <ul className="space-y-1">
                  {abnormalParams.slice(0, 5).map((param, idx) => (
                    <li key={idx} className="text-yellow-700">
                      <span className="font-medium">{param.name}</span>:{" "}
                      {param.value} {param.unit}
                      <span className="ml-2 text-sm">
                        ({param.status === "high" ? "↑ High" : "↓ Low"})
                      </span>
                    </li>
                  ))}
                </ul>
                {abnormalParams.length > 5 && (
                  <p className="text-sm text-yellow-600 mt-2">
                    +{abnormalParams.length - 5} more abnormal parameters
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Key Parameters Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Key Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyParameters.map((param, idx) => (
              <ParameterCard key={idx} parameter={param} />
            ))}
          </div>
          {keyParameters.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No key parameters found in your report
            </p>
          )}
        </div>

        {/* Category Analysis */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Category-wise Analysis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(categoryGroups).map(([category, params]) => (
              <CategoryAnalysis
                key={category}
                category={category}
                parameters={params}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/analysis"
            className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
          >
            <svg
              className="w-8 h-8 text-primary-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-900">
              Upload New Report
            </span>
          </Link>

          <Link
            to={`/reports/${latestReport._id}`}
            className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
          >
            <svg
              className="w-8 h-8 text-primary-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-900">
              View Full Report
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
          >
            <svg
              className="w-8 h-8 text-primary-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-900">
              All Reports
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
