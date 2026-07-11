import PageHeader from "@/components/PageHeader";
import { integrations } from "@/lib/config";

export const dynamic = "force-dynamic";

const ASSISTANT = process.env.NEXT_PUBLIC_ASSISTANT_NAME || "Ramu Kaka";
const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS_AS || "sir";
const OWNER = process.env.NEXT_PUBLIC_OWNER_NAME || "Prithal";

export default function SettingsPage() {
  const connections: [string, boolean, string][] = [
    ["Storage (Supabase)", integrations.supabase, "Saves and reads all your items & habits"],
    ["Brain (Groq)", integrations.brain, "Understands your voice notes"],
    ["Voice transcription", integrations.transcription, "Turns voice notes into text"],
    ["Telegram bot", integrations.telegram, "Send captures & get reminders"],
    ["YouTube", integrations.youtube, "Tracks your channel stats"],
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle="Your assistant & connections" />

      <section className="card p-5">
        <h3 className="mb-4 text-[15px] font-bold">Persona</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Assistant name" value={ASSISTANT} />
          <Field label="Addresses you as" value={ADDRESS} />
          <Field label="Your name" value={OWNER} />
        </div>
        <p className="mt-4 text-xs text-[var(--muted2)]">
          These are set via <code className="rounded bg-[var(--panel)] px-1 py-0.5">NEXT_PUBLIC_*</code> environment variables — tell me and I&rsquo;ll change them.
        </p>
      </section>

      <section className="card p-5">
        <h3 className="mb-4 text-[15px] font-bold">Connections</h3>
        <div className="flex flex-col">
          {connections.map(([name, on, desc]) => (
            <div key={name} className="flex items-center gap-3 border-b border-[var(--line)] py-3 last:border-0">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${on ? "bg-[var(--green-bright)]" : "bg-[#d7dde5]"}`} />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold">{name}</div>
                <div className="text-[11.5px] text-[var(--muted2)]">{desc}</div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${on ? "bg-[#e9f8ef] text-[#16a34a]" : "bg-[#f4f6f8] text-[var(--muted2)]"}`}>
                {on ? "Connected" : "Not set"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--panel)] p-4">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted2)]">{label}</div>
      <div className="text-[15px] font-bold">{value}</div>
    </div>
  );
}
