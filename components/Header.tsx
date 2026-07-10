import { integrations } from "@/lib/config";

const ASSISTANT = process.env.NEXT_PUBLIC_ASSISTANT_NAME || "Ramu Kaka";
const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS_AS || "sir";

export default function Header() {
  const today = new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const dots: [string, boolean][] = [
    ["Storage", integrations.supabase],
    ["Brain", integrations.brain],
    ["Voice", integrations.transcription],
    ["Telegram", integrations.telegram],
    ["YouTube", integrations.youtube],
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[#04070d]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl text-lg text-[#04121a]"
            style={{
              background: "radial-gradient(circle at 35% 30%, #eafcff, var(--accent) 55%, #0b6b7d)",
              boxShadow: "0 0 18px 2px var(--glow)",
            }}
          >
            ◆
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-wide">{ASSISTANT}</h1>
            <p className="text-xs text-[var(--muted)]">
              At your service, {ADDRESS} · {today}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {dots.map(([label, on]) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${on ? "bg-[var(--accent)]" : "bg-zinc-500/40"}`}
                style={on ? { boxShadow: "0 0 6px 1px var(--glow)" } : undefined}
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
