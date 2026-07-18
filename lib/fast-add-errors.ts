export type FastAddErrorCode =
  | "unsupported_type"
  | "empty_file"
  | "file_too_large"
  | "missing_image"
  | "recognition_unavailable"
  | "rate_limited"
  | "card_api_unavailable"
  | "no_candidates"
  | "low_confidence"
  | "duplicate_submission"
  | "dark_image"
  | "blurry_image"
  | "processing_failed";

type FastAddErrorCopy = {
  message: string;
  action: string;
};

const ERROR_COPY: Record<FastAddErrorCode, FastAddErrorCopy> = {
  unsupported_type: {
    message: "That file type isn't supported. Use JPG, PNG, or WebP.",
    action: "Upload another image",
  },
  empty_file: {
    message: "This image looks empty or corrupt.",
    action: "Try another photo",
  },
  file_too_large: {
    message: "This image is too large. Use a photo under 10 MB.",
    action: "Upload a smaller image",
  },
  missing_image: {
    message: "No image was attached.",
    action: "Upload or take a photo",
  },
  recognition_unavailable: {
    message:
      "We couldn't identify this card right now. Try a clearer photo or search by name or card number.",
    action: "Search manually",
  },
  rate_limited: {
    message: "Too many recognition attempts in a short time. Wait a moment and try again.",
    action: "Search manually",
  },
  card_api_unavailable: {
    message:
      "The card catalog is temporarily unavailable. You can still search manually in a moment.",
    action: "Search manually",
  },
  no_candidates: {
    message:
      "We couldn't find a confident match in the catalog. Search by the card name or collector number.",
    action: "Search manually",
  },
  low_confidence: {
    message:
      "We couldn't confidently identify this card. Try a clearer photo or search by name or card number.",
    action: "Search manually",
  },
  duplicate_submission: {
    message: "This photo was already submitted. Adjust the image or search manually.",
    action: "Search manually",
  },
  dark_image: {
    message: "This photo looks very dark. Brighter lighting helps recognition.",
    action: "Retake photo",
  },
  blurry_image: {
    message: "This photo looks blurry. Hold steady and fill the frame with one card.",
    action: "Retake photo",
  },
  processing_failed: {
    message: "We couldn't prepare this image. Try another photo or search manually.",
    action: "Search manually",
  },
};

export function getFastAddErrorCopy(
  code: FastAddErrorCode,
  fallbackMessage?: string,
): FastAddErrorCopy {
  return (
    ERROR_COPY[code] ?? {
      message:
        fallbackMessage ??
        "Something went wrong. Try a clearer photo or search by name or card number.",
      action: "Search manually",
    }
  );
}

export function mapRecognitionApiError(code?: string, fallback?: string): FastAddErrorCopy {
  if (code === "rate_limited") {
    return getFastAddErrorCopy("rate_limited");
  }

  if (code === "recognition_unavailable") {
    return getFastAddErrorCopy("recognition_unavailable", fallback);
  }

  return getFastAddErrorCopy("recognition_unavailable", fallback);
}
