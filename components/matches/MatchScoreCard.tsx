import Link from "next/link";

import {
  ListingCardThumbnail,
  ListingOfficialCardBadges,
} from "@/components/ListingOfficialCard";
import {
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";
import {
  getTopMatchReasons,
  previewMatchItems,
  type MatchScoreItem,
  type MatchScoreResult,
} from "@/lib/match-score";

type MatchScoreCardProps = {
  result: MatchScoreResult;
  otherUserId: string;
  otherUserName?: string;
  eventId?: string;
  cardImagesById?: Map<string, { small: string; large: string }>;
  compact?: boolean;
};

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm">
      <span className="text-lg font-bold tabular-nums leading-none">{score}</span>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-white/70">
        Match
      </span>
    </div>
  );
}

function MatchItemPreview({
  item,
  imageUrl,
}: {
  item: MatchScoreItem;
  imageUrl: string | null;
}) {
  return (
    <li className="flex items-center gap-2 rounded-xl bg-zinc-50 px-2 py-1.5">
      <ListingCardThumbnail imageUrl={imageUrl} cardName={item.cardName} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{item.cardName}</p>
        {item.setName ? (
          <p className="truncate text-[10px] text-zinc-500">{item.setName}</p>
        ) : null}
      </div>
      <ListingOfficialCardBadges
        tcgApiCardId={item.tcgApiCardId}
        cardNumber={item.cardNumber}
      />
    </li>
  );
}

function MatchItemSection({
  title,
  items,
  cardImagesById,
}: {
  title: string;
  items: MatchScoreItem[];
  cardImagesById: Map<string, { small: string; large: string }>;
}) {
  if (items.length === 0) {
    return null;
  }

  const { preview, remaining } = previewMatchItems(items);

  return (
    <details className="group rounded-xl border border-zinc-200">
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="text-zinc-400 transition-transform group-open:rotate-180">
            ▼
          </span>
          {title}
          <span className="font-normal text-zinc-500">({items.length})</span>
        </span>
      </summary>
      <ul className="space-y-1.5 border-t border-zinc-200 p-2">
        {preview.map((item) => (
          <MatchItemPreview
            key={item.cardKey}
            item={item}
            imageUrl={
              item.tcgApiCardId
                ? (cardImagesById.get(item.tcgApiCardId)?.small ?? null)
                : null
            }
          />
        ))}
        {remaining > 0 ? (
          <li className="px-2 py-1 text-xs text-zinc-500">
            + {remaining} more
          </li>
        ) : null}
      </ul>
    </details>
  );
}

/**
 * Reusable Match Score presentation — score ring, label, reasons, item
 * previews, and profile/chat actions. Used on events, attendees, and matches.
 */
export function MatchScoreCard({
  result,
  otherUserId,
  otherUserName,
  eventId,
  cardImagesById = new Map(),
  compact = false,
}: MatchScoreCardProps) {
  const chatHref = `/messages?with=${otherUserId}`;
  const profileHref = `/users/${otherUserId}`;
  const topReasons = getTopMatchReasons(result, compact ? 1 : 3);
  const showScore = result.confidence !== "insufficient" || result.score > 0;

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {showScore ? <ScoreRing score={result.score} /> : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {otherUserName ? (
              <h3 className="truncate text-base font-semibold">{otherUserName}</h3>
            ) : null}
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
              {result.label}
            </span>
            {result.isMutual ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Mutual
              </span>
            ) : null}
            {result.confidence === "low" || result.confidence === "insufficient" ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Low confidence
              </span>
            ) : null}
          </div>

          {result.lowDataMessage ? (
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              {result.lowDataMessage}
            </p>
          ) : null}

          {topReasons.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {topReasons.map((reason) => (
                <li key={reason} className="text-xs leading-5 text-zinc-600">
                  {reason}
                </li>
              ))}
            </ul>
          ) : null}

          {result.sharedInterests.length > 0 && !compact ? (
            <p className="mt-2 text-xs text-zinc-500">
              Shared: {result.sharedInterests.slice(0, 3).join(", ")}
              {result.sharedInterests.length > 3
                ? ` +${result.sharedInterests.length - 3}`
                : ""}
            </p>
          ) : null}
        </div>
      </div>

      {!compact ? (
        <div className="mt-4 space-y-2">
          <MatchItemSection
            title="They have for you"
            items={result.theyHaveForYou}
            cardImagesById={cardImagesById}
          />
          <MatchItemSection
            title="You have for them"
            items={result.youHaveForThem}
            cardImagesById={cardImagesById}
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={profileHref} className={eventSecondaryButtonClassName}>
          View profile
        </Link>
        <Link href={chatHref} className={eventPrimaryButtonClassName}>
          Start chat
        </Link>
        {eventId ? (
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-800"
          >
            Event
          </Link>
        ) : null}
      </div>
    </article>
  );
}
