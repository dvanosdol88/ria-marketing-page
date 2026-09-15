import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryEvent } from "./src/lib/telemetryPrivacy";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: false,
  tracesSampleRate: 0.2,
  beforeSend: sanitizeSentryEvent,
  beforeSendTransaction: sanitizeSentryEvent,
  environment: process.env.NODE_ENV || "development",
  enabled: process.env.NODE_ENV === "production",
});
