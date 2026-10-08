import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { siteName } from "@/data/content";

export const Route = createFileRoute("/login")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Sign in — ${siteName}` },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: `Sign in to your ${siteName} account to read the full archive and manage alerts.`,
      },
      { property: "og:title", content: `Sign in — ${siteName}` },
      {
        property: "og:description",
        content: `Sign in to your ${siteName} account to read the full archive and manage alerts.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [attempted, setAttempted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col px-5 pb-4 sm:px-8">
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col py-16">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 shrink-0 place-items-center bg-foreground font-display text-[1.05rem] leading-none text-background"
          >
            M
          </span>
          <span className="font-display text-2xl leading-none font-semibold tracking-tight">
            {siteName}
          </span>
        </div>

        <h1 className="headline mt-8 text-[2.1rem] text-foreground sm:text-[2.5rem]">
          Sign in to continue reading
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          Subscribers get the full archive, the daily briefing, and alerts on the desks they follow.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setAttempted(true);
          }}
          className="mt-9 space-y-5"
        >
          <label className="block">
            <span className="kicker">Email address</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="mt-2 w-full border border-rule bg-background px-4 py-3.5 text-[0.95rem] text-foreground outline-none transition-colors focus:border-foreground"
            />
          </label>

          <label className="block">
            <span className="kicker">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="mt-2 w-full border border-rule bg-background px-4 py-3.5 text-[0.95rem] text-foreground outline-none transition-colors focus:border-foreground"
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <label className="flex min-w-0 items-center gap-2 text-[0.82rem] text-ink-soft">
              <input type="checkbox" className="h-3.5 w-3.5 shrink-0 accent-foreground" />
              Keep me signed in
            </label>
            <Link
              to="/forgot-password"
              className="shrink-0 text-[0.82rem] text-ink-soft underline-offset-4 transition-colors hover:text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-foreground px-6 py-3.5 text-[0.82rem] font-semibold tracking-[0.08em] text-background uppercase transition-colors hover:bg-brand"
          >
            Sign in
          </button>
        </form>

        {attempted && (
          <p className="mt-3 text-[0.85rem]"><Link to="/dashboard" className="font-semibold underline underline-offset-4 hover:text-brand">Continue to the author dashboard</Link></p>
        )}
        {attempted && (
          <p className="mt-5 border-l-2 border-brand py-1 pl-4 text-[0.85rem] leading-relaxed text-ink-soft">
            This is a front-end demonstration — no account system is connected, so the credentials
            above were not checked against anything.
          </p>
        )}

        <div className="mt-9 border-t border-rule pt-6 text-[0.88rem] text-ink-soft">
          New contributor?{" "}
          <Link
            to="/signup"
            className="font-semibold text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
          >
            Create an author account
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
