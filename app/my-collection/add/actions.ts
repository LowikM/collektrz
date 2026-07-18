"use server";

import { revalidatePath } from "next/cache";

import { parseCollectionFields } from "@/lib/collection-fields";
import { parseBooleanField, parseItemVisibilityField } from "@/lib/item-visibility";
import { createClient } from "@/lib/supabase/server";

export type CollectionDuplicateInfo = {
  id: string;
  card_name: string;
  set_name: string | null;
  quantity: number;
  tcg_api_card_id: string | null;
  card_ref: string;
};

export type FastAddSubmitResult =
  | {
      status: "duplicate";
      existing: CollectionDuplicateInfo;
      requestedQuantity: number;
    }
  | {
      status: "success";
      itemId: string;
      cardName: string;
      quantity: number;
      incremented: boolean;
    }
  | { status: "error"; error: string };

function getDuplicateAction(formData: FormData) {
  const action = formData.get("duplicate_action");

  if (action === "increment" || action === "separate" || action === "check") {
    return action;
  }

  return "check";
}

async function findExistingDuplicate(
  userId: string,
  tcgApiCardId: string | null,
  cardRef: string,
): Promise<CollectionDuplicateInfo | null> {
  const supabase = await createClient();

  if (tcgApiCardId) {
    const { data } = await supabase
      .from("collection_items")
      .select("id, card_name, set_name, quantity, tcg_api_card_id, card_ref")
      .eq("user_id", userId)
      .eq("tcg_api_card_id", tcgApiCardId)
      .maybeSingle();

    if (data) {
      return data as CollectionDuplicateInfo;
    }
  }

  const { data } = await supabase
    .from("collection_items")
    .select("id, card_name, set_name, quantity, tcg_api_card_id, card_ref")
    .eq("user_id", userId)
    .eq("card_ref", cardRef)
    .maybeSingle();

  return (data as CollectionDuplicateInfo | null) ?? null;
}

export async function submitFastAddCollectionItem(
  formData: FormData,
): Promise<FastAddSubmitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", error: "You must be signed in to add cards." };
  }

  const parsed = parseCollectionFields(formData);

  if ("error" in parsed) {
    return { status: "error", error: parsed.error };
  }

  if (parsed.data.item_kind !== "card") {
    return {
      status: "error",
      error: "Fast Add currently supports cards only.",
    };
  }

  const visibilityField = parseItemVisibilityField(formData, "visibility");
  const visibility =
    "error" in visibilityField ? ("private" as const) : visibilityField.value;
  const isFeatured = parseBooleanField(formData, "is_featured");
  const duplicateAction = getDuplicateAction(formData);

  const existing = await findExistingDuplicate(
    user.id,
    parsed.data.tcg_api_card_id,
    parsed.data.card_ref,
  );

  if (existing && duplicateAction === "check") {
    return {
      status: "duplicate",
      existing,
      requestedQuantity: parsed.data.quantity,
    };
  }

  if (existing && duplicateAction === "increment") {
    const nextQuantity = existing.quantity + parsed.data.quantity;
    const { error } = await supabase
      .from("collection_items")
      .update({
        quantity: nextQuantity,
        ...(visibility === "private" ? { is_featured: false } : {}),
      })
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) {
      return { status: "error", error: error.message };
    }

    revalidatePath("/my-collection");
    revalidatePath("/my-collection/add");

    return {
      status: "success",
      itemId: existing.id,
      cardName: existing.card_name,
      quantity: nextQuantity,
      incremented: true,
    };
  }

  const { data: inserted, error } = await supabase
    .from("collection_items")
    .insert({
      user_id: user.id,
      ...parsed.data,
      visibility,
      is_featured: visibility === "public" ? isFeatured : false,
    })
    .select("id, card_name, quantity")
    .single();

  if (error) {
    return { status: "error", error: error.message };
  }

  revalidatePath("/my-collection");
  revalidatePath("/my-collection/add");

  return {
    status: "success",
    itemId: inserted.id,
    cardName: inserted.card_name,
    quantity: inserted.quantity,
    incremented: false,
  };
}
