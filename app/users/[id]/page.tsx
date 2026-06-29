import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatMemberSince,
  getUserDisplayLabel,
  type PublicUserProfile,
} from "@/lib/users";
import { createClient } from "@/lib/supabase/server";

type PublicUserProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicUserProfilePage({
  params,
}: PublicUserProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("users")
    .select(
      "id, email, display_name, bio, location, favorite_pokemon, avatar_url, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) {
    notFound();
  }

  const userProfile = profile as PublicUserProfile;

  const { count: activeListingsCount, error: listingsError } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", id)
    .eq("status", "active");

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <Link
          href="/events"
          className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
        >
          ← Back to events
        </Link>

        <div className="rounded-xl border border-zinc-200 p-8 dark:border-zinc-800">
          <div className="flex items-start gap-4">
            {userProfile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userProfile.avatar_url}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                {getUserDisplayLabel(userProfile).charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {getUserDisplayLabel(userProfile)}
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {userProfile.email}
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Member since
              </dt>
              <dd className="mt-1">
                {formatMemberSince(userProfile.created_at)}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Active listings
              </dt>
              <dd className="mt-1">
                {listingsError
                  ? "Could not load listing count."
                  : (activeListingsCount ?? 0)}
              </dd>
            </div>

            {userProfile.location ? (
              <div>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                  Location
                </dt>
                <dd className="mt-1">{userProfile.location}</dd>
              </div>
            ) : null}

            {userProfile.favorite_pokemon ? (
              <div>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                  Favorite Pokémon
                </dt>
                <dd className="mt-1">{userProfile.favorite_pokemon}</dd>
              </div>
            ) : null}

            {userProfile.bio ? (
              <div>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                  Bio
                </dt>
                <dd className="mt-1 leading-6 whitespace-pre-wrap">
                  {userProfile.bio}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </div>
  );
}
