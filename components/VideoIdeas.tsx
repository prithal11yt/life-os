"use client";

import { useState, useTransition } from "react";
import { Item } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import { toggleItemAction, addItemAction } from "@/app/actions";

export default function VideoIdeas({
  initial,
  showDone = false,
}: {
  initial: Item[];
  showDone?: boolean;
}) {
  const [items, setItems] = useState<Item[]>(initial.filter((i) => i.type === "video"));
  const [title, setTitle] = useState("");
  const [, startTransition] = useTransition();

  const open = items
    .filter((i) => i.status !== "done")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const made = items
    .filter((i) => i.status === "done")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  function toggle(item: Item) {
    const done = item.status !== "done";
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: done ? "done" : "open" } : i)));
    startTransition(() => void toggleItemAction(item.id, done));
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const optimistic: Item = {
      id: `tmp-${Date.now()}`, created_at: new Date().toISOString(), type: "video", title: t,
      details: null, priority: "medium", category: "business", status: "open", due_at: null, source: "manual", raw_transcript: null,
    };
    setItems((prev) => [optimistic, ...prev]);
    setTitle("");
    startTransition(() => void addItemAction({ title: t, type: "video", category: "business", priority: "medium" }));
  }

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <h3 className="text-[15px] font-bold">Video Ideas</h3>
        </div>
        <span className="text-[12.5px] font-semibold text-[var(--green)]">{open.length} to make</span>
      </div>

      <form onSubmit={add} className="mb-3 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a video idea…"
          className="flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-bright)]"
        />
        <button type="submit" className="rounded-lg bg-[var(--green)] px-3 py-2 text-xs font-semibold text-white">Add</button>
      </form>

      <div className="flex flex-col">
        {open.length === 0 && made.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--muted2)]">
            No video ideas yet — tell Ramu Kaka on Telegram: <br />&ldquo;video idea: …&rdquo; 🎙️
          </p>
        )}
        {open.map((item) => (
          <Row key={item.id} item={item} onToggle={toggle} />
        ))}

        {showDone && made.length > 0 && (
          <>
            <div className="mb-1 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--faint)]">
              Published ({made.length})
            </div>
            {made.map((item) => (
              <Row key={item.id} item={item} onToggle={toggle} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

function Row({ item, onToggle }: { item: Item; onToggle: (i: Item) => void }) {
  const done = item.status === "done";
  return (
    <div className="flex items-center gap-3 border-b border-[var(--line)] py-2.5 last:border-0">
      <button
        onClick={() => onToggle(item)}
        title={done ? "Mark as not made" : "Mark as made"}
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[11px] transition-colors ${
          done ? "border-[var(--green)] bg-[var(--green)] text-white" : "border-[#d7dde5] hover:border-[var(--green)]"
        }`}
      >
        {done ? "✓" : ""}
      </button>
      <span className={`flex-1 text-[13.5px] font-medium ${done ? "text-[var(--faint)] line-through" : ""}`}>
        {item.title}
      </span>
      {item.source === "telegram" && <span className="text-[11px] text-[var(--faint)]">via voice</span>}
      <span className="w-14 text-right text-[11px] text-[var(--faint)]">{relativeTime(item.created_at)}</span>
    </div>
  );
}
