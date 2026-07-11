import { completeText } from "./llm";
import { localDay } from "./habits";
import { Item } from "./types";

// The one intentional brain call per morning: turn today's open items into a
// tight, motivating brief. Small output = fractions of a cent (free on Groq).

const SYSTEM =
  "You are a sharp, warm chief of staff writing a founder's morning brief for Telegram. " +
  "Be concise and motivating. Lead with the single most important thing. Then list the top 3 " +
  "priorities today, and end with one encouraging line. " +
  "Use light HTML (<b>) and emojis sparingly. No preamble, no markdown headers.";

export async function buildBrief(items: Item[]): Promise<string> {
  const today = localDay();
  const dueToday = items
    .filter((i) => i.due_at && localDay(new Date(i.due_at)) <= today)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());

  const itemList = items
    .map(
      (i) =>
        `- [${i.type}/${i.priority}/${i.category}] ${i.title}${
          i.due_at ? ` (due ${new Date(i.due_at).toLocaleString("en", { timeZone: "Asia/Kolkata" })})` : ""
        }`
    )
    .join("\n");
  const dueList = dueToday.map((i) => `- ${i.title}`).join("\n");

  return completeText(
    SYSTEM,
    `Open items:\n${itemList || "(none)"}\n\nDue today or overdue:\n${dueList || "(nothing due)"}\n\nWrite the brief.`,
    400
  );
}
