'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) return;

    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      autocapture: true,
      capture_pageleave: true,
      enable_heatmaps: true,
      person_profiles: 'identified_only',
      capture_pageview: false, // handled by SuspensePostHogPageView
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
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
