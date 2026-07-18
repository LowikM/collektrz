import { profileStatCardClassName } from "@/components/profile/profile-styles";

type ProfileStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  future?: boolean;
};

export function ProfileStatCard({
  label,
  value,
  hint,
  future = false,
}: ProfileStatCardProps) {
  return (
    <div
      className={`${profileStatCardClassName} ${future ? "opacity-60" : ""}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
