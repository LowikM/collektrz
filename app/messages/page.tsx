import { redirect } from "next/navigation";

import { ChatExperience } from "@/components/chat/ChatExperience";
import { extractListingContextFromMessage } from "@/lib/chat-context";
import {
  getCollectionItemImageUrlsByIds,
  getListingThumbnailUrl,
} from "@/lib/collection-items";
import { buildConversations } from "@/lib/conversations";
import { markConversationRead } from "@/lib/messages";
import { getCardImagesByIds } from "@/lib/pokemon-tcg";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    messageSent?: string;
    with?: string;
  }>;
}) {
  const { error, messageSent, with: selectedUserId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const messageSelect = `
    id,
    body,
    created_at,
    read_at,
    listing_id,
    parent_message_id,
    sender_id,
    recipient_id,
    sender:users!messages_sender_id_fkey(display_name, email, avatar_url),
    recipient:users!messages_recipient_id_fkey(display_name, email, avatar_url),
    listings(
      id,
      card_name,
      type,
      status,
      condition,
      target_price,
      tcg_api_card_id,
      collection_item_id,
      event_id,
      events(id, name)
    )
  `;

  const { data: messageData, error: messagesError } = await supabase
    .from("messages")
    .select(messageSelect)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  const tcgApiCardIds = [
    ...new Set(
      (messageData ?? [])
        .flatMap((row) => {
          const listings = row.listings;
          const listing = Array.isArray(listings) ? listings[0] : listings;
          return listing?.tcg_api_card_id ? [listing.tcg_api_card_id] : [];
        })
        .filter(Boolean),
    ),
  ] as string[];

  const collectionItemIds = [
    ...new Set(
      (messageData ?? [])
        .flatMap((row) => {
          const listings = row.listings;
          const listing = Array.isArray(listings) ? listings[0] : listings;
          return listing?.collection_item_id ? [listing.collection_item_id] : [];
        })
        .filter(Boolean),
    ),
  ] as string[];

  const [cardImagesById, collectionItemImagesById] = await Promise.all([
    getCardImagesByIds(tcgApiCardIds),
    getCollectionItemImageUrlsByIds(supabase, collectionItemIds),
  ]);

  const enrichedRows = (messageData ?? []).map((row) => {
    const listings = row.listings;
    const listing = Array.isArray(listings) ? listings[0] : listings;
    const imageUrl = listing
      ? getListingThumbnailUrl(listing, cardImagesById, collectionItemImagesById)
      : null;

    return {
      ...row,
      listingContext: extractListingContextFromMessage(row, imageUrl),
    };
  });

  const conversations = buildConversations(enrichedRows, user.id);

  if (selectedUserId) {
    await markConversationRead(supabase, user.id, selectedUserId);

    for (const conversation of conversations) {
      if (conversation.otherUserId === selectedUserId) {
        conversation.unreadCount = 0;
      }
    }
  }

  return (
    <>
      {messagesError ? (
        <div className="px-4 pt-6">
          <p
            className="mx-auto max-w-6xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            Could not load messages: {messagesError.message}
          </p>
        </div>
      ) : null}

      <ChatExperience
        conversations={conversations}
        currentUserId={user.id}
        selectedUserId={selectedUserId ?? null}
        error={error}
        messageSent={messageSent === "1"}
      />
    </>
  );
}
