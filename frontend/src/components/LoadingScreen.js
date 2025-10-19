import React from "react";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blood-600 via-blood-700 to-blood-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating blood drops */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="blood-drop opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 30 + 15}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Heartbeat Animation Container */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Pulsing Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 animate-ping"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 animate-pulse"></div>
            </div>

            {/* Blood Drop Icon */}
            <div className="relative w-24 h-24 flex items-center justify-center animate-heartbeat">
              <svg
                className="w-16 h-16 text-white drop-shadow-glow"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white animate-pulse">
            Blood Report Analysis
          </h2>
          <p className="text-xl text-white/90 animate-fade-in">{message}</p>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-12 w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-gradient-to-r from-white via-blood-300 to-white animate-pulse rounded-full"
            style={{ width: "70%" }}
          ></div>
        </div>
      </div>

      {/* Bottom Medical Cross Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent flex items-center justify-center">
        <div className="flex space-x-8 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="text-white text-4xl animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              +
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
