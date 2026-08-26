import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryEvent } from "@/lib/telemetryPrivacy";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: false,

  // 100% in dev, 10% in production
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Replay metadata includes the browser URL before event hooks can rewrite
  // every rrweb frame. Keep error monitoring, but do not send replay payloads
  // now that onboarding URLs may carry protected one-time state.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  enableLogs: true,

  beforeSend: sanitizeSentryEvent,
  beforeSendTransaction: sanitizeSentryEvent,
  beforeBreadcrumb: sanitizeSentryEvent,
});

// Hook into App Router navigation transitions (App Router only)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
