"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { capturePostHogEvent, initializeDocumentCampaign, registerPostHogProperties } from "@/lib/posthog";
import { MEASUREMENT_VERSION, landingEvidence, resolveLanding } from "@/lib/qrLanding";
import { browserIsAutomated, claimQrEvent, currentDocumentLandingUrl, reportDocumentMeasurement } from "@/lib/qrMeasurementBrowser";
import { exitQrVerification, syncQrVerification } from "@/lib/qrVerification";
import { shouldExcludePublicTraffic } from "@/lib/selfTestTraffic";

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [verification, setVerification] = useState(false);
  useEffect(() => {
    if (!pathname) return;
    const arriving = currentDocumentLandingUrl();
    initializeDocumentCampaign(arriving);
    const testMode = syncQrVerification();
    setVerification(testMode);
    const owner = shouldExcludePublicTraffic(searchParams);
    registerPostHogProperties({ self_test: owner || testMode, qr_verification: testMode });
    capturePostHogEvent("$pageview", {
      $current_url: `${window.location.origin}${pathname}${searchParams.size ? `?${searchParams}` : ""}`,
      ...(owner || testMode ? { self_test: true } : {}),
      ...(testMode ? { qr_verification: true } : {}),
    });
    if (browserIsAutomated()) return;
    void reportDocumentMeasurement().then((receipt) => {
      if (!receipt || !claimQrEvent(receipt)) return;
      const attributionMethod = resolveLanding(landingEvidence(arriving)).attributionMethod;
      capturePostHogEvent("eddm_qr_landed", {
        $current_url: arriving, scan_kind: "mailer_qr_landing",
        campaign_attribution_method: attributionMethod, is_eddm_visitor: true,
        legacy_eddm_qr: attributionMethod === "legacy_qr_signature",
        measurement_version: MEASUREMENT_VERSION, qr_opening_id: receipt.qrOpeningId,
        qr_first_browser: receipt.qrFirstBrowser, qr_verification: receipt.verification,
        ...(receipt.verification ? { self_test: true } : {}),
      });
    });
    const url = new URL(window.location.href);
    if (url.searchParams.has("qrtest") || url.searchParams.has("selftest")) {
      url.searchParams.delete("qrtest"); url.searchParams.delete("selftest");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [pathname, searchParams]);
  if (!verification) return null;
  return <aside role="status" aria-label="QR verification mode" className="fixed bottom-3 left-3 right-3 z-[100] flex items-center justify-between gap-3 rounded-xl border border-amber-700 bg-amber-50 px-3 py-2 text-sm text-amber-950 shadow-lg sm:left-auto sm:max-w-sm">
    <span><strong>QR test mode</strong><br />Your visits stay out of prospect totals.</span>
    <button type="button" className="min-h-11 shrink-0 rounded-lg border border-amber-800 px-3 font-semibold focus-visible:outline focus-visible:outline-2" onClick={() => { exitQrVerification(); registerPostHogProperties({ self_test: shouldExcludePublicTraffic(), qr_verification: false }); setVerification(false); }}>Exit test</button>
  </aside>;
}
