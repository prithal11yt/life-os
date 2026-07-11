import { Item, ItemType } from "@/lib/types";
import { relativeTime } from "@/lib/format";

const TYPE_EMOJI: Record<ItemType, string> = { task: "☑️", idea: "💡", reminder: "⏰", video: "🎬" };

// Latest things you captured — the pulse of your day.
export default function RecentActivity({ items }: { items: Item[] }) {
  const recent = [...items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold">Recent Activity</span>
        <span className="text-[12.5px] font-semibold text-[var(--muted2)]">latest captures</span>
      </div>

      {recent.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--muted2)]">Nothing captured yet — send a voice note. 🎙️</p>
      ) : (
        <div className="flex flex-col">
          {recent.map((i) => (
            <div key={i.id} className="flex items-center gap-3 border-b border-[var(--line)] py-2.5 last:border-0">
              <span className="text-[16px]">{TYPE_EMOJI[i.type]}</span>
              <span className={`flex-1 truncate text-[13.5px] font-medium ${i.status === "done" ? "text-[var(--faint)] line-through" : ""}`}>
                {i.title}
              </span>
              <span className="text-[11px] font-semibold capitalize text-[var(--faint)]">{i.category}</span>
              <span className="w-14 text-right text-[11px] text-[var(--faint)]">{relativeTime(i.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
