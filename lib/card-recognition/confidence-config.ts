/** Centralized Fast Add recognition confidence thresholds. */

export const CONFIDENCE_THRESHOLDS = {
  /** Below this → low confidence, manual search fallback. */
  low: 0.45,
  /** At or above medium → show candidate picker (up to 3). */
  medium: 0.55,
  /** At or above high → promote best candidate, still require confirmation. */
  high: 0.78,
  /** Minimum gap between top two candidates to auto-promote a single result. */
  candidateGap: 0.12,
} as const;

export const CANDIDATE_LIMITS = {
  high: 1,
  medium: 3,
  low: 0,
  maxSearch: 5,
} as const;

export type RecognitionConfidenceLevel = "high" | "medium" | "low" | "none";

export type ConfidenceResolutionInput = {
  topConfidence: number;
  candidateCount: number;
  secondConfidence?: number;
};

export function resolveConfidenceLevel(
  input: ConfidenceResolutionInput,
): RecognitionConfidenceLevel {
  if (input.candidateCount === 0 || input.topConfidence < CONFIDENCE_THRESHOLDS.low) {
    return "none";
  }

  const gap =
    input.secondConfidence !== undefined
      ? input.topConfidence - input.secondConfidence
      : CONFIDENCE_THRESHOLDS.candidateGap;

  if (
    input.topConfidence >= CONFIDENCE_THRESHOLDS.high &&
    input.candidateCount >= 1 &&
    (input.candidateCount === 1 || gap >= CONFIDENCE_THRESHOLDS.candidateGap)
  ) {
    return "high";
  }

  if (input.topConfidence >= CONFIDENCE_THRESHOLDS.medium) {
    return "medium";
  }

  if (input.topConfidence >= CONFIDENCE_THRESHOLDS.low) {
    return "low";
  }

  return "none";
}

export function limitCandidatesForConfidence<T>(
  candidates: T[],
  level: RecognitionConfidenceLevel,
): T[] {
  if (level === "high") {
    return candidates.slice(0, CANDIDATE_LIMITS.high);
  }

  if (level === "medium" || level === "low") {
    return candidates.slice(0, CANDIDATE_LIMITS.medium);
  }

  return [];
}
