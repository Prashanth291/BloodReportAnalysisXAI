import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllParameters,
  getParameterByName,
  analyzeUserReport,
  seedParameters,
} from "../controllers/parameterController.js";

const router = express.Router();

// Get all parameter references (optional: filter by category)
router.get("/", getAllParameters);

// Get specific parameter reference
router.get("/:parameterName", getParameterByName);

// Analyze a report with user profile
router.post("/analyze", protect, analyzeUserReport);

// Seed database (admin only - should be protected in production)
router.post("/seed", seedParameters);

export default router;
