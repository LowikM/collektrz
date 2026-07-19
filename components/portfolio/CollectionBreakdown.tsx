import Link from "next/link";

import {
  AnimatedProgressBar,
  FadeInSection,
} from "@/components/portfolio/PortfolioMotion";
import { PortfolioEmptyState } from "@/components/portfolio/PortfolioEmptyState";
import { buildCollectionFilterHref } from "@/lib/collection-filters";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import type { PortfolioCategoryBreakdown, PortfolioTotals } from "@/lib/portfolio";

type CollectionBreakdownProps = {
  breakdown: PortfolioCategoryBreakdown[];
  totalItems: number;
  totals: PortfolioTotals;
};

const BAR_COLORS: Record<string, string> = {
  cards: "h-full rounded-full bg-zinc-900 dark:bg-zinc-100",
  sealed: "h-full rounded-full bg-violet-600 dark:bg-violet-400",
  graded: "h-full rounded-full bg-amber-500 dark:bg-amber-400",
};

function getBreakdownHref(entry: PortfolioCategoryBreakdown["id"]) {
  if (entry === "sealed") {
    return buildCollectionFilterHref({ kind: "sealed" });
  }

  if (entry === "graded") {
    return buildCollectionFilterHref({ graded: true });
  }

  return buildCollectionFilterHref({ raw: true });
}

function renderBarBlocks(percentage: number) {
  const filled = Math.round(percentage / 7);
  const empty = Math.max(0, 14 - filled);
  return `${"█".repeat(Math.min(filled, 14))}${"░".repeat(empty)}`;
}

export function CollectionBreakdown({
  breakdown,
  totalItems,
  totals,
}: CollectionBreakdownProps) {
  if (totalItems === 0) {
    return null;
  }

  const hasSealed = breakdown.some((entry) => entry.id === "sealed");

  return (
    <FadeInSection delayMs={160}>
      <section className="space-y-5">
        <ProfileSectionHeader
          title="Collection Breakdown"
          description="How your inventory is distributed across categories."
        />

        {breakdown.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {breakdown.map((entry, index) => (
              <Link
                key={entry.id}
                href={getBreakdownHref(entry.id)}
                className={`${profilePanelClassName} group block transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {entry.label}
                    </p>
                    <p className="mt-1 font-mono text-[10px] tracking-tight text-zinc-400 sm:text-xs">
                      {renderBarBlocks(entry.percentage)}
                    </p>
                  </div>
                  <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                    {entry.percentage}%
                  </span>
                </div>

                <AnimatedProgressBar
                  percentage={entry.percentage}
                  className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                  barClassName={
                    BAR_COLORS[entry.id] ??
                    "h-full rounded-full bg-zinc-700 dark:bg-zinc-300"
                  }
                  delayMs={index * 100}
                />

                <p className="mt-3 text-xs text-zinc-500">
                  {entry.itemCount} item{entry.itemCount === 1 ? "" : "s"} · Qty{" "}
                  {entry.quantity}
                </p>
              </Link>
            ))}
          </div>
        ) : null}

        {!hasSealed && totals.sealed === 0 ? (
          <PortfolioEmptyState
            icon="📦"
            title="No sealed products"
            description="Track booster boxes, ETBs, and sealed products alongside your singles."
            actionLabel="Add to collection"
            actionHref="/my-collection?view=collection"
            compact
          />
        ) : null}
      </section>
    </FadeInSection>
  );
}
