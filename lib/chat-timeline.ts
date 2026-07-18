import type { MessageGroup } from "@/lib/conversations";

export type DateSeparatorItem = {
  kind: "date";
  key: string;
  label: string;
};

export type GroupTimelineItem = {
  kind: "group";
  key: string;
  group: MessageGroup;
};

export type ChatTimelineItem = DateSeparatorItem | GroupTimelineItem;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function formatDateSeparatorLabel(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return "Today";
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  const diffDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildChatTimeline(groups: MessageGroup[]): ChatTimelineItem[] {
  const timeline: ChatTimelineItem[] = [];
  let lastDateKey: string | null = null;

  for (const group of groups) {
    const firstMessage = group.messages[0];
    if (!firstMessage) {
      continue;
    }

    const date = new Date(firstMessage.created_at);
    const dateKey = startOfDay(date).toISOString();

    if (dateKey !== lastDateKey) {
      timeline.push({
        kind: "date",
        key: `date-${dateKey}`,
        label: formatDateSeparatorLabel(firstMessage.created_at),
      });
      lastDateKey = dateKey;
    }

    timeline.push({
      kind: "group",
      key: `group-${firstMessage.id}`,
      group,
    });
  }

  return timeline;
}
