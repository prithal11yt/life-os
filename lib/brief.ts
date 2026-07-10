import { completeText } from "./llm";
import { Item } from "./types";
import { AgendaEvent } from "./agenda";

// The one intentional brain call per morning: turn today's open items + agenda
// into a tight, motivating brief. Small output = fractions of a cent (free on Groq).

const SYSTEM =
  "You are a sharp, warm chief of staff writing a founder's morning brief for Telegram. " +
  "Be concise and motivating. Lead with the single most important thing. Then list the top 3 " +
  "priorities today, a one-line note on the calendar, and end with one encouraging line. " +
  "Use light HTML (<b>) and emojis sparingly. No preamble, no markdown headers.";

export async function buildBrief(items: Item[], events: AgendaEvent[]): Promise<string> {
  const itemList = items
    .map(
      (i) =>
        `- [${i.type}/${i.priority}/${i.category}] ${i.title}${
          i.due_at ? ` (due ${new Date(i.due_at).toLocaleString("en")})` : ""
        }`
    )
    .join("\n");
  const eventList = events
    .map(
      (e) =>
        `- ${new Date(e.start).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })} ${e.title}`
    )
    .join("\n");

  return completeText(
    SYSTEM,
    `Open items:\n${itemList || "(none)"}\n\nToday's calendar:\n${eventList || "(nothing scheduled)"}\n\nWrite the brief.`,
    400
  );
}
