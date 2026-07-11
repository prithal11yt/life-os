import { NextRequest } from "next/server";
import { integrations, env } from "@/lib/config";
import { getItems } from "@/lib/items";
import { buildCheckin } from "@/lib/checkin";
import { sendMessage } from "@/lib/telegram";
import { authorizeCron } from "@/lib/cron-auth";

// Runs each evening (Vercel Cron). Ramu Kaka proactively checks in — the second
// of two daily touchpoints (morning brief + evening check-in). One batched
// brain call; replies flow back through the normal webhook and get captured.
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) return new Response("forbidden", { status: 403 });
  if (!integrations.supabase || !integrations.telegram || !integrations.brain || !env.telegramChatId) {
    return Response.json({ ok: true, skipped: "not configured" });
  }

  const { items } = await getItems();
  const message = await buildCheckin(items);
  await sendMessage(env.telegramChatId!, `🌙 <b>Evening check-in</b>\n\n${message}`);

  return Response.json({ ok: true });
}
