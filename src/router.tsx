import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { routeTree } from "./routeTree.gen";

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors theme="dark" />
    </AuthProvider>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    Wrap: ({ children }) => <AppProviders>{children}</AppProviders>,
  });

  return router;
};
