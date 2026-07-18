import { mergeExtractedHints } from "@/lib/card-recognition/normalize-recognition";
import {
  limitCandidatesForConfidence,
  resolveConfidenceLevel,
} from "@/lib/card-recognition/confidence-config";
import { logRecognitionDiagnostic } from "@/lib/card-recognition/diagnostics";
import { buildFallbackSearchQuery } from "@/lib/card-recognition/fallback-query";
import { matchCatalogFromHints } from "@/lib/card-recognition/providers/catalog-match";
import {
  extractHintsWithOpenAiVision,
  isVisionProviderConfigured,
} from "@/lib/card-recognition/providers/vision-openai";
import type {
  CardRecognitionResult,
  ExtractedCardHints,
} from "@/lib/card-recognition/types";

export type RecognizeCardInput = {
  imageBuffer?: Buffer;
  mimeType?: string;
  clientHints?: ExtractedCardHints;
  imageWidth?: number;
  imageHeight?: number;
  compressedBytes?: number;
  ocrAttempted?: boolean;
};

export type RecognizeCardMeta = {
  visionAttempted: boolean;
  visionSucceeded: boolean;
  ocrAttempted: boolean;
};

/**
 * Provider-independent recognition pipeline:
 * 1. Extract hints (optional vision provider + client OCR hints)
 * 2. Match against existing Pokémon TCG catalog
 * Images are processed in memory only — never persisted.
 */
export async function recognizeCardFromImage(
  input: RecognizeCardInput,
): Promise<CardRecognitionResult & { meta: RecognizeCardMeta }> {
  const startedAt = Date.now();
  const providers: string[] = [];
  let visionAttempted = false;
  let visionSucceeded = false;
  const ocrAttempted = Boolean(input.ocrAttempted);

  let visionHints: ExtractedCardHints | null = null;

  if (input.imageBuffer && input.mimeType && isVisionProviderConfigured()) {
    visionAttempted = true;
    visionHints = await extractHintsWithOpenAiVision(
      input.imageBuffer,
      input.mimeType,
    );

    if (visionHints) {
      visionSucceeded = true;
      providers.push("openai-vision");
    }
  }

  if (input.clientHints?.rawText || input.clientHints?.extractedName) {
    providers.push("client-ocr");
  }

  const mergedHints = mergeExtractedHints(input.clientHints, visionHints);

  const logDiagnostic = (
    result: CardRecognitionResult,
    outcome: "success" | "fallback" | "error",
    fallbackReason?: string,
  ) => {
    logRecognitionDiagnostic({
      provider: providers.join("+") || "none",
      imageWidth: input.imageWidth,
      imageHeight: input.imageHeight,
      compressedBytes: input.compressedBytes ?? input.imageBuffer?.length,
      ocrTextLength: mergedHints.rawText?.length,
      hasExtractedName: Boolean(mergedHints.extractedName),
      hasExtractedNumber: Boolean(mergedHints.extractedNumber),
      hasExtractedSetHint: Boolean(mergedHints.extractedSetHint),
      candidateCount: result.candidates.length,
      topConfidence: result.confidence,
      confidenceLevel: result.confidenceLevel ?? "none",
      durationMs: Date.now() - startedAt,
      outcome,
      fallbackReason,
      visionAttempted,
      visionSucceeded,
      ocrAttempted,
    });
  };

  const hasHints = Boolean(
    mergedHints.rawText ||
      mergedHints.extractedName ||
      mergedHints.extractedNumber ||
      mergedHints.extractedSetHint,
  );

  if (!hasHints) {
    const result: CardRecognitionResult = {
      confidence: 0,
      confidenceLevel: "none",
      candidates: [],
      uncertain: true,
      provider: providers.join("+") || "none",
      fallbackReason: "no_hints",
      message: isVisionProviderConfigured()
        ? "We couldn't read enough from this photo. Try a clearer photo, fill the frame with one card, or search by name or card number."
        : "We couldn't read this photo automatically. Search by card name or collector number, or try a clearer photo with the number visible.",
    };
    logDiagnostic(result, "fallback", "no_hints");
    return {
      ...result,
      meta: { visionAttempted, visionSucceeded, ocrAttempted },
    };
  }

  try {
    const match = await matchCatalogFromHints(mergedHints);
    const confidenceLevel = resolveConfidenceLevel({
      topConfidence: match.confidence,
      candidateCount: match.candidates.length,
      secondConfidence: match.candidates[1]?.confidence,
    });

    const limitedCandidates = limitCandidatesForConfidence(
      match.candidates,
      confidenceLevel,
    );

    let message: string | undefined;
    let fallbackReason: string | undefined;
    let uncertain = false;

    if (confidenceLevel === "none" || limitedCandidates.length === 0) {
      message = `We couldn't confidently identify this card. Try searching for "${buildFallbackSearchQuery(mergedHints)}" or use a clearer photo.`;
      fallbackReason = "low_confidence";
      uncertain = true;
    } else if (confidenceLevel === "low") {
      message =
        "We're not certain about this match. Compare the photo below while you search, or pick a candidate if one looks right.";
      fallbackReason = "low_confidence";
      uncertain = true;
    } else if (confidenceLevel === "medium") {
      message = "A few similar matches were found. Please confirm the correct card.";
      uncertain = true;
    }

    const result: CardRecognitionResult = {
      extractedName: mergedHints.extractedName,
      extractedNumber: mergedHints.extractedNumber,
      extractedSetHint: mergedHints.extractedSetHint,
      confidence: match.confidence,
      confidenceLevel,
      candidates: limitedCandidates,
      uncertain,
      provider: providers.join("+") || "client-hints",
      message,
      fallbackReason,
    };

    logDiagnostic(
      result,
      confidenceLevel === "none" ? "fallback" : "success",
      fallbackReason,
    );

    return {
      ...result,
      meta: { visionAttempted, visionSucceeded, ocrAttempted },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "CARD_API_UNAVAILABLE") {
      const result: CardRecognitionResult = {
        extractedName: mergedHints.extractedName,
        extractedNumber: mergedHints.extractedNumber,
        extractedSetHint: mergedHints.extractedSetHint,
        confidence: 0,
        confidenceLevel: "none",
        candidates: [],
        uncertain: true,
        provider: providers.join("+") || "client-hints",
        fallbackReason: "card_api_unavailable",
        message:
          "The card catalog is temporarily unavailable. Try again shortly or search manually with the hints we extracted.",
      };
      logDiagnostic(result, "error", "card_api_unavailable");
      return {
        ...result,
        meta: { visionAttempted, visionSucceeded, ocrAttempted },
      };
    }

    throw error;
  }
}
