"use client";

import { useMemo, useState, useTransition } from "react";
import { Item, ItemType, Category, Priority } from "@/lib/types";
import { relativeTime, isOverdue } from "@/lib/format";
import { toggleItemAction, addItemAction } from "@/app/actions";

const TYPE_EMOJI: Record<ItemType, string> = { task: "☑️", idea: "💡", reminder: "⏰" };
const PRI_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const PRI_PILL: Record<Priority, string> = {
  high: "text-[#ef4444] bg-[#fdecec]",
  medium: "text-[#f59e0b] bg-[#fef4e5]",
  low: "text-[#16a34a] bg-[#e9f8ef]",
};
type TypeFilter = "all" | ItemType;

export default function TasksBoard({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [type, setType] = useState<TypeFilter>("all");
  const [, startTransition] = useTransition();

  const sort = (list: Item[]) =>
    [...list].sort((a, b) => {
      if ((a.status === "done") !== (b.status === "done")) return a.status === "done" ? 1 : -1;
      if (PRI_RANK[a.priority] !== PRI_RANK[b.priority]) return PRI_RANK[a.priority] - PRI_RANK[b.priority];
      const ad = a.due_at ? new Date(a.due_at).getTime() : Infinity;
      const bd = b.due_at ? new Date(b.due_at).getTime() : Infinity;
      return ad - bd;
    });

  const cols = useMemo(() => {
    const f = items.filter((i) => type === "all" || i.type === type);
    return {
      business: sort(f.filter((i) => i.category === "business")),
      personal: sort(f.filter((i) => i.category === "personal")),
    };
  }, [items, type]);

  function toggle(item: Item) {
    const done = item.status !== "done";
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: done ? "done" : "open" } : i)));
    startTransition(() => void toggleItemAction(item.id, done));
  }

  function add(draft: { title: string; type: ItemType; category: Category; priority: Priority }) {
    const optimistic: Item = {
      id: `tmp-${Date.now()}`, created_at: new Date().toISOString(), type: draft.type, title: draft.title,
      details: null, priority: draft.priority, category: draft.category, status: "open", due_at: null,
      source: "manual", raw_transcript: null,
    };
    setItems((prev) => [optimistic, ...prev]);
    startTransition(() => void addItemAction(draft));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-[var(--line)]">
          {(["all", "task", "idea", "reminder"] as TypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                type === t ? "bg-[var(--green-soft)] text-[var(--green)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {t === "all" ? "All" : t + "s"}
            </button>
          ))}
        </div>
        <QuickAdd onAdd={add} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Column label="Business" icon="💼" items={cols.business} onToggle={toggle} />
        <Column label="Personal" icon="🏡" items={cols.personal} onToggle={toggle} />
      </div>
    </div>
  );
}

function Column({ label, icon, items, onToggle }: { label: string; icon: string; items: Item[]; onToggle: (i: Item) => void }) {
  const open = items.filter((i) => i.status !== "done").length;
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span>{icon}</span>
        <h3 className="text-[15px] font-bold">{label}</h3>
        <span className="text-xs font-semibold text-[var(--muted2)]">{open} open</span>
      </div>
      <div className="flex flex-col">
        {items.length === 0 && <p className="py-6 text-center text-sm text-[var(--muted2)]">Nothing here.</p>}
        {items.map((item) => {
          const done = item.status === "done";
          const overdue = !done && isOverdue(item.due_at);
          return (
            <div key={item.id} className="flex items-center gap-3 border-b border-[var(--line)] py-2.5 last:border-0">
              <button
                onClick={() => onToggle(item)}
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[11px] transition-colors ${
                  done ? "border-[var(--green)] bg-[var(--green)] text-white" : "border-[#d7dde5] hover:border-[var(--green)]"
                }`}
              >
                {done ? "✓" : ""}
              </button>
              <span className={`flex-1 text-[13.5px] font-medium ${done ? "text-[var(--faint)] line-through" : ""}`}>
                <span className="mr-1.5">{TYPE_EMOJI[item.type]}</span>{item.title}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${PRI_PILL[item.priority]}`}>{item.priority}</span>
              {item.due_at && (
                <span className={`w-12 text-right text-[11px] ${overdue ? "font-semibold text-[var(--red)]" : "text-[var(--faint)]"}`}>
                  {overdue ? "overdue" : relativeTime(item.due_at)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickAdd({ onAdd }: { onAdd: (d: { title: string; type: ItemType; category: Category; priority: Priority }) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ItemType>("task");
  const [category, setCategory] = useState<Category>("business");
  const [priority, setPriority] = useState<Priority>("medium");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onAdd({ title: title.trim(), type, category, priority }); setTitle(""); }}
      className="flex flex-wrap items-center gap-2"
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add an item…" className="min-w-[150px] flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-bright)]" />
      <select value={type} onChange={(e) => setType(e.target.value as ItemType)} className="rounded-lg border border-[var(--line)] bg-white px-2 py-2 text-xs"><option value="task">Task</option><option value="idea">Idea</option><option value="reminder">Reminder</option></select>
      <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="rounded-lg border border-[var(--line)] bg-white px-2 py-2 text-xs"><option value="business">Business</option><option value="personal">Personal</option></select>
      <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="rounded-lg border border-[var(--line)] bg-white px-2 py-2 text-xs"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
      <button type="submit" className="rounded-lg bg-[var(--green)] px-3 py-2 text-xs font-semibold text-white">Add</button>
    </form>
  );
}
