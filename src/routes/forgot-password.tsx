import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import {
  AuthField,
  AuthNotice,
  AuthShell,
  AuthSubmit,
  authHead,
  authLinkClass,
} from "@/components/auth-shell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  staticData: { sitemap: false },
  head: () =>
    authHead("Forgot password", "Request a link to reset your Forbes Germany account password."),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      intro="Enter the email associated with your Forbes Germany account and we'll send you a secure link to choose a new password."
    >
      {sent ? (
        <div className="mt-8 border border-rule bg-secondary/30 p-6">
          <div className="flex items-start gap-3.5">
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Check your inbox
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                We have sent a secure password reset link to <strong className="text-foreground">{email}</strong>.
                Please check your inbox and click the link to choose your new password.
              </p>
              <p className="mt-3 text-xs text-ink-soft">
                Didn't receive the email? Check your spam folder, or wait a minute before requesting another link.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetRequest}
                  disabled={loading}
                  className="bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wider text-background hover:bg-brand disabled:opacity-50 transition-colors"
                >
                  {loading ? "Resending..." : "Resend reset email"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setError("");
                  }}
                  className="border border-rule px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-colors"
                >
                  Use another email
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleResetRequest} className="mt-9 space-y-5">
          <AuthField
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
          />
          <AuthSubmit disabled={loading}>
            {loading ? "Sending reset link..." : "Send reset link"}
          </AuthSubmit>
        </form>
      )}

      {error && (
        <div className="mt-5 flex items-start gap-2.5 border-l-2 border-red-500 bg-red-500/10 p-3.5 text-[0.85rem] text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-9 border-t border-rule pt-6 text-[0.88rem] text-ink-soft">
        Remembered your password?{" "}
        <Link to="/login" className={authLinkClass}>
          Back to sign in
        </Link>
        .
      </div>
    </AuthShell>
  );
}
