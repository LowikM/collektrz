"use client";

import {
  FAST_ADD_COMPRESSED_MAX_BYTES,
  FAST_ADD_MAX_DIMENSION,
  isFastAddMimeType,
} from "@/lib/fast-add-image";

export type ImageQualityHint = "ok" | "dark" | "blurry" | "low_contrast";

export type PreparedFastAddImage = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  qualityHint: ImageQualityHint;
  qualityMessage?: string;
};

type PrepareOptions = {
  rotationDegrees?: number;
  centerCrop?: boolean;
};

export async function prepareFastAddImage(
  file: File,
  options: PrepareOptions = {},
): Promise<PreparedFastAddImage> {
  if (!isFastAddMimeType(file.type)) {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      width: 0,
      height: 0,
      qualityHint: "ok",
    };
  }

  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;

  let cropX = 0;
  let cropY = 0;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (options.centerCrop) {
    const targetRatio = 3 / 4;
    const sourceRatio = sourceWidth / sourceHeight;

    if (sourceRatio > targetRatio) {
      cropWidth = Math.round(sourceHeight * targetRatio);
      cropX = Math.round((sourceWidth - cropWidth) / 2);
    } else {
      cropHeight = Math.round(sourceWidth / targetRatio);
      cropY = Math.round((sourceHeight - cropHeight) / 2);
    }
  }

  const rotation = ((options.rotationDegrees ?? 0) % 360 + 360) % 360;
  const rotatedSwap = rotation === 90 || rotation === 270;
  const baseWidth = rotatedSwap ? cropHeight : cropWidth;
  const baseHeight = rotatedSwap ? cropWidth : cropHeight;
  const scale = Math.min(1, FAST_ADD_MAX_DIMENSION / Math.max(baseWidth, baseHeight));
  const width = Math.max(1, Math.round(baseWidth * scale));
  const height = Math.max(1, Math.round(baseHeight * scale));

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  const cropContext = cropCanvas.getContext("2d");
  if (!cropContext) {
    bitmap.close();
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      width: sourceWidth,
      height: sourceHeight,
      qualityHint: "ok",
    };
  }
  cropContext.drawImage(bitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  bitmap.close();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return {
      file,
      previewUrl: URL.createObjectURL(file),
      width: sourceWidth,
      height: sourceHeight,
      qualityHint: "ok",
    };
  }

  context.filter = "contrast(1.06) brightness(1.02)";
  context.translate(width / 2, height / 2);
  context.rotate((rotation * Math.PI) / 180);
  context.drawImage(
    cropCanvas,
    -width / 2,
    -height / 2,
    width,
    height,
  );

  const quality = analyzeImageQuality(context, width, height);

  let blobQuality = 0.88;
  let blob = await canvasToBlob(canvas, file.type, blobQuality);

  while (blob.size > FAST_ADD_COMPRESSED_MAX_BYTES && blobQuality > 0.45) {
    blobQuality -= 0.1;
    blob = await canvasToBlob(canvas, file.type, blobQuality);
  }

  if (blob.size > FAST_ADD_COMPRESSED_MAX_BYTES && file.type !== "image/jpeg") {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.82);
  }

  const compressedFile = new File(
    [blob],
    file.name.replace(/\.\w+$/, "") + (blob.type === "image/jpeg" ? ".jpg" : ".webp"),
    { type: blob.type, lastModified: Date.now() },
  );

  return {
    file: compressedFile,
    previewUrl: URL.createObjectURL(blob),
    width,
    height,
    qualityHint: quality.hint,
    qualityMessage: quality.message,
  };
}

/** @deprecated Use prepareFastAddImage */
export async function compressFastAddImage(file: File) {
  const prepared = await prepareFastAddImage(file);
  return { file: prepared.file, previewUrl: prepared.previewUrl };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not compress image."));
          return;
        }

        resolve(blob);
      },
      type === "image/png" ? "image/png" : "image/jpeg",
      quality,
    );
  });
}

function analyzeImageQuality(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): { hint: ImageQualityHint; message?: string } {
  const sampleSize = Math.min(96, width, height);
  const imageData = context.getImageData(0, 0, sampleSize, sampleSize);
  const { data } = imageData;

  let luminanceSum = 0;
  let laplacianSum = 0;
  let count = 0;

  for (let y = 1; y < sampleSize - 1; y += 2) {
    for (let x = 1; x < sampleSize - 1; x += 2) {
      const index = (y * sampleSize + x) * 4;
      const luminance =
        0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
      luminanceSum += luminance;

      const left = (y * sampleSize + (x - 1)) * 4;
      const right = (y * sampleSize + (x + 1)) * 4;
      const up = ((y - 1) * sampleSize + x) * 4;
      const down = ((y + 1) * sampleSize + x) * 4;
      const neighborAvg =
        (data[left] + data[right] + data[up] + data[down]) / 4;
      laplacianSum += Math.abs(data[index] - neighborAvg);
      count += 1;
    }
  }

  const avgLuminance = luminanceSum / Math.max(count, 1);
  const sharpness = laplacianSum / Math.max(count, 1);

  if (avgLuminance < 45) {
    return {
      hint: "dark",
      message: "This photo looks very dark. Brighter lighting helps recognition.",
    };
  }

  if (sharpness < 6) {
    return {
      hint: "blurry",
      message: "This photo looks blurry. Hold steady and keep the card number visible.",
    };
  }

  if (avgLuminance < 70 && sharpness < 10) {
    return {
      hint: "low_contrast",
      message: "Try a plain background and avoid glare on the card surface.",
    };
  }

  return { hint: "ok" };
}

/**
 * Best-effort client OCR using dynamic import. Falls back gracefully when unavailable.
 */
export async function extractTextHintsFromImage(file: File): Promise<{
  rawText?: string;
  extractedName?: string;
  extractedNumber?: string;
  extractedSetHint?: string;
} | null> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng", 1, {
      logger: () => {},
    });

    const result = await worker.recognize(file);
    await worker.terminate();

    const rawText = result.data.text?.trim();

    if (!rawText) {
      return null;
    }

    const numberMatch = rawText.match(/(\d+)\s*\/\s*(\d+)/);
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 2);

    return {
      rawText,
      extractedNumber: numberMatch?.[0]?.replace(/\s+/g, ""),
      extractedName: lines.find((line) => !/\d+\s*\/\s*\d+/.test(line)),
    };
  } catch {
    return null;
  }
}

export function buildImageFingerprint(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
}
