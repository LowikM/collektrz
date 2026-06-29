import { redirect } from "next/navigation";

import { MessageStatusAlert } from "@/components/MessageStatusAlert";
import { ReplyMessageForm } from "@/components/ReplyMessageForm";
import { markAllReceivedMessagesRead } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

type EmbeddedUser = {
  display_name: string | null;
  email: string;
};

type EmbeddedListing = {
  card_name: string;
};

type MessageRow = {
  id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  listing_id: string | null;
  parent_message_id: string | null;
  sender: EmbeddedUser | EmbeddedUser[] | null;
  recipient: EmbeddedUser | EmbeddedUser[] | null;
  listings: EmbeddedListing | EmbeddedListing[] | null;
};

const unreadBadgeClassName =
  "rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";

function getEmbeddedUser(user: MessageRow["sender"]) {
  if (!user) {
    return null;
  }

  return Array.isArray(user) ? (user[0] ?? null) : user;
}

function getListingName(listings: MessageRow["listings"]) {
  if (!listings) {
    return null;
  }

  const listing = Array.isArray(listings) ? listings[0] : listings;
  return listing?.card_name ?? null;
}

function getUserLabel(user: EmbeddedUser | null) {
  if (!user) {
    return "Unknown user";
  }

  return user.display_name?.trim() || user.email;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ReceivedMessageItem({ message }: { message: MessageRow }) {
  const sender = getEmbeddedUser(message.sender);
  const listingName = getListingName(message.listings);
  const isUnread = message.read_at === null;

  return (
    <li>
      <article
        className={`rounded-xl border p-4 ${
          isUnread
            ? "border-zinc-400 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {isUnread ? (
            <span className={unreadBadgeClassName}>Unread</span>
          ) : null}
          {message.parent_message_id ? (
            <span className={unreadBadgeClassName}>Reply</span>
          ) : null}
        </div>

        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              From
            </dt>
            <dd>{getUserLabel(sender)}</dd>
          </div>
          {listingName ? (
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Listing
              </dt>
              <dd>{listingName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Message
            </dt>
            <dd className="leading-6 whitespace-pre-wrap">{message.body}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Sent
            </dt>
            <dd>{formatDateTime(message.created_at)}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <ReplyMessageForm messageId={message.id} />
        </div>
      </article>
    </li>
  );
}

function SentMessageItem({ message }: { message: MessageRow }) {
  const recipient = getEmbeddedUser(message.recipient);
  const listingName = getListingName(message.listings);

  return (
    <li>
      <article className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        {message.parent_message_id ? (
          <div className="mb-3">
            <span className={unreadBadgeClassName}>Reply</span>
          </div>
        ) : null}

        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">To</dt>
            <dd>{getUserLabel(recipient)}</dd>
          </div>
          {listingName ? (
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Listing
              </dt>
              <dd>{listingName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Message
            </dt>
            <dd className="leading-6 whitespace-pre-wrap">{message.body}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Sent
            </dt>
            <dd>{formatDateTime(message.created_at)}</dd>
          </div>
        </dl>
      </article>
    </li>
  );
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; messageSent?: string }>;
}) {
  const { error, messageSent } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const messageSelect = `
    id,
    body,
    created_at,
    read_at,
    listing_id,
    parent_message_id,
    sender:users!messages_sender_id_fkey(display_name, email),
    recipient:users!messages_recipient_id_fkey(display_name, email),
    listings(card_name)
  `;

  const [{ data: receivedData, error: receivedError }, { data: sentData, error: sentError }] =
    await Promise.all([
      supabase
        .from("messages")
        .select(messageSelect)
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select(messageSelect)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

  const receivedMessages = (receivedData ?? []) as MessageRow[];
  const sentMessages = (sentData ?? []) as MessageRow[];

  await markAllReceivedMessagesRead(supabase, user.id);

  return (
    <div className="flex flex-1 justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Messages you&apos;ve sent and received. Replies are linked to the
            original message but not shown as a full thread yet.
          </p>
        </div>

        <MessageStatusAlert messageSent={messageSent === "1"} error={error} />

        {receivedError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            Could not load received messages: {receivedError.message}
          </p>
        ) : null}

        {sentError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            Could not load sent messages: {sentError.message}
          </p>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Received</h2>

          {receivedMessages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              No messages received yet.
            </p>
          ) : (
            <ul className="grid gap-4">
              {receivedMessages.map((message) => (
                <ReceivedMessageItem key={message.id} message={message} />
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Sent</h2>

          {sentMessages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              No messages sent yet.
            </p>
          ) : (
            <ul className="grid gap-4">
              {sentMessages.map((message) => (
                <SentMessageItem key={message.id} message={message} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
