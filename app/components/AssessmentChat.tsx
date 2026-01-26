// pages/index.tsx
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import TextMode from "../components/TextMode";
import VoiceMode from "../components/VoiceMode";
// import Results from "./components/Results";
// import AppointmentScheduler from "./components/AppointmentScheduler";
import type { AssessmentResult, ScreenType, ModeType } from "../types";
import LiveKitModal from "../components/LiveKitModal";

import Image from "next/image";

import Navbar from "../components/Navbar";
import Link from "next/link";
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatResponse {
  session_id?: string;
  messages: Message[];
}

const AssessmentChat = () => {
  const [mode, setMode] = useState<ModeType>("text");
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("assessment");
  const [sessionId, setSessionId] = useState<string>("");
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null);

  useEffect(() => {
    // Generate unique session ID
    setSessionId(
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    );
  }, []);

  const handleAssessmentComplete = (result: AssessmentResult): void => {
    setAssessmentResult(result);
    setCurrentScreen("results");
  };

  const handleScheduleAppointment = (): void => {
    setCurrentScreen("appointment");
  };

  const handleNewAssessment = (): void => {
    setCurrentScreen("assessment");
    setAssessmentResult(null);
    setSessionId(
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    );
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState<string>();

  const [showVoiceSupport, setShowVoiceSupport] = useState<boolean>(false);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const API_BASE_URL = "http://localhost:8000";
  const ENDPOINT = "https://agilance-backend.onrender.com";
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
    if (!inputMessage?.trim() || isLoading || !sessionId) return;

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

  console.log("f", showVoiceSupport);
  return (
    <div>
      {showVoiceSupport && (
        <LiveKitModal setShowSupport={setShowVoiceSupport} />
      )}
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
                symptoms to help assess your situation and provide appropriate
                care recommendations.
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
                    message.role === "user" ? "justify-end" : "justify-start"
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
                  disabled={!inputMessage?.trim() || isLoading}
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
    </div>
  );
};

export default AssessmentChat;
