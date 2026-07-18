import { trackFastAddEvent } from "@/lib/fast-add-analytics";

export type RecognitionDiagnostic = {
  provider: string;
  imageWidth?: number;
  imageHeight?: number;
  compressedBytes?: number;
  ocrTextLength?: number;
  hasExtractedName: boolean;
  hasExtractedNumber: boolean;
  hasExtractedSetHint: boolean;
  candidateCount: number;
  topConfidence: number;
  confidenceLevel: string;
  durationMs: number;
  outcome: "success" | "fallback" | "error";
  fallbackReason?: string;
  visionAttempted?: boolean;
  visionSucceeded?: boolean;
  ocrAttempted?: boolean;
};

export function logRecognitionDiagnostic(diagnostic: RecognitionDiagnostic) {
  const payload = {
    provider: diagnostic.provider,
    imageWidth: diagnostic.imageWidth ?? null,
    imageHeight: diagnostic.imageHeight ?? null,
    compressedBytes: diagnostic.compressedBytes ?? null,
    ocrTextLength: diagnostic.ocrTextLength ?? null,
    hasExtractedName: diagnostic.hasExtractedName,
    hasExtractedNumber: diagnostic.hasExtractedNumber,
    hasExtractedSetHint: diagnostic.hasExtractedSetHint,
    candidateCount: diagnostic.candidateCount,
    topConfidence: diagnostic.topConfidence,
    confidenceLevel: diagnostic.confidenceLevel,
    durationMs: diagnostic.durationMs,
    outcome: diagnostic.outcome,
    fallbackReason: diagnostic.fallbackReason ?? null,
    visionAttempted: diagnostic.visionAttempted ?? null,
    visionSucceeded: diagnostic.visionSucceeded ?? null,
    ocrAttempted: diagnostic.ocrAttempted ?? null,
  };

  console.info("[fast-add-recognition]", JSON.stringify(payload));
  trackFastAddEvent("recognition_diagnostic", payload);
}
