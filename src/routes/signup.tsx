import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

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
      "Join the Forbes Germany contributor network to pitch, draft and publish stories.",
    ),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setDone(false);
    }
  };

  return (
    <AuthShell
      title="Create your author account"
      intro="Contributors draft, edit and track their stories from one dashboard."
    >
      <form
        onSubmit={handleSignup}
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
        <AuthSubmit disabled={done}>{done ? "Signing up..." : "Create account"}</AuthSubmit>
      </form>
      {error && (
        <AuthNotice>
          <span className="text-red-500">{error}</span>
        </AuthNotice>
      )}
      {done && !error && (
        <AuthNotice>
          Account created! Your author application is now awaiting administrator approval. Once approved, you can <Link to="/login" className={authLinkClass}>Sign in</Link> to access your contributor dashboard.
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
