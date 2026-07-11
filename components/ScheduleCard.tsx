import { Item } from "@/lib/types";
import { isOverdue } from "@/lib/format";

const DOTS = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

// Real "today" timeline from due-today / overdue open items.
export default function ScheduleCard({ items }: { items: Item[] }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-bold">Today&rsquo;s Schedule</span>
        <span className="text-[12.5px] font-semibold text-[var(--green)]">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--muted2)]">Nothing scheduled — you&rsquo;re clear. ✨</p>
      ) : (
        <div className="flex flex-col gap-[17px]">
          {items.map((i, idx) => (
            <div key={i.id} className="flex items-center gap-[13px]">
              <span
                className="h-[9px] w-[9px] shrink-0 rounded-full"
                style={{ background: isOverdue(i.due_at) ? "#ef4444" : DOTS[idx % DOTS.length] }}
              />
              <span className="w-[70px] shrink-0 text-[12.5px] font-semibold text-[var(--muted2)]">
                {clock(i.due_at!)}
              </span>
              <span className="text-[13.5px] font-semibold">{i.title}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
