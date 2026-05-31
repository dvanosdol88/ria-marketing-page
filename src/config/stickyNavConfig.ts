/**
 * Shared measurements and motion for the mobile sticky section bars
 * (ProgressiveStickyBar SectionSegments + ProofSectionProgressCue).
 */
export const DESKTOP_COLLAPSED_SITE_NAV_HEIGHT = 52;
export const MOBILE_COLLAPSED_SITE_NAV_HEIGHT = 58;
export const STICKY_BAR_HEIGHT = 40;
export const SCROLL_SPY_BUFFER = 18;

export const STICKY_BAR_OPACITY_MS = 300;

export const STICKY_SECTION_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

export function getCollapsedSiteNavHeight(isMobile = isMobileViewport()): number {
  return isMobile ? MOBILE_COLLAPSED_SITE_NAV_HEIGHT : DESKTOP_COLLAPSED_SITE_NAV_HEIGHT;
}

/** Top edge of the sticky stack (SiteNav + section bar). */
export function getStickyStackHeight(isMobile = isMobileViewport()): number {
  return getCollapsedSiteNavHeight(isMobile) + STICKY_BAR_HEIGHT;
}

/** Viewport Y used to decide which pillar section is "current". */
export function getStickyScrollTriggerY(isMobile = isMobileViewport()): number {
  return getStickyStackHeight(isMobile) + SCROLL_SPY_BUFFER;
}

/**
 * Scroll-spy: last section (document order) whose top has crossed the trigger.
 * Survives gaps between sections (e.g. #advisor-proof between Upgrade and Improve).
 */
export function resolveActiveSection(
  sectionIds: readonly string[],
  triggerY: number,
  fallback: string
): string {
  for (let i = sectionIds.length - 1; i >= 0; i -= 1) {
    const element = document.getElementById(sectionIds[i]!);
    if (!element) continue;
    if (element.getBoundingClientRect().top <= triggerY) {
      return sectionIds[i]!;
    }
  }
  return fallback;
}
