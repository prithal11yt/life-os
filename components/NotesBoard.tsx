"use client";

import { useState, useTransition } from "react";
import { Item } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import { addItemAction, toggleItemAction } from "@/app/actions";

const CARD_TINT = ["bg-[#fef9e7]", "bg-[#eafaf0]", "bg-[#e8f3fd]", "bg-[#f3edfd]", "bg-[#fdeef0]"];

export default function NotesBoard({ initialNotes }: { initialNotes: Item[] }) {
  const [notes, setNotes] = useState<Item[]>(initialNotes.filter((n) => n.status !== "done"));
  const [text, setText] = useState("");
  const [, startTransition] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const optimistic: Item = {
      id: `tmp-${Date.now()}`, created_at: new Date().toISOString(), type: "idea", title: t,
      details: null, priority: "low", category: "business", status: "open", due_at: null, source: "manual", raw_transcript: null,
    };
    setNotes((p) => [optimistic, ...p]);
    setText("");
    startTransition(() => void addItemAction({ title: t, type: "idea", category: "business", priority: "low" }));
  }

  function archive(n: Item) {
    setNotes((p) => p.filter((x) => x.id !== n.id));
    startTransition(() => void toggleItemAction(n.id, true));
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={add} className="card flex gap-2 p-4">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Jot down an idea or note…" className="flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--green-bright)]" />
        <button type="submit" className="rounded-lg bg-[var(--green)] px-4 py-2.5 text-sm font-semibold text-white">Add</button>
      </form>

      {notes.length === 0 ? (
        <div className="card p-10 text-center text-sm text-[var(--muted2)]">No notes yet. Ideas you capture by voice land here too. 💡</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n, i) => (
            <div key={n.id} className={`rounded-2xl border border-[var(--line)] p-4 ${CARD_TINT[i % CARD_TINT.length]}`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="text-lg">💡</span>
                <button onClick={() => archive(n)} title="Archive" className="text-[var(--faint)] hover:text-[var(--ink)]">✓</button>
              </div>
              <p className="text-[13.5px] font-medium leading-relaxed text-[var(--ink)]">{n.title}</p>
              {n.details && <p className="mt-1 text-xs text-[var(--muted)]">{n.details}</p>}
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--muted2)]">
                <span className="capitalize">{n.category}</span>
                <span>·</span>
                <span>{relativeTime(n.created_at)}</span>
                {n.source === "telegram" && <span>· via voice</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
