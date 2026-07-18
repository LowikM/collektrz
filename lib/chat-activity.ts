export function formatRecentActivity(date: string | null) {
  if (!date) {
    return "No recent activity";
  }

  const value = new Date(date);
  const diffMs = Date.now() - value.getTime();

  if (diffMs < 60 * 1000) {
    return "Recently active";
  }

  if (diffMs < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `Active ${minutes}m ago`;
  }

  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
    return `Active ${hours}h ago`;
  }

  return `Last activity ${value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}`;
}

export function isRecentlyActive(date: string | null) {
  if (!date) {
    return false;
  }

  return Date.now() - new Date(date).getTime() < 15 * 60 * 1000;
}

export function getRecentActivityAriaLabel(date: string | null) {
  if (!date) {
    return "No recent message activity";
  }

  return isRecentlyActive(date)
    ? "Recently active based on message activity"
    : formatRecentActivity(date);
}
