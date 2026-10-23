'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { isBluesHostname } from '@/lib/bluesHost'
import { syncQrVerification } from '@/lib/qrVerification'
import { shouldExcludePublicTraffic } from '@/lib/selfTestTraffic'
import { getPostHogCampaignProperties, initializeDocumentCampaign } from '@/lib/posthog'

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const analyticsContractTest =
    process.env.NEXT_PUBLIC_POSTHOG_TEST_MODE === "true";

  if (posthogKey && !(posthog as typeof posthog & { __loaded?: boolean }).__loaded) {
    // 05-51: a browser marked as David's own (?selftest=1, cleared by ?selftest=0) is never
    // recorded; its events still carry self_test=true and are filtered from dashboards.
    const ownerBrowser = shouldExcludePublicTraffic(window.location.search);
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
        const onBlues = isBluesHostname(window.location.hostname);
        const verification = (onBlues ? false : syncQrVerification()) || event.properties.qr_verification === true;
        event.properties.self_test = shouldExcludePublicTraffic(window.location.search) || verification;
        event.properties.qr_verification = verification;
        return event;
      },
      loaded: (ph) => {
        initializeDocumentCampaign();
        const onBlues = isBluesHostname(window.location.hostname);
        const verification = onBlues ? false : syncQrVerification();
        ph.register({ ...getPostHogCampaignProperties(), self_test: shouldExcludePublicTraffic(window.location.search) || verification, qr_verification: verification });
        // 05-51: the project's "filter test accounts" cohort keys on this person property.
        if (ownerBrowser || verification) ph.setPersonProperties({ $internal_or_test_user: true });
        ph.capture("posthog_client_loaded", {
          site_domain: window.location.hostname,
          site_path: window.location.pathname,
        });
      },
      // 05-51: session recordings are on for this site (David, 2026-10-13). Every typed
      // field is masked so recordings never show what a visitor enters.
      disable_session_recording: ownerBrowser,
      session_recording: {
        maskAllInputs: true,
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
