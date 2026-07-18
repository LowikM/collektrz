"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChatMessageGroup, ChatPendingMessageGroup } from "@/components/chat/ChatMessageBubble";
import {
  chatFocusRingClassName,
  chatThreadBackgroundClassName,
} from "@/components/chat/chat-styles";
import type { ChatUser, MessageGroup } from "@/lib/conversations";
import { buildChatTimeline, type ChatTimelineItem } from "@/lib/chat-timeline";

type ChatMessageThreadProps = {
  groups: MessageGroup[];
  otherUser: ChatUser;
  messageSent?: boolean;
  pendingMessageBody?: string | null;
  onPendingMessageConsumed?: () => void;
};

const SCROLL_NEAR_BOTTOM_THRESHOLD = 120;

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-3">
      <span className="rounded-full bg-white/90 px-3.5 py-1 text-[11px] font-medium text-zinc-500 shadow-sm">
        {label}
      </span>
    </div>
  );
}

function TimelineItem({
  item,
  otherUser,
}: {
  item: ChatTimelineItem;
  otherUser: ChatUser;
}) {
  if (item.kind === "date") {
    return <DateSeparator label={item.label} />;
  }

  return <ChatMessageGroup group={item.group} otherUser={otherUser} />;
}

export function ChatMessageThread({
  groups,
  otherUser,
  messageSent = false,
  pendingMessageBody = null,
  onPendingMessageConsumed,
}: ChatMessageThreadProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const isNearBottomRef = useRef(true);
  const hasInitialScrollRef = useRef(false);
  const timeline = buildChatTimeline(groups);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom <= SCROLL_NEAR_BOTTOM_THRESHOLD;
    isNearBottomRef.current = nearBottom;
    setShowJumpToLatest(!nearBottom && container.scrollHeight > container.clientHeight);
  }, []);

  useEffect(() => {
    if (hasInitialScrollRef.current) {
      return;
    }

    hasInitialScrollRef.current = true;
    scrollToBottom("instant");
    updateScrollState();
  }, [scrollToBottom, updateScrollState]);

  useEffect(() => {
    if (messageSent) {
      onPendingMessageConsumed?.();
    }
  }, [messageSent, onPendingMessageConsumed]);

  useEffect(() => {
    if (messageSent || isNearBottomRef.current) {
      scrollToBottom(messageSent ? "smooth" : "instant");
    }

    updateScrollState();
  }, [groups, messageSent, pendingMessageBody, scrollToBottom, updateScrollState]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollContainerRef}
        onScroll={updateScrollState}
        className={`h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 ${chatThreadBackgroundClassName}`}
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col">
          {timeline.map((item) => (
            <TimelineItem key={item.key} item={item} otherUser={otherUser} />
          ))}
          {pendingMessageBody ? (
            <ChatPendingMessageGroup body={pendingMessageBody} />
          ) : null}
          <div ref={bottomRef} aria-hidden="true" className="h-px shrink-0" />
        </div>
      </div>

      {showJumpToLatest ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className={`pointer-events-auto inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-md transition-all duration-200 hover:bg-zinc-50 hover:shadow-lg active:scale-[0.98] ${chatFocusRingClassName}`}
          >
            Jump to latest
          </button>
        </div>
      ) : null}
    </div>
  );
}
