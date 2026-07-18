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
import { canViewProfileStat } from "@/lib/profile-privacy";
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
  const interests = [user.favorite_pokemon, user.location]
    .filter(Boolean)
    .slice(0, 3);

  return (
    <section className={profileHeroGradientClassName}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-zinc-200/40 blur-3xl dark:bg-zinc-700/20" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt=""
              className="h-24 w-24 shrink-0 rounded-2xl border border-white/70 object-cover shadow-md sm:h-28 sm:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-3xl font-semibold text-zinc-600 shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 sm:h-28 sm:w-28">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {displayName}
              </h1>
              {user.is_vendor ? (
                <VendorBadge standNumber={user.vendor_stand_number} />
              ) : null}
              <span className={profileBadgeClassName}>Collector</span>
            </div>

            {user.location ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.location}
              </p>
            ) : null}

            {user.bio ? (
              <p className="max-w-2xl text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                {user.bio}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>Member since {formatMemberSince(user.created_at)}</span>
              {interests.length > 0 ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Collects {interests.join(", ")}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            <Link href={`/messages?with=${user.id}`} className={profileSecondaryButtonClassName}>
              Trade
            </Link>
          ) : null}
        </div>
      </div>

      {!isOwnProfile && matchScore ? (
        <div className="relative mt-6">
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

      <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
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
        <ProfileStatCard
          label="Portfolio value"
          value="—"
          hint="Coming soon"
          future
        />
        <ProfileStatCard
          label="Collector level"
          value="—"
          hint="Coming soon"
          future
        />
      </div>
    </section>
  );
}
