import { NextRequest } from "next/server";
import { integrations, env } from "@/lib/config";
import { getItemsToRemind, markReminded } from "@/lib/items";
import { sendMessage } from "@/lib/telegram";
import { relativeTime, isOverdue } from "@/lib/format";
import { authorizeCron } from "@/lib/cron-auth";

// Runs frequently (e.g. every 15 min via Vercel Cron). Nudges you about items
// due soon that you haven't been reminded of. No Claude tokens spent here —
// this is pure querying + a Telegram message.
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) return new Response("forbidden", { status: 403 });
  if (!integrations.supabase || !integrations.telegram || !env.telegramChatId) {
    return Response.json({ ok: true, skipped: "not configured" });
  }

  const due = await getItemsToRemind(60); // due within the next hour or overdue
  if (due.length === 0) return Response.json({ ok: true, reminded: 0 });

  const lines = due.map((i) => {
    const when = isOverdue(i.due_at) ? "⚠️ overdue" : relativeTime(i.due_at);
    return `⏰ <b>${i.title}</b> — ${when}`;
  });

  await sendMessage(env.telegramChatId!, `Heads up:\n\n${lines.join("\n")}`);
  await markReminded(due.map((i) => i.id));

  return Response.json({ ok: true, reminded: due.length });
}
