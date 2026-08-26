'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { capturePostHogEvent } from "@/lib/posthog";
import { sanitizeAnalyticsUrl } from "@/lib/telemetryPrivacy";

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.location.origin + pathname
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
      capturePostHogEvent('$pageview', {
        $current_url: sanitizeAnalyticsUrl(url),
      })
    }
  }, [pathname, searchParams])

  return null
}
