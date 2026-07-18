import {
  getOwnMessageDeliveryStatus,
  getOwnMessageStatusAriaLabel,
  getOwnMessageStatusLabel,
  type OwnMessageDeliveryStatus,
} from "@/lib/chat-message-status";
import type { ChatMessage, MessageGroup } from "@/lib/conversations";
import { formatMessageTimeOnly } from "@/lib/conversations";

type ChatMessageBubbleProps = {
  group: MessageGroup;
  pendingStatus?: OwnMessageDeliveryStatus | null;
};

function Bubble({
  message,
  isOwn,
  isLastInGroup,
  status,
}: {
  message: ChatMessage;
  isOwn: boolean;
  isLastInGroup: boolean;
  status: OwnMessageDeliveryStatus | null;
}) {
  return (
    <div className={`flex max-w-[85%] flex-col sm:max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
      <div
        className={`px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap ${
          isOwn
            ? `bg-foreground text-background ${
                isLastInGroup ? "rounded-2xl rounded-br-md" : "rounded-2xl"
              }`
            : `bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 ${
                isLastInGroup ? "rounded-2xl rounded-bl-md" : "rounded-2xl"
              }`
        }`}
      >
        <span className="sr-only">{isOwn ? "You said: " : "They said: "}</span>
        {message.listing_name ? (
          <p
            className={`mb-1 text-[11px] font-medium uppercase tracking-wide ${
              isOwn ? "text-background/70" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Re: {message.listing_name}
          </p>
        ) : null}
        {message.body}
      </div>

      {isOwn && isLastInGroup && status ? (
        <p
          className="mt-1 px-1 text-[10px] text-zinc-500 dark:text-zinc-500"
          aria-label={getOwnMessageStatusAriaLabel(status)}
        >
          <span aria-hidden="true">{getOwnMessageStatusLabel(status)}</span>
        </p>
      ) : null}
    </div>
  );
}

export function ChatMessageGroup({ group, pendingStatus = null }: ChatMessageBubbleProps) {
  const lastMessage = group.messages[group.messages.length - 1];
  const deliveryStatus =
    group.isOwn && lastMessage
      ? pendingStatus ?? getOwnMessageDeliveryStatus(lastMessage)
      : null;

  return (
    <div
      className={`flex flex-col gap-1 ${group.isOwn ? "items-end" : "items-start"}`}
    >
      {group.showTimestamp ? (
        <time
          dateTime={group.messages[0]?.created_at}
          className="px-1 text-[11px] text-zinc-500 dark:text-zinc-500"
        >
          {formatMessageTimeOnly(group.messages[0]?.created_at ?? "")}
        </time>
      ) : null}

      <div
        className={`flex flex-col gap-1 ${group.isOwn ? "items-end" : "items-start"}`}
      >
        {group.messages.map((message, index) => (
          <Bubble
            key={message.id}
            message={message}
            isOwn={group.isOwn}
            isLastInGroup={index === group.messages.length - 1}
            status={
              index === group.messages.length - 1 ? deliveryStatus : null
            }
          />
        ))}
      </div>
    </div>
  );
}

export function ChatPendingMessageGroup({ body }: { body: string }) {
  const pendingMessage: ChatMessage = {
    id: "pending-message",
    body,
    created_at: new Date().toISOString(),
    read_at: null,
    sender_id: "pending",
    recipient_id: "pending",
    listing_id: null,
    parent_message_id: null,
    listing_name: null,
    listingContext: null,
  };

  return (
    <ChatMessageGroup
      group={{
        senderId: "pending",
        isOwn: true,
        messages: [pendingMessage],
        showTimestamp: false,
      }}
      pendingStatus="sending"
    />
  );
}
