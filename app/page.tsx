"use client";

// pages/index.tsx
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import TextMode from "./components/TextMode";
import VoiceMode from "./components/VoiceMode";
// import Results from "./components/Results";
// import AppointmentScheduler from "./components/AppointmentScheduler";
import type { AssessmentResult, ScreenType, ModeType } from "./types";
import LiveKitModal from "./components/LiveKitModal";

import Image from "next/image";
import Navbar from "./components/Navbar";
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

export default function Home() {
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
  const ENDPOINT = "https://agilance-api.onrender.com";
  const API = "https://api.agilance.org";

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
        },
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
    <div className="h-screen overflow-hidden">
      <Navbar />
      {showVoiceSupport && (
        <LiveKitModal setShowSupport={setShowVoiceSupport} />
      )}
      <div className="bg-[url('/futuristic.png')] bg-cover bg-center bg-no-repeat min-h-screen">
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col  h-full text-center py-36 text-center  h-full">
          <Image
            className="text-center flex justify-center "
            src="/header.png"
            alt="Logo"
            width="789"
            height="154"
          />

          <p className="text-2xl py-4  text-gray-600 mb-8 text-center">
            Use our <span className="text-blue-600  font-bold">AI-powered</span>{" "}
            tool to assess your symptoms and connect with doctors or ERs near
            you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              href="/assessment"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-lg"
            >
              Start Assessment
            </Link>
            <a
              href="/doctors"
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-lg"
            >
              Talk to a Doctor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
