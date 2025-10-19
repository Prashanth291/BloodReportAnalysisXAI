import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setError(err.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="verify-page">
      <div className="container">
        <div className="verify-card card">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Verifying your email...</p>
            </div>
          )}

          {success && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Email Verified Successfully!</h2>
              <p>
                Your email has been verified. You will be redirected to the
                login page shortly.
              </p>
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          )}

          {error && (
            <div className="error-message">
              <div className="error-icon">✗</div>
              <h2>Verification Failed</h2>
              <p>{error}</p>
              <div className="error-actions">
                <Link to="/register" className="btn btn-primary">
                  Register Again
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
