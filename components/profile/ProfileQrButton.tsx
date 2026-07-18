"use client";

import { useState } from "react";

import { ProfileQrCode } from "@/components/ProfileQrCode";
import { profileGhostButtonClassName } from "@/components/profile/profile-styles";

type ProfileQrButtonProps = {
  profileUrl: string;
};

export function ProfileQrButton({ profileUrl }: ProfileQrButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={profileGhostButtonClassName}
      >
        QR
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Profile QR code"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Share at events</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
              >
                Close
              </button>
            </div>
            <ProfileQrCode url={profileUrl} label="Scan to view collector profile" />
          </div>
        </div>
      ) : null}
    </>
  );
}
