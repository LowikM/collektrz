import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-xl border border-zinc-200 p-8 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Your account details.
          </p>
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Email
            </dt>
            <dd className="mt-1">{user.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              User ID
            </dt>
            <dd className="mt-1 break-all font-mono text-xs">{user.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500 dark:text-zinc-400">
              Last sign in
            </dt>
            <dd className="mt-1">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
