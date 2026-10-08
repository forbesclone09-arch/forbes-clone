import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import {
  AuthField,
  AuthNotice,
  AuthShell,
  AuthSubmit,
  authHead,
  authLinkClass,
} from "@/components/auth-shell";

export const Route = createFileRoute("/signup")({
  staticData: { sitemap: false },
  head: () =>
    authHead(
      "Create an author account",
      "Join the Meridian contributor network to pitch, draft and publish stories.",
    ),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  return (
    <AuthShell
      title="Create your author account"
      intro="Contributors draft, edit and track their stories from one dashboard."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDone(true);
        }}
        className="mt-9 space-y-5"
      >
        <AuthField label="Full name" value={name} onChange={setName} placeholder="Nadia Rahman" />
        <AuthField
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
        />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          minLength={8}
          placeholder="At least 8 characters"
        />
        <AuthSubmit>Create account</AuthSubmit>
      </form>
      {done && (
        <AuthNotice>
          Demo only — no account was created. In the live product you'd now receive a confirmation
          email. <Link to="/dashboard" className={authLinkClass}>Preview the author dashboard</Link>.
        </AuthNotice>
      )}
      <div className="mt-9 border-t border-rule pt-6 text-[0.88rem] text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className={authLinkClass}>
          Sign in
        </Link>
        .
      </div>
    </AuthShell>
  );
}
