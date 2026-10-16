import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

import {
  AuthNotice,
  AuthShell,
  AuthSubmit,
  authHead,
  authLinkClass,
} from "@/components/auth-shell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () =>
    authHead("Choose a new password", "Set a new password for your Forbes Germany account."),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const checkSessionAndTokens = async () => {
      try {
        // 1. Check for PKCE 'code' query parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && isMounted) {
            setHasSession(true);
            setIsVerifying(false);
            return;
          }
        }

        // 2. Check existing active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          setHasSession(true);
          setIsVerifying(false);
          return;
        }

        // 3. Check for implicit recovery token in URL hash
        const hash = window.location.hash;
        if (hash && (hash.includes("access_token") || hash.includes("type=recovery"))) {
          // Supabase JS will parse hash on client init
          setHasSession(true);
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }

      // Finish verifying after 1s
      setTimeout(() => {
        if (isMounted) {
          setIsVerifying(false);
        }
      }, 1000);
    };

    checkSessionAndTokens();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        if (isMounted) {
          setHasSession(true);
          setIsVerifying(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      setStatus("error");
      return;
    }

    if (password !== confirm) {
      setErrorMessage("Passwords do not match. Please verify both fields.");
      setStatus("error");
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update password. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      intro="Enter your new secure password below. It must be at least 8 characters long."
    >
      {isVerifying ? (
        <div className="mt-12 flex flex-col items-center justify-center py-12 text-ink-soft">
          <Loader2 className="h-7 w-7 animate-spin text-brand" />
          <p className="mt-3 text-sm font-medium">Verifying reset credentials...</p>
        </div>
      ) : status === "success" ? (
        <div className="mt-8 border border-rule bg-secondary/30 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="headline mt-4 text-2xl text-foreground">Password updated!</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Your Forbes Germany account password has been successfully updated. You can now sign in with your new credentials.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-block w-full bg-foreground px-6 py-3.5 text-[0.82rem] font-semibold tracking-[0.08em] text-background uppercase transition-colors hover:bg-brand"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          {!hasSession && (
            <div className="mb-6 border-l-2 border-amber-500 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Reset Link Required
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    To choose a new password, you should open the link sent directly to your email. If your link has expired or you haven't requested one yet, please request a fresh link.
                  </p>
                  <div className="mt-3">
                    <Link
                      to="/forgot-password"
                      className="inline-block bg-foreground px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-background hover:bg-brand transition-colors"
                    >
                      Request new reset link
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <label className="block">
              <span className="kicker">New password</span>
              <div className="relative mt-2">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full border border-rule bg-background px-4 py-3.5 pr-11 text-[0.95rem] text-foreground outline-none transition-colors focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="kicker">Confirm new password</span>
              <div className="relative mt-2">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  placeholder="Re-enter your new password"
                  className="w-full border border-rule bg-background px-4 py-3.5 pr-11 text-[0.95rem] text-foreground outline-none transition-colors focus:border-foreground"
                />
              </div>
            </label>

            <AuthSubmit disabled={loading}>
              {loading ? "Updating password..." : "Update password"}
            </AuthSubmit>
          </form>

          {errorMessage && (
            <div className="mt-5 flex items-start gap-2.5 border-l-2 border-red-500 bg-red-500/10 p-3.5 text-[0.85rem] text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="mt-9 border-t border-rule pt-6 text-[0.88rem] text-ink-soft">
            Remembered it?{" "}
            <Link to="/login" className={authLinkClass}>
              Back to sign in
            </Link>
            .
          </div>
        </div>
      )}
    </AuthShell>
  );
}
