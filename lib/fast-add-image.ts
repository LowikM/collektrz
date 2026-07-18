export const FAST_ADD_ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type FastAddMimeType = (typeof FAST_ADD_ACCEPTED_MIME_TYPES)[number];

export const FAST_ADD_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const FAST_ADD_COMPRESSED_MAX_BYTES = 1_500_000;
export const FAST_ADD_MAX_DIMENSION = 1600;

export function isFastAddMimeType(value: string): value is FastAddMimeType {
  return FAST_ADD_ACCEPTED_MIME_TYPES.includes(value as FastAddMimeType);
}

export function validateFastAddImageFile(file: File):
  | { ok: true }
  | { ok: false; error: string; code: string } {
  if (!isFastAddMimeType(file.type)) {
    return {
      ok: false,
      error: "Unsupported file type. Use JPG, PNG, or WebP.",
      code: "unsupported_type",
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      error: "This file appears to be empty or corrupt.",
      code: "empty_file",
    };
  }

  if (file.size > FAST_ADD_MAX_FILE_BYTES) {
    return {
      ok: false,
      error: "Image is too large. Maximum size is 10 MB.",
      code: "file_too_large",
    };
  }

  return { ok: true };
}

export function validateFastAddImageBuffer(
  buffer: Buffer,
  mimeType: string,
):
  | { ok: true }
  | { ok: false; error: string; code: string } {
  if (!isFastAddMimeType(mimeType)) {
    return {
      ok: false,
      error: "Unsupported file type. Use JPG, PNG, or WebP.",
      code: "unsupported_type",
    };
  }

  if (buffer.length === 0) {
    return {
      ok: false,
      error: "This file appears to be empty or corrupt.",
      code: "empty_file",
    };
  }

  if (buffer.length > FAST_ADD_MAX_FILE_BYTES) {
    return {
      ok: false,
      error: "Image is too large. Maximum size is 10 MB.",
      code: "file_too_large",
    };
  }

  return { ok: true };
}
