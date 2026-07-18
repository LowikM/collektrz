"use client";

import { useState } from "react";

import { profileGhostButtonClassName } from "@/components/profile/profile-styles";

type ProfileShareButtonProps = {
  profileUrl: string;
};

export function ProfileShareButton({ profileUrl }: ProfileShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Collektrz profile",
          url: profileUrl,
        });
        return;
      }
    } catch {
      // fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={() => void handleShare()} className={profileGhostButtonClassName}>
      {copied ? "Copied!" : "Share"}
    </button>
  );
}
