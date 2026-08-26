'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import {
  sanitizeAnalyticsUrl,
  sanitizePostHogCaptureResult,
} from '@/lib/telemetryPrivacy'

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (posthogKey && !(posthog as typeof posthog & { __loaded?: boolean }).__loaded) {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      autocapture: true,
      capture_pageleave: true,
      enable_heatmaps: true,
      person_profiles: 'always',
      // Campaign properties are registered from the shared five-key contract.
      // Do not let the SDK persist additional click IDs or arbitrary query data.
      save_campaign_params: false,
      // Replay frames can contain link attributes before ordinary event hooks
      // run, so keep recording off while protected onboarding URLs are in use.
      disable_session_recording: true,
      capture_pageview: false, // handled by SuspensePostHogPageView
      request_batching: false,
      before_send: sanitizePostHogCaptureResult,
      loaded: (ph) => {
        ph.capture("posthog_client_loaded", {
          site_domain: window.location.hostname,
          site_path: window.location.pathname,
        });
      },
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
          email: true,
          tel: true,
        },
        maskCapturedNetworkRequestFn: (request) => {
          if (request.name) {
            request.name = sanitizeAnalyticsUrl(request.name);
          }
          return request;
        },
      },
    })
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>
}
