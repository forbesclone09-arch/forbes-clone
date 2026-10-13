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

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => authHead("Choose a new password", "Set a new password for your Forbes Germany account."),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "mismatch" | "done">("idle");

  return (
    <AuthShell
      title="Choose a new password"
      intro="Use at least 8 characters. You'll be signed out of other devices."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStatus(password === confirm ? "done" : "mismatch");
        }}
        className="mt-9 space-y-5"
      >
        <AuthField
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          minLength={8}
        />
        <AuthField
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          minLength={8}
        />
        <AuthSubmit>Update password</AuthSubmit>
      </form>
      {status === "mismatch" && <AuthNotice>The two passwords don't match.</AuthNotice>}
      {status === "done" && (
        <AuthNotice>
          Demo only — nothing was saved.{" "}
          <Link to="/login" className={authLinkClass}>
            Return to sign in
          </Link>
          .
        </AuthNotice>
      )}
    </AuthShell>
  );
}
