export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return "";
}

export function getPublicProfileUrl(userId: string) {
  const base = getSiteUrl();
  const path = `/users/${userId}`;
  return base ? `${base}${path}` : path;
}
