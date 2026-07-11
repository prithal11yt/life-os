"use client";

import { useState, useTransition } from "react";
import { Item, ItemType, Priority } from "@/lib/types";
import { relativeTime, isOverdue } from "@/lib/format";
import { toggleItemAction, addItemAction } from "@/app/actions";

const TYPE_EMOJI: Record<ItemType, string> = { task: "☑️", idea: "💡", reminder: "⏰", video: "🎬" };
const PRI_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const PRI_PILL: Record<Priority, string> = {
  high: "text-[#ef4444] bg-[#fdecec]",
  medium: "text-[#f59e0b] bg-[#fef4e5]",
  low: "text-[#16a34a] bg-[#e9f8ef]",
};
const CHIP_BG: Record<Priority, string> = { high: "bg-[#fdecec]", medium: "bg-[#fef4e5]", low: "bg-[#e9f8ef]" };

export default function PriorityTasks({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [, startTransition] = useTransition();

  const visible = items
    .filter((i) => i.type !== "idea" && i.type !== "video")
    .sort((a, b) => {
      if ((a.status === "done") !== (b.status === "done")) return a.status === "done" ? 1 : -1;
      if (PRI_RANK[a.priority] !== PRI_RANK[b.priority]) return PRI_RANK[a.priority] - PRI_RANK[b.priority];
      const ad = a.due_at ? new Date(a.due_at).getTime() : Infinity;
      const bd = b.due_at ? new Date(b.due_at).getTime() : Infinity;
      return ad - bd;
    })
    .slice(0, 6);

  function toggle(item: Item) {
    const done = item.status !== "done";
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: done ? "done" : "open" } : i)));
    startTransition(() => void toggleItemAction(item.id, done));
  }

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const optimistic: Item = {
      id: `tmp-${Date.now()}`,
      created_at: new Date().toISOString(),
      type: "task",
      title: t,
      details: null,
      priority: "high",
      category: "business",
      status: "open",
      due_at: null,
      source: "manual",
      raw_transcript: null,
    };
    setItems((prev) => [optimistic, ...prev]);
    setTitle("");
    setAdding(false);
    startTransition(() =>
      void addItemAction({ title: t, type: "task", category: "business", priority: "high" })
    );
  }

  return (
    <section className="card flex flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold">High Priority Tasks</span>
        <span className="text-[12.5px] font-semibold text-[var(--green)]">{visible.length}</span>
      </div>

      <div className="flex flex-col gap-1">
        {visible.length === 0 && (
          <p className="py-4 text-center text-sm text-[var(--muted2)]">All clear — nothing urgent.</p>
        )}
        {visible.map((item) => {
          const done = item.status === "done";
          const overdue = !done && isOverdue(item.due_at);
          return (
            <div key={item.id} className="flex items-center gap-3 py-2">
              <button
                onClick={() => toggle(item)}
                title={done ? "Mark open" : "Mark done"}
                className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] text-sm transition-colors ${
                  done ? "bg-[var(--green-soft)]" : CHIP_BG[item.priority]
                }`}
              >
                {done ? "✅" : TYPE_EMOJI[item.type]}
              </button>
              <span className={`flex-1 text-[13.5px] font-semibold ${done ? "text-[var(--faint)] line-through" : ""}`}>
                {item.title}
              </span>
              <span className={`rounded-full px-2.5 py-[3px] text-[11px] font-bold capitalize ${PRI_PILL[item.priority]}`}>
                {item.priority}
              </span>
              <span className={`w-12 text-right text-[12px] ${overdue ? "font-semibold text-[var(--red)]" : "text-[var(--faint)]"}`}>
                {item.due_at ? (overdue ? "overdue" : relativeTime(item.due_at)) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {adding ? (
        <form onSubmit={submitAdd} className="mt-3 flex gap-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => !title && setAdding(false)}
            placeholder="New task…"
            className="flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-bright)]"
          />
          <button type="submit" className="rounded-lg bg-[var(--green)] px-3 py-2 text-xs font-semibold text-white">
            Add
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#d7dde5] py-3 text-[13px] font-semibold text-[var(--muted2)] transition-colors hover:border-[var(--green-bright)] hover:text-[var(--green)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add new task
        </button>
      )}
    </section>
  );
}
