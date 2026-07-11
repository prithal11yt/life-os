import PageHeader from "@/components/PageHeader";
import { getItems } from "@/lib/items";
import { getHabits } from "@/lib/habits";
import { getYouTube } from "@/lib/youtube";
import { compactNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [{ items }, habits, { stats }] = await Promise.all([getItems(), getHabits(), getYouTube()]);

  const tasks = items.filter((i) => i.type === "task");
  const done = tasks.filter((i) => i.status === "done").length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const business = items.filter((i) => i.category === "business").length;
  const personal = items.filter((i) => i.category === "personal").length;
  const ideas = items.filter((i) => i.type === "idea").length;
  const reminders = items.filter((i) => i.type === "reminder").length;
  const weekTotal = habits.totalHabits * 7;
  const weekDone = habits.habits.reduce((s, h) => s + h.weekDone, 0);
  const consistency = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;
  const bestStreak = habits.habits.reduce((m, h) => Math.max(m, h.streak), 0);

  return (
    <>
      <PageHeader title="Analytics" subtitle="How you're tracking across tasks, habits & content" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Task completion" value={`${completion}%`} sub={`${done}/${tasks.length} tasks done`} />
        <Stat label="Habit consistency" value={`${consistency}%`} sub={`${weekDone}/${weekTotal} this week`} />
        <Stat label="Best streak" value={`${bestStreak}`} sub="days in a row" />
        <Stat label="Ideas captured" value={`${ideas}`} sub="parked for later" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="mb-4 text-[15px] font-bold">Work split</h3>
          <Bar label="Business" value={business} total={business + personal} color="#8b5cf6" />
          <Bar label="Personal" value={personal} total={business + personal} color="#16a34a" />
          <div className="mt-4 h-px bg-[var(--line)]" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Mini label="Tasks" value={tasks.length} />
            <Mini label="Ideas" value={ideas} />
            <Mini label="Reminders" value={reminders} />
          </div>
        </section>

        <section className="card p-5">
          <h3 className="mb-4 text-[15px] font-bold">Habit consistency (this week)</h3>
          <div className="flex flex-col gap-3">
            {habits.habits.map((h) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-[16px]">{h.emoji}</span>
                <span className="w-28 shrink-0 truncate text-[13px] font-semibold">{h.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-[#eef1f4]">
                  <div className="h-full rounded bg-[var(--green-bright)]" style={{ width: `${(h.weekDone / 7) * 100}%` }} />
                </div>
                <span className="w-10 text-right text-[12px] font-semibold text-[var(--muted)]">{h.weekDone}/7</span>
              </div>
            ))}
            {habits.habits.length === 0 && <p className="text-sm text-[var(--muted2)]">No habits yet.</p>}
          </div>
        </section>
      </div>

      <section className="card p-5">
        <h3 className="mb-4 text-[15px] font-bold">YouTube snapshot — {stats.channelTitle}</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Mini label="Subscribers" value={stats.subscribers.toLocaleString("en")} />
          <Mini label="Total views" value={compactNumber(stats.totalViews)} />
          <Mini label="Videos" value={stats.videoCount} />
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-[18px]">
      <div className="mb-2 text-[13px] font-semibold text-[var(--muted)]">{label}</div>
      <div className="text-[28px] font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-[var(--muted2)]">{sub}</div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-[var(--panel)] py-3">
      <div className="text-[19px] font-bold tracking-tight">{value}</div>
      <div className="text-[11px] text-[var(--muted2)]">{label}</div>
    </div>
  );
}
function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex justify-between text-[13px] font-semibold">
        <span>{label}</span>
        <span className="text-[var(--muted)]">{value} · {pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-[#eef1f4]"><div className="h-full rounded" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}
