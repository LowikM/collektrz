import Link from "next/link";
import type { ReactNode } from "react";

import { buildCollectionFilterHref } from "@/lib/collection-filters";
import { ProfileStatCard } from "@/components/profile/ProfileStatCard";
import {
  profileHeroGradientClassName,
  profileSectionDescriptionClassName,
  profileSectionTitleClassName,
} from "@/components/profile/profile-styles";
import type { PortfolioTotals } from "@/lib/portfolio";

type PortfolioHeroProps = {
  totals: PortfolioTotals;
};

function MetricLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
    >
      {children}
    </Link>
  );
}

export function PortfolioHero({ totals }: PortfolioHeroProps) {
  return (
    <section className={profileHeroGradientClassName}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-zinc-200/40 blur-3xl dark:bg-zinc-700/15" />

      <div className="relative space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Your portfolio
        </p>
        <h1 className={profileSectionTitleClassName}>Collection overview</h1>
        <p className={profileSectionDescriptionClassName}>
          A structured view of what you own, how it is organized, and what you
          are showcasing to other collectors.
        </p>
      </div>

      <div
        className="relative mt-8 rounded-2xl border border-dashed border-zinc-300/80 bg-white/50 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-950/40"
        aria-label="Portfolio value extension point"
      >
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Estimated value tracking
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Live pricing, daily change, acquisition cost, and profit/loss will
          appear here when value data is connected. No estimates are shown yet.
        </p>
      </div>

      <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ProfileStatCard label="Total items" value={totals.totalItems} />
        <ProfileStatCard label="Unique items" value={totals.uniqueItems} />
        <ProfileStatCard label="Total quantity" value={totals.totalQuantity} />
        <MetricLink href={buildCollectionFilterHref({ kind: "card" })}>
          <ProfileStatCard label="Cards" value={totals.cards} />
        </MetricLink>
        <MetricLink href={buildCollectionFilterHref({ kind: "sealed" })}>
          <ProfileStatCard label="Sealed" value={totals.sealed} />
        </MetricLink>
        <MetricLink href={buildCollectionFilterHref({ graded: true })}>
          <ProfileStatCard label="Graded" value={totals.graded} />
        </MetricLink>
        <MetricLink href={buildCollectionFilterHref({ visibility: "public" })}>
          <ProfileStatCard label="Public items" value={totals.publicItems} />
        </MetricLink>
        <MetricLink href="/my-collection?view=collection">
          <ProfileStatCard label="Featured" value={totals.featuredItems} />
        </MetricLink>
        <MetricLink href="/my-wishlist">
          <ProfileStatCard
            label="Wishlist"
            value={totals.wishlistCount ?? "—"}
            hint={totals.wishlistCount === null ? "Unavailable" : undefined}
          />
        </MetricLink>
        <MetricLink href="/my-listings">
          <ProfileStatCard
            label="Active listings"
            value={totals.activeListingsCount ?? "—"}
            hint={
              totals.activeListingsCount === null ? "Unavailable" : undefined
            }
          />
        </MetricLink>
      </div>
    </section>
  );
}
