import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById, deleteReport } from "../services/analysisService";
import "./ReportDetails.css";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await getReportById(id);
      setReport(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

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
    if (!status || status === "normal") return "#28a745";
    if (status === "high") return "#dc3545";
    if (status === "low") return "#ffc107";
    return "#6c757d";
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-details-page">
        <div className="container">
          <div className="alert alert-error">{error}</div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-details-page">
      <div className="container">
        <div className="report-header-section">
          <button onClick={() => navigate("/dashboard")} className="back-btn">
            ← Back to Dashboard
          </button>
          <h1>{report.fileName}</h1>
          <p className="report-date">
            Uploaded on {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Patient Info */}
        {report.extractedData?.patientInfo && (
          <div className="info-card card">
            <h2>Patient Information</h2>
            <div className="info-grid">
              {report.extractedData.patientInfo.name && (
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">
                    {report.extractedData.patientInfo.name}
                  </span>
                </div>
              )}
              {report.extractedData.patientInfo.age && (
                <div className="info-item">
                  <span className="info-label">Age:</span>
                  <span className="info-value">
                    {report.extractedData.patientInfo.age}
                  </span>
                </div>
              )}
              {report.extractedData.patientInfo.gender && (
                <div className="info-item">
                  <span className="info-label">Gender:</span>
                  <span className="info-value">
                    {report.extractedData.patientInfo.gender}
                  </span>
                </div>
              )}
              {report.extractedData.patientInfo.reportDate && (
                <div className="info-item">
                  <span className="info-label">Report Date:</span>
                  <span className="info-value">
                    {report.extractedData.patientInfo.reportDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lab Info */}
        {report.extractedData?.labInfo && (
          <div className="info-card card">
            <h2>Laboratory Information</h2>
            <div className="info-grid">
              {report.extractedData.labInfo.labName && (
                <div className="info-item">
                  <span className="info-label">Laboratory:</span>
                  <span className="info-value">
                    {report.extractedData.labInfo.labName}
                  </span>
                </div>
              )}
              {report.extractedData.labInfo.reportId && (
                <div className="info-item">
                  <span className="info-label">Report ID:</span>
                  <span className="info-value">
                    {report.extractedData.labInfo.reportId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parameters */}
        <div className="parameters-card card">
          <h2>Blood Test Parameters</h2>
          {report.extractedData?.parameters &&
          report.extractedData.parameters.length > 0 ? (
            <div className="parameters-table">
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.extractedData.parameters.map((param, index) => (
                    <tr key={index}>
                      <td className="param-name">{param.name}</td>
                      <td className="param-value">{param.value}</td>
                      <td>{param.unit}</td>
                      <td>{param.referenceRange || "N/A"}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(param.status),
                            color: "white",
                          }}
                        >
                          {param.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No parameters extracted</p>
          )}
        </div>

        {/* Raw JSON */}
        <div className="json-card card">
          <h2>Raw JSON Data</h2>
          <pre className="json-display">
            {JSON.stringify(report.extractedData, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="actions-section">
          <button onClick={handleDelete} className="btn btn-danger">
            Delete Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
