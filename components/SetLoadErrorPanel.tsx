import Link from "next/link";

type SetLoadErrorPanelProps = {
  title: string;
  message: string;
  setId: string;
  retryable?: boolean;
};

export function SetLoadErrorPanel({
  title,
  message,
  setId,
  retryable = true,
}: SetLoadErrorPanelProps) {
  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 dark:border-red-900 dark:bg-red-950/40"
      role="alert"
    >
      <h2 className="text-lg font-semibold text-red-900 dark:text-red-200">
        {title}
      </h2>
      <p className="mt-2 text-sm text-red-800 dark:text-red-300">{message}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {retryable ? (
          <Link
            href={`/sets/${encodeURIComponent(setId)}`}
            className="inline-flex min-h-11 items-center rounded-xl bg-red-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-red-200 dark:text-red-950"
          >
            Retry
          </Link>
        ) : null}
        <Link
          href="/sets"
          className="inline-flex min-h-11 items-center rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-100 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-900/60"
        >
          Back to Set Browser
        </Link>
      </div>
    </div>
  );
}
