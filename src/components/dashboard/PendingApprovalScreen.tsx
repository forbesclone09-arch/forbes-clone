import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Clock, RefreshCw, LogOut } from "lucide-react";

import { siteName } from "@/data/content";
import { supabase } from "@/lib/supabase";

export function PendingApprovalScreen({
  session,
  onRefresh,
}: {
  session: any;
  onRefresh: () => void;
}) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await onRefresh();
    setTimeout(() => setChecking(false), 500);
  };

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 py-16 sm:px-8">
      <div className="border border-rule bg-background p-8 sm:p-12 shadow-sm text-center rounded-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-6">
          <Clock className="h-8 w-8" />
        </div>

        <p className="kicker text-amber-600">Contributor Verification</p>
        <h1 className="headline mt-2 text-[2rem] sm:text-[2.4rem] text-foreground">
          Account Pending Approval
        </h1>

        <p className="mt-4 text-[0.98rem] leading-relaxed text-ink-soft max-w-xl mx-auto">
          Thank you for joining <strong>{siteName}</strong>. Your author registration is currently awaiting review by our editorial administration. Once approved, you will have immediate access to draft, pitch, and publish stories.
        </p>

        <div className="mt-8 mx-auto max-w-md bg-secondary/40 border border-rule p-4 text-left space-y-2 text-[0.85rem] rounded-lg">
          <div className="flex justify-between">
            <span className="text-ink-soft">Registered Account:</span>
            <span className="font-semibold text-foreground">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Current Status:</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-600">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              Awaiting Admin Approval
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleCheck}
            disabled={checking}
            className="flex items-center gap-2 bg-foreground px-6 py-3 text-[0.8rem] font-semibold uppercase tracking-wider text-background hover:bg-brand disabled:opacity-50 transition-colors rounded"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking Status..." : "Check Status"}
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/author-login" });
            }}
            className="flex items-center gap-2 border border-rule px-6 py-3 text-[0.8rem] font-semibold uppercase tracking-wider hover:bg-secondary transition-colors rounded"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
