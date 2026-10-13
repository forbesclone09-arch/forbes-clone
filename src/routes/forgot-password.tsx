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

export const Route = createFileRoute("/forgot-password")({
  staticData: { sitemap: false },
  head: () =>
    authHead("Forgot password", "Request a link to reset your Forbes Germany account password."),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthShell
      title="Reset your password"
      intro="Enter the email on your account and we'll send you a link to choose a new password."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="mt-9 space-y-5"
      >
        <AuthField
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
        />
        <AuthSubmit>Send reset link</AuthSubmit>
      </form>
      {sent && (
        <AuthNotice>
          Demo only — no email was sent.{" "}
          <Link to="/reset-password" className={authLinkClass}>
            Preview the reset page
          </Link>
          .
        </AuthNotice>
      )}
      <div className="mt-9 border-t border-rule pt-6 text-[0.88rem] text-ink-soft">
        Remembered it?{" "}
        <Link to="/login" className={authLinkClass}>
          Back to sign in
        </Link>
        .
      </div>
    </AuthShell>
  );
}
