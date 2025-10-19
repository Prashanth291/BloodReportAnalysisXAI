import express from "express";
import {
  uploadReport,
  getUserReports,
  getReportById,
  deleteReport,
  getParameterTrends,
  getAllParameters,
  searchByParameters,
} from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Report routes
router.post("/upload", upload.single("report"), uploadReport);
router.get("/reports", getUserReports);
router.get("/reports/:id", getReportById);
router.delete("/reports/:id", deleteReport);

// Parameter routes
router.get("/parameters/list", getAllParameters);
router.get("/parameters/trends/:parameterName", getParameterTrends);
router.get("/parameters/search", searchByParameters);

export default router;
