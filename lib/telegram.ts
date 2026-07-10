import { env } from "./config";

// Thin Telegram Bot API helpers. All free.

const api = (method: string) =>
  `https://api.telegram.org/bot${env.telegramToken}/${method}`;

export async function sendMessage(chatId: string | number, text: string) {
  const res = await fetch(api("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!res.ok) console.error("telegram sendMessage failed:", await res.text());
}

// Resolve a Telegram file_id to a downloadable URL, then fetch the bytes.
export async function downloadFile(fileId: string): Promise<ArrayBuffer> {
  const metaRes = await fetch(api("getFile") + `?file_id=${fileId}`);
  const meta = await metaRes.json();
  const filePath = meta?.result?.file_path;
  if (!filePath) throw new Error("could not resolve telegram file path");

  const fileRes = await fetch(
    `https://api.telegram.org/file/bot${env.telegramToken}/${filePath}`
  );
  if (!fileRes.ok) throw new Error(`telegram file download failed: ${fileRes.status}`);
  return fileRes.arrayBuffer();
}

// Minimal shape of the Telegram update we care about.
export interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    voice?: { file_id: string };
    audio?: { file_id: string };
  };
}
