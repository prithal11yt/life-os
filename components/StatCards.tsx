import { Item } from "@/lib/types";
import { isOverdue } from "@/lib/format";
import { localDay } from "@/lib/date";

export default function StatCards({ items, capturedThisWeek }: { items: Item[]; capturedThisWeek: number }) {
  const tasks = items.filter((i) => i.type === "task");
  const doneTasks = tasks.filter((i) => i.status === "done").length;
  const totalTasks = tasks.length || 1;
  const open = items.filter((i) => i.status === "open");
  const highPriority = open.filter((i) => i.priority === "high").length;
  const today = localDay();
  const dueToday = open.filter((i) => i.due_at && localDay(new Date(i.due_at)) <= today).length;
  const overdue = open.filter((i) => isOverdue(i.due_at)).length;
  const pct = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card label="Tasks Completed" icon={<Refresh />}>
        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-[28px] font-bold tracking-tight">{doneTasks}</span>
          <span className="text-[15px] font-semibold text-[var(--faint)]">/{tasks.length}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded bg-[#eef1f4]">
          <div className="h-full rounded bg-[var(--green-bright)]" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      <Card label="Due Today" icon={<Clock />}>
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-[28px] font-bold tracking-tight">{dueToday}</span>
          {overdue > 0 && <span className="text-xs font-bold text-[var(--red)]">{overdue} overdue</span>}
        </div>
        <div className="text-xs font-medium text-[var(--muted2)]">items on your plate</div>
      </Card>

      <Card label="High Priority" icon={<Bars />}>
        <div className="mb-3 text-[28px] font-bold tracking-tight">{highPriority}</div>
        <div className="text-xs font-medium text-[var(--muted2)]">need attention</div>
      </Card>

      <Card label="Captured this week" icon={<Bolt />}>
        <div className="mb-3 text-[28px] font-bold tracking-tight">{capturedThisWeek}</div>
        <div className="text-xs font-medium text-[var(--muted2)]">thoughts logged 🎙️</div>
      </Card>
    </div>
  );
}

function Card({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card p-[18px]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[var(--muted)]">{label}</span>
        <span className="text-[#c2c9d2]">{icon}</span>
      </div>
      {children}
    </div>
  );
}

const s = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 } as const;
const Refresh = () => (<svg {...s}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v4h-4" /></svg>);
const Clock = () => (<svg {...s}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const Bars = () => (<svg {...s}><path d="M18 20V10M12 20V4M6 20v-6" /></svg>);
const Bolt = () => (<svg {...s}><path d="M13 2 3 14h7l-1 8 10-12h-7z" /></svg>);
