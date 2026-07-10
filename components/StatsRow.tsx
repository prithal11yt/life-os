import { Item } from "@/lib/types";
import { isOverdue } from "@/lib/format";

// Derived at-a-glance numbers. Pure/server component.
export default function StatsRow({ items }: { items: Item[] }) {
  const open = items.filter((i) => i.status === "open");
  const highPriority = open.filter((i) => i.priority === "high").length;
  const ideas = items.filter((i) => i.type === "idea" && i.status !== "done").length;
  const dueSoon = open.filter(
    (i) => i.due_at && (isOverdue(i.due_at) || new Date(i.due_at).getTime() < Date.now() + 86400000)
  ).length;
  const doneToday = items.filter(
    (i) => i.status === "done"
  ).length;

  const stats = [
    { label: "Open tasks", value: open.filter((i) => i.type === "task").length, accent: "text-violet-500" },
    { label: "High priority", value: highPriority, accent: "text-red-500" },
    { label: "Ideas parked", value: ideas, accent: "text-amber-500" },
    { label: "Due within 24h", value: dueSoon, accent: "text-sky-500" },
    { label: "Completed", value: doneToday, accent: "text-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="glass rounded-2xl p-4"
        >
          <p className={`text-2xl font-bold tabular-nums ${s.accent}`}>{s.value}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
