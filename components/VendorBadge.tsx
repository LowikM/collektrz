type VendorBadgeProps = {
  standNumber?: string | null;
  className?: string;
};

export function VendorBadge({ standNumber, className = "" }: VendorBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/60 dark:text-amber-200 ${className}`}
    >
      Vendor
      {standNumber ? (
        <span className="text-amber-800/80 dark:text-amber-100/80">
          · Stand {standNumber}
        </span>
      ) : null}
    </span>
  );
}
