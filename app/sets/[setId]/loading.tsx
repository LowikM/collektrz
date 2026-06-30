function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}

export default function SetDetailLoading() {
  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-6xl space-y-8">
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-36" />
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonBlock className="h-12 w-32" />
            <div className="space-y-2">
              <SkeletonBlock className="h-8 w-56" />
              <SkeletonBlock className="h-4 w-72" />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <SkeletonBlock className="h-4 w-32" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16 w-full" />
            ))}
          </div>
          <SkeletonBlock className="h-2 w-full rounded-full" />
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <SkeletonBlock className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-8 w-20" />
            ))}
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <li key={index}>
              <SkeletonBlock className="h-80 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
