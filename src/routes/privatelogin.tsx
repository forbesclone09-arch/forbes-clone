import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shield, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

import { siteName } from "@/data/content";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/privatelogin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Back-Office Login — ${siteName}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PrivateLoginPage,
});

function PrivateLoginPage() {
  const navigate = useNavigate();
  const [attempted, setAttempted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    // If user already has an active session, take them straight to the studio
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/dashboard" });
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Failed to fetch") || signInError.message.includes("NetworkError")) {
          setError("Connection error: The database server may be sleeping. Please verify that your Supabase instance is active.");
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please verify your credentials or contact the Newsroom Administrator.");
        } else {
          setError(signInError.message);
        }
        setAttempted(false);
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during authentication.");
      setAttempted(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex items-center gap-3">
          <div className="size-5 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100" />
          <span className="text-sm tracking-wider uppercase font-mono text-zinc-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0a0a0c] text-zinc-100 selection:bg-red-600 selection:text-white">
      {/* Top micro-bar */}
      <header className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center bg-red-600 font-display font-black text-sm text-white rounded">
            F
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-white">Forbes Germany</span>
            <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-red-400 bg-red-950/60 border border-red-800/50 px-2 py-0.5 rounded">
              Back-Office Studio
            </span>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Return to Public Portal
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-semibold tracking-widest text-red-400 uppercase">
            <Shield className="size-4" /> Restricted Portal
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Editorial Sign In
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Authorized journalists, editors, and administrative staff only. Please sign in with your assigned newsroom credentials.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Email / Username
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="journalist@forbesgermany.de"
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
                  className="w-full rounded-md border border-zinc-700/80 bg-zinc-950/70 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200 flex items-start gap-2.5">
                <AlertCircle className="size-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={attempted}
              className="mt-2 w-full rounded-md bg-red-600 px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {attempted ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="size-4" /> Sign In to Back-Office
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-zinc-800/80 pt-5 text-center">
            <p className="text-[0.72rem] font-mono text-zinc-500">
              Need access? Contact your Newsroom Administrator to provision your staff credentials.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-4 text-center text-xs font-mono text-zinc-600">
        © {new Date().getFullYear()} Forbes Germany Media Group • Secure Back-Office Studio
      </footer>
    </div>
  );
}
