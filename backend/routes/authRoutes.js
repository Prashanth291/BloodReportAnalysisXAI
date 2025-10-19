import express from "express";
import {
  register,
  verifyEmail,
  verifyOTPController,
  login,
  getMe,
  resendVerification,
  resendOTP,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTPController);
router.post("/resend-otp", resendOTP);
router.get("/verify/:token", verifyEmail);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/resend-verification", resendVerification);

export default router;
