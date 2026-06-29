import { replyToMessage } from "@/app/messages/actions";
import { MESSAGE_BODY_MAX_LENGTH } from "@/lib/messages";

type ReplyMessageFormProps = {
  messageId: string;
};

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

const buttonClassName =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900";

export function ReplyMessageForm({ messageId }: ReplyMessageFormProps) {
  const replyAction = replyToMessage.bind(null, messageId);

  return (
    <details className="group rounded-lg border border-zinc-200 dark:border-zinc-800">
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="text-zinc-500 transition-transform group-open:rotate-180 dark:text-zinc-400">
            ▼
          </span>
          Reply
        </span>
      </summary>
      <form action={replyAction} className="space-y-3 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="space-y-2">
          <label htmlFor={`reply-body-${messageId}`} className="sr-only">
            Reply
          </label>
          <textarea
            id={`reply-body-${messageId}`}
            name="body"
            rows={4}
            required
            maxLength={MESSAGE_BODY_MAX_LENGTH}
            placeholder="Write your reply..."
            className={inputClassName}
          />
        </div>
        <button type="submit" className={buttonClassName}>
          Send reply
        </button>
      </form>
    </details>
  );
}
