"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updateEventPresence(
  eventId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const action = formData.get("presence_action");

  if (action !== "attending" && action !== "currently_at") {
    redirect(`/events/${eventId}?error=${encodeURIComponent("Invalid presence action.")}`);
  }

  const { data: existing } = await supabase
    .from("event_attendees")
    .select("is_attending, is_currently_at_event")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  const nextAttending =
    action === "attending"
      ? formData.get("is_attending") === "true"
      : (existing?.is_attending ?? false);

  const nextCurrentlyAt =
    action === "currently_at"
      ? formData.get("is_currently_at_event") === "true"
      : (existing?.is_currently_at_event ?? false);

  if (nextCurrentlyAt && !nextAttending) {
    redirect(
      `/events/${eventId}?error=${encodeURIComponent("Mark yourself as attending before checking in at the event.")}`,
    );
  }

  const payload = {
    event_id: eventId,
    user_id: user.id,
    is_attending: nextAttending,
    is_currently_at_event: nextCurrentlyAt,
  };

  const { error } = existing
    ? await supabase
        .from("event_attendees")
        .update({
          is_attending: payload.is_attending,
          is_currently_at_event: payload.is_currently_at_event,
        })
        .eq("event_id", eventId)
        .eq("user_id", user.id)
    : await supabase.from("event_attendees").insert(payload);

  if (error) {
    redirect(`/events/${eventId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}
