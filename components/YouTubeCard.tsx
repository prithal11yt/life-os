import { YouTubeStats } from "@/lib/types";
import { compactNumber, relativeTime } from "@/lib/format";

export default function YouTubeCard({ stats }: { stats: YouTubeStats }) {
  const latest = stats.recent[0];
  // Sparkline from real recent-upload view counts (oldest → newest).
  const series = [...stats.recent].reverse().map((v) => v.views);
  const spark = sparkline(series, 150, 60);

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold">YouTube Overview</span>
        <span className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--muted)]">
          {stats.channelTitle}
        </span>
      </div>

      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="mb-1 text-xs text-[var(--muted2)]">Subscribers</div>
          <div className="text-[26px] font-bold tracking-tight">{stats.subscribers.toLocaleString("en")}</div>
        </div>
        {series.length > 1 && (
          <svg width="150" height="60" viewBox="0 0 150 60" preserveAspectRatio="none">
            <polyline points={spark.line} fill="none" stroke="#22c55e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={spark.area} fill="#22c55e" opacity="0.1" stroke="none" />
          </svg>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Metric label="Total Views" value={compactNumber(stats.totalViews)} />
        <Metric label="Videos" value={String(stats.videoCount)} />
      </div>

      {latest && (
        <>
          <div className="mb-2 text-xs text-[var(--muted2)]">Latest Video</div>
          <div className="flex items-center gap-3">
            <div
              className="grid h-[46px] w-[74px] shrink-0 place-items-center rounded-[9px]"
              style={{ background: "linear-gradient(135deg,#1e293b,#7c3aed)" }}
            >
              <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-white/90">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="#1e293b"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold leading-tight">{latest.title}</div>
              <div className="mt-1 text-[11.5px] text-[var(--faint)]">
                {compactNumber(latest.views)} views · {relativeTime(latest.publishedAt)}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--panel)] px-4 py-3">
      <div className="mb-1 text-xs text-[var(--muted2)]">{label}</div>
      <div className="text-[19px] font-bold tracking-tight">{value}</div>
    </div>
  );
}

function sparkline(values: number[], w: number, h: number) {
  if (values.length < 2) return { line: "", area: "" };
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 6 - ((v - min) / range) * (h - 12);
    return `${x.toFixed(0)},${y.toFixed(0)}`;
  });
  return { line: pts.join(" "), area: `0,${h} ${pts.join(" ")} ${w},${h}` };
}
