import { Item } from "./types";
import { relativeTime, isOverdue } from "./format";

// Builds a warm, first-person briefing the assistant "speaks" on the dashboard.
// Pure and deterministic — costs nothing, sounds human.

export function timeGreeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Working late";
}

export function buildBriefing(items: Item[], name: string, now = new Date()): string {
  const open = items.filter((i) => i.status === "open");
  const high = open.filter((i) => i.priority === "high");
  const ideas = items.filter((i) => i.type === "idea" && i.status !== "done");
  const withDue = open
    .filter((i) => i.due_at)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());
  const next = withDue[0];

  const parts: string[] = [`${timeGreeting(now)}, ${name}.`];

  if (open.length === 0) {
    parts.push("You're all clear — nothing on your plate right now. Enjoy it.");
    return parts.join(" ");
  }

  // The core status line.
  const bits: string[] = [];
  if (high.length > 0) {
    bits.push(`${high.length} high-priority ${high.length === 1 ? "item" : "items"}`);
  }
  bits.push(`${open.length} thing${open.length === 1 ? "" : "s"} open in total`);
  parts.push(`You've got ${joinList(bits)}.`);

  // The most pressing deadline.
  if (next?.due_at) {
    if (isOverdue(next.due_at)) {
      parts.push(`Heads up — "${next.title}" is overdue.`);
    } else {
      parts.push(`Next up: "${next.title}" ${relativeTime(next.due_at)}.`);
    }
  }

  // A gentle nudge about parked ideas.
  if (ideas.length > 0) {
    parts.push(
      `I'm also holding ${ideas.length} idea${ideas.length === 1 ? "" : "s"} for when you have a moment.`
    );
  }

  return parts.join(" ");
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}
