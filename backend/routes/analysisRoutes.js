import express from "express";
import {
  uploadReport,
  getUserReports,
  getReportById,
  deleteReport,
} from "../controllers/analysisController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/upload", upload.single("report"), uploadReport);
router.get("/reports", getUserReports);
router.get("/reports/:id", getReportById);
router.delete("/reports/:id", deleteReport);

export default router;
