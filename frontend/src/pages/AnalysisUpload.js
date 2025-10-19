import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadReport } from "../services/analysisService";
import "./AnalysisUpload.css";

const AnalysisUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");

    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Please upload a valid file (JPG, PNG, or PDF)");
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);

    try {
      const response = await uploadReport(file);
      setResult(response.data);
    } catch (err) {
      setError(err.message || "Failed to analyze report");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="analysis-page">
      <div className="container">
        <h1 className="page-title">Upload Blood Report</h1>
        <p className="page-subtitle">
          Upload your blood test report for AI-powered analysis
        </p>

        <div className="upload-section card">
          {!result ? (
            <form onSubmit={handleSubmit}>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="file-input"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                  <div className="upload-icon">📁</div>
                  <p>{file ? file.name : "Click to upload or drag and drop"}</p>
                  <span>Supported formats: JPG, PNG, PDF (Max 10MB)</span>
                </label>
              </div>

              {preview && (
                <div className="preview-section">
                  <h3>Preview:</h3>
                  <img src={preview} alt="Preview" className="image-preview" />
                </div>
              )}

              {file && file.type === "application/pdf" && (
                <div className="pdf-info">
                  <p>📄 PDF File: {file.name}</p>
                  <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}

              {error && <div className="alert alert-error">{error}</div>}

              <div className="button-group">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!file || loading}
                >
                  {loading ? "Analyzing..." : "Analyze Report"}
                </button>
                {file && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-secondary"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="results-section">
              <div className="success-header">
                <div className="success-icon">✓</div>
                <h2>Analysis Complete!</h2>
              </div>

              <div className="result-summary">
                <p>
                  <strong>File:</strong> {result.fileName}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(result.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Parameters Extracted:</strong>{" "}
                  {result.extractedData.parameters?.length || 0}
                </p>
              </div>

              <div className="json-output">
                <h3>Extracted Parameters (JSON):</h3>
                <pre className="json-display">
                  {JSON.stringify(result.extractedData, null, 2)}
                </pre>
              </div>

              <div className="button-group">
                <button
                  onClick={() => navigate(`/reports/${result.reportId}`)}
                  className="btn btn-primary"
                >
                  View Detailed Report
                </button>
                <button onClick={handleReset} className="btn btn-secondary">
                  Upload Another Report
                </button>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="spinner"></div>
              <p>Analyzing your blood report...</p>
              <p className="loading-subtext">This may take a few moments</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisUpload;
