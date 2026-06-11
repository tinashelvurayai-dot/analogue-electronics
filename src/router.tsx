import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { routeTree } from "./routeTree.gen";
import type { ReactNode } from "react";

function AppProviders({ children, queryClient }: { children: ReactNode; queryClient: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster richColors theme="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    Wrap: ({ children }) => <AppProviders queryClient={queryClient}>{children}</AppProviders>,
  });

  return router;
};
