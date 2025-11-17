import axios from "axios";

let activeProvider = null;

// Helper function to get API keys (reads at runtime, not at import time)
const getApiKeys = () => ({
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
});

/**
 * Chat with Groq (Llama 3.1 - FREE, Fast)
 */
async function chatWithGroq(message, conversationHistory = []) {
  const { GROQ_API_KEY } = getApiKeys();
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful medical assistant specializing in blood test analysis and general health information. Provide clear, accurate, and empathetic responses. Always remind users to consult healthcare professionals for medical decisions.",
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      message: response.data.choices[0].message.content,
      provider: "groq",
    };
  } catch (error) {
    console.error("Groq API Error:", error.response?.data || error.message);
    throw new Error(
      `Groq API failed: ${error.response?.data?.error?.message || error.message}`
    );
  }
}

/**
 * Chat with Gemini (Fallback - Free but has overload issues)
 */
async function chatWithGemini(message, conversationHistory = []) {
  const { GEMINI_API_KEY } = getApiKeys();
  try {
    // Format conversation history for Gemini
    let prompt = `You are a helpful medical assistant specializing in blood test analysis and general health information. Provide clear, accurate, and empathetic responses. Always remind users to consult healthcare professionals for medical decisions.\n\n`;

    // Add conversation history
    conversationHistory.forEach((msg) => {
      prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    });

    prompt += `User: ${message}\nAssistant:`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    return {
      success: true,
      message: text,
      provider: "gemini",
    };
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw new Error(
      `Gemini API failed: ${error.response?.data?.error?.message || error.message}`
    );
  }
}

/**
 * Main chat function with automatic provider fallback
 */
export async function chat(message, conversationHistory = [], reportContext = null) {
  const { GROQ_API_KEY, GEMINI_API_KEY } = getApiKeys();
  
  // Enhance message with report context if provided
  let enhancedMessage = message;
  if (reportContext) {
    enhancedMessage = `Based on this blood report data:\n${JSON.stringify(reportContext, null, 2)}\n\nUser question: ${message}`;
  }

  // Try Groq first (FREE and fast)
  if (GROQ_API_KEY) {
    try {
      console.log("Attempting chat with Groq...");
      const result = await chatWithGroq(enhancedMessage, conversationHistory);
      return result;
    } catch (error) {
      console.error("Groq failed, trying Gemini fallback...");
    }
  }

  // Try Gemini as fallback
  if (GEMINI_API_KEY) {
    try {
      console.log("Attempting chat with Gemini...");
      const result = await chatWithGemini(enhancedMessage, conversationHistory);
      return result;
    } catch (error) {
      console.error("All providers failed");
      throw new Error("All AI providers are currently unavailable");
    }
  }

  throw new Error("No AI provider configured. Please add GROQ_API_KEY to .env file");
}

/**
 * Initialize chatbot and determine active provider
 */
export function initializeChatbot() {
  const { GROQ_API_KEY, GEMINI_API_KEY } = getApiKeys();
  
  console.log("\n🤖 Medical Chatbot Initialization:");

  if (GROQ_API_KEY) {
    activeProvider = "GROQ";
    console.log("✅ Groq API configured (FREE, Llama 3.3-70b)");
    console.log("   Primary Provider: Groq");
  } else {
    console.log("⚠️  Groq API not configured (Recommended - FREE)");
    console.log("   Get your free key: https://console.groq.com/keys");
  }

  if (GEMINI_API_KEY) {
    console.log("✅ Gemini API configured (Fallback)");
    if (!activeProvider) activeProvider = "GEMINI";
  } else {
    console.log("⚠️  Gemini API not configured");
  }

  if (!activeProvider) {
    console.log("\n❌ ERROR: No AI provider configured!");
    console.log("   Add GROQ_API_KEY to .env file: https://console.groq.com/keys");
    return;
  }

  console.log(`\n🎯 Active Provider: ${activeProvider}`);
  console.log("   Chatbot ready!\n");
}

/**
 * Get chatbot status
 */
export function getChatbotStatus() {
  const { GROQ_API_KEY, GEMINI_API_KEY } = getApiKeys();
  
  return {
    groq: {
      available: !!GROQ_API_KEY,
      status: GROQ_API_KEY ? "configured" : "not_configured",
      recommended: true,
      cost: "FREE",
    },
    gemini: {
      available: !!GEMINI_API_KEY,
      status: GEMINI_API_KEY ? "configured" : "not_configured",
      recommended: false,
      cost: "FREE (with limits)",
    },
    activeProvider,
  };
}

/**
 * Get quick question suggestions
 */
export function getQuickQuestions() {
  return [
    {
      category: "Blood Test Basics",
      questions: [
        "What is a Complete Blood Count (CBC)?",
        "How should I prepare for a blood test?",
        "What do abnormal blood test results mean?",
        "How often should I get blood tests done?",
      ],
    },
    {
      category: "Understanding Results",
      questions: [
        "What is considered a normal hemoglobin level?",
        "What causes high white blood cell count?",
        "What does low platelet count indicate?",
        "What is the difference between HDL and LDL cholesterol?",
      ],
    },
    {
      category: "Health Guidance",
      questions: [
        "How can I improve my blood test results?",
        "What foods help increase hemoglobin?",
        "What lifestyle changes can improve cholesterol levels?",
        "When should I consult a doctor about my results?",
      ],
    },
    {
      category: "Report Interpretation",
      questions: [
        "Can you explain my blood report?",
        "What do the highlighted abnormal values mean?",
        "Are my results within normal range?",
        "What follow-up tests might I need?",
      ],
    },
  ];
}

export default {
  chat,
  initializeChatbot,
  getChatbotStatus,
  getQuickQuestions,
};
