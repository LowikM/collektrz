import Link from "next/link";

import { AnimatedProgressBar, FadeInSection } from "@/components/portfolio/PortfolioMotion";
import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import type { PortfolioHealthSignal, PortfolioTotals } from "@/lib/portfolio";

type CollectionHealthProps = {
  signals: PortfolioHealthSignal[];
  totals: PortfolioTotals;
};

type HealthRow = {
  id: string;
  label: string;
  percentage: number;
  status: "complete" | "warning" | "neutral";
  actionHref?: string;
  actionLabel?: string;
};

function buildHealthRows(
  signals: PortfolioHealthSignal[],
  totals: PortfolioTotals,
): HealthRow[] {
  const byId = new Map(signals.map((signal) => [signal.id, signal]));

  const images = byId.get("images");
  const setInfo = byId.get("set-info");
  const rarity = byId.get("rarity");
  const publicShowcase = byId.get("public-showcase");

  const rows: HealthRow[] = [];

  if (images) {
    rows.push({
      id: "images",
      label: "Images",
      percentage: images.percentage,
      status: images.percentage >= 80 ? "complete" : images.percentage >= 50 ? "neutral" : "warning",
    });
  }

  if (setInfo) {
    rows.push({
      id: "set-info",
      label: "Set Information",
      percentage: setInfo.percentage,
      status: setInfo.percentage >= 80 ? "complete" : setInfo.percentage >= 50 ? "neutral" : "warning",
    });
  }

  if (rarity) {
    rows.push({
      id: "rarity",
      label: "Rarity Notes",
      percentage: rarity.percentage,
      status: rarity.percentage >= 60 ? "complete" : "neutral",
    });
  }

  rows.push({
    id: "featured",
    label: "Featured Cards",
    percentage: totals.totalItems
      ? Math.round((totals.featuredItems / totals.totalItems) * 1000) / 10
      : 0,
    status: totals.featuredItems > 0 ? "complete" : "warning",
    actionHref: "/my-collection?view=collection",
    actionLabel: "Feature items",
  });

  rows.push({
    id: "public-showcase",
    label: "Public Showcase",
    percentage: publicShowcase?.percentage ?? 0,
    status:
      (publicShowcase?.percentage ?? 0) >= 25
        ? "complete"
        : (publicShowcase?.percentage ?? 0) > 0
          ? "neutral"
          : "warning",
    actionHref: publicShowcase?.actionHref,
    actionLabel: publicShowcase?.actionLabel,
  });

  return rows;
}

function StatusIcon({ status }: { status: HealthRow["status"] }) {
  if (status === "complete") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-sm text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
        ✔
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-sm text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400">
        ⚠
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm text-zinc-500 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700">
      ○
    </span>
  );
}

export function CollectionHealth({ signals, totals }: CollectionHealthProps) {
  const rows = buildHealthRows(signals, totals);

  if (rows.length === 0) {
    return null;
  }

  const overallComplete = Math.round(
    rows.reduce((sum, row) => sum + row.percentage, 0) / rows.length,
  );

  return (
    <FadeInSection delayMs={280}>
      <section className="space-y-5">
        <ProfileSectionHeader
          title="Collection Health"
          description="Metadata completeness and showcase readiness at a glance."
        />

        <div className={`${profilePanelClassName} space-y-6`}>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200/70 pb-5 dark:border-zinc-800">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Overall completeness
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {overallComplete}%
              </p>
            </div>
            <AnimatedProgressBar
              percentage={overallComplete}
              className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
              barClassName="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
            />
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {rows.map((row, index) => (
              <li
                key={row.id}
                className="flex items-start gap-3 rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-700"
              >
                <StatusIcon status={row.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {row.label}
                    </p>
                    <span className="text-sm font-bold tabular-nums text-zinc-700 dark:text-zinc-300">
                      {row.percentage}%
                    </span>
                  </div>
                  <AnimatedProgressBar
                    percentage={row.percentage}
                    className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800"
                    barClassName={
                      row.status === "complete"
                        ? "h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                        : row.status === "warning"
                          ? "h-full rounded-full bg-amber-500 dark:bg-amber-400"
                          : "h-full rounded-full bg-zinc-500 dark:bg-zinc-400"
                    }
                    delayMs={index * 60}
                  />
                  {row.actionHref && row.actionLabel ? (
                    <Link
                      href={row.actionHref}
                      className="mt-2 inline-block text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-400"
                    >
                      {row.actionLabel}
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </FadeInSection>
  );
}
