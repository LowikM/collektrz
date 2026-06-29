export const PROFILE_FIELD_MAX_LENGTHS = {
  display_name: 80,
  bio: 500,
  location: 120,
  favorite_pokemon: 80,
  avatar_url: 500,
} as const;

export type PublicUserProfile = {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  favorite_pokemon: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type UserLabel = {
  display_name: string | null;
  email: string;
};

export function getUserDisplayLabel(user: UserLabel | null | undefined) {
  if (!user) {
    return "Unknown user";
  }

  return user.display_name?.trim() || user.email;
}

function readOptionalField(
  formData: FormData,
  field: keyof typeof PROFILE_FIELD_MAX_LENGTHS,
):
  | { error: string }
  | { value: string | null } {
  const raw = formData.get(field);

  if (raw === null || typeof raw !== "string") {
    return { value: null };
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return { value: null };
  }

  if (trimmed.length > PROFILE_FIELD_MAX_LENGTHS[field]) {
    return {
      error: `${field.replace("_", " ")} must be at most ${PROFILE_FIELD_MAX_LENGTHS[field]} characters.`,
    };
  }

  return { value: trimmed };
}

export function parseProfileFormData(formData: FormData):
  | { error: string }
  | {
      display_name: string | null;
      bio: string | null;
      location: string | null;
      favorite_pokemon: string | null;
      avatar_url: string | null;
    } {
  const fields = [
    "display_name",
    "bio",
    "location",
    "favorite_pokemon",
    "avatar_url",
  ] as const;

  const parsed: Record<(typeof fields)[number], string | null> = {
    display_name: null,
    bio: null,
    location: null,
    favorite_pokemon: null,
    avatar_url: null,
  };

  for (const field of fields) {
    const result = readOptionalField(formData, field);

    if ("error" in result) {
      return result;
    }

    parsed[field] = result.value;
  }

  return parsed;
}

export function formatMemberSince(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
