'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { capturePostHogEvent } from "@/lib/posthog";

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.location.origin + pathname
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
      capturePostHogEvent('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams])

  return null
}
