import * as Sentry from "@sentry/node";

// Error monitoring, gated behind SENTRY_DSN exactly like Chapa is gated
// behind CHAPA_SECRET_KEY or email behind SMTP_HOST — unset, this is a
// complete no-op and nothing behaves any differently. Initialized once
// from instrumentation.ts's register() when the server starts.
//
// Rather than adding a captureError() call to every one of this app's
// ~40 API route catch blocks (which all already do `console.error(err)`
// as their final fallback for the unexpected-error case), this patches
// console.error itself to also forward Error objects to Sentry — every
// existing and future console.error(err) call site gets coverage for
// free. Unhandled rejections/exceptions are caught directly too, so a
// bug that breaks checkout or payment confirmation shows up here
// instead of only surfacing when a customer complains.
let initialized = false;

export function initErrorMonitoring(): void {
  if (initialized) return;
  initialized = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });

  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    originalConsoleError(...args);
    const err = args.find((a): a is Error => a instanceof Error);
    if (err) {
      Sentry.captureException(err);
    } else {
      Sentry.captureMessage(args.map((a) => String(a)).join(" "));
    }
  };

  process.on("unhandledRejection", (reason) => {
    Sentry.captureException(reason);
  });
  process.on("uncaughtException", (err) => {
    Sentry.captureException(err);
  });
}
