export const SELF_TEST_QUERY_PARAM = "selftest";
export const SELF_TEST_STORAGE_KEY = "sww_self_test";
export const SELF_TEST_COOKIE_NAME = "yapt_selftest";
export const SELF_TEST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function readSelfTestQueryValue(
  search: string | URLSearchParams,
): "1" | "0" | null {
  const searchParams =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const value = searchParams.get(SELF_TEST_QUERY_PARAM)?.trim().toLowerCase();
  if (value === "1" || value === "true") return "1";
  if (value === "0" || value === "false") return "0";
  return null;
}

export function hasSelfTestCookie(cookieHeader: string) {
  return cookieHeader.split(";").some((part) => {
    const [name, ...rest] = part.split("=");
    return (
      name.trim() === SELF_TEST_COOKIE_NAME && rest.join("=").trim() === "1"
    );
  });
}

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

export function persistSelfTestEnabled() {
  if (!canUseBrowserStorage()) return;
  try {
    window.localStorage.setItem(SELF_TEST_STORAGE_KEY, "true");
  } catch {
    // Cookie persistence still covers later same-browser visits.
  }
  document.cookie = `${SELF_TEST_COOKIE_NAME}=1; Path=/; Max-Age=${SELF_TEST_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearSelfTestEnabled() {
  if (!canUseBrowserStorage()) return;
  try {
    window.localStorage.removeItem(SELF_TEST_STORAGE_KEY);
  } catch {
    // Continue clearing the cookie even if storage is blocked.
  }
  document.cookie = `${SELF_TEST_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function hasPersistedSelfTestFlag() {
  if (!canUseBrowserStorage()) return false;
  try {
    if (window.localStorage.getItem(SELF_TEST_STORAGE_KEY) === "true") {
      return true;
    }
  } catch {
    // Fall through to the cookie.
  }
  return hasSelfTestCookie(document.cookie);
}

export function syncSelfTestFromSearch(search: string | URLSearchParams) {
  const queryValue = readSelfTestQueryValue(search);
  if (queryValue === "1") persistSelfTestEnabled();
  if (queryValue === "0") clearSelfTestEnabled();
  return queryValue === "1" || (queryValue !== "0" && hasPersistedSelfTestFlag());
}

export function shouldExcludePublicTraffic(search?: string | URLSearchParams) {
  if (search !== undefined) {
    return syncSelfTestFromSearch(search);
  }
  return hasPersistedSelfTestFlag();
}
