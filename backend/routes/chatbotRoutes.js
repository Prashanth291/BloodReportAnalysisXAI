import express from "express";
import {
  sendMessage,
  chatWithReport,
  getQuickQuestionsList,
  getChatbotStatusInfo,
} from "../controllers/chatbotController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/status", getChatbotStatusInfo);
router.get("/quick-questions", getQuickQuestionsList);

// Protected routes (require authentication)
router.post("/chat", protect, sendMessage);
router.post("/chat-with-report", protect, chatWithReport);

export default router;
