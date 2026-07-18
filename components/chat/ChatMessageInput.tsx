"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { sendMessage } from "@/app/messages/actions";
import {
  chatComposerInputClassName,
  chatComposerSurfaceClassName,
  chatFocusRingClassName,
  chatSendButtonClassName,
} from "@/components/chat/chat-styles";
import { MESSAGE_BODY_MAX_LENGTH } from "@/lib/messages";

type ChatMessageInputProps = {
  recipientId: string;
  error?: string;
  messageSent?: boolean;
  onSubmitMessage?: (body: string) => void;
};

const DRAFT_STORAGE_PREFIX = "collektrz-chat-draft-";
const COUNTER_THRESHOLD = Math.floor(MESSAGE_BODY_MAX_LENGTH * 0.9);

function getDraftKey(recipientId: string) {
  return `${DRAFT_STORAGE_PREFIX}${recipientId}`;
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
      />
    </svg>
  );
}

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Sending message" : "Send message"}
      className={`${chatSendButtonClassName} ${chatFocusRingClassName}`}
    >
      {pending ? (
        <span className="text-xs font-medium">…</span>
      ) : (
        <SendIcon />
      )}
    </button>
  );
}

function MessageFields({
  length,
  inlineError,
  onLengthChange,
  onKeyDown,
}: {
  length: number;
  inlineError: string | null;
  onLengthChange: (length: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <textarea
        id="chat-message-body"
        name="body"
        rows={1}
        maxLength={MESSAGE_BODY_MAX_LENGTH}
        placeholder="Write a message..."
        onKeyDown={onKeyDown}
        onInput={(event) => {
          const target = event.currentTarget;
          onLengthChange(target.value.length);
          target.style.height = "auto";
          target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
        }}
        disabled={pending}
        aria-invalid={inlineError ? true : undefined}
        aria-describedby={
          inlineError ? "chat-message-error" : "chat-message-hint"
        }
        className={`${chatComposerInputClassName} ${chatFocusRingClassName}`}
      />

      <div className="mt-1.5 flex items-start justify-between gap-3 px-1">
        <p
          id="chat-message-hint"
          className="text-[11px] text-zinc-400"
        >
          Enter to send · Shift+Enter for a new line
        </p>
        {length >= COUNTER_THRESHOLD ? (
          <p
            className="shrink-0 text-[11px] tabular-nums text-zinc-400"
            aria-live="polite"
          >
            {length}/{MESSAGE_BODY_MAX_LENGTH}
          </p>
        ) : null}
      </div>

      {inlineError ? (
        <p
          id="chat-message-error"
          className="mt-1.5 px-1 text-xs text-red-600"
          role="alert"
        >
          {inlineError}
        </p>
      ) : null}
    </>
  );
}

export function ChatMessageInput({
  recipientId,
  error,
  messageSent,
  onSubmitMessage,
}: ChatMessageInputProps) {
  const [length, setLength] = useState(0);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const sendMessageAction = sendMessage.bind(null, recipientId, "");

  useEffect(() => {
    const textarea = document.getElementById(
      "chat-message-body",
    ) as HTMLTextAreaElement | null;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  });

  useEffect(() => {
    if (messageSent) {
      sessionStorage.removeItem(getDraftKey(recipientId));
      const textarea = document.getElementById(
        "chat-message-body",
      ) as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.value = "";
      }
      setLength(0);
      setInlineError(null);
      return;
    }

    const draft = sessionStorage.getItem(getDraftKey(recipientId));
    const textarea = document.getElementById(
      "chat-message-body",
    ) as HTMLTextAreaElement | null;
    if (draft && textarea && !textarea.value) {
      textarea.value = draft;
      setLength(draft.length);
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [messageSent, recipientId]);

  useEffect(() => {
    if (error) {
      setInlineError(error);
    }
  }, [error]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setInlineError(null);

    const formData = new FormData(event.currentTarget);
    const bodyValue = formData.get("body");
    const body = typeof bodyValue === "string" ? bodyValue.trim() : "";

    if (!body) {
      event.preventDefault();
      setInlineError("Message is required.");
      return;
    }

    if (body.length > MESSAGE_BODY_MAX_LENGTH) {
      event.preventDefault();
      setInlineError(
        `Message must be ${MESSAGE_BODY_MAX_LENGTH} characters or fewer.`,
      );
      return;
    }

    sessionStorage.setItem(getDraftKey(recipientId), body);
    onSubmitMessage?.(body);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form
      action={sendMessageAction}
      onSubmit={handleSubmit}
      className={chatComposerSurfaceClassName}
    >
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="chat-message-body" className="sr-only">
            Message
          </label>
          <MessageFields
            length={length}
            inlineError={inlineError}
            onLengthChange={setLength}
            onKeyDown={handleKeyDown}
          />
        </div>

        <SendButton />
      </div>
    </form>
  );
}
