import {
  chat,
  getChatbotStatus,
  getQuickQuestions,
} from "../services/chatbotService.js";

/**
 * Send message to chatbot
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const result = await chat(message, conversationHistory);

    res.json({
      success: true,
      data: {
        message: result.message,
        provider: result.provider,
      },
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process message",
      type: "CHATBOT_ERROR",
    });
  }
};

/**
 * Send message with blood report context
 */
export const chatWithReport = async (req, res) => {
  try {
    const { message, reportData, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (!reportData) {
      return res.status(400).json({
        success: false,
        message: "Report data is required",
      });
    }

    const result = await chat(message, conversationHistory, reportData);

    res.json({
      success: true,
      data: {
        message: result.message,
        provider: result.provider,
      },
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process message",
      type: "CHATBOT_ERROR",
    });
  }
};

/**
 * Get quick question suggestions
 */
export const getQuickQuestionsList = async (req, res) => {
  try {
    const questions = getQuickQuestions();

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching quick questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quick questions",
    });
  }
};

/**
 * Get chatbot status and configuration
 */
export const getChatbotStatusInfo = async (req, res) => {
  try {
    const status = getChatbotStatus();

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error fetching chatbot status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chatbot status",
    });
  }
};

export default {
  sendMessage,
  chatWithReport,
  getQuickQuestionsList,
  getChatbotStatusInfo,
};
