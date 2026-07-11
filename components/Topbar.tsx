import { timeGreeting } from "@/lib/greeting";

export default function Topbar({
  address,
  openTasks,
  dueToday,
}: {
  address: string;
  openTasks: number;
  dueToday: number;
}) {
  const date = new Date().toLocaleDateString("en", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[25px] font-bold tracking-tight">
          {timeGreeting()}, {address} <span className="text-[22px]">👋</span>
        </div>
        <div className="mt-1 text-[13.5px] text-[var(--muted2)]">
          You&rsquo;ve got {openTasks} open {openTasks === 1 ? "task" : "tasks"} and {dueToday} due today.
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[13px] font-medium text-[var(--muted)]">{date}</span>
        <IconButton dot>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </IconButton>
        <IconButton>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
        </IconButton>
        <span
          className="h-10 w-10 rounded-full border-2 border-white"
          style={{ background: "linear-gradient(135deg,#94a3b8,#475569)", boxShadow: "0 0 0 1px var(--line)" }}
        />
      </div>
    </header>
  );
}

function IconButton({ children, dot }: { children: React.ReactNode; dot?: boolean }) {
  return (
    <button className="relative grid h-[38px] w-[38px] place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--panel)]">
      {children}
      {dot && (
        <span className="absolute right-2.5 top-2.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[var(--red)]" />
      )}
    </button>
  );
}
