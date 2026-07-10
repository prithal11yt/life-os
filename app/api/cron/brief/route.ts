import { NextRequest } from "next/server";
import { integrations, env } from "@/lib/config";
import { getOpenItems } from "@/lib/items";
import { getAgenda } from "@/lib/agenda";
import { buildBrief } from "@/lib/brief";
import { sendMessage } from "@/lib/telegram";
import { authorizeCron } from "@/lib/cron-auth";

// Runs once each morning (Vercel Cron). Sends a single batched, Claude-written
// brief to Telegram. This is the one deliberate token spend per day.
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) return new Response("forbidden", { status: 403 });
  if (!integrations.supabase || !integrations.telegram || !integrations.brain || !env.telegramChatId) {
    return Response.json({ ok: true, skipped: "not configured" });
  }

  const [items, { events }] = await Promise.all([getOpenItems(), getAgenda()]);
  const brief = await buildBrief(items, events);
  await sendMessage(env.telegramChatId!, `☀️ <b>Good morning</b>\n\n${brief}`);

  return Response.json({ ok: true });
}
