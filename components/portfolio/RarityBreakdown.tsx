import Link from "next/link";

import {
  AnimatedProgressBar,
  FadeInSection,
} from "@/components/portfolio/PortfolioMotion";
import { PortfolioEmptyState } from "@/components/portfolio/PortfolioEmptyState";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import type { PortfolioRaritySummary } from "@/lib/portfolio";

type RarityBreakdownProps = {
  breakdown: PortfolioRaritySummary[];
  hasRarityData: boolean;
};

export function RarityBreakdown({
  breakdown,
  hasRarityData,
}: RarityBreakdownProps) {
  return (
    <FadeInSection delayMs={240}>
      <section className="space-y-5">
        <ProfileSectionHeader
          title="Rarity Distribution"
          description="Grouped from rarity keywords in your stored notes and condition fields."
        />

        {!hasRarityData ? (
          <PortfolioEmptyState
            icon="✨"
            title="No rarity information"
            description="Add rarity details to item notes (for example, Rare or Illustration Rare) to unlock this breakdown."
            actionLabel="Review collection"
            actionHref="/my-collection?view=collection"
            compact
          />
        ) : (
          <div className={`${profilePanelClassName} space-y-5`}>
            {breakdown.map((entry, index) => (
              <div key={entry.rarity}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-zinc-800 dark:text-zinc-100">
                    {entry.rarity}
                  </span>
                  <span className="tabular-nums text-zinc-500">
                    {entry.itemCount} · {entry.percentage}%
                  </span>
                </div>
                <AnimatedProgressBar
                  percentage={entry.percentage}
                  className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                  barClassName="h-full rounded-full bg-zinc-700 dark:bg-zinc-200"
                  delayMs={index * 70}
                />
              </div>
            ))}
          </div>
        )}

      </section>
    </FadeInSection>
  );
}
