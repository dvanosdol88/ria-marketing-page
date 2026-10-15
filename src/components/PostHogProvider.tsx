'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { syncQrVerification } from '@/lib/qrVerification'
import { shouldExcludePublicTraffic } from '@/lib/selfTestTraffic'
import { getPostHogCampaignProperties, initializeDocumentCampaign } from '@/lib/posthog'

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const analyticsContractTest =
    process.env.NEXT_PUBLIC_POSTHOG_TEST_MODE === "true";

  if (posthogKey && !(posthog as typeof posthog & { __loaded?: boolean }).__loaded) {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
      autocapture: true,
      capture_pageleave: true,
      enable_heatmaps: true,
      person_profiles: 'always',
      capture_pageview: false, // handled by SuspensePostHogPageView
      request_batching: false,
      advanced_disable_flags: analyticsContractTest,
      disable_external_dependency_loading: analyticsContractTest,
      opt_out_useragent_filter: analyticsContractTest,
      before_send: (event) => {
        if (!event) return event;
        const verification = syncQrVerification() || event.properties.qr_verification === true;
        event.properties.self_test = shouldExcludePublicTraffic(window.location.search) || verification;
        event.properties.qr_verification = verification;
        return event;
      },
      loaded: (ph) => {
        initializeDocumentCampaign();
        const verification = syncQrVerification();
        ph.register({ ...getPostHogCampaignProperties(), self_test: shouldExcludePublicTraffic(window.location.search) || verification, qr_verification: verification });
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
