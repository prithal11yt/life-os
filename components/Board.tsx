"use client";

import { useMemo, useState, useTransition } from "react";
import { Item, ItemType, Category, Priority } from "@/lib/types";
import { relativeTime, isOverdue } from "@/lib/format";
import { toggleItemAction, addItemAction } from "@/app/actions";

const TYPE_META: Record<ItemType, { icon: string; label: string }> = {
  task: { icon: "☑️", label: "Task" },
  idea: { icon: "💡", label: "Idea" },
  reminder: { icon: "⏰", label: "Reminder" },
};

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "bg-red-500/15 text-red-500 ring-red-500/25",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/25",
  low: "bg-zinc-500/15 text-zinc-500 ring-zinc-500/25",
};

const CATEGORY_STYLE: Record<Category, string> = {
  business: "bg-violet-500/15 text-violet-500 ring-violet-500/25",
  personal: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-500/25",
};

type TypeFilter = "all" | ItemType;
type CatFilter = "all" | Category;

export default function Board({
  initialItems,
  isSample,
}: {
  initialItems: Item[];
  isSample: boolean;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [catFilter, setCatFilter] = useState<CatFilter>("all");
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    return items
      .filter((i) => typeFilter === "all" || i.type === typeFilter)
      .filter((i) => catFilter === "all" || i.category === catFilter)
      .sort((a, b) => {
        // Open items before done.
        if ((a.status === "done") !== (b.status === "done"))
          return a.status === "done" ? 1 : -1;
        // Then by priority.
        if (PRIORITY_RANK[a.priority] !== PRIORITY_RANK[b.priority])
          return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        // Then by soonest due date (nulls last).
        const ad = a.due_at ? new Date(a.due_at).getTime() : Infinity;
        const bd = b.due_at ? new Date(b.due_at).getTime() : Infinity;
        return ad - bd;
      });
  }, [items, typeFilter, catFilter]);

  function toggle(item: Item) {
    const done = item.status !== "done";
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: done ? "done" : "open" } : i))
    );
    if (!isSample) startTransition(() => void toggleItemAction(item.id, done));
  }

  function addQuick(draft: { title: string; type: ItemType; category: Category; priority: Priority }) {
    const optimistic: Item = {
      id: `tmp-${Date.now()}`,
      created_at: new Date().toISOString(),
      type: draft.type,
      title: draft.title,
      details: null,
      priority: draft.priority,
      category: draft.category,
      status: "open",
      due_at: null,
      source: "manual",
      raw_transcript: null,
    };
    setItems((prev) => [optimistic, ...prev]);
    if (!isSample) startTransition(() => void addItemAction(draft));
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Captured</h2>
        <div className="flex flex-wrap gap-1.5">
          <FilterGroup
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              ["all", "All"],
              ["task", "Tasks"],
              ["idea", "Ideas"],
              ["reminder", "Reminders"],
            ]}
          />
        </div>
      </div>

      <div className="mb-4 flex gap-1.5">
        <FilterGroup
          value={catFilter}
          onChange={setCatFilter}
          options={[
            ["all", "Everything"],
            ["business", "Business"],
            ["personal", "Personal"],
          ]}
        />
      </div>

      <QuickAdd onAdd={addQuick} />

      <ul className="mt-3 flex flex-col gap-2">
        {visible.length === 0 && (
          <li className="py-10 text-center text-sm text-[var(--muted)]">
            Nothing here yet. Drop a voice note in Telegram and it&apos;ll appear.
          </li>
        )}
        {visible.map((item) => {
          const done = item.status === "done";
          const overdue = !done && isOverdue(item.due_at);
          return (
            <li
              key={item.id}
              className={`group flex items-start gap-3 rounded-xl border border-[var(--border)] p-3 transition-colors ${
                done ? "opacity-55" : "hover:border-zinc-400/40"
              }`}
            >
              <button
                aria-label={done ? "Mark open" : "Mark done"}
                onClick={() => toggle(item)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] transition-colors ${
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-[var(--border)] hover:border-emerald-500"
                }`}
              >
                {done ? "✓" : ""}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium leading-snug ${done ? "line-through" : ""}`}>
                    <span className="mr-1.5">{TYPE_META[item.type].icon}</span>
                    {item.title}
                  </p>
                  {item.due_at && (
                    <span
                      className={`shrink-0 whitespace-nowrap text-xs ${
                        overdue ? "font-semibold text-red-500" : "text-[var(--muted)]"
                      }`}
                    >
                      {overdue ? "overdue" : relativeTime(item.due_at)}
                    </span>
                  )}
                </div>
                {item.details && (
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{item.details}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge className={PRIORITY_STYLE[item.priority]}>{item.priority}</Badge>
                  <Badge className={CATEGORY_STYLE[item.category]}>{item.category}</Badge>
                  {item.source === "telegram" && (
                    <span className="text-[11px] text-[var(--muted)]">· via voice</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${className}`}
    >
      {children}
    </span>
  );
}

function FilterGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex rounded-lg bg-black/5 p-0.5 dark:bg-white/5">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === v
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function QuickAdd({
  onAdd,
}: {
  onAdd: (d: { title: string; type: ItemType; category: Category; priority: Priority }) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ItemType>("task");
  const [category, setCategory] = useState<Category>("business");
  const [priority, setPriority] = useState<Priority>("medium");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onAdd({ title: t, type, category, priority });
    setTitle("");
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Quick add a task or idea…"
        className="min-w-[160px] flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ItemType)}
        className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 text-xs"
      >
        <option value="task">Task</option>
        <option value="idea">Idea</option>
        <option value="reminder">Reminder</option>
      </select>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
        className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 text-xs"
      >
        <option value="business">Business</option>
        <option value="personal">Personal</option>
      </select>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 text-xs"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <button
        type="submit"
        className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[#04121a] transition-opacity hover:opacity-90"
      >
        Add
      </button>
    </form>
  );
}
