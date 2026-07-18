import { NextResponse } from "next/server";

import { logRecognitionDiagnostic } from "@/lib/card-recognition/diagnostics";
import { checkRecognitionRateLimit } from "@/lib/card-recognition/rate-limit";
import { recognizeCardFromImage } from "@/lib/card-recognition/recognize-card";
import type { ExtractedCardHints } from "@/lib/card-recognition/types";
import { getFastAddErrorCopy } from "@/lib/fast-add-errors";
import { validateFastAddImageBuffer } from "@/lib/fast-add-image";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const recentSubmissionHashes = new Map<string, { hash: string; at: number }>();
const SUBMISSION_DEDUP_MS = 8_000;

/**
 * Card recognition endpoint.
 *
 * Privacy: uploaded images are processed in memory and discarded after the
 * response is sent. They are never stored in Supabase or made public.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRecognitionRateLimit(user.id);
  if (!rateLimit.allowed) {
    const copy = getFastAddErrorCopy("rate_limited");
    return NextResponse.json(
      { error: copy.message, code: "rate_limited", action: copy.action },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("image");

      if (!(file instanceof File)) {
        const copy = getFastAddErrorCopy("missing_image");
        return NextResponse.json(
          { error: copy.message, code: "missing_image", action: copy.action },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const validation = validateFastAddImageBuffer(buffer, file.type);

      if (!validation.ok) {
        const copy = getFastAddErrorCopy(validation.code as "unsupported_type");
        return NextResponse.json(
          { error: copy.message, code: validation.code, action: copy.action },
          { status: 400 },
        );
      }

      const fingerprint = getOptionalString(formData, "fingerprint");
      if (fingerprint && isDuplicateSubmission(user.id, fingerprint)) {
        const copy = getFastAddErrorCopy("duplicate_submission");
        return NextResponse.json(
          {
            error: copy.message,
            code: "duplicate_submission",
            action: copy.action,
          },
          { status: 409 },
        );
      }

      if (fingerprint) {
        rememberSubmission(user.id, fingerprint);
      }

      const clientHints = parseClientHints(formData);
      const imageWidth = parseOptionalInt(formData, "imageWidth");
      const imageHeight = parseOptionalInt(formData, "imageHeight");

      const { meta, ...result } = await recognizeCardFromImage({
        imageBuffer: buffer,
        mimeType: file.type,
        clientHints,
        imageWidth,
        imageHeight,
        compressedBytes: buffer.length,
        ocrAttempted: getOptionalString(formData, "ocrAttempted") === "1",
      });

      return NextResponse.json({ result, meta });
    }

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as ExtractedCardHints;
      const { meta, ...result } = await recognizeCardFromImage({
        clientHints: body,
        ocrAttempted: false,
      });
      return NextResponse.json({ result, meta });
    }

    return NextResponse.json(
      { error: "Unsupported content type.", code: "unsupported_content" },
      { status: 415 },
    );
  } catch (error) {
    console.error("[card-recognize] failure", error);
    logRecognitionDiagnostic({
      provider: "error",
      hasExtractedName: false,
      hasExtractedNumber: false,
      hasExtractedSetHint: false,
      candidateCount: 0,
      topConfidence: 0,
      confidenceLevel: "none",
      durationMs: 0,
      outcome: "error",
      fallbackReason: "unhandled_exception",
    });
    const copy = getFastAddErrorCopy("recognition_unavailable");
    return NextResponse.json(
      {
        error: copy.message,
        code: "recognition_unavailable",
        action: copy.action,
      },
      { status: 503 },
    );
  }
}

function parseClientHints(formData: FormData): ExtractedCardHints | undefined {
  const rawText = getOptionalString(formData, "rawText");
  const extractedName = getOptionalString(formData, "extractedName");
  const extractedNumber = getOptionalString(formData, "extractedNumber");
  const extractedSetHint = getOptionalString(formData, "extractedSetHint");

  if (!rawText && !extractedName && !extractedNumber && !extractedSetHint) {
    return undefined;
  }

  return { rawText, extractedName, extractedNumber, extractedSetHint };
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseOptionalInt(formData: FormData, key: string) {
  const value = getOptionalString(formData, key);
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isDuplicateSubmission(userId: string, fingerprint: string) {
  const entry = recentSubmissionHashes.get(userId);
  if (!entry) {
    return false;
  }

  return entry.hash === fingerprint && Date.now() - entry.at < SUBMISSION_DEDUP_MS;
}

function rememberSubmission(userId: string, fingerprint: string) {
  recentSubmissionHashes.set(userId, { hash: fingerprint, at: Date.now() });
}
