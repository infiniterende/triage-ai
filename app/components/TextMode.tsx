import React, { useState, useEffect, useRef } from "react";
import type {
  Question,
  UserResponse,
  QuestionsResponse,
  AssessmentResult,
  TextModeProps,
  APIError,
  Message,
  ChatResponse,
} from "../types";

const API_BASE_URL = "http://localhost:8000";

export default function TextMode({ onComplete }: TextModeProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const API_BASE_URL = "http://localhost:8000";
  const ENDPOINT = "https://agilance-api.onrender.com";
  const API = "https://api.agilance.org";

  const startChat = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/chat/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data: ChatResponse = await response.json();
        setSessionId(data.session_id || "");
        setMessages(data.messages);
        setIsStarted(true);
      } else {
        console.error("Failed to start chat");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
        }),
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();
        setMessages(data.messages);
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  };

  const getMessageIcon = (role: string, content: string) => {
    if (role === "user") return "👤";

    // Different icons based on message content
    if (content.includes("🚨")) return "🚨";
    if (content.includes("⚠️")) return "⚠️";
    if (content.includes("⚡")) return "⚡";
    if (content.includes("✅")) return "✅";
    if (content.includes("📋")) return "📋";

    return "🩺";
  };

  return (
    <>
      <title>Triage AI</title>
      <meta
        name="description"
        content="AI-powered chest pain assessment tool"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Triage AI</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Intelligent chest pain assessment to help determine your next
              steps
            </p>

            {!isStarted && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Medical Disclaimer:</strong> This tool provides
                  general guidance only. In case of emergency or severe
                  symptoms, call 911 immediately.
                </p>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {!isStarted ? (
              /* Start Screen */
              <div className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❤️</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Chest Pain Assessment
                  </h2>
                  <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                    I will ask you a series of questions about your chest pain
                    symptoms to help assess your situation and provide
                    appropriate care recommendations.
                  </p>
                </div>

                <button
                  onClick={startChat}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Starting..." : "Begin Assessment"}
                </button>
              </div>
            ) : (
              /* Chat Messages */
              <>
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-sm">
                            {getMessageIcon(message.role, message.content)}
                          </span>
                          <div
                            className="flex-1 text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatMessage(message.content),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            Analyzing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex space-x-4">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response here..."
                      rows={2}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift + Enter for new line
                  </p>
                </div>
              </>
            )}
          </div>
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              🏥 Always consult with healthcare professionals for medical
              concerns. This tool is for informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
