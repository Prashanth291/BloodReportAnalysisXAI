/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blood: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          950: "#4c0519",
        },
        medical: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      backgroundImage: {
        "blood-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "blood-gradient-2": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "blood-gradient-3": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "medical-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "dark-gradient": "linear-gradient(135deg, #1e1e1e 0%, #434343 100%)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
        drop: "drop 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.1)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(1)" },
        },
        drop: {
          "0%": { transform: "translateY(-100px)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
      },
      boxShadow: {
        blood: "0 10px 40px rgba(244, 63, 94, 0.3)",
        medical: "0 10px 40px rgba(14, 165, 233, 0.3)",
        glow: "0 0 20px rgba(244, 63, 94, 0.5)",
        "glow-lg": "0 0 40px rgba(244, 63, 94, 0.6)",
      },
    },
  },
  plugins: [],
};
