import { env } from "./config";

// Speech-to-text via Groq's Whisper (OpenAI-compatible endpoint).
// Groq is fast and has a generous free tier — near-zero cost for personal use.

export async function transcribe(audio: ArrayBuffer, filename = "voice.ogg"): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([audio]), filename);
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "text");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.groqKey}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Transcription failed (${res.status}): ${await res.text()}`);
  }
  return (await res.text()).trim();
}
