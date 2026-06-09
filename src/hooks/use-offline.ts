import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Hook to detect and monitor online/offline status.
 * Shows toast notifications when connection is lost or restored.
 */
export function useOfflineDetector() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online", { duration: 3000 });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You're offline. Some features may not work.", { duration: 5000 });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
