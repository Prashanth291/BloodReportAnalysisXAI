import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { sendChatMessage, getQuickQuestions } from "../services/chatbotService";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! I'm your medical AI assistant. I can help you understand blood test results, explain medical terms, answer health questions, and provide guidance. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadQuickQuestions = async () => {
      try {
        const response = await getQuickQuestions();
        setQuickQuestions(response.data);
      } catch (error) {
        console.error("Failed to load quick questions:", error);
      }
    };
    loadQuickQuestions();
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setShowQuickQuestions(false);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendChatMessage(text, conversationHistory);

      const assistantMessage = {
        role: "assistant",
        content: response.data.message,
        timestamp: response.data.timestamp,
        provider: response.data.provider,
        model: response.data.model,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. This might be because:\n\n• The AI service is temporarily unavailable\n• Network connection issues\n• Backend server is not running\n\nPlease check that the backend is running and try again in a moment. 🔄",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "👋 Chat cleared! How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setShowQuickQuestions(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold gradient-text mb-2">
            Medical AI Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Ask anything about blood tests, health, and medical guidance
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full animate-pulse">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Medical Assistant</h3>
                <p className="text-xs text-white/80">Powered by Advanced AI</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="font-medium">Clear</span>
            </button>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-slide-up`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg"
                      : message.isError
                      ? "bg-red-50 text-red-800 border-2 border-red-200 shadow-md"
                      : "bg-white text-gray-800 shadow-lg border border-gray-100"
                  }`}
                >
                  <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-3 last:mb-0 text-gray-800" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3 space-y-1 text-gray-800" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-3 space-y-1 text-gray-800" {...props} />,
                          li: ({node, ...props}) => <li className="mb-1 text-gray-800" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-gray-900" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-gray-900" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 text-gray-900" {...props} />,
                          code: ({node, inline, ...props}) => 
                            inline ? (
                              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800" {...props} />
                            ) : (
                              <code className="block bg-gray-100 p-3 rounded my-2 text-xs font-mono overflow-x-auto text-gray-800" {...props} />
                            ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  {message.provider && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs opacity-70">
                      <span>{message.provider}</span>
                      <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}

            {showQuickQuestions && quickQuestions.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-sm text-gray-700 font-semibold">Quick Questions:</p>
                </div>

                {/* Category Tabs */}
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {quickQuestions.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedCategory(idx)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                        selectedCategory === idx
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {cat.category}
                    </button>
                  ))}
                </div>

                {/* Questions */}
                <div className="grid gap-2">
                  {quickQuestions[selectedCategory]?.questions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-left text-sm bg-white hover:bg-indigo-50 text-gray-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-indigo-300 group"
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-indigo-600 group-hover:scale-110 transition-transform">💡</span>
                        <span>{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Medical Disclaimer */}
          <div className="px-6 py-3 bg-yellow-50 border-t-2 border-yellow-200">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-yellow-800">
                <strong>Medical Disclaimer:</strong> For informational purposes only. Always consult qualified healthcare professionals for medical advice.
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about blood tests, symptoms, health advice..."
                className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
