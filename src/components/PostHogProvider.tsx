'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (posthogKey && !(posthog as typeof posthog & { __loaded?: boolean }).__loaded) {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      autocapture: true,
      capture_pageleave: true,
      enable_heatmaps: true,
      person_profiles: 'always',
      capture_pageview: false, // handled by SuspensePostHogPageView
      request_batching: false,
      loaded: (ph) => {
        ph.capture("posthog_client_loaded", {
          site_domain: window.location.hostname,
          site_path: window.location.pathname,
        });
      },
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: {
          password: true,
          email: true,
          tel: true,
        },
        maskCapturedNetworkRequestFn: (request) => {
          if (request.name) {
            request.name = request.name.replace(/([?&](token|auth|email|phone|ssn)=)[^&]+/gi, '$1[REDACTED]');
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
