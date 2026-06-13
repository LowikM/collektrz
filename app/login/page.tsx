import Link from "next/link";

import { signIn, signUp } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Pokémon Event Trade
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to your account or create a new one.
          </p>
        </div>

        {error ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2">
          <form action={signIn} className="space-y-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="text-lg font-medium">Sign in</h2>
            <div className="space-y-2">
              <label htmlFor="signin-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="signin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="signin-password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="signin-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                minLength={6}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Sign in
            </button>
          </form>

          <form action={signUp} className="space-y-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="text-lg font-medium">Sign up</h2>
            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="signup-password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Create account
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="font-medium hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
