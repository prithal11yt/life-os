import { NextRequest } from "next/server";
import { env, integrations } from "@/lib/config";
import { authorizeCron } from "@/lib/cron-auth";

// Convenience: hit this once (with ?secret=CRON_SECRET) after deploying to
// point your Telegram bot at this app. Equivalent to calling Telegram's
// setWebhook by hand.
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) return new Response("forbidden", { status: 403 });
  if (!integrations.telegram) {
    return Response.json({ ok: false, error: "TELEGRAM_BOT_TOKEN not set" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const webhookUrl = `${origin}/api/telegram/webhook`;

  const res = await fetch(
    `https://api.telegram.org/bot${env.telegramToken}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: env.telegramWebhookSecret || undefined,
        allowed_updates: ["message"],
      }),
    }
  );

  const result = await res.json();
  return Response.json({ ok: res.ok, webhookUrl, telegram: result });
}
