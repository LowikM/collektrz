import { UserAvatar } from "@/components/chat/UserAvatar";
import {
  chatBubbleBaseClassName,
  chatBubbleMaxWidthClassName,
  chatBubbleOwnClassName,
  chatBubbleRadiusClassName,
  chatBubbleReceivedClassName,
  chatBubbleTailOwnClassName,
  chatBubbleTailReceivedClassName,
  chatMetadataClassName,
} from "@/components/chat/chat-styles";
import {
  getOwnMessageDeliveryStatus,
  getOwnMessageStatusAriaLabel,
  getOwnMessageStatusLabel,
  type OwnMessageDeliveryStatus,
} from "@/lib/chat-message-status";
import type { ChatMessage, ChatUser, MessageGroup } from "@/lib/conversations";
import { formatMessageTimeOnly } from "@/lib/conversations";

type ChatMessageBubbleProps = {
  group: MessageGroup;
  pendingStatus?: OwnMessageDeliveryStatus | null;
  otherUser?: ChatUser | null;
};

function Bubble({
  message,
  isOwn,
  isLastInGroup,
  isFirstInGroup,
}: {
  message: ChatMessage;
  isOwn: boolean;
  isLastInGroup: boolean;
  isFirstInGroup: boolean;
}) {
  const tailClass = isLastInGroup
    ? isOwn
      ? chatBubbleTailOwnClassName
      : chatBubbleTailReceivedClassName
    : "";
  const stackRadius =
    !isFirstInGroup && !isLastInGroup
      ? isOwn
        ? "rounded-[20px] rounded-tr-[8px] rounded-br-[8px]"
        : "rounded-[20px] rounded-tl-[8px] rounded-bl-[8px]"
      : !isFirstInGroup && isLastInGroup
        ? isOwn
          ? "rounded-[20px] rounded-tr-[8px]"
          : "rounded-[20px] rounded-tl-[8px]"
        : isFirstInGroup && !isLastInGroup
          ? isOwn
            ? "rounded-[20px] rounded-br-[8px]"
            : "rounded-[20px] rounded-bl-[8px]"
          : chatBubbleRadiusClassName;

  return (
    <div
      className={`${chatBubbleBaseClassName} ${stackRadius} ${tailClass} ${
        isOwn ? chatBubbleOwnClassName : chatBubbleReceivedClassName
      }`}
    >
      <span className="sr-only">{isOwn ? "You said: " : "They said: "}</span>
      {message.listing_name ? (
        <p
          className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${
            isOwn ? "text-background/70" : "text-zinc-500"
          }`}
        >
          Re: {message.listing_name}
        </p>
      ) : null}
      <span>{message.body}</span>
    </div>
  );
}

function GroupMetadata({
  createdAt,
  isOwn,
  status,
}: {
  createdAt: string;
  isOwn: boolean;
  status: OwnMessageDeliveryStatus | null;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 px-0.5 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <time dateTime={createdAt} className={chatMetadataClassName}>
        {formatMessageTimeOnly(createdAt)}
      </time>
      {isOwn && status ? (
        <span
          className={chatMetadataClassName}
          aria-label={getOwnMessageStatusAriaLabel(status)}
        >
          <span aria-hidden="true">· {getOwnMessageStatusLabel(status)}</span>
        </span>
      ) : null}
    </div>
  );
}

export function ChatMessageGroup({
  group,
  pendingStatus = null,
  otherUser = null,
}: ChatMessageBubbleProps) {
  const lastMessage = group.messages[group.messages.length - 1];
  const firstMessage = group.messages[0];
  const deliveryStatus =
    group.isOwn && lastMessage
      ? pendingStatus ?? getOwnMessageDeliveryStatus(lastMessage)
      : null;

  const bubbleStack = (
    <div className={`flex min-w-0 flex-col gap-[3px] ${chatBubbleMaxWidthClassName}`}>
      {group.messages.map((message, index) => (
        <Bubble
          key={message.id}
          message={message}
          isOwn={group.isOwn}
          isLastInGroup={index === group.messages.length - 1}
          isFirstInGroup={index === 0}
        />
      ))}

      {firstMessage ? (
        <GroupMetadata
          createdAt={lastMessage?.created_at ?? firstMessage.created_at}
          isOwn={group.isOwn}
          status={deliveryStatus}
        />
      ) : null}
    </div>
  );

  if (group.isOwn) {
    return (
      <div className="mb-4 flex justify-end pl-8 sm:pl-12">
        {bubbleStack}
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-end gap-2 pr-8 sm:gap-2.5 sm:pr-12">
      <UserAvatar
        user={otherUser}
        size="xs"
        className="mb-[18px] shrink-0"
      />
      {bubbleStack}
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
