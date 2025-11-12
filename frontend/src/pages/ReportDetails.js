import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById, deleteReport } from "../services/analysisService";
import LoadingScreen from "../components/LoadingScreen";
import DocusParameterCard from "../components/DocusParameterCard";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
    try {
      const response = await getReportById(id);
      setReport(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(id);
        navigate("/dashboard");
      } catch (err) {
        alert(err.message || "Failed to delete report");
      }
    }
  };

  const getStatusColor = (status) => {
    if (!status || status.toLowerCase() === "normal")
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300",
      };
    if (status.toLowerCase() === "high")
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
      };
    if (status.toLowerCase() === "low")
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
      };
    return {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
    };
  };

  const getStatusIcon = (status) => {
    if (!status || status.toLowerCase() === "normal") {
      return (
        <svg
          className="w-5 h-5 text-green-600"
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
    }
    if (status.toLowerCase() === "high") {
      return (
        <svg
          className="w-5 h-5 text-red-600"
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
      );
    }
    if (status.toLowerCase() === "low") {
      return (
        <svg
          className="w-5 h-5 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      );
    }
    return null;
  };

  if (loading) {
    return <LoadingScreen message="Loading report details..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="bg-red-100 p-6 rounded-full inline-block">
              <svg
                className="w-16 h-16 text-red-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Report
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-6 group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-8 h-8 mr-3 text-primary-600"
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
                  {report.fileName}
                </h1>
                <p className="text-gray-600">
                  Uploaded on {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleDelete}
                className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300"
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Delete Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        {report.extractedData?.patientInfo &&
          Object.keys(report.extractedData.patientInfo).some(
            (key) => report.extractedData.patientInfo[key]
          ) && (
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg
                  className="w-6 h-6 mr-3 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {report.extractedData.patientInfo.name && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold mb-2">
                      Name
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {report.extractedData.patientInfo.name}
                    </p>
                  </div>
                )}
                {report.extractedData.patientInfo.age && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold mb-2">
                      Age
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {report.extractedData.patientInfo.age}
                    </p>
                  </div>
                )}
                {report.extractedData.patientInfo.gender && (
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                    <p className="text-sm text-pink-600 font-semibold mb-2">
                      Gender
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {report.extractedData.patientInfo.gender}
                    </p>
                  </div>
                )}
                {report.extractedData.patientInfo.reportDate && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <p className="text-sm text-green-600 font-semibold mb-2">
                      Report Date
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {report.extractedData.patientInfo.reportDate}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Lab Info */}
        {report.extractedData?.labInfo &&
          Object.keys(report.extractedData.labInfo).some(
            (key) => report.extractedData.labInfo[key]
          ) && (
            <div
              className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg
                  className="w-6 h-6 mr-3 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Laboratory Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.extractedData.labInfo.labName && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                    <p className="text-sm text-indigo-600 font-semibold mb-2">
                      Laboratory
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {report.extractedData.labInfo.labName}
                    </p>
                  </div>
                )}
                {report.extractedData.labInfo.reportId && (
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200">
                    <p className="text-sm text-cyan-600 font-semibold mb-2">
                      Report ID
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {report.extractedData.labInfo.reportId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Parameters */}
        <div
          className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Blood Test Parameters
            <span className="ml-auto text-sm font-semibold text-primary-600 bg-primary-100 px-4 py-2 rounded-full">
              {report.extractedData?.parameters?.length || 0} Parameters
            </span>
          </h2>

          {report.extractedData?.parameters &&
          report.extractedData.parameters.length > 0 ? (
            <div className="grid gap-6">
              {report.extractedData.parameters.map((param, index) => (
                <DocusParameterCard 
                  key={index} 
                  parameter={param} 
                  allParameters={report.extractedData.parameters}
                  patientProfile={{
                    patientAge: report.extractedData?.patientAge || 50,
                    patientGender: report.extractedData?.patientGender || 'Male',
                    diabetic: report.extractedData?.diabetic || false,
                    pregnant: report.extractedData?.pregnant || false,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-20 h-20 mx-auto text-gray-400 mb-4"
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
              <p className="text-gray-500">No parameters extracted</p>
            </div>
          )}
        </div>

        {/* Raw JSON */}
        <div
          className="bg-white rounded-3xl shadow-xl p-8 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Raw JSON Data
          </h2>
          <div className="bg-gray-900 rounded-xl p-6 overflow-auto max-h-96">
            <pre className="text-green-400 text-sm font-mono">
              {JSON.stringify(report.extractedData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
