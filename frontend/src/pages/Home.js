import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Explainable AI-Based Blood Test Analysis
          </h1>
          <p className="hero-subtitle">
            Transform your blood test reports into clear, actionable health
            insights with the power of Artificial Intelligence
          </p>
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/analysis" className="btn btn-primary btn-lg">
                  Upload New Report
                </Link>
                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                  View Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Multi-Format Support</h3>
              <p>Upload blood test reports in JPG, PNG, or PDF format</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Analysis</h3>
              <p>
                Advanced Gemini AI extracts and interprets medical parameters
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Clear Visualizations</h3>
              <p>
                Understand your health data with intuitive charts and graphs
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚠️</div>
              <h3>Abnormality Detection</h3>
              <p>Automatic flagging of out-of-range values</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Explainable AI</h3>
              <p>Transparent, human-friendly explanations of findings</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Long-term Tracking</h3>
              <p>Monitor health trends over time with secure storage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register & Verify</h3>
              <p>Create your account and verify your email</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Upload Report</h3>
              <p>Upload your blood test report (JPG, PNG, or PDF)</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>AI Analysis</h3>
              <p>Our AI extracts and analyzes medical parameters</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>View Results</h3>
              <p>Get clear insights and recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
