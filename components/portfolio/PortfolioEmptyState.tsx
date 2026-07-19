import Link from "next/link";

import {
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
  PROFILE_RADIUS_LG,
} from "@/components/profile/profile-styles";

type PortfolioEmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  compact?: boolean;
};

export function PortfolioEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  compact = false,
}: PortfolioEmptyStateProps) {
  return (
    <div
      className={`${PROFILE_RADIUS_LG} border border-dashed border-zinc-300/90 bg-gradient-to-br from-zinc-50/80 via-white to-zinc-100/50 px-6 text-center dark:border-zinc-700 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 ${
        compact ? "py-8" : "py-12 sm:py-14"
      }`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href={actionHref} className={profilePrimaryButtonClassName}>
          {actionLabel}
        </Link>
        {secondaryActionLabel && secondaryActionHref ? (
          <Link
            href={secondaryActionHref}
            className={profileSecondaryButtonClassName}
          >
            {secondaryActionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
