"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
  useTrackTranscription,
  useVoiceAssistant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Loader2, Mic, MicOff, PhoneOff } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? "";

type TranscriptLine = {
  id: string;
  role: "assistant" | "user";
  text: string;
  receivedAt: number;
};

const STATE_LABEL: Record<string, string> = {
  disconnected: "Disconnected",
  connecting: "Connecting…",
  initializing: "Getting ready…",
  listening: "Listening",
  thinking: "Thinking…",
  speaking: "Speaking",
};

/* ------------------------------------------------------------------ */
/* In-room UI                                                          */
/* ------------------------------------------------------------------ */

function VoiceSession() {
  const room = useRoomContext();
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant, microphoneTrack, isMicrophoneEnabled } =
    useLocalParticipant();
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant,
  });

  const transcript = useMemo<TranscriptLine[]>(() => {
    const agent = (agentTranscriptions ?? []).map((t) => ({
      id: t.id,
      role: "assistant" as const,
      text: t.text,
      receivedAt: t.firstReceivedTime,
    }));
    const user = (userTranscriptions ?? []).map((t) => ({
      id: t.id,
      role: "user" as const,
      text: t.text,
      receivedAt: t.firstReceivedTime,
    }));
    return [...agent, ...user].sort((a, b) => a.receivedAt - b.receivedAt);
  }, [agentTranscriptions, userTranscriptions]);

  const label = STATE_LABEL[state] ?? "Connected";
  const live = state === "listening" || state === "speaking" || state === "thinking";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Visualiser */}
      <div className="relative flex flex-col items-center bg-gradient-to-b from-brand-50/70 to-white px-6 pb-6 pt-8">
        <span
          className={cn(
            "chip bg-white shadow-sm ring-slate-200/80",
            live ? "text-brand-700" : "text-slate-600",
          )}
        >
          <span className="relative flex h-2 w-2">
            {live && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 animate-pulse-ring" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                live ? "bg-brand-600" : "bg-slate-400",
              )}
            />
          </span>
          {label}
        </span>

        <div className="mt-6 h-24 w-full max-w-xs">
          <BarVisualizer state={state} barCount={9} trackRef={audioTrack} />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
            aria-pressed={!isMicrophoneEnabled}
            aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
            className={cn(
              "grid h-12 w-12 place-items-center rounded-full transition",
              isMicrophoneEnabled
                ? "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                : "bg-slate-900 text-white hover:bg-slate-800",
            )}
          >
            {isMicrophoneEnabled ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => void room.disconnect()}
            aria-label="End session"
            className="grid h-14 w-14 place-items-center rounded-full bg-rose-500 text-white shadow-[0_10px_24px_-10px_rgba(225,29,72,.8)] transition hover:bg-rose-600"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
          <span className="w-12" aria-hidden="true" />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {isMicrophoneEnabled
            ? "Speak naturally — pause when you're done and I'll respond."
            : "Your microphone is muted."}
        </p>
      </div>

      {/* Transcript */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto border-t border-slate-200/70 bg-[#F6F8FC] px-4 py-5 sm:px-6">
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Live transcript
        </p>
        {transcript.length === 0 ? (
          <p className="mx-auto max-w-sm text-center text-sm text-slate-500">
            Your conversation will appear here as you talk.
          </p>
        ) : (
          <div className="space-y-4">
            {transcript.map((line) => (
              <ChatMessage key={line.id} role={line.role} content={line.text} html={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Setup + room wrapper                                                */
/* ------------------------------------------------------------------ */

export default function VoiceAssessment() {
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore a previously used name so returning patients aren't re-asked.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("agilance.voice.name");
      if (saved) setName(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const connect = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsConnecting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/getToken?name=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      if (!data?.token) throw new Error("No token returned");
      try {
        window.localStorage.setItem("agilance.voice.name", trimmed);
      } catch {
        /* ignore */
      }
      setToken(data.token);
    } catch (err) {
      console.error(err);
      setError("We couldn't connect to the voice assistant. Please try again in a moment.");
    } finally {
      setIsConnecting(false);
    }
  };

  if (token) {
    return (
      <LiveKitRoom
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect
        audio
        video={false}
        onDisconnected={() => setToken(null)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <RoomAudioRenderer />
        <VoiceSession />
      </LiveKitRoom>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
      <span className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
        <span className="absolute inset-0 rounded-full bg-brand-200/60 animate-pulse-ring" />
        <Mic className="relative h-7 w-7" />
      </span>
      <h2 className="mt-6 font-display text-2xl font-semibold">
        Talk it through
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        Have a natural conversation with the Agilance voice assistant. It will
        ask about your symptoms, listen, and guide you to the right next step.
        You&apos;ll see a live transcript as you go.
      </p>

      <form onSubmit={connect} className="mt-8 w-full max-w-sm">
        <label htmlFor="voice-name" className="field-label text-left">
          What should we call you?
        </label>
        <input
          id="voice-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your first name"
          autoComplete="given-name"
          required
          className="field-input"
        />
        {error && (
          <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-left text-sm text-rose-700 ring-1 ring-rose-100">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isConnecting || !name.trim()}
          className="btn-primary mt-4 w-full py-3 text-[15px]"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" /> Start voice session
            </>
          )}
        </button>
        <p className="mt-3 text-xs text-slate-400">
          Your browser will ask for microphone access.
        </p>
      </form>
    </div>
  );
}
