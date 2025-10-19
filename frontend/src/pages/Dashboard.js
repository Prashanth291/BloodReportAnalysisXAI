import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserReports, deleteReport } from "../services/analysisService";
import "./Dashboard.css";

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getUserReports();
      setReports(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(id);
        setReports(reports.filter((report) => report._id !== id));
      } catch (err) {
        alert(err.message || "Failed to delete report");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Blood Reports</h1>
          <Link to="/analysis" className="btn btn-primary">
            + Upload New Report
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {reports.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📄</div>
            <h2>No Reports Yet</h2>
            <p>
              Upload your first blood test report to get started with AI-powered
              analysis.
            </p>
            <Link to="/analysis" className="btn btn-primary">
              Upload Report
            </Link>
          </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report) => (
              <div key={report._id} className="report-card card">
                <div className="report-header">
                  <h3>{report.fileName}</h3>
                  <span className={`status-badge status-${report.status}`}>
                    {report.status}
                  </span>
                </div>
                <div className="report-info">
                  <p className="report-date">{formatDate(report.createdAt)}</p>
                  <p className="report-params">
                    {report.extractedData?.parameters?.length || 0} parameters
                    extracted
                  </p>
                </div>
                <div className="report-actions">
                  <Link
                    to={`/reports/${report._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(report._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
