import { Item } from "@/lib/types";
import { relativeTime } from "@/lib/format";

// Recent voice/text captures that came in through Telegram.
export default function MessagesCard({ messages }: { messages: Item[] }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-bold">Telegram Messages</span>
          {messages.length > 0 && (
            <span className="rounded-full bg-[var(--green-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--green)]">
              {messages.length}
            </span>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--muted2)]">
          No voice notes yet — send one to your bot. 🎙️
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[var(--green-soft)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#16a34a"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <span className="text-[13px] font-semibold leading-snug">
                    {m.raw_transcript || m.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--faint)]">{relativeTime(m.created_at)}</span>
                </div>
                <div className="mt-1.5 flex h-[18px] items-center gap-[1.5px]">
                  {WAVE.map((h, i) => (
                    <span key={i} className="w-[2px] rounded-[2px] bg-[#cfd6de]" style={{ height: h }} />
                  ))}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.4" className="ml-1.5 shrink-0">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Deterministic decorative waveform.
const WAVE = Array.from({ length: 40 }, (_, i) =>
  3 + Math.round((Math.abs(Math.sin(i * 1.7)) * 0.6 + Math.abs(Math.cos(i * 0.55)) * 0.4) * 13)
);
