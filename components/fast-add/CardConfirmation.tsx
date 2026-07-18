import type { PokemonTcgCardSearchResult } from "@/lib/pokemon-tcg";
import {
  profileImageGradientClassName,
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";

import type { RecognitionConfidenceLevel } from "@/lib/card-recognition/confidence-config";

type CardConfirmationProps = {
  card: PokemonTcgCardSearchResult;
  confidence?: number | null;
  confidenceLevel?: RecognitionConfidenceLevel;
  usedRecognition?: boolean;
  onConfirm: () => void;
  onSearchManually: () => void;
  onStartOver: () => void;
};

export function CardConfirmation({
  card,
  confidence,
  confidenceLevel,
  usedRecognition = false,
  onConfirm,
  onSearchManually,
  onStartOver,
}: CardConfirmationProps) {
  const imageUrl = card.images.large || card.images.small;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div
          className={`overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 ${profileImageGradientClassName}`}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={card.name}
              className="mx-auto max-h-[420px] w-full object-contain p-6"
            />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center p-6 text-sm text-zinc-400">
              No image available
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Confirm card
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{card.name}</h2>
            <p className="mt-2 text-sm text-zinc-500">
              {card.set.name || "Unknown set"}
              {card.number ? ` · #${card.number}` : ""}
            </p>
          </div>

          {usedRecognition && typeof confidence === "number" ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
              {confidenceLevel === "high"
                ? "Strong match from your photo"
                : "Possible match from your photo"}
              : {Math.round(confidence * 100)}%. Please confirm before adding.
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={onConfirm}
              className={`${profilePrimaryButtonClassName} w-full sm:w-auto`}
            >
              Confirm this card
            </button>
            <button
              type="button"
              onClick={onSearchManually}
              className={`${profileSecondaryButtonClassName} w-full sm:w-auto`}
            >
              Search manually
            </button>
            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 sm:w-auto"
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
