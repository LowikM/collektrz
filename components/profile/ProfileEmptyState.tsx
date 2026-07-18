import Link from "next/link";

import {
  profilePanelClassName,
  profilePrimaryButtonClassName,
  profileSecondaryButtonClassName,
} from "@/components/profile/profile-styles";

const EMPTY_STATE_ICONS: Record<string, { emoji: string; gradient: string }> = {
  "🃏": {
    emoji: "🃏",
    gradient: "from-violet-100 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/20",
  },
  "⭐": {
    emoji: "⭐",
    gradient: "from-amber-100 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20",
  },
  "📋": {
    emoji: "📋",
    gradient: "from-sky-100 to-cyan-50 dark:from-sky-950/40 dark:to-cyan-950/20",
  },
  "📍": {
    emoji: "📍",
    gradient: "from-emerald-100 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20",
  },
  "🔒": {
    emoji: "🔒",
    gradient: "from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900",
  },
  "🤝": {
    emoji: "🤝",
    gradient: "from-rose-100 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/20",
  },
  "✨": {
    emoji: "✨",
    gradient: "from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950",
  },
};

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
  const iconStyle = EMPTY_STATE_ICONS[icon] ?? EMPTY_STATE_ICONS["✨"];

  return (
    <div
      className={`${profilePanelClassName} flex flex-col items-center justify-center py-14 text-center sm:py-16`}
    >
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br text-4xl shadow-inner ${iconStyle.gradient}`}
        aria-hidden="true"
      >
        {iconStyle.emoji}
      </div>
      <h3 className="mt-6 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={`${profilePrimaryButtonClassName} mt-8`}>
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
