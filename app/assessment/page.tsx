"use client";

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

import AssessmentChat from "../components/AssessmentChat";
import Navbar from "../components/Navbar";
import Link from "next/link";
interface Message {
  type: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatResponse {
  session_id?: string;
  messages: Message[];
}
const AssessmentPage = () => {
  const [mode, setMode] = useState<ModeType>("text");
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("assessment");
  const [sessionId, setSessionId] = useState<string>("");
  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null);

  useEffect(() => {
    // Generate unique session ID
    setSessionId(
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

  console.log(showVoiceSupport);
  const startChat = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/chat/start`,
        {
          mode: "no-cors",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: userMessage,
          }),
        }
      );

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
    <div className="h-screen">
      <Navbar />
      <div className="relative container mx-auto h-screen max-w-4xl">
        <div className=" p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Medical Disclaimer:</strong> This tool provides general
            guidance only. In case of emergency or severe symptoms, call 911
            immediately.
          </p>
        </div>

        <div className="h-screen relative max-w-4xl mx-auto">
          {/* Mode Selection */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold p-8 text-gray-800">
              Choose Assessment Mode
            </h2>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setMode("text");
                  setShowVoiceSupport(false);
                }}
                className={` mb-8 text-l px-8 w-1/4 py-8 h-2 rounded-lg flex items-center justify-center font-medium transition-colors ${
                  mode === "text"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 m-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                Text Mode
              </button>
              <button
                onClick={() => setShowVoiceSupport(true)}
                className={` px-8  w-1/4 h-2 text-l  flex items-center justify-center py-8 rounded-lg font-medium transition-colors ${
                  mode === "voice"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                  />
                </svg>
                Voice Mode
              </button>
            </div>
          </div>

          {showVoiceSupport && (
            <LiveKitModal setShowSupport={setShowVoiceSupport} />
          )}

          {mode === "text" && <AssessmentChat />}
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              🏥 Always consult with healthcare professionals for medical
              concerns. This tool is for informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
