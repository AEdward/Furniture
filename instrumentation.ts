// Next.js server-startup hook (stable since Next 14, no config flag
// needed) — the one place to initialize something once when the
// server process starts, regardless of which route handles the first
// request. Only used for error monitoring today; guarded to the
// Node.js runtime since Sentry's Node SDK doesn't run on the Edge
// runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initErrorMonitoring } = await import("@/lib/error-monitoring");
    initErrorMonitoring();
  }
}
