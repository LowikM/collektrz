import Link from "next/link";

import { chatActionButtonClassName, chatFocusRingClassName } from "@/components/chat/chat-styles";
import { UserAvatar } from "@/components/chat/UserAvatar";
import {
  formatRecentActivity,
  getRecentActivityAriaLabel,
  isRecentlyActive,
} from "@/lib/chat-activity";
import type { ChatUser, Conversation } from "@/lib/conversations";
import {
  getConversationDisplayName,
  getOtherUserLastActivity,
} from "@/lib/conversations";

type ChatHeaderProps = {
  otherUser: ChatUser;
  conversation: Conversation | null;
  showMobileBack?: boolean;
};

export function ChatHeader({
  otherUser,
  conversation,
  showMobileBack = false,
}: ChatHeaderProps) {
  const lastActivity = conversation
    ? getOtherUserLastActivity(conversation.messages, otherUser.id)
    : null;
  const recentlyActive = isRecentlyActive(lastActivity);
  const activityLabel = formatRecentActivity(lastActivity);

  return (
    <header className="flex items-center gap-3 border-b border-zinc-200/80 bg-white px-4 py-3.5 sm:px-6">
      {showMobileBack ? (
        <Link
          href="/messages"
          className={`inline-flex rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-medium shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] lg:hidden ${chatFocusRingClassName}`}
          aria-label="Back to conversations"
        >
          ←
        </Link>
      ) : null}

      <UserAvatar
        user={otherUser}
        size="md"
        showActivityIndicator
        isRecentlyActive={recentlyActive}
        activityAriaLabel={getRecentActivityAriaLabel(lastActivity)}
      />

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold tracking-tight text-zinc-900">
          {getConversationDisplayName(otherUser)}
        </h2>
        <p className="truncate text-xs text-zinc-500">{activityLabel}</p>
      </div>

      <nav
        aria-label="Conversation actions"
        className="hidden flex-wrap justify-end gap-2 sm:flex"
      >
        <Link
          href={`/users/${otherUser.id}`}
          className={`${chatActionButtonClassName} ${chatFocusRingClassName}`}
        >
          View Profile
        </Link>
        <Link
          href={`/users/${otherUser.id}?view=collection`}
          className={`${chatActionButtonClassName} ${chatFocusRingClassName}`}
        >
          View Collection
        </Link>
        <Link
          href={`/users/${otherUser.id}?view=wishlist`}
          className={`${chatActionButtonClassName} ${chatFocusRingClassName}`}
        >
          View Wishlist
        </Link>
      </nav>

      <nav
        aria-label="Conversation actions"
        className="flex flex-wrap gap-2 sm:hidden"
      >
        <Link
          href={`/users/${otherUser.id}`}
          className={`${chatActionButtonClassName} ${chatFocusRingClassName}`}
        >
          Profile
        </Link>
        <Link
          href={`/users/${otherUser.id}?view=collection`}
          className={`${chatActionButtonClassName} ${chatFocusRingClassName}`}
        >
          Collection
        </Link>
        <Link
          href={`/users/${otherUser.id}?view=wishlist`}
          className={`${chatActionButtonClassName} ${chatFocusRingClassName}`}
        >
          Wishlist
        </Link>
      </nav>
    </header>
  );
}
