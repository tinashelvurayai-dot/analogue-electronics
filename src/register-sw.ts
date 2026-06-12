import { registerSW } from "virtual:pwa-register";

const isPreviewHost = (host: string) =>
  host.startsWith("id-preview--") ||
  host.startsWith("preview--") ||
  host === "lovableproject.com" ||
  host.endsWith(".lovableproject.com") ||
  host === "lovableproject-dev.com" ||
  host.endsWith(".lovableproject-dev.com") ||
  host === "beta.lovable.dev" ||
  host.endsWith(".beta.lovable.dev");

async function unregisterAppShellWorker() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(regs.filter((reg) => new URL(reg.scope).pathname === "/").map((reg) => reg.unregister()));
}

export function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const blocked =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    isPreviewHost(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("sw") === "off";

  if (blocked) {
    void unregisterAppShellWorker();
    return;
  }

  registerSW({ immediate: true });
}