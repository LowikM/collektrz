import type { createClient } from "@/lib/supabase/server";

export const MESSAGE_BODY_MAX_LENGTH = 1000;

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export async function getUnreadMessageCount(
  supabase: SupabaseClient,
  userId: string,
) {
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("[messages] failed to count unread messages", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function markAllReceivedMessagesRead(
  supabase: SupabaseClient,
  userId: string,
) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("[messages] failed to mark messages read", error.message);
  }
}

export async function markConversationRead(
  supabase: SupabaseClient,
  userId: string,
  otherUserId: string,
) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", userId)
    .eq("sender_id", otherUserId)
    .is("read_at", null);

  if (error) {
    console.error(
      "[messages] failed to mark conversation read",
      error.message,
    );
  }
}
