import Link from "next/link";

import {
  eventPrimaryButtonClassName,
  eventSecondaryButtonClassName,
} from "@/components/events/event-styles";

type EventIntelligenceEmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
};

export function EventIntelligenceEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
}: EventIntelligenceEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 px-6 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900/20">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm dark:bg-zinc-950">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link href={actionHref} className={`${eventPrimaryButtonClassName} min-h-11`}>
          {actionLabel}
        </Link>
        {secondaryActionLabel && secondaryActionHref ? (
          <Link
            href={secondaryActionHref}
            className={`${eventSecondaryButtonClassName} min-h-11`}
          >
            {secondaryActionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function EventIntelligenceSignIn() {
  return (
    <section className="rounded-2xl border border-dashed border-zinc-300 bg-gradient-to-br from-zinc-50 to-white px-6 py-8 text-center dark:border-zinc-700 dark:from-zinc-950 dark:to-zinc-900">
      <h2 className="text-lg font-semibold tracking-tight">
        Sign in for your event intelligence
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        See wishlist matches, collectors you should meet, relevant vendors, and
        personalized next steps for this event.
      </p>
      <Link href="/login" className={`${eventPrimaryButtonClassName} mt-5 min-h-11`}>
        Sign in
      </Link>
    </section>
  );
}
