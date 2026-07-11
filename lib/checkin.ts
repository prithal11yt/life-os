import { completeText } from "./llm";
import { localDay } from "./date";
import { Item } from "./types";

const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS_AS || "sir";

const SYSTEM =
  `You are a warm, sharp chief of staff sending a founder their EVENING check-in on Telegram. ` +
  `Address them as "${ADDRESS}". Be brief and human (4-6 short lines max). Acknowledge what they got ` +
  `done today, surface the top 2-3 things still open, flag anything overdue or due tomorrow, and end ` +
  `with one encouraging or gently accountable line inviting them to reply with anything on their mind. ` +
  `If they had a quiet day (nothing captured or completed), warmly nudge them to brain-dump. ` +
  `Use light HTML (<b>) and emojis sparingly. No preamble, no markdown headers.`;

// Builds the proactive evening message from today's real state.
export async function buildCheckin(items: Item[]): Promise<string> {
  const today = localDay();
  const tomorrow = localDay(new Date(Date.now() + 86400_000));
  const open = items.filter((i) => i.status === "open");

  const completedToday = items.filter(
    (i) => i.completed_at && localDay(new Date(i.completed_at)) === today
  );
  const capturedToday = items.filter((i) => localDay(new Date(i.created_at)) === today);
  const highOpen = open.filter((i) => i.priority === "high");
  const overdue = open.filter((i) => i.due_at && new Date(i.due_at).getTime() < Date.now());
  const dueTomorrow = open.filter((i) => i.due_at && localDay(new Date(i.due_at)) === tomorrow);
  const videoOpen = open.filter((i) => i.type === "video");

  const list = (arr: Item[], n = 3) => arr.slice(0, n).map((i) => `- ${i.title}`).join("\n") || "(none)";

  const summary = [
    `Completed today: ${completedToday.length}`,
    `Captured today: ${capturedToday.length}`,
    `Open high-priority (${highOpen.length}):\n${list(highOpen)}`,
    `Overdue (${overdue.length}):\n${list(overdue)}`,
    `Due tomorrow (${dueTomorrow.length}):\n${list(dueTomorrow)}`,
    `Video ideas waiting: ${videoOpen.length}`,
  ].join("\n\n");

  return completeText(SYSTEM, `Today's state:\n${summary}\n\nWrite the evening check-in.`, 350);
}
