"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";

import {
  NoConversationsEmptyState,
  SearchNoResultsEmptyState,
} from "@/components/chat/ChatEmptyStates";
import { chatFocusRingClassName } from "@/components/chat/chat-styles";
import { UserAvatar } from "@/components/chat/UserAvatar";
import {
  formatRecentActivity,
  getRecentActivityAriaLabel,
  isRecentlyActive,
} from "@/lib/chat-activity";
import type { Conversation } from "@/lib/conversations";
import {
  formatConversationTimestamp,
  getConversationDisplayName,
  getConversationPreview,
  getOtherUserLastActivity,
} from "@/lib/conversations";

type ConversationListProps = {
  conversations: Conversation[];
  currentUserId: string;
  selectedUserId: string | null;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
};

export function ConversationList({
  conversations,
  currentUserId,
  selectedUserId,
  searchQuery,
  onSearchQueryChange,
}: ConversationListProps) {
  const activeItemRef = useRef<HTMLLIElement>(null);

  const filteredConversations = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const name = getConversationDisplayName(conversation.otherUser).toLowerCase();
      const preview = getConversationPreview(
        conversation.lastMessage,
        currentUserId,
      ).toLowerCase();

      return name.includes(normalized) || preview.includes(normalized);
    });
  }, [conversations, currentUserId, searchQuery]);

  useEffect(() => {
    if (!selectedUserId || !activeItemRef.current) {
      return;
    }

    activeItemRef.current.scrollIntoView({ block: "nearest" });
  }, [selectedUserId, filteredConversations.length]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-semibold tracking-tight">Messages</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Chat with collectors about trades and listings.
        </p>
        <div className="mt-4">
          <label htmlFor="conversation-search" className="sr-only">
            Search conversations
          </label>
          <input
            id="conversation-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search conversations..."
            className={`w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 ${chatFocusRingClassName}`}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {conversations.length === 0 ? (
          <NoConversationsEmptyState />
        ) : filteredConversations.length === 0 ? (
          <SearchNoResultsEmptyState
            onClearSearch={() => onSearchQueryChange("")}
          />
        ) : (
          <ul className="space-y-2" role="list">
            {filteredConversations.map((conversation) => {
              const isActive = selectedUserId === conversation.otherUserId;
              const hasUnread = conversation.unreadCount > 0;
              const lastActivityFromOther = getOtherUserLastActivity(
                conversation.messages,
                conversation.otherUserId,
              );
              const recentlyActive = isRecentlyActive(lastActivityFromOther);
              const activityLabel = formatRecentActivity(lastActivityFromOther);

              return (
                <li
                  key={conversation.otherUserId}
                  id={`conversation-${conversation.otherUserId}`}
                  ref={isActive ? activeItemRef : undefined}
                >
                  <Link
                    href={`/messages?with=${conversation.otherUserId}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`block rounded-2xl border px-3 py-3 transition-all duration-200 ${chatFocusRingClassName} ${
                      isActive
                        ? "border-foreground bg-zinc-100 shadow-sm dark:bg-zinc-900"
                        : hasUnread
                          ? "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/70"
                          : "border-transparent bg-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        user={conversation.otherUser}
                        size="md"
                        showActivityIndicator
                        isRecentlyActive={recentlyActive}
                        activityAriaLabel={getRecentActivityAriaLabel(
                          lastActivityFromOther,
                        )}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              hasUnread ? "font-bold" : "font-semibold"
                            }`}
                          >
                            {getConversationDisplayName(conversation.otherUser)}
                          </p>
                          <time
                            dateTime={conversation.lastActivityAt}
                            className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400"
                          >
                            {formatConversationTimestamp(
                              conversation.lastActivityAt,
                            )}
                          </time>
                        </div>

                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p
                            className={`truncate text-sm ${
                              hasUnread
                                ? "font-medium text-zinc-900 dark:text-zinc-100"
                                : "text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {getConversationPreview(
                              conversation.lastMessage,
                              currentUserId,
                            )}
                          </p>
                          {hasUnread ? (
                            <span
                              className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-semibold text-background"
                              aria-label={`${conversation.unreadCount} unread message${
                                conversation.unreadCount === 1 ? "" : "s"
                              }`}
                            >
                              <span aria-hidden="true">
                                {conversation.unreadCount > 9
                                  ? "9+"
                                  : conversation.unreadCount}
                              </span>
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 truncate text-[11px] text-zinc-500 dark:text-zinc-500">
                          {activityLabel}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
