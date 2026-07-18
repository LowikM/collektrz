"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  parseBooleanField,
  parseSectionVisibilityField,
} from "@/lib/item-visibility";
import { createClient } from "@/lib/supabase/server";

function revalidateProfilePaths(userId: string) {
  revalidatePath("/profile");
  revalidatePath(`/users/${userId}`);
  revalidatePath("/", "layout");
}

export async function updateProfilePrivacy(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const collectionVisibility = parseSectionVisibilityField(
    formData,
    "collection_visibility",
  );
  const wishlistVisibility = parseSectionVisibilityField(
    formData,
    "wishlist_visibility",
  );

  if ("error" in collectionVisibility) {
    redirect(`/profile?error=${encodeURIComponent(collectionVisibility.error)}`);
  }

  if ("error" in wishlistVisibility) {
    redirect(`/profile?error=${encodeURIComponent(wishlistVisibility.error)}`);
  }

  const confirmCollectionPublic = parseBooleanField(
    formData,
    "confirm_collection_public",
  );
  const confirmWishlistPublic = parseBooleanField(
    formData,
    "confirm_wishlist_public",
  );

  if (
    collectionVisibility.value === "public" &&
    !confirmCollectionPublic
  ) {
    redirect(
      `/profile?error=${encodeURIComponent("Confirm making your collection public before saving.")}`,
    );
  }

  if (wishlistVisibility.value === "public" && !confirmWishlistPublic) {
    redirect(
      `/profile?error=${encodeURIComponent("Confirm making your wishlist public before saving.")}`,
    );
  }

  const { error } = await supabase
    .from("users")
    .update({
      collection_visibility: collectionVisibility.value,
      wishlist_visibility: wishlistVisibility.value,
      show_collection_stats: parseBooleanField(formData, "show_collection_stats"),
      show_portfolio_value: parseBooleanField(formData, "show_portfolio_value"),
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidateProfilePaths(user.id);
  redirect("/profile?privacyUpdated=1");
}
