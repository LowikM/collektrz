import Link from "next/link";

export default function EventNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Event not found</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This event does not exist or may have been removed.
        </p>
        <Link
          href="/events"
          className="inline-flex rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Back to events
        </Link>
      </div>
    </div>
  );
}
