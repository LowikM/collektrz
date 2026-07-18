"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  buildImageFingerprint,
  extractTextHintsFromImage,
  prepareFastAddImage,
  type ImageQualityHint,
  type PreparedFastAddImage,
} from "@/lib/fast-add-image-client";
import { getFastAddErrorCopy } from "@/lib/fast-add-errors";
import { validateFastAddImageFile } from "@/lib/fast-add-image";
import { trackFastAddEvent } from "@/lib/fast-add-analytics";
import { profileImageGradientClassName } from "@/components/profile/profile-styles";

const CAPTURE_GUIDANCE = [
  "Fill most of the frame with one card",
  "Avoid glare and heavy shadows",
  "Keep the collector number visible",
  "Use a plain background when you can",
];

type CardImageUploadProps = {
  mode: "upload" | "camera";
  onImageReady: (input: {
    file: File;
    previewUrl: string;
    clientHints: Awaited<ReturnType<typeof extractTextHintsFromImage>>;
    width: number;
    height: number;
    fingerprint: string;
  }) => void;
  onError: (message: string, code?: string) => void;
};

export function CardImageUpload({
  mode,
  onImageReady,
  onError,
}: CardImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [centerCrop, setCenterCrop] = useState(false);
  const [qualityHint, setQualityHint] = useState<ImageQualityHint>("ok");
  const [qualityMessage, setQualityMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const revokePreview = useCallback((url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  useEffect(() => {
    return () => revokePreview(previewUrl);
  }, [previewUrl, revokePreview]);

  const loadSourceFile = useCallback(
    async (file: File) => {
      const validation = validateFastAddImageFile(file);

      if (!validation.ok) {
        const copy = getFastAddErrorCopy(validation.code as "unsupported_type");
        onError(copy.message, validation.code);
        return;
      }

      setSourceFile(file);
      setRotation(0);
      setCenterCrop(false);
      revokePreview(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setQualityHint("ok");
      setQualityMessage(null);
    },
    [onError, previewUrl, revokePreview],
  );

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (mode !== "upload" || previewUrl) {
        return;
      }

      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            void loadSourceFile(file);
            break;
          }
        }
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [loadSourceFile, mode, previewUrl]);

  async function identifyCard() {
    if (!sourceFile) {
      return;
    }

    setIsProcessing(true);

    try {
      const prepared: PreparedFastAddImage = await prepareFastAddImage(sourceFile, {
        rotationDegrees: rotation,
        centerCrop,
      });

      revokePreview(previewUrl);
      setPreviewUrl(prepared.previewUrl);
      setQualityHint(prepared.qualityHint);
      setQualityMessage(prepared.qualityMessage ?? null);

      if (prepared.qualityHint === "dark" || prepared.qualityHint === "blurry") {
        trackFastAddEvent("photo_uploaded", {
          mode,
          qualityHint: prepared.qualityHint,
        });
      }

      const clientHints = await extractTextHintsFromImage(prepared.file);
      trackFastAddEvent("photo_uploaded", {
        mode,
        bytes: prepared.file.size,
        hasClientHints: Boolean(clientHints?.rawText),
        width: prepared.width,
        height: prepared.height,
      });

      onImageReady({
        file: prepared.file,
        previewUrl: prepared.previewUrl,
        clientHints,
        width: prepared.width,
        height: prepared.height,
        fingerprint: buildImageFingerprint(prepared.file),
      });
    } catch {
      const copy = getFastAddErrorCopy("processing_failed");
      onError(copy.message, "processing_failed");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void loadSourceFile(file);
    }
  }

  function clearImage() {
    revokePreview(previewUrl);
    setPreviewUrl(null);
    setSourceFile(null);
    setRotation(0);
    setCenterCrop(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture={mode === "camera" ? "environment" : undefined}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void loadSourceFile(file);
          }
        }}
      />

      {!previewUrl ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border border-dashed px-6 py-10 text-center ${
            isDragging
              ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
              : "border-zinc-300 dark:border-zinc-700"
          }`}
        >
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {mode === "camera"
              ? "Take a photo or choose from your library"
              : "Drag and drop a card photo"}
          </p>
          <ul className="mx-auto mt-4 max-w-md space-y-1 text-left text-xs text-zinc-500">
            {CAPTURE_GUIDANCE.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            {mode === "upload"
              ? "JPG, PNG, or WebP up to 10 MB. Paste from clipboard on desktop."
              : "Works in mobile browsers. Photo library is available if camera access isn't."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                inputRef.current?.setAttribute("capture", "environment");
                inputRef.current?.click();
              }}
              className="inline-flex min-h-11 items-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {mode === "camera" ? "Take photo" : "Choose image"}
            </button>
            {mode === "camera" ? (
              <button
                type="button"
                onClick={() => {
                  inputRef.current?.removeAttribute("capture");
                  inputRef.current?.click();
                }}
                className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-medium dark:border-zinc-700"
              >
                Photo library
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {qualityMessage ? (
            <p
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200"
              role="status"
            >
              {qualityMessage}
            </p>
          ) : null}

          <div
            className={`overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 ${profileImageGradientClassName}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Card preview"
              style={{ transform: `rotate(${rotation}deg)` }}
              className="mx-auto max-h-[420px] w-full object-contain p-4 transition-transform"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRotation((value) => (value + 270) % 360)}
              className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
            >
              Rotate left
            </button>
            <button
              type="button"
              onClick={() => setRotation((value) => (value + 90) % 360)}
              className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
            >
              Rotate right
            </button>
            <button
              type="button"
              onClick={() => setCenterCrop((value) => !value)}
              className={`inline-flex min-h-11 items-center rounded-xl border px-4 py-2.5 text-sm font-medium ${
                centerCrop
                  ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              {centerCrop ? "Using center crop" : "Center crop (optional)"}
            </button>
            <button
              type="button"
              onClick={clearImage}
              className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
            >
              {mode === "camera" ? "Retake photo" : "Replace image"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void identifyCard()}
            disabled={isProcessing}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 sm:w-auto"
          >
            {isProcessing ? "Preparing card photo…" : "Identify card"}
          </button>

          <p className="text-xs text-zinc-500">
            Photos are processed temporarily for recognition and are not stored in your
            collection or public profile.
          </p>
        </div>
      )}

      {isProcessing && !previewUrl ? (
        <p className="text-sm text-zinc-500" role="status" aria-live="polite">
          Preparing image…
        </p>
      ) : null}
    </div>
  );
}
