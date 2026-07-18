import { profileSkeletonClassName } from "@/components/profile/profile-styles";

export function RecognitionProgress({ message = "Reading card details…" }: { message?: string }) {
  return (
    <div
      className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-800 dark:bg-zinc-900/40"
      role="status"
      aria-live="polite"
    >
      <div
        className={`mx-auto h-10 w-10 rounded-full ${profileSkeletonClassName}`}
        aria-hidden="true"
      />
      <p className="mt-4 text-sm font-medium text-zinc-800 dark:text-zinc-100">{message}</p>
      <p className="mt-2 text-xs text-zinc-500">
        Matching against the official card catalog. This usually takes a few seconds.
      </p>
    </div>
  );
}
