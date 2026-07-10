import { AgendaEvent, InboxThread } from "@/lib/agenda";

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
}

export function TodayPanel({ events }: { events: AgendaEvent[] }) {
  const nextIdx = events.findIndex((e) => new Date(e.start).getTime() >= Date.now());
  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">📅</span>
        <h3 className="text-sm font-semibold">Today</h3>
      </div>
      <ul className="space-y-3">
        {events.map((e, i) => {
          const isNext = i === nextIdx;
          return (
            <li key={e.id} className="flex gap-3">
              <div className="w-14 shrink-0 pt-0.5 text-right text-xs tabular-nums text-[var(--muted)]">
                {clock(e.start)}
              </div>
              <div className="relative flex flex-col items-center">
                <span
                  className={`mt-1 h-2 w-2 rounded-full ${
                    isNext ? "bg-violet-500 ring-4 ring-violet-500/20" : "bg-[var(--border)]"
                  }`}
                />
                {i < events.length - 1 && <span className="w-px flex-1 bg-[var(--border)]" />}
              </div>
              <div className="pb-1">
                <p className={`text-sm ${isNext ? "font-semibold" : ""}`}>{e.title}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  {clock(e.start)} – {clock(e.end)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function InboxPanel({ threads }: { threads: InboxThread[] }) {
  const needsReply = threads.filter((t) => t.needsReply).length;
  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📨</span>
          <h3 className="text-sm font-semibold">Inbox triage</h3>
        </div>
        {needsReply > 0 && (
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-500">
            {needsReply} need you
          </span>
        )}
      </div>
      <ul className="space-y-2.5">
        {threads.map((t) => (
          <li key={t.id} className="rounded-xl border border-[var(--border)] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-semibold">{t.from}</p>
              {t.needsReply && (
                <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  reply
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs font-medium">{t.subject}</p>
            <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--muted)]">{t.snippet}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
