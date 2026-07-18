import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { ProfileEmptyState } from "@/components/profile/ProfileEmptyState";
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
  if (!hasRarityData) {
    return (
      <section className="space-y-5">
        <ProfileSectionHeader
          title="Rarity distribution"
          description="Rarity grouping uses notes and condition text already stored on your items."
        />
        <ProfileEmptyState
          title="No rarity data yet"
          description="Add rarity details to item notes (for example, Rare or Illustration Rare) to unlock this breakdown."
          actionLabel="Review collection"
          actionHref="/my-collection?view=collection"
          icon="✨"
        />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        title="Rarity distribution"
        description="Grouped from rarity keywords in your stored notes and condition fields."
      />
      <div className={`${profilePanelClassName} space-y-4`}>
        {breakdown.map((entry) => (
          <div key={entry.rarity}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                {entry.rarity}
              </span>
              <span className="tabular-nums text-zinc-500">
                {entry.itemCount} · {entry.percentage}%
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
              role="progressbar"
              aria-valuenow={entry.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${entry.rarity} share`}
            >
              <div
                className="h-full rounded-full bg-zinc-700 dark:bg-zinc-200"
                style={{ width: `${Math.min(entry.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
