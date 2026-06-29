"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseProfileFormData } from "@/lib/users";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = parseProfileFormData(formData);

  if ("error" in parsed) {
    redirect(`/profile?error=${encodeURIComponent(parsed.error)}`);
  }

  const { error } = await supabase
    .from("users")
    .update(parsed)
    .eq("id", user.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  revalidatePath(`/users/${user.id}`);
  revalidatePath("/", "layout");
  redirect("/profile?updated=1");
}
