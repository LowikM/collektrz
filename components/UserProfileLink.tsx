import Link from "next/link";

import { getUserDisplayLabel, type UserLabel } from "@/lib/users";

type UserProfileLinkProps = {
  userId: string;
  user: UserLabel;
  className?: string;
};

export function UserProfileLink({
  userId,
  user,
  className = "hover:underline",
}: UserProfileLinkProps) {
  return (
    <Link href={`/users/${userId}`} className={className}>
      {getUserDisplayLabel(user)}
    </Link>
  );
}
