import { profileStatCardClassName } from "@/components/profile/profile-styles";

type ProfileStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  future?: boolean;
  className?: string;
};

export function ProfileStatCard({
  label,
  value,
  hint,
  future = false,
  className = "",
}: ProfileStatCardProps) {
  return (
    <div
      className={`${profileStatCardClassName} ${future ? "opacity-70" : ""} ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
