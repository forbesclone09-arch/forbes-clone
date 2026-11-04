import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/privatelogin")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/private-admin-login" });
  },
  component: () => null,
});
