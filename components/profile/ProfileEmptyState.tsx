import Link from "next/link";

import {
  profilePanelClassName,
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";

type ProfileEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  icon?: string;
};

export function ProfileEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  icon = "✨",
}: ProfileEmptyStateProps) {
  return (
    <div
      className={`${profilePanelClassName} flex flex-col items-center justify-center py-12 text-center`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-900">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={`${profilePrimaryButtonClassName} mt-6`}>
          {actionLabel}
        </Link>
      ) : null}
      {secondaryActionLabel && secondaryActionHref ? (
        <Link
          href={secondaryActionHref}
          className={`${profileSecondaryButtonClassName} mt-3`}
        >
          {secondaryActionLabel}
        </Link>
      ) : null}
    </div>
  );
}
