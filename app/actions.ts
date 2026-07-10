"use server";

import { revalidatePath } from "next/cache";
import { insertItems, setItemStatus } from "@/lib/items";
import { integrations } from "@/lib/config";
import { extractItems } from "@/lib/extract";
import { Category, ItemType, Priority } from "@/lib/types";

// Server actions invoked from the client Board. When Supabase isn't configured
// (preview mode) these no-op so the UI can fall back to local-only state.

export async function toggleItemAction(id: string, done: boolean) {
  if (!integrations.supabase) return { ok: false, reason: "preview" as const };
  await setItemStatus(id, done ? "done" : "open");
  revalidatePath("/");
  return { ok: true as const };
}

export async function addItemAction(input: {
  title: string;
  type: ItemType;
  category: Category;
  priority: Priority;
}) {
  if (!integrations.supabase) return { ok: false, reason: "preview" as const };
  const [item] = await insertItems(
    [{ ...input, details: null, due_at: null }],
    { source: "manual" }
  );
  revalidatePath("/");
  return { ok: true as const, item };
}

// The "talk to your assistant" command bar. Runs the same understanding step
// as a Telegram voice note: the brain parses what you typed, then (if storage
// is on) saves it. Returns a natural, spoken-style reply.
const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS_AS || "sir";

export async function talkToAssistant(
  text: string
): Promise<{ reply: string; saved: boolean }> {
  const trimmed = text.trim();
  if (!trimmed) return { reply: `I'm listening, ${ADDRESS} — what do you need?`, saved: false };

  if (!integrations.brain) {
    return {
      reply: `Forgive me, ${ADDRESS} — my brain isn't connected yet. Add a Groq key and I'm at your service.`,
      saved: false,
    };
  }

  let items;
  try {
    items = await extractItems(trimmed, new Date().toISOString());
  } catch {
    return {
      reply: `My apologies, ${ADDRESS} — something glitched while I was noting that down. Would you try once more?`,
      saved: false,
    };
  }

  if (items.length === 0) {
    return {
      reply: `Noted, ${ADDRESS}. Nothing to act on there, so I've simply filed the thought away.`,
      saved: false,
    };
  }

  const titles = items.map((i) => `“${i.title}”`).join(", ");

  if (!integrations.supabase) {
    return {
      reply: `Right away, ${ADDRESS} — I understood ${items.length === 1 ? "that as" : `${items.length} things:`} ${titles}. I'll begin saving these to your board the moment storage is connected.`,
      saved: false,
    };
  }

  await insertItems(items, { source: "assistant", rawTranscript: trimmed });
  revalidatePath("/");
  return {
    reply: `Consider it done, ${ADDRESS}. I've added ${items.length === 1 ? "it" : `${items.length} items`} to your board: ${titles}.`,
    saved: true,
  };
}
