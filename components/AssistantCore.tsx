"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/lib/types";
import { buildBriefing } from "@/lib/greeting";
import { talkToAssistant } from "@/app/actions";

// Typewriter hook — makes the assistant feel like it's "speaking".
function useTypewriter(text: string, speed = 18) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { out, done };
}

export default function AssistantCore({
  items,
  addressAs,
  assistantName,
}: {
  items: Item[];
  addressAs: string;
  assistantName: string;
}) {
  const router = useRouter();
  const briefing = buildBriefing(items, addressAs);

  // The line the assistant is currently "saying" — briefing first, then replies.
  const [line, setLine] = useState(briefing);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const { out, done } = useTypewriter(line);
  const inputRef = useRef<HTMLInputElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setThinking(true);
    setLine(`Right away, ${addressAs}…`);
    try {
      const { reply, saved } = await talkToAssistant(text);
      setLine(reply);
      if (saved) router.refresh();
    } catch {
      setLine(`My apologies, ${addressAs} — I hit a snag. Would you try again?`);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  }

  return (
    <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
      {/* soft accent wash */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className={`orb ${thinking ? "is-thinking" : ""}`}>
          <span className="orb-ring orb-ring--3" />
          <span className="orb-ring orb-ring--1" />
          <span className="orb-ring orb-ring--2" />
          <span className="orb-core" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {assistantName}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="eq" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </span>
              {thinking ? "processing" : "online"}
            </span>
          </div>

          <p
            className={`min-h-[3.5rem] text-lg leading-relaxed text-[var(--foreground)] sm:text-xl ${
              done ? "" : "caret"
            }`}
          >
            {out}
          </p>

          <form onSubmit={send} className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-black/30 px-3 py-2.5 focus-within:border-[var(--accent)]">
              <span className="text-[var(--accent)]">⟩</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Talk to ${assistantName} — "remind me to call the editor at 4"`}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <button
              type="submit"
              disabled={thinking}
              className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#04121a] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
