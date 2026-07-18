"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { sendMessage } from "@/app/messages/actions";
import { chatFocusRingClassName, chatPrimaryButtonClassName } from "@/components/chat/chat-styles";
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

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${chatPrimaryButtonClassName} h-11 shrink-0 px-4`}
    >
      {pending ? "Sending…" : "Send"}
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
        className={`max-h-40 min-h-[44px] w-full resize-none rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 ${chatFocusRingClassName}`}
      />

      <div className="mt-2 flex items-start justify-between gap-3">
        <p
          id="chat-message-hint"
          className="text-xs text-zinc-500 dark:text-zinc-500"
        >
          Enter to send · Shift+Enter for a new line
        </p>
        {length >= COUNTER_THRESHOLD ? (
          <p
            className="shrink-0 text-xs text-zinc-500 dark:text-zinc-500"
            aria-live="polite"
          >
            {length}/{MESSAGE_BODY_MAX_LENGTH}
          </p>
        ) : null}
      </div>

      {inlineError ? (
        <p
          id="chat-message-error"
          className="mt-2 text-xs text-red-600 dark:text-red-400"
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
      className="shrink-0 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex items-end gap-3">
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
