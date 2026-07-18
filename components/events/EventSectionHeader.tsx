type EventSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  action?: React.ReactNode;
};

export function EventSectionHeader({
  eyebrow,
  title,
  description,
  count,
  countLabel,
  action,
}: EventSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {typeof count === "number" && countLabel ? (
            <p className="text-sm text-zinc-500">
              {count} {countLabel}
            </p>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
