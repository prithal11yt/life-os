import { NextRequest } from "next/server";
import { env, integrations } from "@/lib/config";
import { TelegramUpdate, downloadFile, sendMessage } from "@/lib/telegram";
import { transcribe } from "@/lib/transcribe";
import { extractItems } from "@/lib/extract";
import { insertItems } from "@/lib/items";
import { ExtractedItem } from "@/lib/types";

// Telegram calls this endpoint whenever you send the bot a message.
// Voice note / audio → transcribe → understand → save → reply.
// Plain text also works (typed capture).

export async function POST(req: NextRequest) {
  // Verify the shared secret Telegram echoes back (set when registering the webhook).
  if (env.telegramWebhookSecret) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== env.telegramWebhookSecret) {
      return new Response("forbidden", { status: 403 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return Response.json({ ok: true }); // ignore malformed pings
  }

  const message = update.message;
  if (!message) return Response.json({ ok: true });

  const chatId = message.chat.id;

  // Optionally lock the bot to your own chat.
  if (env.telegramChatId && String(chatId) !== String(env.telegramChatId)) {
    await sendMessage(chatId, "This assistant is private.");
    return Response.json({ ok: true });
  }

  if (!integrations.brain || !integrations.supabase) {
    await sendMessage(
      chatId,
      "⚙️ Almost there — I still need my Claude + Supabase keys configured before I can save your notes."
    );
    return Response.json({ ok: true });
  }

  try {
    // 1) Get the text — either from a voice note or a typed message.
    let transcript = message.text?.trim() ?? "";
    let viaVoice = false;

    const audioId = message.voice?.file_id ?? message.audio?.file_id;
    if (audioId) {
      if (!integrations.transcription) {
        await sendMessage(chatId, "🎙️ I need my transcription key to understand voice notes yet.");
        return Response.json({ ok: true });
      }
      const bytes = await downloadFile(audioId);
      transcript = await transcribe(bytes);
      viaVoice = true;
    }

    if (transcript === "/start") {
      await sendMessage(
        chatId,
        "👋 Hey! I'm your Life OS assistant. Send me a voice note or a message and I'll capture, prioritize, and track it. Your chat id is <code>" +
          chatId +
          "</code>."
      );
      return Response.json({ ok: true });
    }

    if (!transcript) return Response.json({ ok: true });

    // 2) Understand it (one cheap Haiku call).
    const items = await extractItems(transcript, new Date().toISOString());

    if (items.length === 0) {
      await sendMessage(chatId, "Got it — noted, nothing actionable to track.");
      return Response.json({ ok: true });
    }

    // 3) Save.
    await insertItems(items, { source: "telegram", rawTranscript: transcript });

    // 4) Confirm.
    await sendMessage(chatId, summarize(items, viaVoice, transcript));
  } catch (err) {
    console.error("webhook error:", err);
    await sendMessage(chatId, "😕 Something went wrong saving that. I logged it — try again in a moment.");
  }

  return Response.json({ ok: true });
}

function summarize(items: ExtractedItem[], viaVoice: boolean, transcript: string): string {
  const icon = { task: "☑️", idea: "💡", reminder: "⏰", video: "🎬" };
  const lines = items.map((i) => {
    const pri = i.priority === "high" ? "🔴" : i.priority === "medium" ? "🟡" : "⚪";
    return `${icon[i.type]} ${pri} <b>${escapeHtml(i.title)}</b> <i>(${i.category})</i>`;
  });
  const header =
    items.length === 1 ? "✅ Saved 1 item:" : `✅ Saved ${items.length} items:`;
  const heard = viaVoice ? `\n\n<i>Heard: “${escapeHtml(transcript.slice(0, 140))}”</i>` : "";
  return `${header}\n\n${lines.join("\n")}${heard}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
