"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseWishlistFields } from "@/lib/wishlist";
import { createClient } from "@/lib/supabase/server";

export async function createWishlistItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = parseWishlistFields(formData);

  if ("error" in parsed) {
    redirect(`/my-wishlist?error=${encodeURIComponent(parsed.error)}`);
  }

  const { error } = await supabase.from("wishlist_items").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) {
    redirect(`/my-wishlist?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/my-wishlist");
  redirect("/my-wishlist");
}

export async function updateWishlistItem(itemId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = parseWishlistFields(formData);

  if ("error" in parsed) {
    redirect(`/my-wishlist?error=${encodeURIComponent(parsed.error)}`);
  }

  const {
    tcg_api_card_id: _tcgApiCardId,
    card_number: _cardNumber,
    set_id: _setId,
    ...editableFields
  } = parsed.data;

  const { error } = await supabase
    .from("wishlist_items")
    .update(editableFields)
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/my-wishlist?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/my-wishlist");
  redirect("/my-wishlist");
}

export async function deleteWishlistItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/my-wishlist?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/my-wishlist");
  redirect("/my-wishlist");
}
