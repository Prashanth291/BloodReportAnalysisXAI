import axios from "axios";

const API_URL = "/api/chatbot";

// Configure axios to include auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Send message to chatbot
export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat`,
      {
        message,
        conversationHistory,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to send message" };
  }
};

// Chat with context from blood report
export const chatWithReport = async (
  message,
  reportData,
  conversationHistory = []
) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat-with-report`,
      {
        message,
        reportData,
        conversationHistory,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to send message" };
  }
};

// Get quick question suggestions
export const getQuickQuestions = async () => {
  try {
    const response = await axios.get(`${API_URL}/quick-questions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch questions" };
  }
};

// Get chatbot status
export const getChatbotStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch status" };
  }
};
