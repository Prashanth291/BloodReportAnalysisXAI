import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyOTP from "./pages/VerifyOTP";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import HealthDashboard from "./pages/HealthDashboard";
import ParameterTrends from "./pages/ParameterTrends";
import AnalysisUpload from "./pages/AnalysisUpload";
import ReportDetails from "./pages/ReportDetails";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          {/* Add padding-top to account for fixed navbar */}
          <div className="pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/health"
                element={
                  <PrivateRoute>
                    <HealthDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trends"
                element={
                  <PrivateRoute>
                    <ParameterTrends />
                  </PrivateRoute>
                }
              />
              <Route
                path="/trends/:parameterName"
                element={
                  <PrivateRoute>
                    <ParameterTrends />
                  </PrivateRoute>
                }
              />
              <Route
                path="/analysis"
                element={
                  <PrivateRoute>
                    <AnalysisUpload />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/:id"
                element={
                  <PrivateRoute>
                    <ReportDetails />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
