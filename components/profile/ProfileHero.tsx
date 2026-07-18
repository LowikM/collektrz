import Link from "next/link";

import { MatchScoreCard } from "@/components/matches/MatchScoreCard";
import { ProfileQrButton } from "@/components/profile/ProfileQrButton";
import { ProfileShareButton } from "@/components/profile/ProfileShareButton";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";
import {
  profileBadgeClassName,
  profileHeroGradientClassName,
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";
import { canViewProfileStat, canViewPortfolioValue } from "@/lib/profile-privacy";
import type { MatchScoreResult } from "@/lib/match-score";
import type { ProfileStats, ProfileUser } from "@/lib/profile";
import type { ProfileVisibilityContext } from "@/lib/profile-privacy";
import {
  formatMemberSince,
  getUserDisplayLabel,
} from "@/lib/users";
import { VendorBadge } from "@/components/VendorBadge";

type ProfileHeroProps = {
  user: ProfileUser;
  stats: ProfileStats;
  visibility: ProfileVisibilityContext;
  isOwnProfile: boolean;
  profileUrl: string;
  matchScore: MatchScoreResult | null;
  matchEventId: string | null;
  cardImagesById: Map<string, { small: string; large: string }>;
};

function formatStatValue(
  visible: boolean,
  value: number | null,
): string | number {
  if (!visible) {
    return "—";
  }

  return value ?? 0;
}

export function ProfileHero({
  user,
  stats,
  visibility,
  isOwnProfile,
  profileUrl,
  matchScore,
  matchEventId,
  cardImagesById,
}: ProfileHeroProps) {
  const displayName = getUserDisplayLabel(user);
  const interests = [user.favorite_pokemon].filter(Boolean);

  return (
    <section className={profileHeroGradientClassName}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-zinc-200/50 to-transparent blur-3xl dark:from-zinc-600/20" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-zinc-200/40 to-transparent blur-3xl dark:from-zinc-700/10" />

      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt=""
              className="h-28 w-28 shrink-0 rounded-3xl border-2 border-white object-cover shadow-lg ring-1 ring-zinc-200/80 sm:h-32 sm:w-32 dark:border-zinc-800 dark:ring-zinc-700"
            />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border-2 border-white bg-gradient-to-br from-zinc-100 to-zinc-200 text-4xl font-semibold text-zinc-600 shadow-lg ring-1 ring-zinc-200/80 sm:h-32 sm:w-32 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800 dark:text-zinc-300 dark:ring-zinc-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 space-y-4 pt-1">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                  {displayName}
                </h1>
                {user.is_vendor ? (
                  <VendorBadge standNumber={user.vendor_stand_number} />
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={profileBadgeClassName}>Collector</span>
                {user.location ? (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {user.location}
                  </span>
                ) : null}
              </div>
            </div>

            {user.bio ? (
              <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
                {user.bio}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <span>Member since {formatMemberSince(user.created_at)}</span>
              {interests.length > 0 ? (
                <>
                  <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">
                    ·
                  </span>
                  <span>Collects {interests.join(", ")}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:max-w-sm xl:justify-end">
          {isOwnProfile ? (
            <Link href="/profile" className={profilePrimaryButtonClassName}>
              Edit profile
            </Link>
          ) : (
            <Link
              href={`/messages?with=${user.id}`}
              className={profilePrimaryButtonClassName}
            >
              Chat
            </Link>
          )}
          <ProfileQrButton profileUrl={profileUrl} />
          <ProfileShareButton profileUrl={profileUrl} />
          {!isOwnProfile ? (
            <Link
              href={`/messages?with=${user.id}`}
              className={profileSecondaryButtonClassName}
            >
              Trade
            </Link>
          ) : null}
        </div>
      </div>

      {!isOwnProfile && matchScore ? (
        <div className="relative mt-8 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/70">
          <MatchScoreCard
            result={matchScore}
            otherUserId={user.id}
            otherUserName={displayName}
            eventId={matchEventId ?? undefined}
            cardImagesById={cardImagesById}
            compact
          />
        </div>
      ) : null}

      <div className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ProfileStatCard
          label="Collection"
          value={formatStatValue(
            canViewProfileStat("collection", visibility),
            stats.collectionCount,
          )}
        />
        <ProfileStatCard
          label="Wishlist"
          value={formatStatValue(
            canViewProfileStat("wishlist", visibility),
            stats.wishlistCount,
          )}
        />
        <ProfileStatCard
          label="Listings"
          value={stats.listingsCount}
        />
        <ProfileStatCard
          label="Completed trades"
          value={stats.completedTradesCount}
        />
        <ProfileStatCard
          label="Events attended"
          value={stats.eventsAttendedCount}
        />
        {canViewPortfolioValue(visibility) ? (
          <ProfileStatCard
            label="Portfolio value"
            value="—"
            hint="Coming soon"
            future
            className="hidden xl:block"
          />
        ) : null}
      </div>
    </section>
  );
}
