import PageHeader from "@/components/PageHeader";
import YouTubeCard from "@/components/YouTubeCard";
import { getYouTube } from "@/lib/youtube";
import { compactNumber, relativeTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function YouTubePage() {
  const { stats } = await getYouTube();
  const sorted = [...stats.recent].sort((a, b) => b.views - a.views);
  const best = sorted[0]?.id;
  const worst = sorted[sorted.length - 1]?.id;

  return (
    <>
      <PageHeader title="YouTube" subtitle={stats.channelTitle} />
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
