import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shield, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, ShieldAlert } from "lucide-react";

import { siteName } from "@/data/content";
import { supabase } from "@/lib/supabase";
import { getUserRoleAndApproval } from "@/components/dashboard/shared";

export const Route = createFileRoute("/private-admin-login")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Executive Admin Login — ${siteName}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PrivateAdminLoginPage,
});

function PrivateAdminLoginPage() {
  const navigate = useNavigate();
  const [attempted, setAttempted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [authorDetected, setAuthorDetected] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { isAdmin } = await getUserRoleAndApproval(session.user.id, session.user.email);
        if (isAdmin) {
          navigate({ to: "/admin-dashboard" });
          return;
        } else {
          setAuthorDetected(true);
          setLoadingInitial(false);
        }
      } else {
        setLoadingInitial(false);
      }
    });
  }, [navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Failed to fetch") || signInError.message.includes("NetworkError")) {
          setError("Connection error: The database server may be inactive or sleeping. Please verify that your Supabase instance is active.");
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid administrator email or password. Please verify your credentials.");
        } else {
          setError(signInError.message);
        }
        setAttempted(false);
        return;
      }

      if (data.session?.user) {
        // Verify admin privilege
        const { isAdmin } = await getUserRoleAndApproval(data.session.user.id, data.session.user.email);
        if (!isAdmin) {
          await supabase.auth.signOut();
          setError("Access Denied: This account does not possess Administrative clearance. Please use the Author Portal at /author-login.");
          setAttempted(false);
          return;
        }
        navigate({ to: "/admin-dashboard" });
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during administrative authentication.");
      setAttempted(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex items-center gap-3">
          <div className="size-5 animate-spin rounded-full border-2 border-red-500 border-t-zinc-100" />
          <span className="text-sm tracking-wider uppercase font-mono text-zinc-400">Verifying executive clearance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#08080a] text-zinc-100 selection:bg-red-600 selection:text-white w-full max-w-full overflow-x-clip">
      {/* Top bar */}
      <header className="border-b border-zinc-800/80 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="flex size-7 shrink-0 items-center justify-center bg-red-600 font-display font-black text-sm text-white rounded shadow-sm">
            F
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Forbes Germany
            </span>
            <span className="hidden sm:inline-flex text-[0.65rem] font-mono uppercase tracking-[0.2em] text-red-400 bg-red-950/60 border border-red-800/50 px-2 py-0.5 rounded whitespace-nowrap">
              Executive Admin Portal
            </span>
            <span className="sm:hidden text-[0.58rem] font-mono uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-800/50 px-1.5 py-0.5 rounded font-bold shrink-0">
              Admin
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors py-1.5 px-2 rounded hover:bg-zinc-900/60 shrink-0"
        >
          <ArrowLeft className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">Return to Public Portal</span>
          <span className="sm:hidden">Public Portal</span>
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px] rounded-xl border border-zinc-800/90 bg-zinc-900/70 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-semibold tracking-widest text-red-400 uppercase">
            <Shield className="size-4" /> Restricted Portal
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Admin Sign In
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Newsroom administration and executive editorial team only. Enter your administrator credentials to access newsroom controls.
          </p>

          {authorDetected && (
            <div className="mt-6 rounded-lg border border-amber-800/60 bg-amber-950/30 p-4 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <ShieldAlert className="size-4 text-amber-400 shrink-0" />
                <span>Author Account Detected</span>
              </div>
              <p>You are currently signed in as an author. This portal is reserved for Newsroom Administrators.</p>
              <div className="flex gap-2 pt-1">
                <Link
                  to="/author-dashboard"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded text-xs transition"
                >
                  Go to Author Dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setAuthorDetected(false);
                  }}
                  className="border border-amber-700/60 hover:bg-amber-900/40 text-amber-300 px-3 py-1.5 rounded text-xs transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Admin Email / Username
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@forbes.com"
                autoComplete="email"
                className="mt-1.5 w-full rounded-md border border-zinc-700/80 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-md border border-zinc-700/80 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-800/80 bg-red-950/40 p-3 text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-1">
                  <span>{error}</span>
                  {error.includes("Author Portal") && (
                    <div>
                      <Link to="/author-login" className="font-semibold underline text-red-300 hover:text-white">
                        Click here to go to the Author Login Portal &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={attempted}
              className="mt-2 w-full rounded-md bg-red-600 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer"
            >
              {attempted ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Verifying Clearance...</span>
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  <span>Enter Executive Newsroom</span>
                </>
              )}
            </button>
          </form>

          {/* Separation Note / Author Switch */}
          <div className="mt-8 border-t border-zinc-800/80 pt-6 text-center">
            <p className="text-xs text-zinc-400">
              Staff journalist or contributor?{" "}
              <Link to="/author-login" className="text-red-400 hover:text-red-300 font-semibold underline">
                Author & Journalist Sign In &rarr;
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Micro-footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-4 text-center text-xs font-mono text-zinc-500">
        Forbes Media Group — Internal Newsroom Administration Portal
      </footer>
    </div>
  );
}
