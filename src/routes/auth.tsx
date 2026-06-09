import { createFileRoute, Navigate } from "@tanstack/react-router";

// Legacy redirect — auth page renamed to /sign-in
export const Route = createFileRoute("/auth")({
  component: () => <Navigate to="/sign-in" />,
});
