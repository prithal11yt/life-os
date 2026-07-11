import PageHeader from "@/components/PageHeader";
import { getItems } from "@/lib/items";
import { localDay } from "@/lib/date";
import { isOverdue } from "@/lib/format";
import { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

const TYPE_EMOJI = { task: "☑️", idea: "💡", reminder: "⏰", video: "🎬" } as const;

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
}
function dayLabel(day: string) {
  const today = localDay();
  const tomorrow = localDay(new Date(Date.now() + 86400_000));
  if (day === today) return "Today";
  if (day === tomorrow) return "Tomorrow";
  return new Date(day + "T12:00:00Z").toLocaleDateString("en", { weekday: "long", day: "numeric", month: "short" });
}

export default async function CalendarPage() {
  const { items } = await getItems();
  const scheduled = items
    .filter((i) => i.status === "open" && i.due_at)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());

  // Group by day.
  const groups = new Map<string, Item[]>();
  for (const i of scheduled) {
    const d = localDay(new Date(i.due_at!));
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d)!.push(i);
  }

  return (
    <>
      <PageHeader title="Calendar" subtitle={`${scheduled.length} scheduled items`} />
      {groups.size === 0 ? (
        <div className="card p-10 text-center text-sm text-[var(--muted2)]">Nothing scheduled. Add due dates to your tasks and they&rsquo;ll appear here.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {[...groups.entries()].map(([day, list]) => (
            <section key={day} className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-[15px] font-bold">{dayLabel(day)}</h3>
                <span className="text-xs font-semibold text-[var(--muted2)]">{list.length} items</span>
              </div>
              <div className="flex flex-col">
                {list.map((i) => {
                  const overdue = isOverdue(i.due_at);
                  return (
                    <div key={i.id} className="flex items-center gap-3 border-b border-[var(--line)] py-2.5 last:border-0">
                      <span className={`w-16 text-[12.5px] font-semibold ${overdue ? "text-[var(--red)]" : "text-[var(--muted2)]"}`}>
                        {overdue ? "overdue" : clock(i.due_at!)}
                      </span>
                      <span className="flex-1 text-[13.5px] font-medium"><span className="mr-1.5">{TYPE_EMOJI[i.type]}</span>{i.title}</span>
                      <span className="text-[11px] font-semibold capitalize text-[var(--faint)]">{i.category}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
