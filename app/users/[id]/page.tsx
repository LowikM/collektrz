import { notFound } from "next/navigation";

import { ProfileExperience } from "@/components/profile/ProfileExperience";
import {
  loadProfilePageData,
  resolveProfileTab,
  type ProfileCollectionFilters,
} from "@/lib/profile";
import { getPublicProfileUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { getCardImagesByIds } from "@/lib/pokemon-tcg";

type PublicUserProfilePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tab?: string;
    view?: string;
    event?: string;
    page?: string;
    q?: string;
    kind?: string;
    sort?: string;
  }>;
};

function parseCollectionFilters(searchParams: {
  page?: string;
  q?: string;
  kind?: string;
  sort?: string;
}): ProfileCollectionFilters {
  const page = Number.parseInt(searchParams.page ?? "1", 10);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    q: searchParams.q,
    kind:
      searchParams.kind === "card" || searchParams.kind === "sealed"
        ? searchParams.kind
        : "all",
    sort:
      searchParams.sort === "oldest" ||
      searchParams.sort === "alphabetical" ||
      searchParams.sort === "recently_added" ||
      searchParams.sort === "quantity"
        ? searchParams.sort
        : "newest",
  };
}

function collectTcgApiCardIds(
  data: NonNullable<Awaited<ReturnType<typeof loadProfilePageData>>>,
) {
  const ids = new Set<string>();

  const add = (tcgApiCardId: string | null | undefined) => {
    if (tcgApiCardId) {
      ids.add(tcgApiCardId);
    }
  };

  for (const item of data.featuredCollection) {
    add(item.tcg_api_card_id);
  }
  for (const item of data.collectionItems) {
    add(item.tcg_api_card_id);
  }
  for (const item of data.wishlistHighlights) {
    add(item.tcg_api_card_id);
  }
  for (const item of data.wishlistItems) {
    add(item.tcg_api_card_id);
  }
  for (const item of data.recentListings) {
    add(item.tcg_api_card_id);
  }
  for (const item of data.listingItems) {
    add(item.tcg_api_card_id);
  }

  return [...ids];
}

export default async function PublicUserProfilePage({
  params,
  searchParams,
}: PublicUserProfilePageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTab = resolveProfileTab(
    resolvedSearchParams.tab,
    resolvedSearchParams.view,
  );
  const collectionFilters = parseCollectionFilters(resolvedSearchParams);

  const supabase = await createClient();
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const profileData = await loadProfilePageData(supabase, id, viewer?.id ?? null, {
    eventId: resolvedSearchParams.event ?? null,
    collectionFilters,
    activeTab,
  });

  if (!profileData) {
    notFound();
  }

  const cardImagesById = await getCardImagesByIds(
    collectTcgApiCardIds(profileData),
  );

  return (
    <ProfileExperience
      data={profileData}
      activeTab={activeTab}
      userId={id}
      profileUrl={getPublicProfileUrl(id)}
      cardImagesById={cardImagesById}
      collectionFilters={{
        q: collectionFilters.q,
        kind: collectionFilters.kind,
        sort: collectionFilters.sort,
      }}
    />
  );
}
