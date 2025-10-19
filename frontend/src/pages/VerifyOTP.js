import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerification } = useContext(AuthContext);

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      while (newOtp.length < 6) newOtp.push("");
      setOtp(newOtp);

      // Focus last filled input
      const lastIndex = Math.min(pastedData.length - 1, 5);
      document.getElementById(`otp-${lastIndex}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0").focus();
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blood-600 via-blood-700 to-blood-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full glass rounded-3xl shadow-2xl p-8 border border-white/20 text-center animate-scale-in">
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Email Required</h2>
          <p className="text-white/80 mb-8">
            Please register first to receive an OTP.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="w-full py-4 bg-white text-blood-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-600 via-blood-700 to-blood-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="blood-drop opacity-5"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 15}px`,
              height: `${Math.random() * 40 + 20}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* OTP Verification Card */}
      <div className="max-w-lg w-full space-y-8 relative z-10 animate-scale-in">
        {/* Header */}
        <div className="text-center">
          {/* Email Icon with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blood-400 to-blood-600 p-6 rounded-3xl shadow-glow-lg">
                <svg
                  className="w-16 h-16 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold text-white mb-3">
            Verify Your Email
          </h2>
          <p className="text-lg text-white/80 mb-2">
            We've sent a 6-digit OTP to
          </p>
          <p className="text-xl font-semibold text-white bg-white/10 inline-block px-6 py-2 rounded-full">
            {email}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-white text-sm animate-slide-down">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
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
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/50 text-white text-sm animate-slide-down">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
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
                <span>{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-bold bg-white/10 border-2 border-white/30 rounded-xl text-white focus:outline-none focus:border-white focus:bg-white/20 transition-all duration-300 focus:scale-110 focus:shadow-glow"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-white text-blood-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="blood-spinner w-6 h-6"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-white/70 mb-2">Didn't receive the OTP?</p>
            <button
              onClick={handleResendOTP}
              className="text-white font-semibold hover:text-blood-200 transition-colors underline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </div>

          {/* Tips Section */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-white mb-2">💡 Tips:</p>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• OTP is valid for 10 minutes</li>
                  <li>• Check your spam folder if you don't see the email</li>
                  <li>• You can paste the OTP directly in the first box</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
