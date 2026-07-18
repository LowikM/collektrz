"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  parseItemIds,
  parseItemVisibilityField,
} from "@/lib/item-visibility";
import { createClient } from "@/lib/supabase/server";

function revalidateWishlistPaths(userId: string) {
  revalidatePath("/my-wishlist");
  revalidatePath(`/users/${userId}`);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function updateWishlistItemVisibility(formData: FormData) {
  const { supabase, user } = await requireUser();
  const itemId = formData.get("wishlist_item_id");
  const visibility = parseItemVisibilityField(formData);

  if (typeof itemId !== "string" || !itemId) {
    redirect("/my-wishlist?error=Wishlist%20item%20not%20found.");
  }

  if ("error" in visibility) {
    redirect(`/my-wishlist?error=${encodeURIComponent(visibility.error)}`);
  }

  const { error } = await supabase
    .from("wishlist_items")
    .update({ visibility: visibility.value })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/my-wishlist?error=${encodeURIComponent(error.message)}`);
  }

  revalidateWishlistPaths(user.id);
  redirect("/my-wishlist");
}

export async function bulkSetWishlistVisibility(formData: FormData) {
  const { supabase, user } = await requireUser();
  const itemIds = parseItemIds(formData, "wishlist_item_ids");
  const visibility = parseItemVisibilityField(formData);

  if (itemIds.length === 0) {
    redirect(
      `/my-wishlist?error=${encodeURIComponent("Select at least one wishlist item.")}`,
    );
  }

  if ("error" in visibility) {
    redirect(`/my-wishlist?error=${encodeURIComponent(visibility.error)}`);
  }

  const { error, count } = await supabase
    .from("wishlist_items")
    .update({ visibility: visibility.value })
    .eq("user_id", user.id)
    .in("id", itemIds);

  if (error) {
    redirect(`/my-wishlist?error=${encodeURIComponent(error.message)}`);
  }

  revalidateWishlistPaths(user.id);
  redirect(
    `/my-wishlist?visibilityUpdated=${encodeURIComponent(String(count ?? itemIds.length))}`,
  );
}

export async function setAllWishlistVisibility(formData: FormData) {
  const { supabase, user } = await requireUser();
  const visibility = parseItemVisibilityField(formData);

  if (formData.get("confirm_all") !== "yes") {
    redirect(
      `/my-wishlist?error=${encodeURIComponent("Confirm the bulk visibility change before continuing.")}`,
    );
  }

  if ("error" in visibility) {
    redirect(`/my-wishlist?error=${encodeURIComponent(visibility.error)}`);
  }

  const { error, count } = await supabase
    .from("wishlist_items")
    .update({ visibility: visibility.value })
    .eq("user_id", user.id);

  if (error) {
    redirect(`/my-wishlist?error=${encodeURIComponent(error.message)}`);
  }

  revalidateWishlistPaths(user.id);
  redirect(
    `/my-wishlist?allVisibilityUpdated=${encodeURIComponent(String(count ?? 0))}`,
  );
}
