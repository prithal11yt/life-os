"use client";

import { useState, useTransition } from "react";
import { HabitView } from "@/lib/habits";
import { toggleHabitTodayAction, addHabitAction, archiveHabitAction } from "@/app/actions";

const CHIP: Record<string, string> = {
  violet: "bg-[#f3edfd]", emerald: "bg-[#e9f8ef]", sky: "bg-[#e8f3fd]", amber: "bg-[#fef1e7]",
};

export default function HabitsManager({ initialHabits }: { initialHabits: HabitView[] }) {
  const [habits, setHabits] = useState<HabitView[]>(initialHabits);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [, startTransition] = useTransition();

  function toggle(h: HabitView) {
    const nowDone = !h.doneToday;
    setHabits((prev) => prev.map((x) => x.id === h.id ? {
      ...x, doneToday: nowDone,
      weekDone: Math.min(7, Math.max(0, x.weekDone + (nowDone ? 1 : -1))),
      streak: nowDone ? x.streak + 1 : Math.max(0, x.streak - 1),
      total: nowDone ? x.total + 1 : Math.max(0, x.total - 1),
    } : x));
    startTransition(() => void toggleHabitTodayAction(h.id));
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const n = name.trim(); const em = emoji.trim() || "✅";
    setName(""); setEmoji("");
    startTransition(async () => {
      const res = await addHabitAction(n, em);
      if (res.ok && res.habit) setHabits((p) => [...p, { ...res.habit, doneToday: false, streak: 0, total: 0, weekDone: 0 }]);
    });
  }

  function remove(h: HabitView) {
    setHabits((prev) => prev.filter((x) => x.id !== h.id));
    startTransition(() => void archiveHabitAction(h.id));
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold">Your Habits</span>
        <span className="text-[12.5px] font-semibold text-[var(--green)]">
          {habits.filter((h) => h.doneToday).length}/{habits.length} done today
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {habits.map((h) => {
          const pct = Math.round((h.weekDone / 7) * 100);
          return (
            <div key={h.id} className="flex items-center gap-3">
              <span className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] text-[18px] ${CHIP[h.color] ?? CHIP.emerald}`}>{h.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold">{h.name}</span>
                  <span className="flex items-center gap-3 text-[12px] font-semibold text-[var(--muted)]">
                    <span className="text-amber-500">🔥 {h.streak}</span>
                    <span>{h.weekDone}/7 this week</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[#eef1f4]"><div className="h-full rounded bg-[var(--green-bright)]" style={{ width: `${pct}%` }} /></div>
              </div>
              <button
                onClick={() => toggle(h)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  h.doneToday ? "bg-[var(--green)] text-white" : "border border-[var(--line)] text-[var(--muted)] hover:border-[var(--green)] hover:text-[var(--green)]"
                }`}
              >
                {h.doneToday ? "✓ Done" : "Mark today"}
              </button>
              <button onClick={() => remove(h)} title="Remove habit" className="shrink-0 px-1 text-[var(--faint)] hover:text-[var(--red)]">✕</button>
            </div>
          );
        })}
        {habits.length === 0 && <p className="py-4 text-center text-sm text-[var(--muted2)]">No habits yet — add one below.</p>}
      </div>

      <form onSubmit={add} className="mt-5 flex items-center gap-2 border-t border-[var(--line)] pt-4">
        <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🙂" className="w-12 rounded-lg border border-[var(--line)] bg-white px-2 py-2 text-center text-sm outline-none focus:border-[var(--green-bright)]" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a habit…" className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--green-bright)]" />
        <button type="submit" className="rounded-lg bg-[var(--green)] px-4 py-2 text-xs font-semibold text-white">Add habit</button>
      </form>
    </div>
  );
}
