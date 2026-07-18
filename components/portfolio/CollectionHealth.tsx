import Link from "next/link";

import { buildCollectionFilterHref } from "@/components/portfolio/CollectionViewNav";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import type { PortfolioHealthSignal } from "@/lib/portfolio";

type CollectionHealthProps = {
  signals: PortfolioHealthSignal[];
};

export function CollectionHealth({ signals }: CollectionHealthProps) {
  if (signals.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <ProfileSectionHeader
        title="Collection health"
        description="Neutral signals to help you improve metadata and showcase readiness."
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {signals.map((signal) => (
          <li key={signal.id} className={profilePanelClassName}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {signal.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {signal.count}
                  <span className="ml-2 text-sm font-normal text-zinc-500">
                    ({signal.percentage}%)
                  </span>
                </p>
              </div>
              {signal.actionLabel && signal.actionHref ? (
                <Link
                  href={signal.actionHref}
                  className="text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  {signal.actionLabel}
                </Link>
              ) : null}
            </div>
            {signal.id === "missing-set" ? (
              <Link
                href={buildCollectionFilterHref({})}
                className="mt-3 inline-block text-xs text-zinc-500 hover:underline"
              >
                Review items missing set information
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
