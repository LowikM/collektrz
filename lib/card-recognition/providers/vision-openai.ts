import type { ExtractedCardHints } from "@/lib/card-recognition/types";
import { normalizeRecognitionText } from "@/lib/card-recognition/normalize-recognition";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const VISION_TIMEOUT_MS = 12_000;

export function isVisionProviderConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export type VisionExtractionResult = {
  hints: ExtractedCardHints | null;
  error?: "missing_key" | "timeout" | "invalid_response" | "request_failed";
};

/**
 * Optional vision provider — credentials stay server-side.
 * Returns null hints on any failure without throwing.
 */
export async function extractHintsWithOpenAiVision(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<ExtractedCardHints | null> {
  const result = await extractHintsWithOpenAiVisionDetailed(imageBuffer, mimeType);
  return result.hints;
}

export async function extractHintsWithOpenAiVisionDetailed(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<VisionExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return { hints: null, error: "missing_key" };
  }

  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are helping identify a Pokémon trading card from a photo.
Return ONLY a JSON object with these optional string fields:
- name (card name as printed, without set info)
- number (collector number like 58/102)
- setHint (set name if visible)
Do not guess. Use null for unknown fields.`,
              },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0,
      }),
      signal: AbortSignal.timeout(VISION_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { hints: null, error: "request_failed" };
    }

    const payload = (await response.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
    } | null;

    const content = payload?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return { hints: null, error: "invalid_response" };
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { hints: normalizeRecognitionText(content) };
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        name?: string | null;
        number?: string | null;
        setHint?: string | null;
      };

      const parts = [parsed.name, parsed.number, parsed.setHint]
        .filter((value): value is string => Boolean(value))
        .join(" ");

      const normalized = parts
        ? normalizeRecognitionText(parts)
        : { rawText: content };

      return {
        hints: {
          ...normalized,
          extractedName: parsed.name ?? normalized.extractedName,
          extractedNumber: parsed.number ?? normalized.extractedNumber,
          extractedSetHint: parsed.setHint ?? normalized.extractedSetHint,
        },
      };
    } catch {
      return { hints: normalizeRecognitionText(content) };
    }
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return { hints: null, error: "timeout" };
    }

    return { hints: null, error: "request_failed" };
  }
}
