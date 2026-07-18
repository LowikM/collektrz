import type { CardRecognitionCandidate } from "@/lib/card-recognition/types";
import { profileImageGradientClassName } from "@/components/profile/profile-styles";

type CardCandidateListProps = {
  candidates: CardRecognitionCandidate[];
  selectedCardId?: string | null;
  onSelect: (candidate: CardRecognitionCandidate) => void;
  uncertain?: boolean;
  message?: string;
};

export function CardCandidateList({
  candidates,
  selectedCardId,
  onSelect,
  uncertain,
  message,
}: CardCandidateListProps) {
  if (candidates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {uncertain || message ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
          {message ?? "We're not certain about this match. Please choose the correct card."}
        </p>
      ) : null}

      <ul className="space-y-2">
        {candidates.map((candidate) => {
          const isSelected = selectedCardId === candidate.cardId;

          return (
            <li key={candidate.cardId}>
              <button
                type="button"
                onClick={() => onSelect(candidate)}
                className={`flex w-full min-h-11 gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                }`}
              >
                <div
                  className={`flex h-20 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg ${profileImageGradientClassName}`}
                >
                  {candidate.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={candidate.imageUrl}
                      alt=""
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <span className="text-xs text-zinc-400">?</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{candidate.name}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {candidate.setName || "Unknown set"}
                    {candidate.number ? ` · #${candidate.number}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Match {Math.round(candidate.confidence * 100)}% ·{" "}
                    {candidate.reasons.join(", ")}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
