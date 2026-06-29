type MessageStatusAlertProps = {
  messageSent?: boolean;
  error?: string;
};

export function MessageStatusAlert({
  messageSent,
  error,
}: MessageStatusAlertProps) {
  if (error) {
    return (
      <p
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (messageSent) {
    return (
      <p
        className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
        role="status"
      >
        Message sent.
      </p>
    );
  }

  return null;
}
