"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  parseItemIds,
  parseItemVisibilityField,
} from "@/lib/item-visibility";
import { createClient } from "@/lib/supabase/server";

function revalidateCollectionPaths(userId: string) {
  revalidatePath("/my-collection");
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

export async function updateCollectionItemVisibility(formData: FormData) {
  const { supabase, user } = await requireUser();
  const itemId = formData.get("collection_item_id");
  const visibility = parseItemVisibilityField(formData);

  if (typeof itemId !== "string" || !itemId) {
    redirect("/my-collection?error=Collection%20item%20not%20found.");
  }

  if ("error" in visibility) {
    redirect(`/my-collection?error=${encodeURIComponent(visibility.error)}`);
  }

  const updates: Record<string, unknown> = {
    visibility: visibility.value,
  };

  if (visibility.value === "private") {
    updates.is_featured = false;
  }

  const { error } = await supabase
    .from("collection_items")
    .update(updates)
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/my-collection?error=${encodeURIComponent(error.message)}`);
  }

  revalidateCollectionPaths(user.id);
  redirect("/my-collection");
}

export async function updateCollectionItemFeatured(formData: FormData) {
  const { supabase, user } = await requireUser();
  const itemId = formData.get("collection_item_id");
  const featuredRaw = formData.get("is_featured");

  if (typeof itemId !== "string" || !itemId) {
    redirect("/my-collection?error=Collection%20item%20not%20found.");
  }

  const isFeatured = featuredRaw === "true" || featuredRaw === "1";

  if (isFeatured) {
    const { data: item, error: readError } = await supabase
      .from("collection_items")
      .select("visibility")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (readError) {
      redirect(`/my-collection?error=${encodeURIComponent(readError.message)}`);
    }

    if (!item || item.visibility !== "public") {
      redirect(
        `/my-collection?error=${encodeURIComponent("Only public items can be featured on your profile.")}`,
      );
    }
  }

  const { error } = await supabase
    .from("collection_items")
    .update({ is_featured: isFeatured })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/my-collection?error=${encodeURIComponent(error.message)}`);
  }

  revalidateCollectionPaths(user.id);
  redirect("/my-collection");
}

export async function bulkSetCollectionVisibility(formData: FormData) {
  const { supabase, user } = await requireUser();
  const itemIds = parseItemIds(formData, "collection_item_ids");
  const visibility = parseItemVisibilityField(formData);

  if (itemIds.length === 0) {
    redirect(
      `/my-collection?error=${encodeURIComponent("Select at least one collection item.")}`,
    );
  }

  if ("error" in visibility) {
    redirect(`/my-collection?error=${encodeURIComponent(visibility.error)}`);
  }

  const updates: Record<string, unknown> = {
    visibility: visibility.value,
  };

  if (visibility.value === "private") {
    updates.is_featured = false;
  }

  const { error, count } = await supabase
    .from("collection_items")
    .update(updates)
    .eq("user_id", user.id)
    .in("id", itemIds);

  if (error) {
    redirect(`/my-collection?error=${encodeURIComponent(error.message)}`);
  }

  revalidateCollectionPaths(user.id);
  redirect(
    `/my-collection?visibilityUpdated=${encodeURIComponent(String(count ?? itemIds.length))}`,
  );
}

export async function bulkSetCollectionFeatured(formData: FormData) {
  const { supabase, user } = await requireUser();
  const itemIds = parseItemIds(formData, "collection_item_ids");
  const featuredRaw = formData.get("is_featured");
  const isFeatured = featuredRaw === "true" || featuredRaw === "1";

  if (itemIds.length === 0) {
    redirect(
      `/my-collection?error=${encodeURIComponent("Select at least one collection item.")}`,
    );
  }

  if (isFeatured) {
    const { count, error: countError } = await supabase
      .from("collection_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("id", itemIds)
      .eq("visibility", "public");

    if (countError) {
      redirect(`/my-collection?error=${encodeURIComponent(countError.message)}`);
    }

    if ((count ?? 0) !== itemIds.length) {
      redirect(
        `/my-collection?error=${encodeURIComponent("Only public items can be featured.")}`,
      );
    }
  }

  const { error, count } = await supabase
    .from("collection_items")
    .update({ is_featured: isFeatured })
    .eq("user_id", user.id)
    .in("id", itemIds);

  if (error) {
    redirect(`/my-collection?error=${encodeURIComponent(error.message)}`);
  }

  revalidateCollectionPaths(user.id);
  redirect(
    `/my-collection?featuredUpdated=${encodeURIComponent(String(count ?? itemIds.length))}`,
  );
}

export async function setAllCollectionVisibility(formData: FormData) {
  const { supabase, user } = await requireUser();
  const visibility = parseItemVisibilityField(formData);

  if (formData.get("confirm_all") !== "yes") {
    redirect(
      `/my-collection?error=${encodeURIComponent("Confirm the bulk visibility change before continuing.")}`,
    );
  }

  if ("error" in visibility) {
    redirect(`/my-collection?error=${encodeURIComponent(visibility.error)}`);
  }

  const updates: Record<string, unknown> = {
    visibility: visibility.value,
  };

  if (visibility.value === "private") {
    updates.is_featured = false;
  }

  const { error, count } = await supabase
    .from("collection_items")
    .update(updates)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/my-collection?error=${encodeURIComponent(error.message)}`);
  }

  revalidateCollectionPaths(user.id);
  redirect(
    `/my-collection?allVisibilityUpdated=${encodeURIComponent(String(count ?? 0))}`,
  );
}
