import { updateProfile } from "@/app/profile/actions";
import {
  PROFILE_FIELD_MAX_LENGTHS,
  type PublicUserProfile,
} from "@/lib/users";

type ProfileFormProps = {
  profile: Pick<
    PublicUserProfile,
    | "display_name"
    | "bio"
    | "location"
    | "favorite_pokemon"
    | "avatar_url"
  >;
};

const inputClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

export function ProfileForm({ profile }: ProfileFormProps) {
  return (
    <form action={updateProfile} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="display_name" className="text-sm font-medium">
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          maxLength={PROFILE_FIELD_MAX_LENGTHS.display_name}
          defaultValue={profile.display_name ?? ""}
          className={inputClassName}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Max {PROFILE_FIELD_MAX_LENGTHS.display_name} characters.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={PROFILE_FIELD_MAX_LENGTHS.bio}
          defaultValue={profile.bio ?? ""}
          className={inputClassName}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Max {PROFILE_FIELD_MAX_LENGTHS.bio} characters.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          maxLength={PROFILE_FIELD_MAX_LENGTHS.location}
          defaultValue={profile.location ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="favorite_pokemon" className="text-sm font-medium">
          Favorite Pokémon
        </label>
        <input
          id="favorite_pokemon"
          name="favorite_pokemon"
          type="text"
          maxLength={PROFILE_FIELD_MAX_LENGTHS.favorite_pokemon}
          defaultValue={profile.favorite_pokemon ?? ""}
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="avatar_url" className="text-sm font-medium">
          Avatar URL
        </label>
        <input
          id="avatar_url"
          name="avatar_url"
          type="url"
          maxLength={PROFILE_FIELD_MAX_LENGTHS.avatar_url}
          defaultValue={profile.avatar_url ?? ""}
          placeholder="https://example.com/avatar.png"
          className={inputClassName}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Optional image URL. Upload support is not available yet.
        </p>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Save profile
      </button>
    </form>
  );
}
