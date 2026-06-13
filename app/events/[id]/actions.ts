"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function expressInterest(eventId: string, listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, user_id, event_id")
    .eq("id", listingId)
    .eq("event_id", eventId)
    .single();

  if (listingError || !listing || listing.user_id === user.id) {
    redirect(`/events/${eventId}`);
  }

  const { data: existingInterest } = await supabase
    .from("interests")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingInterest) {
    redirect(`/events/${eventId}`);
  }

  const { error } = await supabase.from("interests").insert({
    listing_id: listingId,
    user_id: user.id,
    message: null,
  });

  if (error) {
    redirect(
      `/events/${eventId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}
