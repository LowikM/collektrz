import { getUserDisplayLabel, type UserLabel } from "@/lib/users";

import { getConversationListingContext, type ListingContext } from "@/lib/chat-context";

export type ChatUser = UserLabel & {
  id: string;
  avatar_url: string | null;
};

export type ChatMessage = {
  id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  sender_id: string;
  recipient_id: string;
  listing_id: string | null;
  parent_message_id: string | null;
  listing_name: string | null;
  listingContext: ListingContext | null;
};

export type Conversation = {
  otherUserId: string;
  otherUser: ChatUser;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
  unreadCount: number;
  lastActivityAt: string;
  listingContext: ListingContext | null;
};

type RawMessageRow = {
  id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  listing_id: string | null;
  parent_message_id: string | null;
  sender_id: string;
  recipient_id: string;
  sender: UserLabel & { avatar_url?: string | null } | Array<UserLabel & { avatar_url?: string | null }> | null;
  recipient: UserLabel & { avatar_url?: string | null } | Array<UserLabel & { avatar_url?: string | null }> | null;
  listings: RawListingEmbed | RawListingEmbed[] | null;
  listingContext?: ListingContext | null;
};

type RawListingEmbed = {
  id: string;
  card_name: string;
  type: "want" | "trade" | "sale";
  status: string;
  condition: string | null;
  target_price: string | null;
  tcg_api_card_id: string | null;
  collection_item_id: string | null;
  event_id: string;
  events: { id: string; name: string } | Array<{ id: string; name: string }> | null;
};

function getEmbeddedUser(
  user: RawMessageRow["sender"],
): (UserLabel & { avatar_url?: string | null }) | null {
  if (!user) {
    return null;
  }

  return Array.isArray(user) ? (user[0] ?? null) : user;
}

function getListingName(listings: RawMessageRow["listings"]) {
  if (!listings) {
    return null;
  }

  const listing = Array.isArray(listings) ? listings[0] : listings;
  return listing?.card_name ?? null;
}

function normalizeMessage(row: RawMessageRow): ChatMessage {
  return {
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    read_at: row.read_at,
    sender_id: row.sender_id,
    recipient_id: row.recipient_id,
    listing_id: row.listing_id,
    parent_message_id: row.parent_message_id,
    listing_name: getListingName(row.listings),
    listingContext: row.listingContext ?? null,
  };
}

function getOtherUserId(message: ChatMessage, currentUserId: string) {
  return message.sender_id === currentUserId
    ? message.recipient_id
    : message.sender_id;
}

export function buildConversations(
  rows: RawMessageRow[],
  currentUserId: string,
): Conversation[] {
  const conversationMap = new Map<
    string,
    {
      otherUser: ChatUser;
      messages: ChatMessage[];
      unreadCount: number;
    }
  >();

  for (const row of rows) {
    const message = normalizeMessage(row);
    const otherUserId = getOtherUserId(message, currentUserId);
    const embeddedOtherUser =
      message.sender_id === otherUserId
        ? getEmbeddedUser(row.sender)
        : getEmbeddedUser(row.recipient);

    const existing = conversationMap.get(otherUserId);

    if (!existing) {
      conversationMap.set(otherUserId, {
        otherUser: {
          id: otherUserId,
          display_name: embeddedOtherUser?.display_name ?? null,
          email: embeddedOtherUser?.email ?? "unknown@user.local",
          avatar_url: embeddedOtherUser?.avatar_url ?? null,
        },
        messages: [message],
        unreadCount:
          message.recipient_id === currentUserId && message.read_at === null
            ? 1
            : 0,
      });
      continue;
    }

    existing.messages.push(message);

    if (message.recipient_id === currentUserId && message.read_at === null) {
      existing.unreadCount += 1;
    }

    const embedded = getEmbeddedUser(row.sender) ?? getEmbeddedUser(row.recipient);
    if (embedded?.display_name || embedded?.avatar_url) {
      existing.otherUser = {
        ...existing.otherUser,
        display_name: embedded.display_name ?? existing.otherUser.display_name,
        email: embedded.email ?? existing.otherUser.email,
        avatar_url: embedded.avatar_url ?? existing.otherUser.avatar_url,
      };
    }
  }

  const conversations: Conversation[] = [];

  for (const [otherUserId, data] of conversationMap) {
    const messages = [...data.messages].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) {
      continue;
    }

    conversations.push({
      otherUserId,
      otherUser: data.otherUser,
      messages,
      lastMessage,
      unreadCount: data.unreadCount,
      lastActivityAt: lastMessage.created_at,
      listingContext: getConversationListingContext(messages),
    });
  }

  conversations.sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
  );

  return conversations;
}

export function getConversationPreview(message: ChatMessage, currentUserId: string) {
  const prefix = message.sender_id === currentUserId ? "You: " : "";
  const singleLine = message.body.replace(/\s+/g, " ").trim();

  if (!singleLine) {
    return `${prefix}Start the conversation`;
  }

  const preview =
    singleLine.length > 72 ? `${singleLine.slice(0, 72)}…` : singleLine;

  return `${prefix}${preview}`;
}

export function getConversationDisplayName(user: ChatUser) {
  return getUserDisplayLabel(user);
}

export type MessageGroup = {
  senderId: string;
  isOwn: boolean;
  messages: ChatMessage[];
  showTimestamp: boolean;
};

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export function groupMessagesForDisplay(
  messages: ChatMessage[],
  currentUserId: string,
): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const message of messages) {
    const isOwn = message.sender_id === currentUserId;
    const lastGroup = groups[groups.length - 1];
    const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1];

    if (
      lastGroup &&
      lastGroup.senderId === message.sender_id &&
      lastMessage &&
      new Date(message.created_at).getTime() -
        new Date(lastMessage.created_at).getTime() <=
        GROUP_WINDOW_MS
    ) {
      lastGroup.messages.push(message);
      continue;
    }

    groups.push({
      senderId: message.sender_id,
      isOwn,
      messages: [message],
      showTimestamp: true,
    });
  }

  return groups;
}

export function formatConversationTimestamp(date: string) {
  const value = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - value.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return value.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return value.toLocaleDateString(undefined, { weekday: "short" });
  }

  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatMessageTimeOnly(date: string) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatMessageTimestamp(date: string) {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getOtherUserLastActivity(
  messages: ChatMessage[],
  otherUserId: string,
) {
  const fromOther = messages.filter(
    (message) => message.sender_id === otherUserId,
  );

  if (fromOther.length === 0) {
    return null;
  }

  return fromOther[fromOther.length - 1]?.created_at ?? null;
}
