import Link from "next/link";

import { buildCollectionFilterHref } from "@/components/portfolio/CollectionViewNav";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import type { PortfolioCategoryBreakdown } from "@/lib/portfolio";

type CollectionBreakdownProps = {
  breakdown: PortfolioCategoryBreakdown[];
  totalItems: number;
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

export function CollectionBreakdown({
  breakdown,
  totalItems,
}: CollectionBreakdownProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        title="Collection breakdown"
        description="How your inventory is distributed across categories."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {breakdown.map((entry) => (
          <Link
            key={entry.id}
            href={getBreakdownHref(entry.id)}
            className={`${profilePanelClassName} block transition-colors hover:border-zinc-300 dark:hover:border-zinc-700`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {entry.label}
              </p>
              <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {entry.percentage}%
              </span>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
              role="progressbar"
              aria-valuenow={entry.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${entry.label} share of collection`}
            >
              <div
                className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
                style={{ width: `${Math.min(entry.percentage, 100)}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              {entry.itemCount} item{entry.itemCount === 1 ? "" : "s"} · Qty{" "}
              {entry.quantity}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
