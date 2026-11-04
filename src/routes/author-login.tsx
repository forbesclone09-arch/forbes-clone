import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PenLine, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";

import { siteName } from "@/data/content";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/author-login")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: `Author & Journalist Login — ${siteName}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthorLoginPage,
});

function AuthorLoginPage() {
  const navigate = useNavigate();
  const [attempted, setAttempted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/author-dashboard" });
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
        navigate({ to: "/author-dashboard" });
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
          <div className="size-5 animate-spin rounded-full border-2 border-red-500 border-t-zinc-100" />
          <span className="text-sm tracking-wider uppercase font-mono text-zinc-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0c10] text-zinc-100 selection:bg-red-600 selection:text-white w-full max-w-full overflow-x-clip">
      {/* Top micro-bar */}
      <header className="border-b border-zinc-800/80 px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="flex size-7 shrink-0 items-center justify-center bg-red-600 font-display font-black text-sm text-white rounded shadow-sm">
            F
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Forbes Germany
            </span>
            <span className="hidden sm:inline-flex text-[0.65rem] font-mono uppercase tracking-[0.2em] text-zinc-400 bg-zinc-900 border border-zinc-700/80 px-2 py-0.5 rounded whitespace-nowrap">
              Author Studio
            </span>
            <span className="sm:hidden text-[0.58rem] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-700/80 px-1.5 py-0.5 rounded font-bold shrink-0">
              Journalist
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
        <div className="w-full max-w-[440px] rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-semibold tracking-widest text-zinc-400 uppercase">
            <PenLine className="size-4 text-red-500" /> Journalist Portal
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Author Sign In
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Welcome to the Forbes Germany Newsroom. Sign in with your assigned contributor credentials to write, pitch, and manage your stories.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                Author Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="journalist@forbes.com"
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
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={attempted}
              className="mt-2 w-full rounded-md bg-zinc-100 py-2.5 text-sm font-semibold uppercase tracking-wider text-zinc-950 transition hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {attempted ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  <span>Access Author Studio</span>
                </>
              )}
            </button>
          </form>

          {/* Separation Note / Admin Switch */}
          <div className="mt-8 border-t border-zinc-800/80 pt-6 text-center">
            <p className="text-xs text-zinc-400">
              Newsroom administrator?{" "}
              <Link to="/private-admin-login" className="text-red-400 hover:text-red-300 font-semibold underline">
                Admin Sign In &rarr;
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Micro-footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-4 text-center text-xs font-mono text-zinc-500">
        Forbes Media Group — Internal Author & Contributor Studio
      </footer>
    </div>
  );
}
