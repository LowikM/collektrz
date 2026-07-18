"use client";

import { useState } from "react";

import { updateProfilePrivacy } from "@/app/profile/privacy-actions";
import type { ProfilePrivacySettings } from "@/lib/profile-privacy";

type ProfilePrivacyFormProps = {
  settings: ProfilePrivacySettings;
};

const inputClassName =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

export function ProfilePrivacyForm({ settings }: ProfilePrivacyFormProps) {
  const [collectionVisibility, setCollectionVisibility] = useState(
    settings.collection_visibility,
  );
  const [wishlistVisibility, setWishlistVisibility] = useState(
    settings.wishlist_visibility,
  );
  const [confirmCollectionPublic, setConfirmCollectionPublic] = useState(false);
  const [confirmWishlistPublic, setConfirmWishlistPublic] = useState(false);

  return (
    <form action={updateProfilePrivacy} className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Profile privacy</h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Control what other collectors can see on your public profile and QR
          page. Individual items stay private until you mark them public.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Collection visibility</legend>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="radio"
            name="collection_visibility"
            value="private"
            checked={collectionVisibility === "private"}
            onChange={() => {
              setCollectionVisibility("private");
              setConfirmCollectionPublic(false);
            }}
            className="mt-1"
          />
          <span>
            <span className="font-medium">Private</span>
            <span className="mt-1 block text-zinc-500">
              Only you can browse your full collection.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="radio"
            name="collection_visibility"
            value="public"
            checked={collectionVisibility === "public"}
            onChange={() => setCollectionVisibility("public")}
            className="mt-1"
          />
          <span>
            <span className="font-medium">Public</span>
            <span className="mt-1 block text-zinc-500">
              Collectors can browse items you mark as public and featured cards
              you choose.
            </span>
          </span>
        </label>
        {collectionVisibility === "public" ? (
          <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <input
              type="checkbox"
              name="confirm_collection_public"
              checked={confirmCollectionPublic}
              onChange={(event) => setConfirmCollectionPublic(event.target.checked)}
              className="mt-1"
            />
            <span>
              I understand my public collection items may appear on my profile,
              QR page, and event discovery.
            </span>
          </label>
        ) : null}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Wishlist visibility</legend>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="radio"
            name="wishlist_visibility"
            value="private"
            checked={wishlistVisibility === "private"}
            onChange={() => {
              setWishlistVisibility("private");
              setConfirmWishlistPublic(false);
            }}
            className="mt-1"
          />
          <span>
            <span className="font-medium">Private</span>
            <span className="mt-1 block text-zinc-500">
              Your permanent wishlist stays hidden from other collectors.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="radio"
            name="wishlist_visibility"
            value="public"
            checked={wishlistVisibility === "public"}
            onChange={() => setWishlistVisibility("public")}
            className="mt-1"
          />
          <span>
            <span className="font-medium">Public</span>
            <span className="mt-1 block text-zinc-500">
              Collectors can see wishlist items you mark as public.
            </span>
          </span>
        </label>
        {wishlistVisibility === "public" ? (
          <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <input
              type="checkbox"
              name="confirm_wishlist_public"
              checked={confirmWishlistPublic}
              onChange={(event) => setConfirmWishlistPublic(event.target.checked)}
              className="mt-1"
            />
            <span>
              I understand my public wishlist items may appear on my profile and
              in match recommendations.
            </span>
          </label>
        ) : null}
      </fieldset>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="show_collection_stats"
            defaultChecked={settings.show_collection_stats}
            className="mt-1"
          />
          <span>
            <span className="font-medium">Show collection statistics</span>
            <span className="mt-1 block text-zinc-500">
              Display public collection and wishlist counts on your profile.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="show_portfolio_value"
            defaultChecked={settings.show_portfolio_value}
            className="mt-1"
          />
          <span>
            <span className="font-medium">Show portfolio value</span>
            <span className="mt-1 block text-zinc-500">
              Reserved for a future release. No values are shown yet.
            </span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Save privacy settings
      </button>
    </form>
  );
}
