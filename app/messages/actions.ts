"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getUnreadMessageCount,
  MESSAGE_BODY_MAX_LENGTH,
} from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

async function getReturnPath(fallback = "/messages") {
  const referer = (await headers()).get("referer");
  if (!referer) {
    return fallback;
  }

  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

function redirectWithMessageStatus(
  returnPath: string,
  status: { sent?: boolean; error?: string },
): never {
  const url = new URL(returnPath, "http://localhost");

  if (status.sent) {
    url.searchParams.set("messageSent", "1");
  }

  if (status.error) {
    url.searchParams.set("error", status.error);
  }

  redirect(`${url.pathname}${url.search}`);
}

function revalidateMessagePaths() {
  revalidatePath("/messages");
  revalidatePath("/", "layout");
}

function parseMessageBody(formData: FormData):
  | { error: string }
  | { body: string } {
  const bodyValue = formData.get("body");

  if (typeof bodyValue !== "string" || !bodyValue.trim()) {
    return { error: "Message is required." };
  }

  const body = bodyValue.trim();

  if (body.length > MESSAGE_BODY_MAX_LENGTH) {
    return {
      error: `Message must be ${MESSAGE_BODY_MAX_LENGTH} characters or fewer.`,
    };
  }

  return { body };
}

async function validateListingId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
) {
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .maybeSingle();

  return listing?.id ?? null;
}

export async function sendMessage(
  recipientId: string,
  listingId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const returnPath = await getReturnPath();

  if (!user) {
    redirect("/login");
  }

  const trimmedRecipientId = recipientId.trim();
  const trimmedListingId = listingId.trim();

  if (!trimmedRecipientId) {
    redirectWithMessageStatus(returnPath, {
      error: "Recipient is required.",
    });
  }

  if (trimmedRecipientId === user.id) {
    redirectWithMessageStatus(returnPath, {
      error: "You cannot message yourself.",
    });
  }

  const parsedBody = parseMessageBody(formData);
  if ("error" in parsedBody) {
    redirectWithMessageStatus(returnPath, { error: parsedBody.error });
  }

  const { body } = parsedBody;
  let validatedListingId: string | null = null;

  if (trimmedListingId) {
    validatedListingId = await validateListingId(supabase, trimmedListingId);

    if (!validatedListingId) {
      redirectWithMessageStatus(returnPath, {
        error: "Linked listing was not found.",
      });
    }
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: trimmedRecipientId,
    body,
    ...(validatedListingId ? { listing_id: validatedListingId } : {}),
  });

  if (error) {
    redirectWithMessageStatus(returnPath, {
      error: error.message,
    });
  }

  revalidateMessagePaths();
  redirectWithMessageStatus(returnPath, { sent: true });
}

export async function replyToMessage(messageId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsedBody = parseMessageBody(formData);
  if ("error" in parsedBody) {
    redirectWithMessageStatus("/messages", { error: parsedBody.error });
  }

  const { body } = parsedBody;

  const { data: originalMessage, error: originalError } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, listing_id")
    .eq("id", messageId.trim())
    .maybeSingle();

  if (originalError || !originalMessage) {
    redirectWithMessageStatus("/messages", {
      error: "Original message was not found.",
    });
  }

  if (originalMessage.recipient_id !== user.id) {
    redirectWithMessageStatus("/messages", {
      error: "You can only reply to messages you received.",
    });
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: originalMessage.sender_id,
    listing_id: originalMessage.listing_id,
    parent_message_id: originalMessage.id,
    body,
  });

  if (error) {
    redirectWithMessageStatus("/messages", {
      error: error.message,
    });
  }

  revalidateMessagePaths();
  redirectWithMessageStatus("/messages", { sent: true });
}

export async function markMessageRead(messageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId.trim())
    .eq("recipient_id", user.id)
    .is("read_at", null);

  if (error) {
    redirect(`/messages?error=${encodeURIComponent(error.message)}`);
  }

  revalidateMessagePaths();
}

export async function fetchUnreadMessageCountForCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  return getUnreadMessageCount(supabase, user.id);
}
