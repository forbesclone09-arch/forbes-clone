import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { getUserRoleAndApproval } from "@/components/dashboard/shared";

export const Route = createFileRoute("/dashboard")({
  staticData: { sitemap: false },
  component: DashboardRouter,
});

function DashboardRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate({ to: "/author-login" });
      } else {
        const { isAdmin } = await getUserRoleAndApproval(session.user.id, session.user.email);
        if (isAdmin) {
          navigate({ to: "/admin-dashboard" });
        } else {
          navigate({ to: "/author-dashboard" });
        }
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="flex items-center gap-3">
        <div className="size-5 animate-spin rounded-full border-2 border-red-500 border-t-zinc-100" />
        <span className="text-sm tracking-wider uppercase font-mono text-zinc-400">Directing to your newsroom portal...</span>
      </div>
    </div>
  );
}
