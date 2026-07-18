import { ProfileSectionHeader } from "@/components/profile/ProfileSectionHeader";
import { profilePanelClassName } from "@/components/profile/profile-styles";
import { canViewProfileSection } from "@/lib/profile-privacy";
import type { ProfilePageData } from "@/lib/profile";
import { formatMemberSince, getUserDisplayLabel } from "@/lib/users";

type ProfileAboutTabProps = {
  data: ProfilePageData;
};

export function ProfileAboutTab({ data }: ProfileAboutTabProps) {
  const displayName = getUserDisplayLabel(data.user);
  const showEmail = canViewProfileSection("email", data.visibility);

  return (
    <div className="space-y-6">
      <ProfileSectionHeader
        title="About"
        description={`Learn more about ${displayName}.`}
      />

      <div className={`${profilePanelClassName} space-y-5`}>
        <div>
          <h3 className="text-sm font-medium text-zinc-500">Collector bio</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {data.user.bio?.trim() || "No bio yet."}
          </p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-zinc-500">Location</dt>
            <dd className="mt-1 text-sm">{data.user.location ?? "Not shared"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Favorite collectible</dt>
            <dd className="mt-1 text-sm">
              {data.user.favorite_pokemon ?? "Not shared"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500">Member since</dt>
            <dd className="mt-1 text-sm">
              {formatMemberSince(data.user.created_at)}
            </dd>
          </div>
          {showEmail ? (
            <div>
              <dt className="text-sm font-medium text-zinc-500">Email</dt>
              <dd className="mt-1 text-sm">{data.user.email}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className={`${profilePanelClassName} space-y-3`}>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Coming soon
        </h3>
        <ul className="grid gap-2 text-sm text-zinc-600 dark:text-zinc-400 sm:grid-cols-2">
          <li>Portfolio values & price history</li>
          <li>Featured manual selection</li>
          <li>Collection folders</li>
          <li>Verified collector badge</li>
          <li>Friends-only visibility</li>
          <li>Import wizard & scanner badges</li>
        </ul>
      </div>
    </div>
  );
}
