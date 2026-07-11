"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { talkToAssistant } from "@/app/actions";

const ASSISTANT = process.env.NEXT_PUBLIC_ASSISTANT_NAME || "Ramu Kaka";

const NAV = [
  { label: "Dashboard", href: "/", icon: "grid" },
  { label: "Tasks", href: "/tasks", icon: "check" },
  { label: "Calendar", href: "/calendar", icon: "calendar" },
  { label: "Video Ideas", href: "/videos", icon: "film" },
  { label: "YouTube", href: "/youtube", icon: "play" },
  { label: "Analytics", href: "/analytics", icon: "chart" },
  { label: "Notes", href: "/notes", icon: "note" },
  { label: "Settings", href: "/settings", icon: "gear" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    setReply("…");
    startTransition(async () => {
      const res = await talkToAssistant(text);
      setReply(res.reply);
      if (res.saved) router.refresh();
    });
  }

  return (
    <aside className="hidden w-[230px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface)] p-5 lg:flex">
      <Link href="/" className="mb-7 flex items-center gap-3 px-1">
        <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "linear-gradient(150deg,#22c55e,#0ea5e9)" }}>
          <Icon name="bot" />
        </span>
        <span className="text-[15px] font-bold tracking-tight">{ASSISTANT}</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.label}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[var(--green-soft)] font-semibold text-[var(--green)]"
                  : "font-medium text-[var(--muted)] hover:bg-[var(--panel)]"
              }`}
            >
              <Icon name={n.icon} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--green-soft)] text-[var(--green)]">
            <Icon name="mic" size={14} />
          </span>
          <span className="text-sm font-bold">Ask {ASSISTANT}</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-[var(--muted2)]">Voice note on Telegram, or type below.</p>

        <div className="mb-3 flex items-center justify-center">
          <div className="flex h-11 items-center justify-center gap-[2px] rounded-full border border-[var(--line)] bg-white px-3">
            {[9, 16, 22, 14, 8].map((h, i) => (
              <span key={i} className="wavebar" style={{ height: h, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>

        <form onSubmit={send} className="flex flex-col gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Remind me to…"
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none placeholder:text-[var(--faint)] focus:border-[var(--green-bright)]"
          />
          <button type="submit" disabled={pending} className="rounded-lg bg-[var(--green)] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {pending ? "Thinking…" : "Send"}
          </button>
        </form>
        {reply && <p className="mt-2 text-[11px] leading-snug text-[var(--muted)]">{reply}</p>}
      </div>
    </aside>
  );
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9 } as const;
  switch (name) {
    case "bot":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v3M6.5 6.5 8 8M17.5 6.5 16 8" /><rect x="5" y="8" width="14" height="11" rx="4" /><circle cx="9.5" cy="13" r="1.3" fill="#fff" stroke="none" /><circle cx="14.5" cy="13" r="1.3" fill="#fff" stroke="none" />
        </svg>
      );
    case "grid":
      return (<svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
    case "check":
      return (<svg {...p}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>);
    case "calendar":
      return (<svg {...p}><rect x="3" y="4" width="18" height="18" rx="2.5" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>);
    case "play":
      return (<svg {...p}><rect x="2" y="5" width="20" height="14" rx="4" /><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" /></svg>);
    case "film":
      return (<svg {...p}><rect x="2.5" y="4" width="19" height="16" rx="2.5" /><path d="M7 4v16M17 4v16M2.5 9h4.5M2.5 15h4.5M17 9h4.5M17 15h4.5" /></svg>);
    case "target":
      return (<svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>);
    case "chart":
      return (<svg {...p}><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" fill="currentColor" stroke="none" /><rect x="12.5" y="8" width="3" height="10" fill="currentColor" stroke="none" /><rect x="18" y="5" width="3" height="13" fill="currentColor" stroke="none" /></svg>);
    case "note":
      return (<svg {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></svg>);
    case "gear":
      return (<svg {...p}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.6 1.6 0 0 0 .32 1.77 2 2 0 1 1-2.83 2.83 1.6 1.6 0 0 0-2.81 1.24V22a2 2 0 0 1-4 0 1.6 1.6 0 0 0-2.81-1.16 2 2 0 1 1-2.83-2.83A1.6 1.6 0 0 0 3.6 15a2 2 0 0 1 0-4 1.6 1.6 0 0 0 1.16-2.81 2 2 0 1 1 2.83-2.83A1.6 1.6 0 0 0 11 4.6a2 2 0 0 1 4 0 1.6 1.6 0 0 0 2.81 1.16 2 2 0 1 1 2.83 2.83A1.6 1.6 0 0 0 22 11a2 2 0 0 1 0 4z" /></svg>);
    case "mic":
      return (<svg {...p}><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
    default:
      return null;
  }
}
