import PageHeader from "@/components/PageHeader";
import { getItems } from "@/lib/items";
import { getActivity } from "@/lib/activity";
import { getYouTube } from "@/lib/youtube";
import { compactNumber } from "@/lib/format";
import { localDay } from "@/lib/date";

export const dynamic = "force-dynamic";

const WK = ["S", "M", "T", "W", "T", "F", "S"];

export default async function AnalyticsPage() {
  const [{ items }, activity, { stats }] = await Promise.all([getItems(), getActivity(), getYouTube()]);

  const tasks = items.filter((i) => i.type === "task");
  const done = tasks.filter((i) => i.status === "done").length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const business = items.filter((i) => i.category === "business").length;
  const personal = items.filter((i) => i.category === "personal").length;
  const ideas = items.filter((i) => i.type === "idea").length;
  const reminders = items.filter((i) => i.type === "reminder").length;

  // Last 14 days of activity for the bar chart.
  const last14 = activity.days.slice(-14);
  const barMax = Math.max(1, ...last14.map((d) => activity.countByDay[d] ?? 0));

  return (
    <>
      <PageHeader title="Analytics" subtitle="How you're tracking across tasks, activity & content" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Task completion" value={`${completion}%`} sub={`${done}/${tasks.length} tasks done`} />
        <Stat label="Captured this week" value={`${activity.capturedThisWeek}`} sub="thoughts logged" />
        <Stat label="Completed all-time" value={`${activity.completedTotal}`} sub="items finished" />
        <Stat label="Active days" value={`${activity.activeDays}`} sub="in the last ~19 weeks" />
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
          <h3 className="mb-4 text-[15px] font-bold">Activity — last 14 days</h3>
          <div className="flex items-end justify-between gap-1.5" style={{ height: 130 }}>
            {last14.map((d) => {
              const c = activity.countByDay[d] ?? 0;
              const h = Math.round((c / barMax) * 100);
              const dow = new Date(d + "T12:00:00Z").getUTCDay();
              return (
                <div key={d} className="flex flex-1 flex-col items-center gap-1.5" title={`${d}: ${c}`}>
                  <div className="flex w-full flex-1 items-end">
                    <div className="w-full rounded-t bg-[var(--green-bright)]" style={{ height: `${Math.max(3, h)}%`, opacity: c ? 1 : 0.25 }} />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--faint)]">{WK[dow]}</span>
                </div>
              );
            })}
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
