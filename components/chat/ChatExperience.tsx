"use client";

import { useState } from "react";

import { NoSelectionEmptyState } from "@/components/chat/ChatEmptyStates";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageStatusAlert } from "@/components/MessageStatusAlert";
import type { Conversation } from "@/lib/conversations";

type ChatExperienceProps = {
  conversations: Conversation[];
  currentUserId: string;
  selectedUserId: string | null;
  error?: string;
  messageSent?: boolean;
};

export function ChatExperience({
  conversations,
  currentUserId,
  selectedUserId,
  error,
  messageSent,
}: ChatExperienceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedConversation =
    conversations.find(
      (conversation) => conversation.otherUserId === selectedUserId,
    ) ?? null;

  const mobileShowsChat = Boolean(selectedUserId);

  return (
    <div className="flex flex-1 justify-center px-4 py-6 sm:py-8">
      <div className="flex h-[min(78vh,820px)] w-full max-w-6xl flex-col">
        <div className="mb-4 lg:hidden">
          <MessageStatusAlert messageSent={messageSent} error={error} />
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <aside
            className={`${
              mobileShowsChat ? "hidden lg:flex" : "flex"
            } w-full min-w-0 flex-col border-r border-zinc-200 lg:w-[22rem] xl:w-[24rem] dark:border-zinc-800`}
          >
            <ConversationList
              conversations={conversations}
              currentUserId={currentUserId}
              selectedUserId={selectedUserId}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
          </aside>

          <section
            className={`${
              mobileShowsChat ? "flex" : "hidden lg:flex"
            } min-w-0 flex-1 flex-col`}
            aria-label="Conversation"
          >
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                currentUserId={currentUserId}
                showMobileBack
                error={error}
                messageSent={messageSent}
              />
            ) : (
              <NoSelectionEmptyState
                invalidSelection={Boolean(selectedUserId && !selectedConversation)}
              />
            )}
          </section>
        </div>

        <div className="mt-4 hidden lg:block">
          <MessageStatusAlert messageSent={messageSent} error={error} />
        </div>
      </div>
    </div>
  );
}
