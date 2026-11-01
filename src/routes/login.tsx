import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect public /login visits directly to home page to keep back-office entrance secret
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
