"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const LISTING_STATUSES = [
  "active",
  "reserved",
  "completed",
  "removed",
] as const;

type ListingStatus = (typeof LISTING_STATUSES)[number];

function isListingStatus(value: string): value is ListingStatus {
  return LISTING_STATUSES.includes(value as ListingStatus);
}

export async function updateListingStatus(
  listingId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const status = formData.get("status");

  if (typeof status !== "string" || !isListingStatus(status)) {
    redirect(
      `/my-listings?error=${encodeURIComponent("Please select a valid status.")}`,
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, event_id, user_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing || listing.user_id !== user.id) {
    redirect("/my-listings");
  }

  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/my-listings?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/my-listings");
  revalidatePath(`/events/${listing.event_id}`);
  redirect("/my-listings");
}
