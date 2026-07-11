import { Item, ItemType } from "@/lib/types";
import { isOverdue } from "@/lib/format";

const TYPE_ICON: Record<ItemType, string> = { task: "☑️", idea: "💡", reminder: "⏰" };

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

// Real "today" view — open items due today or overdue, pulled from your board.
export function TodayPanel({ items }: { items: Item[] }) {
  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">📅</span>
        <h3 className="text-sm font-semibold">Due today</h3>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--muted)]">
          Nothing due today — you&apos;re clear. ✨
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((i) => {
            const overdue = isOverdue(i.due_at);
            return (
              <li key={i.id} className="flex items-start gap-3">
                <span className="w-16 shrink-0 pt-0.5 text-right text-xs tabular-nums">
                  <span className={overdue ? "font-semibold text-red-500" : "text-[var(--muted)]"}>
                    {overdue ? "overdue" : clock(i.due_at!)}
                  </span>
                </span>
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    i.priority === "high"
                      ? "bg-red-500"
                      : i.priority === "medium"
                        ? "bg-amber-500"
                        : "bg-zinc-500"
                  }`}
                />
                <span className="min-w-0 flex-1 text-sm">
                  <span className="mr-1">{TYPE_ICON[i.type]}</span>
                  {i.title}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
