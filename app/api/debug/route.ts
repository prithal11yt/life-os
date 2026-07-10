import { NextRequest } from "next/server";
import { env, integrations } from "@/lib/config";
import { brainProvider } from "@/lib/llm";
import { extractItems } from "@/lib/extract";
import { insertItems } from "@/lib/items";

// Temporary diagnostic. Runs the same text pipeline the Telegram webhook uses
// and returns the exact error, so we can see what's failing on the live deploy.
// Protected by CRON_SECRET. Remove after debugging.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== env.cronSecret) {
    return new Response("forbidden", { status: 403 });
  }

  const text =
    url.searchParams.get("text") ||
    "remind me to follow up with the brand deal tomorrow morning, high priority";

  const diag: Record<string, unknown> = {
    integrations,
    brain: brainProvider(),
    anthropicKeyPresent: Boolean(env.anthropicKey),
    text,
  };

  try {
    diag.step = "extract";
    const items = await extractItems(text, new Date().toISOString());
    diag.extracted = items;

    diag.step = "insert";
    const saved = await insertItems(items, { source: "debug", rawTranscript: text });
    diag.savedCount = saved.length;

    return Response.json({ ok: true, diag });
  } catch (err) {
    return Response.json({
      ok: false,
      failedAt: diag.step,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 4) : undefined,
      diag,
    });
  }
}
