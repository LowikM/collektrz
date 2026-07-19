import Link from "next/link";

import {
  AnimatedCounter,
  FadeInSection,
} from "@/components/portfolio/PortfolioMotion";
import { buildCollectionFilterHref } from "@/lib/collection-filters";
import type { PortfolioTotals } from "@/lib/portfolio";
import { PROFILE_RADIUS_LG } from "@/components/profile/profile-styles";

type PortfolioHeroProps = {
  totals: PortfolioTotals;
};

function PrimaryMetric({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/90 px-5 py-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/90 dark:hover:border-zinc-700">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-4xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
        <AnimatedCounter value={value} />
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100">
        {content}
      </Link>
    );
  }

  return content;
}

function SecondaryMetric({
  label,
  value,
  href,
}: {
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-xl border border-zinc-200/60 bg-white/60 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-950"
    >
      <span className="text-sm font-medium text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-100">
        {label}
      </span>
      <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
        {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
      </span>
    </Link>
  );
}

export function PortfolioHero({ totals }: PortfolioHeroProps) {
  return (
    <FadeInSection>
      <section
        className={`relative overflow-hidden ${PROFILE_RADIUS_LG} border border-zinc-200/80 bg-gradient-to-br from-zinc-50 via-white to-zinc-100/90 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950`}
      >
        <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-500/5" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-zinc-300/30 blur-3xl dark:bg-zinc-600/10" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-6 xl:gap-10">
          {/* Left — identity */}
          <div className="flex flex-col justify-center space-y-3 lg:pr-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Collector dashboard
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              My Collection
            </h2>
            <p className="max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Organized for collecting, trading and showcasing.
            </p>
          </div>

          {/* Center — primary metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <PrimaryMetric label="Total Items" value={totals.totalItems} />
            <PrimaryMetric label="Unique Items" value={totals.uniqueItems} />
            <PrimaryMetric
              label="Cards"
              value={totals.cards}
              href={buildCollectionFilterHref({ kind: "card" })}
            />
            <PrimaryMetric
              label="Sealed"
              value={totals.sealed}
              href={buildCollectionFilterHref({ kind: "sealed" })}
            />
          </div>

          {/* Right — secondary metrics */}
          <div className="flex flex-col justify-center gap-2.5">
            <SecondaryMetric
              label="Wishlist"
              value={totals.wishlistCount ?? "—"}
              href="/my-wishlist"
            />
            <SecondaryMetric
              label="Active Listings"
              value={totals.activeListingsCount ?? "—"}
              href="/my-listings"
            />
            <SecondaryMetric
              label="Featured Cards"
              value={totals.featuredItems}
              href="/my-collection?view=collection"
            />
            <SecondaryMetric
              label="Public Items"
              value={totals.publicItems}
              href={buildCollectionFilterHref({ visibility: "public" })}
            />
          </div>
        </div>

        {/* Value — coming soon */}
        <div className="relative border-t border-zinc-200/70 bg-gradient-to-r from-amber-50/80 via-white to-zinc-50 px-6 py-5 dark:border-zinc-800 dark:from-amber-950/20 dark:via-zinc-950 dark:to-zinc-900 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Estimated Collection Value
                </p>
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Coming Soon
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Live pricing, daily change, and portfolio value tracking will
                appear here when connected.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200/60 bg-white/80 px-5 py-3 text-right shadow-sm dark:border-amber-900/40 dark:bg-zinc-950/80">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Total quantity tracked
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                <AnimatedCounter value={totals.totalQuantity} />
              </p>
            </div>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}
