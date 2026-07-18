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
    <header className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      {showMobileBack ? (
        <Link
          href="/messages"
          className={`inline-flex rounded-xl border border-zinc-300 px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 lg:hidden dark:border-zinc-700 dark:hover:bg-zinc-900 ${chatFocusRingClassName}`}
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
        <h2 className="truncate text-base font-semibold tracking-tight">
          {getConversationDisplayName(otherUser)}
        </h2>
        <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
          {activityLabel}
        </p>
      </div>

      <nav
        aria-label="Conversation actions"
        className="hidden flex-wrap justify-end gap-2 sm:flex"
      >
        <Link href={`/users/${otherUser.id}`} className={chatActionButtonClassName}>
          View Profile
        </Link>
        <Link
          href={`/users/${otherUser.id}?view=collection`}
          className={chatActionButtonClassName}
        >
          View Collection
        </Link>
        <Link
          href={`/users/${otherUser.id}?view=wishlist`}
          className={chatActionButtonClassName}
        >
          View Wishlist
        </Link>
      </nav>

      <nav
        aria-label="Conversation actions"
        className="flex flex-wrap gap-2 sm:hidden"
      >
        <Link href={`/users/${otherUser.id}`} className={chatActionButtonClassName}>
          Profile
        </Link>
        <Link
          href={`/users/${otherUser.id}?view=collection`}
          className={chatActionButtonClassName}
        >
          Collection
        </Link>
        <Link
          href={`/users/${otherUser.id}?view=wishlist`}
          className={chatActionButtonClassName}
        >
          Wishlist
        </Link>
      </nav>
    </header>
  );
}
