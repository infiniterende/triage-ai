"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Clock, Loader2, MessageSquare, Phone, RotateCcw } from "lucide-react";
import type { ChatResponse, Message } from "../../types";
import type { PathwayResult } from "@/lib/pathway";
import { rememberPatientId } from "@/lib/api";
import PathwayResultCard from "../pathway/PathwayResultCard";
import { ChatMessage, TypingIndicator } from "./ChatMessage";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? "";

type ChatReply = ChatResponse & { pathway?: PathwayResult; patient_id?: number };

function looksUrgent(messages: Message[]): boolean {
  const last = [...messages].reverse().find((m) => m.role === "assistant");
  if (!last) return false;
  return /🚨|call 911|emergency room/i.test(last.content);
}

export default function TextAssessment({
  onComplete,
  embedded = false,
}: {
  /** Fired when the backend returns a pathway evaluation for this session. */
  onComplete?: (result: PathwayResult, patientId?: number) => void;
  /** Slightly tighter layout for use inside a drawer / side panel. */
  embedded?: boolean;
} = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathway, setPathway] = useState<PathwayResult | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  // Auto-grow the composer up to ~5 lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const startChat = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/api/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const data: ChatResponse = await response.json();
      setSessionId(data.session_id || "");
      setMessages(data.messages);
      setIsStarted(true);
      setTimeout(() => textareaRef.current?.focus(), 50);
    } catch (err) {
      console.error("Error starting chat:", err);
      setError("We couldn't start the assessment. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || !sessionId) return;

    setIsLoading(true);
    setError(null);
    setInput("");
    // Optimistically show the user's message while the backend replies.
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const response = await fetch(`${API}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const data: ChatReply = await response.json();
      setMessages(data.messages);
      if (data.pathway) {
        setPathway(data.pathway);
        rememberPatientId(data.patient_id);
        onComplete?.(data.pathway, data.patient_id);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Your message didn't go through. Please try sending it again.");
      setInput(text);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([]);
    setSessionId("");
    setIsStarted(false);
    setInput("");
    setError(null);
    setPathway(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  /* ----------------------------- Start screen ----------------------------- */
  if (!isStarted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
          <span className="absolute inset-0 rounded-full bg-brand-200/60 animate-pulse-ring" />
          <MessageSquare className="relative h-7 w-7" />
        </span>
        <h2 className="mt-6 font-display text-2xl font-semibold">
          Chest pain assessment
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
          I&apos;ll ask a short series of questions about your symptoms and
          history, then explain what they suggest and what to do next. Answer in
          your own words — there are no wrong answers.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-slate-500">
          <span className="chip bg-slate-50 text-slate-600 ring-slate-200/70">
            <Clock className="h-3.5 w-3.5" /> About 3 minutes
          </span>
          <span className="chip bg-slate-50 text-slate-600 ring-slate-200/70">
            Private · nothing is shared without you
          </span>
        </div>
        {error && (
          <p className="mt-5 max-w-sm rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={startChat}
          disabled={isLoading}
          className="btn-primary mt-8 px-7 py-3 text-[15px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Starting…
            </>
          ) : (
            "Begin assessment"
          )}
        </button>
      </div>
    );
  }

  /* ------------------------------ Chat screen ----------------------------- */
  const urgent = pathway ? pathway.disposition.level === "emergency" : looksUrgent(messages);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {urgent && !pathway && (
        <div className="flex items-center gap-3 border-b border-rose-100 bg-rose-50 px-5 py-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-rose-600 ring-1 ring-rose-100">
            <Phone className="h-4 w-4" />
          </span>
          <p className="flex-1 text-sm text-rose-800">
            Your answers suggest you should seek care right away.
          </p>
          <a href="tel:911" className="btn bg-rose-600 px-4 py-2 text-white hover:bg-rose-700">
            Call 911
          </a>
        </div>
      )}

      <div className="scrollbar-thin min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F6F8FC] px-4 py-6 sm:px-6">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        {isLoading && <TypingIndicator />}
        {pathway && (
          <div className={cn("animate-fade-up pt-2", !embedded && "sm:px-6")}>
            <PathwayResultCard result={pathway} compact={embedded} />
          </div>
        )}
        {error && (
          <p className="mx-auto max-w-md rounded-xl bg-rose-50 px-4 py-2.5 text-center text-xs text-rose-700 ring-1 ring-rose-100">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-200/70 bg-white p-3 sm:p-4">
        <div className="flex items-end gap-2 rounded-[22px] bg-slate-50 p-2 ring-1 ring-slate-200/80 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/50">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            disabled={isLoading}
            placeholder={pathway ? "Ask a follow-up question…" : "Type your answer…"}
            aria-label="Your answer"
            className="max-h-[140px] min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-[15px] leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isLoading}
            aria-label="Send"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <ArrowUp className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>Enter to send · Shift + Enter for a new line</span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <RotateCcw className="h-3 w-3" /> Start over
          </button>
        </div>
      </div>
    </div>
  );
}
