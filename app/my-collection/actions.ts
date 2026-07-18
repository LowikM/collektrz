"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseCollectionFields } from "@/lib/collection-fields";
import { getSafeReturnPath } from "@/lib/return-path";
import { createClient } from "@/lib/supabase/server";

export async function createCollectionItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = parseCollectionFields(formData);
  const returnPath = getSafeReturnPath(formData, "/my-collection");

  if ("error" in parsed) {
    redirect(`${returnPath}?error=${encodeURIComponent(parsed.error)}`);
  }

  const { error } = await supabase.from("collection_items").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/my-collection");
  revalidatePath(returnPath);
  redirect(`${returnPath}?added=collection`);
}

export async function updateCollectionItem(
  itemId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = parseCollectionFields(formData);

  if ("error" in parsed) {
    redirect(
      `/my-collection?error=${encodeURIComponent(parsed.error)}`,
    );
  }

  const {
    tcg_api_card_id: _tcgApiCardId,
    card_number: _cardNumber,
    set_id: _setId,
    ...editableFields
  } = parsed.data;

  const { error } = await supabase
    .from("collection_items")
    .update(editableFields)
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/my-collection?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/my-collection");
  redirect("/my-collection");
}

export async function deleteCollectionItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) {
    redirect(
      `/my-collection?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/my-collection");
  redirect("/my-collection");
}
