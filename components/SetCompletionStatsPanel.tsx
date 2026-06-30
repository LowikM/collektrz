import type { SetCompletionStats } from "@/lib/set-browser";

type SetCompletionStatsProps = {
  stats: SetCompletionStats;
};

export function SetCompletionStatsPanel({ stats }: SetCompletionStatsProps) {
  return (
    <section className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/20">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Set completion
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Based on cards loaded for this set and your official collection and
          wishlist entries.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">Total</dt>
          <dd className="text-lg font-semibold">{stats.total}</dd>
        </div>
        <div className="rounded-lg bg-green-50 px-3 py-2 dark:bg-green-950/40">
          <dt className="text-xs text-green-700 dark:text-green-400">Owned</dt>
          <dd className="text-lg font-semibold text-green-800 dark:text-green-300">
            {stats.owned}
          </dd>
        </div>
        <div className="rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950/40">
          <dt className="text-xs text-blue-700 dark:text-blue-400">Wanted</dt>
          <dd className="text-lg font-semibold text-blue-800 dark:text-blue-300">
            {stats.wanted}
          </dd>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/40">
          <dt className="text-xs font-medium text-amber-800 dark:text-amber-300">
            Missing
          </dt>
          <dd className="text-lg font-semibold text-amber-900 dark:text-amber-200">
            {stats.missing}
          </dd>
        </div>
      </dl>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{stats.completionPercent}% complete</span>
          <span className="text-zinc-600 dark:text-zinc-400">
            {stats.owned} / {stats.total} owned
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
          role="progressbar"
          aria-valuenow={stats.completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Set completion"
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all dark:bg-green-400"
            style={{ width: `${stats.completionPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
