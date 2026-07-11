"use client";

import { useMemo, useState, useTransition } from "react";
import { HabitView } from "@/lib/habits";
import { toggleHabitTodayAction, addHabitAction } from "@/app/actions";

// GitHub-style contribution grid + per-habit streaks.
export default function HabitTracker({
  initialHabits,
  countByDay,
  days,
  today,
}: {
  initialHabits: HabitView[];
  countByDay: Record<string, number>;
  days: string[]; // oldest → newest, yyyy-mm-dd
  today: string;
}) {
  const [habits, setHabits] = useState<HabitView[]>(initialHabits);
  const [, startTransition] = useTransition();

  const totalHabits = habits.length;
  const doneTodayCount = habits.filter((h) => h.doneToday).length;

  function toggle(h: HabitView) {
    const nowDone = !h.doneToday;
    setHabits((prev) =>
      prev.map((x) =>
        x.id === h.id
          ? {
              ...x,
              doneToday: nowDone,
              streak: nowDone ? x.streak + 1 : Math.max(0, x.streak - 1),
              total: nowDone ? x.total + 1 : Math.max(0, x.total - 1),
            }
          : x
      )
    );
    startTransition(() => void toggleHabitTodayAction(h.id));
  }

  function add(name: string, emoji: string) {
    startTransition(async () => {
      const res = await addHabitAction(name, emoji);
      if (res.ok && res.habit) {
        setHabits((prev) => [
          ...prev,
          { ...res.habit, doneToday: false, streak: 0, total: 0 },
        ]);
      }
    });
  }

  // Effective per-day count: today reflects live toggles.
  const effCount = (day: string) => (day === today ? doneTodayCount : countByDay[day] ?? 0);

  // Build week columns (each column = 7 days, top = Sunday), padded to align.
  const weeks = useMemo(() => {
    const firstDow = new Date(days[0] + "T12:00:00Z").getUTCDay();
    const cells: (string | null)[] = [...Array(firstDow).fill(null), ...days];
    const cols: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
    return cols;
  }, [days]);

  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🟩</span>
          <h3 className="text-sm font-semibold">Habits</h3>
        </div>
        <span className="text-xs text-[var(--muted)]">
          {totalHabits > 0 ? (
            <>
              <span className="font-semibold text-[var(--accent)]">{doneTodayCount}</span> / {totalHabits} today
            </>
          ) : (
            "no habits yet"
          )}
        </span>
      </div>

      {/* Per-habit rows with today toggle + streak */}
      <div className="mb-5 flex flex-col gap-2">
        {habits.map((h) => (
          <div key={h.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-2.5">
            <span className="text-lg">{h.emoji}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{h.name}</span>
            <span
              className={`whitespace-nowrap text-xs ${h.streak > 0 ? "text-amber-400" : "text-[var(--muted)]"}`}
              title="Current streak"
            >
              🔥 {h.streak}
            </span>
            <button
              onClick={() => toggle(h)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                h.doneToday
                  ? "bg-[var(--accent)] text-[#04121a]"
                  : "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
              }`}
            >
              {h.doneToday ? "✓ Done" : "Mark today"}
            </button>
          </div>
        ))}
        <AddHabit onAdd={add} />
      </div>

      {/* Contribution grid */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-[3px]">
          {weeks.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              {col.map((day, ri) => {
                if (!day) return <span key={ri} className="h-3 w-3" />;
                const ratio = totalHabits ? effCount(day) / totalHabits : 0;
                return (
                  <span
                    key={ri}
                    title={`${day}: ${effCount(day)}/${totalHabits}`}
                    className={`h-3 w-3 rounded-[3px] ${day === today ? "ring-1 ring-[var(--accent)]" : ""}`}
                    style={{ background: intensity(ratio) }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <span key={r} className="h-3 w-3 rounded-[3px]" style={{ background: intensity(r) }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </section>
  );
}

function intensity(ratio: number): string {
  if (ratio <= 0) return "rgba(255,255,255,0.05)";
  if (ratio <= 0.25) return "rgba(34,211,238,0.25)";
  if (ratio <= 0.5) return "rgba(34,211,238,0.45)";
  if (ratio <= 0.75) return "rgba(34,211,238,0.7)";
  return "rgba(34,211,238,1)";
}

function AddHabit({ onAdd }: { onAdd: (name: string, emoji: string) => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAdd(name.trim(), emoji.trim() || "✅");
        setName("");
        setEmoji("");
      }}
      className="flex items-center gap-2"
    >
      <input
        value={emoji}
        onChange={(e) => setEmoji(e.target.value)}
        placeholder="🙂"
        className="w-12 rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 text-center text-sm outline-none focus:border-[var(--accent)]"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add a habit…"
        className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
      />
      <button
        type="submit"
        className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[#04121a] transition-opacity hover:opacity-90"
      >
        Add
      </button>
    </form>
  );
}
