"use client";

import { useState, useTransition } from "react";
import { HabitView } from "@/lib/habits";
import { toggleHabitTodayAction } from "@/app/actions";

const CHIP: Record<string, string> = {
  violet: "bg-[#f3edfd]",
  emerald: "bg-[#e9f8ef]",
  sky: "bg-[#e8f3fd]",
  amber: "bg-[#fef1e7]",
};

export default function HabitsCard({ initialHabits }: { initialHabits: HabitView[] }) {
  const [habits, setHabits] = useState<HabitView[]>(initialHabits);
  const [, startTransition] = useTransition();

  function toggle(h: HabitView) {
    const nowDone = !h.doneToday;
    setHabits((prev) =>
      prev.map((x) =>
        x.id === h.id
          ? {
              ...x,
              doneToday: nowDone,
              weekDone: Math.min(7, Math.max(0, x.weekDone + (nowDone ? 1 : -1))),
              streak: nowDone ? x.streak + 1 : Math.max(0, x.streak - 1),
            }
          : x
      )
    );
    startTransition(() => void toggleHabitTodayAction(h.id));
  }

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold">Habits</span>
        <span className="text-[12.5px] font-semibold text-[var(--green)]">
          {habits.filter((h) => h.doneToday).length}/{habits.length} today
        </span>
      </div>

      <div className="flex flex-col gap-[18px]">
        {habits.map((h) => {
          const pct = Math.round((h.weekDone / 7) * 100);
          return (
            <button key={h.id} onClick={() => toggle(h)} className="flex items-center gap-[13px] text-left">
              <span
                className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] text-[17px] ${CHIP[h.color] ?? CHIP.emerald} ${
                  h.doneToday ? "ring-2 ring-[var(--green-bright)]" : ""
                }`}
              >
                {h.emoji}
              </span>
              <span className="flex-1">
                <span className="mb-[7px] flex justify-between">
                  <span className="text-[13.5px] font-semibold">{h.name}</span>
                  <span className="text-[12px] font-semibold text-[var(--muted)]">{h.weekDone}/7</span>
                </span>
                <span className="block h-1.5 overflow-hidden rounded bg-[#eef1f4]">
                  <span className="block h-full rounded bg-[var(--green-bright)]" style={{ width: `${pct}%` }} />
                </span>
              </span>
            </button>
          );
        })}
        {habits.length === 0 && (
          <p className="py-4 text-center text-sm text-[var(--muted2)]">No habits yet.</p>
        )}
      </div>
    </section>
  );
}
