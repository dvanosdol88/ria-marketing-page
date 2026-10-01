'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import {
  sanitizePostHogCaptureResult,
  sanitizePostHogNetworkRequest,
} from '@/lib/telemetryPrivacy'

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const analyticsContractTest =
    process.env.NEXT_PUBLIC_POSTHOG_TEST_MODE === "true";

  if (posthogKey && !(posthog as typeof posthog & { __loaded?: boolean }).__loaded) {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      autocapture: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      before_send: sanitizePostHogCaptureResult,
      capture_pageleave: true,
      enable_heatmaps: true,
      person_profiles: 'always',
      capture_pageview: false, // handled by SuspensePostHogPageView
      request_batching: false,
      advanced_disable_flags: analyticsContractTest,
      disable_external_dependency_loading: analyticsContractTest,
      opt_out_useragent_filter: analyticsContractTest,
      loaded: (ph) => {
        ph.capture("posthog_client_loaded", {
          site_domain: window.location.hostname,
          site_path: window.location.pathname,
        });
      },
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "*",
        maskCapturedNetworkRequestFn: sanitizePostHogNetworkRequest,
      },
    })
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>
}
