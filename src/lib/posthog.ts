export type PostHogProperties = Record<string, unknown>;

type BrowserPostHog = {
  capture?: (eventName: string, properties?: PostHogProperties) => void;
  register?: (properties: PostHogProperties) => void;
  register_once?: (properties: PostHogProperties) => void;
};

function getBrowserPostHog() {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { posthog?: BrowserPostHog }).posthog;
}

export function capturePostHogEvent(eventName: string, properties: PostHogProperties = {}) {
  if (typeof window === "undefined") return;
  getBrowserPostHog()?.capture?.(eventName, {
    site_domain: window.location.hostname,
    site_path: window.location.pathname,
    ...properties,
  });
}

export function registerPostHogProperties(properties: PostHogProperties) {
  getBrowserPostHog()?.register?.(properties);
}

export function registerPostHogPropertiesOnce(properties: PostHogProperties) {
  getBrowserPostHog()?.register_once?.(properties);
}
