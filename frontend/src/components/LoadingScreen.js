import React from "react";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="text-center fade-in">
        {/* Elegant Spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-violet-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-semibold gradient-text mb-2">
          Blood Report Analysis
        </h2>
        <p className="text-gray-600 font-medium">{message}</p>
        
        {/* Progress Indicator */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full animate-pulse shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;