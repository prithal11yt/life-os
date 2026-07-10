// Calendar + inbox for the sidebar.
//
// v1 ships with sample data and a clean interface. Wiring real Google
// Calendar + Gmail needs an OAuth flow (a later phase) — when that lands,
// these functions return live data and everything downstream stays the same.

export interface AgendaEvent {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  location?: string;
}

export interface InboxThread {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  needsReply: boolean;
}

const now = Date.now();
const at = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const sampleAgenda: AgendaEvent[] = [
  { id: "e1", title: "Deep work: record YouTube video", start: at(9), end: at(11) },
  { id: "e2", title: "Call with supplier", start: at(12, 30), end: at(13) },
  { id: "e3", title: "Team standup", start: at(15), end: at(15, 30) },
  { id: "e4", title: "Gym", start: at(18), end: at(19) },
];

const sampleInbox: InboxThread[] = [
  {
    id: "m1",
    from: "Brand partnership (Notion)",
    subject: "Sponsorship for your next video",
    snippet: "We'd love to collaborate on an integration for your channel…",
    needsReply: true,
  },
  {
    id: "m2",
    from: "Accountant",
    subject: "Q3 numbers — need your sign-off",
    snippet: "Attached the draft P&L. Can you confirm the ad-spend figure?",
    needsReply: true,
  },
  {
    id: "m3",
    from: "Editor",
    subject: "Rough cut ready for review",
    snippet: "First pass on the AI tools video is in the Drive folder.",
    needsReply: false,
  },
];

export async function getAgenda(): Promise<{ events: AgendaEvent[]; isSample: boolean }> {
  // Only show events still ahead in the day.
  const upcoming = sampleAgenda.filter((e) => new Date(e.end).getTime() >= now);
  return { events: upcoming.length ? upcoming : sampleAgenda, isSample: true };
}

export async function getInbox(): Promise<{ threads: InboxThread[]; isSample: boolean }> {
  return { threads: sampleInbox, isSample: true };
}
