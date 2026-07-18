import { getUserDisplayLabel, type UserLabel } from "@/lib/users";

type UserAvatarProps = {
  user: UserLabel | null | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showActivityIndicator?: boolean;
  isRecentlyActive?: boolean;
  activityAriaLabel?: string;
  /** @deprecated Use showActivityIndicator */
  showOnline?: boolean;
  /** @deprecated Use isRecentlyActive */
  isOnline?: boolean;
};

const SIZE_CLASSES = {
  xs: "h-8 w-8 text-xs",
  sm: "h-10 w-10 text-sm",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function UserAvatar({
  user,
  size = "md",
  className = "",
  showActivityIndicator = false,
  isRecentlyActive = false,
  activityAriaLabel,
  showOnline = false,
  isOnline = false,
}: UserAvatarProps) {
  const label = getUserDisplayLabel(user);
  const avatarUrl =
    user && "avatar_url" in user
      ? (user as UserLabel & { avatar_url?: string | null }).avatar_url
      : null;
  const showIndicator = showActivityIndicator || showOnline;
  const active = showActivityIndicator ? isRecentlyActive : isOnline;

  return (
    <div className={`relative shrink-0 ${className}`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-provided avatar URLs
        <img
          src={avatarUrl}
          alt=""
          className={`rounded-full object-cover ${SIZE_CLASSES[size]}`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 ${SIZE_CLASSES[size]}`}
          aria-hidden="true"
        >
          {label.charAt(0).toUpperCase()}
        </div>
      )}

      {showIndicator ? (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 ${
            active ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
          }`}
          role="img"
          aria-label={activityAriaLabel ?? (active ? "Recently active" : "Not recently active")}
        />
      ) : null}
    </div>
  );
}
