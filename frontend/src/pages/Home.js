import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blood-600 via-blood-700 to-blood-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating blood drops */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="blood-drop opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 20}px`,
              height: `${Math.random() * 40 + 25}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 4 + 3}s`,
            }}
          />
        ))}

        {/* Medical cross patterns */}
        <div className="absolute top-20 right-20 text-white/5 text-9xl animate-float">
          +
        </div>
        <div
          className="absolute bottom-40 left-10 text-white/5 text-7xl animate-float"
          style={{ animationDelay: "1s" }}
        >
          +
        </div>
        <div
          className="absolute top-1/2 right-1/4 text-white/5 text-6xl animate-float"
          style={{ animationDelay: "2s" }}
        >
          +
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blood-400 to-blood-600 p-6 rounded-3xl shadow-glow-lg animate-heartbeat">
                  <svg
                    className="w-16 h-16 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 animate-slide-up leading-tight">
              Explainable AI-Based
              <br />
              <span className="bg-gradient-to-r from-blood-200 to-white bg-clip-text text-transparent">
                Blood Test Analysis
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              Transform your blood test reports into clear, actionable health
              insights with the power of Artificial Intelligence
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              {user ? (
                <>
                  <Link
                    to="/analysis"
                    className="group px-8 py-4 bg-white text-blood-600 rounded-full font-bold text-lg shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Upload New Report</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 glass text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    View Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group px-8 py-4 bg-white text-blood-600 rounded-full font-bold text-lg shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 glass text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blood-500 to-blood-700 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📄",
                title: "Multi-Format Support",
                description:
                  "Upload blood test reports in JPG, PNG, or PDF format",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: "🤖",
                title: "AI-Powered Analysis",
                description:
                  "Advanced Gemini AI extracts and interprets medical parameters",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: "📊",
                title: "Clear Visualizations",
                description:
                  "Understand your health data with intuitive charts and graphs",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: "⚠️",
                title: "Abnormality Detection",
                description: "Automatic flagging of out-of-range values",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: "💡",
                title: "Explainable AI",
                description:
                  "Transparent, human-friendly explanations of findings",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: "📈",
                title: "Long-term Tracking",
                description:
                  "Monitor health trends over time with secure storage",
                gradient: "from-indigo-500 to-purple-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white text-3xl mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative z-10 py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blood-500 to-blood-700 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line (hidden on mobile) */}
            <div
              className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blood-200 via-blood-400 to-blood-600"
              style={{ top: "4rem" }}
            ></div>

            {[
              {
                number: "1",
                title: "Register & Verify",
                description: "Create your account and verify your email",
                icon: "✉️",
              },
              {
                number: "2",
                title: "Upload Report",
                description: "Upload your blood test report (JPG, PNG, or PDF)",
                icon: "📤",
              },
              {
                number: "3",
                title: "AI Analysis",
                description: "Our AI extracts and analyzes medical parameters",
                icon: "🔬",
              },
              {
                number: "4",
                title: "View Results",
                description: "Get clear insights and recommendations",
                icon: "✨",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 relative z-10">
                  {/* Step Number Circle */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blood-500 to-blood-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-blood animate-heartbeat">
                      {step.number}
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl">
                      {step.icon}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative z-10 py-16 px-4 bg-gradient-to-br from-blood-600 via-blood-700 to-blood-900">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who trust their health analysis to our AI
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-flex items-center px-10 py-5 bg-white text-blood-600 rounded-full font-bold text-lg shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105 space-x-3"
            >
              <span>Create Free Account</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
