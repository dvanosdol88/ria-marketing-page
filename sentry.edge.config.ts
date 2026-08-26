import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryEvent } from "./src/lib/telemetryPrivacy";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
  sendDefaultPii: false,
  beforeSend: sanitizeSentryEvent,
  beforeSendTransaction: sanitizeSentryEvent,
  beforeBreadcrumb: sanitizeSentryEvent,
  environment: process.env.NODE_ENV || "development",
  enabled: process.env.NODE_ENV === "production",
});
