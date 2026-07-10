import Anthropic from "@anthropic-ai/sdk";
import { env } from "./config";

// Provider-flexible "brain". Prefers Claude when an Anthropic key is set
// (slightly sharper), otherwise uses Groq's free Llama — so the whole app can
// run on a single Groq key at zero cost.

export type Brain = "claude" | "groq";

export function brainProvider(): Brain | null {
  if (env.anthropicKey) return "claude";
  if (env.groqKey) return "groq";
  return null;
}

const GROQ_MODEL = "llama-3.3-70b-versatile";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

async function groqChat(body: Record<string, unknown>) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: GROQ_MODEL, ...body }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

// Returns a parsed JSON object. `system` should describe the exact JSON shape.
export async function completeJSON(system: string, user: string): Promise<unknown> {
  const provider = brainProvider();

  if (provider === "claude") {
    const client = new Anthropic({ apiKey: env.anthropicKey! });
    const msg = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: system + " Respond with a single valid JSON object and nothing else.",
      messages: [{ role: "user", content: user }],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    return JSON.parse(stripFences(text));
  }

  // Groq JSON mode. The prompt must mention "json" for this mode to engage.
  const content = await groqChat({
    messages: [
      { role: "system", content: system + " Respond ONLY with valid JSON." },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1024,
  });
  return JSON.parse(stripFences(content));
}

export async function completeText(
  system: string,
  user: string,
  maxTokens = 400
): Promise<string> {
  const provider = brainProvider();

  if (provider === "claude") {
    const client = new Anthropic({ apiKey: env.anthropicKey! });
    const msg = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });
    return msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
  }

  const content = await groqChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.6,
    max_tokens: maxTokens,
  });
  return content.trim();
}

// Models occasionally wrap JSON in ```json fences — strip them defensively.
function stripFences(s: string): string {
  return s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}
