import { completeJSON } from "./llm";
import { ExtractedItem } from "./types";

// The "understanding" step. One cheap call (Groq free, or Claude) turns a raw
// transcript into one or more structured items.

const SYSTEM = `You are the parsing engine for a founder's personal assistant. The user is a business owner and content creator who dumps quick thoughts by voice. Extract clean, well-prioritized items from their note.

Split multiple distinct thoughts into separate items. If nothing actionable is present, return an empty array.

Return JSON of exactly this shape:
{"items": [{
  "type": "task" | "idea" | "reminder" | "video",  // task = to-do; idea = general thought/opportunity; reminder = time-bound nudge; video = an idea for a YouTube video or piece of content to create
  "title": string,                             // short imperative summary, max ~10 words
  "details": string | null,                    // optional extra context, else null
  "priority": "high" | "medium" | "low",       // deadlines, money, customers = high
  "category": "business" | "personal",
  "due_at": string | null                      // MUST be a full ISO 8601 datetime like "2026-07-11T09:00:00Z", or null
}]}

Be decisive about priority. Keep titles crisp. For due_at, resolve any relative date (e.g. "tomorrow morning", "Friday") against the current time given and output a real ISO 8601 timestamp — NEVER a phrase. If no time is implied, use null.

Use type "video" whenever the note is an idea for a video/short/reel/content to make (e.g. "video idea — 5 AI tools for founders", "I should make a video about X", "content idea: …", "we could do a reel on …"). Video ideas are usually low/medium priority with no due date unless one is stated.`;

export async function extractItems(transcript: string, nowISO: string): Promise<ExtractedItem[]> {
  const result = (await completeJSON(
    SYSTEM + `\n\nCurrent time: ${nowISO}`,
    transcript
  )) as { items?: ExtractedItem[] };
  return Array.isArray(result?.items) ? result.items : [];
}
