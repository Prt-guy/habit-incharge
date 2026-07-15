import { GoogleGenAI } from "@google/genai";

const apiKey =
  import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || "";

const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

let ai = null;
function getClient() {
  if (!ai) ai = new GoogleGenAI({ apiKey });
  return ai;
}

export const geminiAvailable = Boolean(apiKey);

/**
 * Generate plain text from a prompt. `system` is prepended as guidance.
 * Never throws to the caller — returns "" on failure so the UI can fall back.
 */
export async function generateText({ prompt, system, temperature = 0.9 }) {
  if (!apiKey) return "";
  try {
    const res = await getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature,
        ...(system ? { systemInstruction: system } : {}),
      },
    });
    return (res.text || "").trim();
  } catch (err) {
    console.warn("[gemini] generateText failed:", err?.message || err);
    return "";
  }
}

/**
 * Generate and parse a JSON object. Strips markdown fences. Returns
 * `fallback` if the API is unavailable or parsing fails.
 */
export async function generateJson({ prompt, system, temperature = 0.85 }, fallback = null) {
  const raw = await generateText({
    prompt: `${prompt}\n\nRespond with ONLY valid minified JSON. No markdown, no commentary.`,
    system,
    temperature,
  });
  if (!raw) return fallback;
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return fallback;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return fallback;
  }
}
