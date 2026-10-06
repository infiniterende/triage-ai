"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
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
import { ArrowRight, Loader2, Mic, MicOff, PhoneOff, RotateCcw } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import PathwayResultCard, { DispositionPill } from "../pathway/PathwayResultCard";
import { api, rememberPatientId } from "@/lib/api";
import type { PathwayResult } from "@/lib/pathway";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_ENDPOINT ?? "";
/** Text-stream topic the voice agent publishes pathway results on. */
const PATHWAY_TOPIC = "agilance.pathway";

type TranscriptLine = {
  id: string;
  role: "assistant" | "user";
  text: string;
  receivedAt: number;
};

/** Payload streamed by backend/agent.py → pathway_payload(). */
type PathwayMessage = {
  type: "pathway";
  final: boolean;
  patient_id: number | null;
  evaluation_id: number | null;
  result: PathwayResult;
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

function VoiceSession({
  pathway,
  onTranscript,
  onPathway,
}: {
  pathway: PathwayMessage | null;
  onTranscript: (lines: TranscriptLine[]) => void;
  onPathway: (msg: PathwayMessage) => void;
}) {
  const room = useRoomContext();
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant, microphoneTrack, isMicrophoneEnabled } = useLocalParticipant();
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant,
  });
  const endRef = useRef<HTMLDivElement>(null);

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

  // Keep the parent's copy current so it survives the call ending.
  useEffect(() => {
    onTranscript(transcript);
  }, [transcript, onTranscript]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [transcript.length, pathway?.final]);

  // Pathway results arrive from the agent as a text stream on a dedicated topic.
  useEffect(() => {
    const handler = async (reader: { readAll: () => Promise<string> }) => {
      try {
        const text = await reader.readAll();
        const msg = JSON.parse(text) as PathwayMessage;
        if (msg?.type === "pathway" && msg.result) onPathway(msg);
      } catch (err) {
        console.error("Bad pathway payload from agent", err);
      }
    };
    try {
      room.registerTextStreamHandler(PATHWAY_TOPIC, handler);
    } catch (err) {
      console.error("Could not register pathway stream handler", err);
    }
    return () => {
      try {
        room.unregisterTextStreamHandler(PATHWAY_TOPIC);
      } catch {
        /* already gone */
      }
    };
  }, [room, onPathway]);

  const label = STATE_LABEL[state] ?? "Connected";
  const live = state === "listening" || state === "speaking" || state === "thinking";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Visualiser */}
      <div className="relative flex flex-col items-center bg-gradient-to-b from-brand-50/70 to-white px-6 pb-6 pt-8">
        <span className={cn("chip bg-white shadow-sm ring-slate-200/80", live ? "text-brand-700" : "text-slate-600")}>
          <span className="relative flex h-2 w-2">
            {live && <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 animate-pulse-ring" />}
            <span className={cn("relative inline-flex h-2 w-2 rounded-full", live ? "bg-brand-600" : "bg-slate-400")} />
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
            {isMicrophoneEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
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
          {isMicrophoneEnabled ? "Speak naturally — pause when you're done and I'll respond." : "Your microphone is muted."}
        </p>
      </div>

      {/* Transcript + result */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto border-t border-slate-200/70 bg-[#F6F8FC] px-4 py-5 sm:px-6">
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Live transcript</p>
        {transcript.length === 0 ? (
          <p className="mx-auto max-w-sm text-center text-sm text-slate-500">Your conversation will appear here as you talk.</p>
        ) : (
          <div className="space-y-4">
            {transcript.map((line) => (
              <ChatMessage key={line.id} role={line.role} content={line.text} html={false} />
            ))}
          </div>
        )}

        {pathway && (
          <div className="mt-5 animate-fade-up">
            {pathway.final ? (
              <PathwayResultCard result={pathway.result} compact />
            ) : (
              <LiveEstimate result={pathway.result} />
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

/** Running estimate shown while the interview is still in progress. */
function LiveEstimate({ result }: { result: PathwayResult }) {
  const primary = result.primary_pathway;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200/70">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live estimate</span>
      <DispositionPill level={result.disposition.level} />
      {result.risk_percent != null && (
        <span className="text-sm font-semibold tabular-nums text-slate-900">{result.risk_percent}% risk</span>
      )}
      {primary && primary.likelihood !== "unlikely" && (
        <span className="text-xs text-slate-500">· {primary.name}</span>
      )}
      <span className="ml-auto text-[11px] text-slate-400">Updates as you answer</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* After the call                                                      */
/* ------------------------------------------------------------------ */

function CallSummary({
  transcript,
  pathway,
  roomName,
  onRestart,
}: {
  transcript: TranscriptLine[];
  pathway: PathwayMessage | null;
  roomName: string | null;
  onRestart: () => void;
}) {
  const [result, setResult] = useState<PathwayResult | null>(pathway?.final ? pathway.result : null);
  const [loading, setLoading] = useState(!pathway?.final && !!roomName);

  // If the agent didn't push a final result before hang-up, the worker
  // evaluates the transcript at shutdown — poll the API for it briefly.
  useEffect(() => {
    if (result || !roomName) return;
    let cancelled = false;
    let attempts = 0;
    const tick = async () => {
      attempts += 1;
      try {
        const data = await api.chatTranscript(roomName);
        if (!cancelled && data.pathway) {
          setResult(data.pathway);
          setLoading(false);
          return;
        }
      } catch {
        /* keep trying */
      }
      if (!cancelled && attempts < 8) setTimeout(tick, 2500);
      else if (!cancelled) setLoading(false);
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [result, roomName]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col items-center gap-2 border-b border-slate-200/70 bg-white px-6 py-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-600">
          <PhoneOff className="h-5 w-5" />
        </span>
        <h3 className="font-display text-xl font-semibold">Call ended</h3>
        <p className="max-w-sm text-sm text-slate-500">
          Your conversation has been saved to your record. Here is the transcript and your result.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onRestart} className="btn-secondary">
            <RotateCcw className="h-4 w-4" /> Start another call
          </button>
          <Link href="/patient?tab=conversations" className="btn-primary">
            View in my dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-[#F6F8FC] px-4 py-5 sm:px-6">
        {result ? (
          <PathwayResultCard result={result} />
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-6 text-sm text-slate-500 ring-1 ring-slate-200/70">
            <Loader2 className="h-4 w-4 animate-spin" /> Evaluating your conversation…
          </div>
        ) : pathway ? (
          <LiveEstimate result={pathway.result} />
        ) : (
          <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-500 ring-1 ring-slate-200/70">
            The call ended before an assessment could be made.
          </p>
        )}

        {transcript.length > 0 && (
          <>
            <p className="mb-4 mt-8 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Transcript</p>
            <div className="space-y-4">
              {transcript.map((line) => (
                <ChatMessage key={line.id} role={line.role} content={line.text} html={false} />
              ))}
            </div>
          </>
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
  const [roomName, setRoomName] = useState<string | null>(null);
  const [phase, setPhase] = useState<"setup" | "live" | "ended">("setup");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [pathway, setPathway] = useState<PathwayMessage | null>(null);

  // Restore a previously used name so returning patients aren't re-asked.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("agilance.voice.name");
      if (saved) setName(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const onTranscript = useCallback((lines: TranscriptLine[]) => {
    if (lines.length) setTranscript(lines);
  }, []);

  const onPathway = useCallback((msg: PathwayMessage) => {
    // Never let a late running estimate overwrite the final result.
    setPathway((prev) => (prev?.final && !msg.final ? prev : msg));
    if (msg.final) rememberPatientId(msg.patient_id);
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
      setTranscript([]);
      setPathway(null);
      setRoomName(data.room ?? null);
      setToken(data.token);
      setPhase("live");
    } catch (err) {
      console.error(err);
      setError("We couldn't connect to the voice assistant. Please try again in a moment.");
    } finally {
      setIsConnecting(false);
    }
  };

  const restart = () => {
    setToken(null);
    setRoomName(null);
    setTranscript([]);
    setPathway(null);
    setPhase("setup");
  };

  if (phase === "live" && token) {
    return (
      <LiveKitRoom
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect
        audio
        video={false}
        onDisconnected={() => {
          setToken(null);
          setPhase("ended");
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <RoomAudioRenderer />
        <VoiceSession pathway={pathway} onTranscript={onTranscript} onPathway={onPathway} />
      </LiveKitRoom>
    );
  }

  if (phase === "ended") {
    return <CallSummary transcript={transcript} pathway={pathway} roomName={roomName} onRestart={restart} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
      <span className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
        <span className="absolute inset-0 rounded-full bg-brand-200/60 animate-pulse-ring" />
        <Mic className="relative h-7 w-7" />
      </span>
      <h2 className="mt-6 font-display text-2xl font-semibold">Talk it through</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        Have a natural conversation with the Agilance voice assistant. It will ask about your symptoms, listen,
        and give you the same risk estimate and recommendation as the text assessment. You&apos;ll see a live
        transcript as you go.
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
          <p className="mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-left text-sm text-rose-700 ring-1 ring-rose-100">{error}</p>
        )}
        <button type="submit" disabled={isConnecting || !name.trim()} className="btn-primary mt-4 w-full py-3 text-[15px]">
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
        <p className="mt-3 text-xs text-slate-400">Your browser will ask for microphone access.</p>
      </form>
    </div>
  );
}
