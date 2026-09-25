import { cn } from "@/lib/utils";
import { LogoMark } from "../brand/Logo";

/** Very small markdown subset used by the backend: **bold**, *italic*, newlines. */
export function formatMessage(content: string): string {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export function ChatMessage({
  role,
  content,
  html = true,
  timestamp,
}: {
  role: "user" | "assistant";
  content: string;
  /** Render the backend's lightweight markdown; plain text otherwise. */
  html?: boolean;
  timestamp?: string;
}) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex items-end gap-2.5 animate-fade-up",
        isUser && "flex-row-reverse",
      )}
    >
      {!isUser && (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200">
          <LogoMark className="h-[18px] w-[18px]" />
        </span>
      )}
      <div className={cn("max-w-[82%] sm:max-w-[70%]", isUser && "text-right")}>
        {html ? (
          <div
            className={cn(
              "inline-block rounded-2xl px-4 py-3 text-left text-[15px] leading-6",
              isUser
                ? "rounded-br-md bg-brand-600 text-white"
                : "rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/70",
            )}
            dangerouslySetInnerHTML={{ __html: formatMessage(content) }}
          />
        ) : (
          <p
            className={cn(
              "inline-block whitespace-pre-wrap rounded-2xl px-4 py-3 text-left text-[15px] leading-6",
              isUser
                ? "rounded-br-md bg-brand-600 text-white"
                : "rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/70",
            )}
          >
            {content}
          </p>
        )}
        {timestamp && (
          <p className="mt-1 px-1 text-[11px] text-slate-400">{timestamp}</p>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator({ label = "Thinking…" }: { label?: string }) {
  return (
    <div className="flex items-end gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200">
        <LogoMark className="h-[18px] w-[18px]" />
      </span>
      <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/70">
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    </div>
  );
}
