import Header from "@/components/Header";
import AssistantCore from "@/components/AssistantCore";
import StatsRow from "@/components/StatsRow";
import Board from "@/components/Board";
import YouTubePanel from "@/components/YouTubePanel";
import { TodayPanel, InboxPanel } from "@/components/SidePanels";
import { getItems } from "@/lib/items";
import { getYouTube } from "@/lib/youtube";
import { getAgenda, getInbox } from "@/lib/agenda";

// Always render fresh — this is a live personal dashboard.
export const dynamic = "force-dynamic";

const ASSISTANT = process.env.NEXT_PUBLIC_ASSISTANT_NAME || "Ramu Kaka";
// How the assistant addresses you when it speaks (e.g. "sir").
const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS_AS || "sir";

export default async function Home() {
  const [{ items, isSample }, { stats }, { events }, { threads }] = await Promise.all([
    getItems(),
    getYouTube(),
    getAgenda(),
    getInbox(),
  ]);

  return (
    <div className="min-h-full">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <AssistantCore items={items} addressAs={ADDRESS} assistantName={ASSISTANT} />

        {isSample && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            <span>🛰️</span>
            <span className="font-medium">Preview mode</span>
            <span className="text-[var(--muted)]">
              — running on sample tasks. Connect storage and your real captures flow onto the board
              automatically; {ASSISTANT}&apos;s brain and your YouTube feed are already live.
            </span>
          </div>
        )}

        <div className="mt-6">
          <StatsRow items={items} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Board initialItems={items} isSample={isSample} />

          <div className="flex flex-col gap-6">
            <YouTubePanel stats={stats} />
            <TodayPanel events={events} />
            <InboxPanel threads={threads} />
          </div>
        </div>

        <footer className="mt-10 pb-6 text-center text-xs text-[var(--muted)]">
          {ASSISTANT} · your always-on chief of staff — watching quietly, thinking only when it counts.
        </footer>
      </main>
    </div>
  );
}
