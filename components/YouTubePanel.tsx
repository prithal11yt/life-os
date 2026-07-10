import { YouTubeStats } from "@/lib/types";
import { compactNumber, relativeTime } from "@/lib/format";

// Channel health at a glance. Highlights the best + weakest recent upload
// so the assistant can nudge content decisions.
export default function YouTubePanel({ stats }: { stats: YouTubeStats }) {
  const sorted = [...stats.recent].sort((a, b) => b.views - a.views);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📺</span>
          <h3 className="text-sm font-semibold">{stats.channelTitle}</h3>
        </div>
        <span className="text-[11px] text-[var(--muted)]">YouTube</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Metric label="Subscribers" value={compactNumber(stats.subscribers)} />
        <Metric label="Total views" value={compactNumber(stats.totalViews)} />
        <Metric label="Videos" value={String(stats.videoCount)} />
      </div>

      <div className="mt-4 space-y-2">
        {best && (
          <Highlight tone="up" label="Top recent" title={best.title} value={`${compactNumber(best.views)} views`} />
        )}
        {worst && worst.id !== best?.id && (
          <Highlight
            tone="down"
            label="Underperforming"
            title={worst.title}
            value={`${compactNumber(worst.views)} views`}
          />
        )}
      </div>

      <div className="mt-4 border-t border-[var(--border)] pt-3">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
          Recent uploads
        </p>
        <ul className="space-y-1.5">
          {stats.recent.slice(0, 4).map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 flex-1 truncate">{v.title}</span>
              <span className="shrink-0 tabular-nums text-[var(--muted)]">
                {compactNumber(v.views)} · {relativeTime(v.publishedAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/5 py-3 dark:bg-white/5">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] text-[var(--muted)]">{label}</p>
    </div>
  );
}

function Highlight({
  tone,
  label,
  title,
  value,
}: {
  tone: "up" | "down";
  label: string;
  title: string;
  value: string;
}) {
  const color = tone === "up" ? "text-emerald-500" : "text-amber-500";
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-2.5">
      <span className={color}>{tone === "up" ? "▲" : "▼"}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{title}</p>
        <p className="text-[10px] text-[var(--muted)]">
          {label} · {value}
        </p>
      </div>
    </div>
  );
}
