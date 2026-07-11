import PageHeader from "@/components/PageHeader";
import YouTubeCard from "@/components/YouTubeCard";
import { getYouTube, getYouTubeMonthly } from "@/lib/youtube";
import { compactNumber, relativeTime } from "@/lib/format";
import { YouTubeMonthlyStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const METRICS: { key: keyof YouTubeMonthlyStats; label: string; compact: boolean }[] = [
  { key: "videoCount", label: "Videos published", compact: false },
  { key: "totalViews", label: "Total views", compact: true },
  { key: "totalLikes", label: "Total likes", compact: true },
  { key: "totalComments", label: "Total comments", compact: true },
];

function fmt(n: number, compact: boolean) {
  return compact ? compactNumber(n) : String(n);
}

function delta(cur: number, prev: number): { label: string; cls: string } {
  if (!prev) return { label: cur ? "new" : "—", cls: "text-[var(--muted2)]" };
  const p = Math.round(((cur - prev) / prev) * 100);
  if (p === 0) return { label: "0%", cls: "text-[var(--muted2)]" };
  return {
    label: `${p > 0 ? "▲" : "▼"} ${Math.abs(p)}%`,
    cls: p > 0 ? "text-[#16a34a]" : "text-[#ef4444]",
  };
}

export default async function YouTubePage() {
  const [{ stats }, { monthly }] = await Promise.all([getYouTube(), getYouTubeMonthly()]);
  const sorted = [...stats.recent].sort((a, b) => b.views - a.views);
  const best = sorted[0]?.id;
  const worst = sorted[sorted.length - 1]?.id;

  const periods: { label: string; stats: YouTubeMonthlyStats; focus?: boolean }[] = [
    { label: "This month", stats: monthly.current, focus: true },
    { label: "Last month", stats: monthly.prev1 },
    { label: "2 months ago", stats: monthly.prev2 },
  ];

  return (
    <>
      <PageHeader title="YouTube" subtitle={stats.channelTitle} />

      {/* Long-form performance — focus on this month, compare 3 */}
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-bold">Long-form performance</h3>
            <p className="text-[11.5px] text-[var(--muted2)]">
              Rolling 30-day windows · Shorts excluded · refreshes daily
            </p>
          </div>
          <span className="text-[11px] text-[var(--faint)]">
            {monthly.updatedAt ? `updated ${relativeTime(monthly.updatedAt)}` : "sample"}
          </span>
        </div>

        {/* This month — big, with vs-last-month delta */}
        <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[var(--green)]">This month · last 30 days</div>
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {METRICS.map((m) => {
            const cur = monthly.current[m.key];
            const d = delta(cur, monthly.prev1[m.key]);
            return (
              <div key={m.key} className="rounded-xl bg-[var(--panel)] px-4 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[24px] font-bold tracking-tight">{fmt(cur, m.compact)}</span>
                  <span className={`text-[11px] font-bold ${d.cls}`}>{d.label}</span>
                </div>
                <div className="mt-1 text-[11.5px] text-[var(--muted2)]">{m.label}</div>
              </div>
            );
          })}
        </div>

        {/* 3-month comparison */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-[13px]">
            <thead>
              <tr className="text-[var(--muted2)]">
                <th className="py-2 text-left font-semibold">Metric</th>
                {periods.map((p) => (
                  <th
                    key={p.label}
                    className={`px-3 py-2 text-right font-semibold ${p.focus ? "text-[var(--green)]" : ""}`}
                  >
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => (
                <tr key={m.key} className="border-t border-[var(--line)]">
                  <td className="py-2.5 text-left font-medium text-[var(--muted)]">{m.label}</td>
                  {periods.map((p) => (
                    <td
                      key={p.label}
                      className={`px-3 py-2.5 text-right tabular-nums ${p.focus ? "rounded-lg bg-[var(--green-soft)] font-bold text-[var(--ink)]" : "font-semibold text-[var(--muted)]"}`}
                    >
                      {fmt(p.stats[m.key], m.compact)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <YouTubeCard stats={stats} />

        <section className="card p-5">
          <h3 className="mb-4 text-[15px] font-bold">Recent uploads</h3>
          <div className="flex flex-col">
            {stats.recent.map((v) => (
              <div key={v.id} className="flex items-center gap-3 border-b border-[var(--line)] py-3 last:border-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: "linear-gradient(135deg,#1e293b,#7c3aed)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold">{v.title}</div>
                  <div className="text-[11.5px] text-[var(--faint)]">{compactNumber(v.views)} views · {relativeTime(v.publishedAt)}</div>
                </div>
                {v.id === best && <span className="rounded-full bg-[#e9f8ef] px-2 py-0.5 text-[11px] font-bold text-[#16a34a]">▲ Top</span>}
                {v.id === worst && v.id !== best && <span className="rounded-full bg-[#fef4e5] px-2 py-0.5 text-[11px] font-bold text-[#f59e0b]">▼ Low</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
