"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const LISTING_TYPES = ["want", "trade", "sale"] as const;

type ListingType = (typeof LISTING_TYPES)[number];

function isListingType(value: string): value is ListingType {
  return LISTING_TYPES.includes(value as ListingType);
}

export async function createListing(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const type = formData.get("type");
  const cardName = formData.get("card_name");

  if (typeof type !== "string" || !isListingType(type)) {
    redirect(
      `/events/${eventId}/new-listing?error=${encodeURIComponent("Please select a valid listing type.")}`,
    );
  }

  if (typeof cardName !== "string" || !cardName.trim()) {
    redirect(
      `/events/${eventId}/new-listing?error=${encodeURIComponent("Card name is required.")}`,
    );
  }

  const normalizedCardName = cardName.trim();
  const cardRef = normalizedCardName.toLowerCase();

  const tradeFor = formData.get("trade_for");
  const condition = formData.get("condition");
  const setName = formData.get("set_name");
  const notes = formData.get("notes");

  const { error } = await supabase.from("listings").insert({
    event_id: eventId,
    user_id: user.id,
    type,
    card_name: normalizedCardName,
    card_ref: cardRef,
    status: "active",
    ...(typeof tradeFor === "string" && tradeFor.trim()
      ? { trade_for: tradeFor.trim() }
      : {}),
    ...(typeof condition === "string" && condition.trim()
      ? { condition: condition.trim() }
      : {}),
    ...(typeof setName === "string" && setName.trim()
      ? { set_name: setName.trim() }
      : {}),
    ...(typeof notes === "string" && notes.trim() ? { notes: notes.trim() } : {}),
  });

  if (error) {
    redirect(
      `/events/${eventId}/new-listing?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}
