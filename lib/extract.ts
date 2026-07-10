import { completeJSON } from "./llm";
import { ExtractedItem } from "./types";

// The "understanding" step. One cheap call (Groq free, or Claude) turns a raw
// transcript into one or more structured items.

const SYSTEM = `You are the parsing engine for a founder's personal assistant. The user is a business owner and content creator who dumps quick thoughts by voice. Extract clean, well-prioritized items from their note.

Split multiple distinct thoughts into separate items. If nothing actionable is present, return an empty array.

Return JSON of exactly this shape:
{"items": [{
  "type": "task" | "idea" | "reminder",      // task = to-do; idea = thought/opportunity to keep; reminder = time-bound nudge
  "title": string,                             // short imperative summary, max ~10 words
  "details": string | null,                    // optional extra context, else null
  "priority": "high" | "medium" | "low",       // deadlines, money, customers = high
  "category": "business" | "personal",
  "due_at": string | null                      // ISO 8601 datetime if a time/deadline is implied, else null
}]}

Be decisive about priority. Keep titles crisp. Resolve relative dates (e.g. "tomorrow") against the current time given.`;

export async function extractItems(transcript: string, nowISO: string): Promise<ExtractedItem[]> {
  const result = (await completeJSON(
    SYSTEM + `\n\nCurrent time: ${nowISO}`,
    transcript
  )) as { items?: ExtractedItem[] };
  return Array.isArray(result?.items) ? result.items : [];
}
