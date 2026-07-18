"use client";

import { useState } from "react";

import { ChatContextCard } from "@/components/chat/ChatContextCard";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import { ChatMessageThread } from "@/components/chat/ChatMessageThread";
import type { Conversation } from "@/lib/conversations";
import { groupMessagesForDisplay } from "@/lib/conversations";

type ChatWindowProps = {
  conversation: Conversation;
  currentUserId: string;
  showMobileBack?: boolean;
  error?: string;
  messageSent?: boolean;
};

export function ChatWindow({
  conversation,
  currentUserId,
  showMobileBack = false,
  error,
  messageSent,
}: ChatWindowProps) {
  const [pendingMessageBody, setPendingMessageBody] = useState<string | null>(
    null,
  );

  const groups = groupMessagesForDisplay(
    conversation.messages,
    currentUserId,
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader
        otherUser={conversation.otherUser}
        conversation={conversation}
        showMobileBack={showMobileBack}
      />

      {conversation.listingContext ? (
        <ChatContextCard context={conversation.listingContext} />
      ) : null}

      <ChatMessageThread
        groups={groups}
        messageSent={messageSent}
        pendingMessageBody={pendingMessageBody}
        onPendingMessageConsumed={() => setPendingMessageBody(null)}
      />

      <ChatMessageInput
        recipientId={conversation.otherUserId}
        error={error}
        messageSent={messageSent}
        onSubmitMessage={(body) => setPendingMessageBody(body)}
      />
    </div>
  );
}
