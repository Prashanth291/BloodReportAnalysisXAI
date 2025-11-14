import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import parameterRoutes from "./routes/parameterRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import {
  initializeGeminiAPI,
  verifyGeminiConnection,
} from "./services/geminiService.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Blood Report Analysis API",
    version: "1.0.0",
  });
});

// Ignore favicon requests (browser automatically requests this)
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/parameters", parameterRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

  // Check if email is configured
  const emailConfigured =
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_PASSWORD !== "wrho tpvc vaiy udsq" &&
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== "prashanthbollinedi2910@gmail.com";

  if (!emailConfigured && process.env.NODE_ENV === "development") {
    console.log("\n⚠️  EMAIL NOT CONFIGURED - Running in DEV mode");
    console.log("📧 Email verification is DISABLED");
    console.log("✅ Users will be auto-verified on registration\n");
    console.log("To enable email verification:");
    console.log(
      "1. Set up Gmail App Password: https://myaccount.google.com/apppasswords"
    );
    console.log("2. Update SMTP_USER and SMTP_PASSWORD in .env file");
    console.log("3. Restart the server\n");
  } else if (emailConfigured) {
    console.log("📧 Email service configured and ready\n");
  }

  // Check if Gemini API is configured and test connection
  const geminiConfigured =
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "your_gemini_api_key_here";

  if (!geminiConfigured) {
    console.log("⚠️  GEMINI API NOT CONFIGURED");
    console.log("🤖 Blood report analysis will fail without API key");
    console.log("Get your API key: https://makersuite.google.com/app/apikey\n");
  } else {
    console.log("🤖 Testing Gemini API configuration...\n");
    const initialized = initializeGeminiAPI();
    if (initialized) {
      await verifyGeminiConnection();
    }
  }
});
