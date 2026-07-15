import Link from "next/link";

import { CollectorDashboard } from "@/components/CollectorDashboard";
import { loadCollectorDashboard } from "@/lib/dashboard";
import { getCardImagesByIds } from "@/lib/pokemon-tcg";
import { createClient } from "@/lib/supabase/server";

function LandingPage() {
  return (
    <div className="flex flex-1 justify-center px-4 py-12 sm:py-16">
      <main className="flex w-full max-w-2xl flex-col justify-center gap-10">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Collektrz
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Collect. Connect. Trade.
          </h1>
          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
            The modern marketplace and community where collectors connect,
            trade, and discover collectibles — from Pokémon and Yu-Gi-Oh! to
            sports cards, comics, LEGO, Funko, and everything in between.
          </p>
        </div>

        <ul className="space-y-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
            Discover collector events and meetups near you
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
            Manage your collection and wishlist in one place
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
            Post listings for items you want to sell, trade, or find
          </li>
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
            See who is interested before and during the event
          </li>
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/events"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Browse Events
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const dashboard = await loadCollectorDashboard(supabase, user.id);
  const cardImagesById = await getCardImagesByIds(
    dashboard.topWishlist
      .map((item) => item.tcgApiCardId)
      .filter((id): id is string => Boolean(id)),
  );

  return <CollectorDashboard data={dashboard} cardImagesById={cardImagesById} />;
}
