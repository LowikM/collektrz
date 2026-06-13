import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { createListing } from "./actions";

type NewListingPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function NewListingPage({
  params,
  searchParams,
}: NewListingPageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  const createListingForEvent = createListing.bind(null, event.id);

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2">
          <Link
            href={`/events/${event.id}`}
            className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            ← Back to event
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Listing
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            for {event.name}
          </p>
        </div>

        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <form action={createListingForEvent} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Type <span className="text-red-600">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue=""
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="" disabled>
                Select a type
              </option>
              <option value="want">Want</option>
              <option value="trade">Trade</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="card_name" className="text-sm font-medium">
              Card name <span className="text-red-600">*</span>
            </label>
            <input
              id="card_name"
              name="card_name"
              type="text"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="trade_for" className="text-sm font-medium">
              Trade for
            </label>
            <input
              id="trade_for"
              name="trade_for"
              type="text"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="condition" className="text-sm font-medium">
              Condition
            </label>
            <input
              id="condition"
              name="condition"
              type="text"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="set_name" className="text-sm font-medium">
              Set name
            </label>
            <input
              id="set_name"
              name="set_name"
              type="text"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Create Listing
          </button>
        </form>
      </div>
    </div>
  );
}
