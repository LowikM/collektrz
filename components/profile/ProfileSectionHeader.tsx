import type { ReactNode } from "react";
import Link from "next/link";

import {
  profilePrimaryButtonClassName,
  profileSectionDescriptionClassName,
  profileSectionTitleClassName,
} from "@/components/profile/profile-styles";

type ProfileSectionHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function ProfileSectionHeader({
  title,
  description,
  actionLabel,
  actionHref,
}: ProfileSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-1">
      <div>
        <h2 className={profileSectionTitleClassName}>{title}</h2>
        {description ? (
          <p className={profileSectionDescriptionClassName}>{description}</p>
        ) : null}
      </div>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className={`${profilePrimaryButtonClassName} !min-h-10 !px-4 !py-2 text-xs sm:text-sm`}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function ProfileSection({
  children,
  alt = false,
  className = "",
}: {
  children: ReactNode;
  alt?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`${
        alt
          ? "rounded-2xl border border-zinc-200/50 bg-zinc-50/40 p-6 sm:p-8 dark:border-zinc-800/50 dark:bg-zinc-900/20"
          : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}
