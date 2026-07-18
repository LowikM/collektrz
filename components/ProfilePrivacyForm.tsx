"use client";

import { useState } from "react";

import { updateProfilePrivacy } from "@/app/profile/privacy-actions";
import type { ProfilePrivacySettings } from "@/lib/profile-privacy";

type ProfilePrivacyFormProps = {
  settings: ProfilePrivacySettings;
};

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
    <form action={updateProfilePrivacy} className="space-y-8">
      <input type="hidden" name="show_collection_stats" value={settings.show_collection_stats ? "1" : "0"} />

      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Sharing</h2>
        <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Choose what appears on your public profile. Mark individual items
          public from your collection or wishlist menus.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Collection
        </legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors has-[:checked]:border-zinc-400 has-[:checked]:bg-zinc-50 dark:border-zinc-800 dark:has-[:checked]:border-zinc-600 dark:has-[:checked]:bg-zinc-900/50">
          <input
            type="radio"
            name="collection_visibility"
            value="private"
            checked={collectionVisibility === "private"}
            onChange={() => {
              setCollectionVisibility("private");
              setConfirmCollectionPublic(false);
            }}
          />
          <span className="text-sm font-medium">Private</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors has-[:checked]:border-zinc-400 has-[:checked]:bg-zinc-50 dark:border-zinc-800 dark:has-[:checked]:border-zinc-600 dark:has-[:checked]:bg-zinc-900/50">
          <input
            type="radio"
            name="collection_visibility"
            value="public"
            checked={collectionVisibility === "public"}
            onChange={() => setCollectionVisibility("public")}
          />
          <span className="text-sm font-medium">Public</span>
        </label>
        {collectionVisibility === "public" ? (
          <label className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
            <input
              type="checkbox"
              name="confirm_collection_public"
              checked={confirmCollectionPublic}
              onChange={(event) => setConfirmCollectionPublic(event.target.checked)}
              className="mt-0.5"
            />
            <span>Public collection items may appear on my profile and QR page.</span>
          </label>
        ) : null}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Wishlist
        </legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors has-[:checked]:border-zinc-400 has-[:checked]:bg-zinc-50 dark:border-zinc-800 dark:has-[:checked]:border-zinc-600 dark:has-[:checked]:bg-zinc-900/50">
          <input
            type="radio"
            name="wishlist_visibility"
            value="private"
            checked={wishlistVisibility === "private"}
            onChange={() => {
              setWishlistVisibility("private");
              setConfirmWishlistPublic(false);
            }}
          />
          <span className="text-sm font-medium">Private</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors has-[:checked]:border-zinc-400 has-[:checked]:bg-zinc-50 dark:border-zinc-800 dark:has-[:checked]:border-zinc-600 dark:has-[:checked]:bg-zinc-900/50">
          <input
            type="radio"
            name="wishlist_visibility"
            value="public"
            checked={wishlistVisibility === "public"}
            onChange={() => setWishlistVisibility("public")}
          />
          <span className="text-sm font-medium">Public</span>
        </label>
        {wishlistVisibility === "public" ? (
          <label className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
            <input
              type="checkbox"
              name="confirm_wishlist_public"
              checked={confirmWishlistPublic}
              onChange={(event) => setConfirmWishlistPublic(event.target.checked)}
              className="mt-0.5"
            />
            <span>Public wishlist items may appear on my profile.</span>
          </label>
        ) : null}
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <input
          type="checkbox"
          name="show_portfolio_value"
          defaultChecked={settings.show_portfolio_value}
          className="mt-0.5"
        />
        <span>
          <span className="block text-sm font-semibold">Show portfolio value</span>
          <span className="mt-1 block text-sm text-zinc-500">
            Display estimated value when portfolio tracking launches.
          </span>
        </span>
      </label>

      <button
        type="submit"
        className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Save sharing settings
      </button>
    </form>
  );
}
