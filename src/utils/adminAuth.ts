// Admin login for the /admin pages.
//
// The admin API uses HTTP Basic auth. The username and password are typed in by
// the admin on the page and kept in sessionStorage for this browser tab only,
// so they are never part of the site's public JavaScript.

const STORAGE_KEY = 'ozvfy_admin_auth';
export const ADMIN_AUTH_EVENT = 'admin-auth-changed';

// Fallback for browsers that block sessionStorage
let memoryHeader: string | null = null;

export function getAdminAuthHeader(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveAdminLogin(username: string, password: string) {
  // btoa only takes Latin-1, so encode the text as UTF-8 first
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  const header = 'Basic ' + btoa(String.fromCharCode(...bytes));
  try {
    sessionStorage.setItem(STORAGE_KEY, header);
  } catch {
    // Storage blocked: the login lasts until the page is reloaded
    memoryHeader = header;
  }
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
}

export function clearAdminLogin() {
  memoryHeader = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // nothing stored
  }
  window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
}

/** Headers for an admin API request: `extra` plus the stored login. */
export function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const header = getAdminAuthHeader() ?? memoryHeader;
  return header ? { ...extra, Authorization: header } : extra;
}

export function hasAdminLogin(): boolean {
  return (getAdminAuthHeader() ?? memoryHeader) !== null;
}

/** Call with every admin API response: a 401 means the login is wrong, so ask again. */
export function checkAdminResponse(res: Response): Response {
  if (res.status === 401) clearAdminLogin();
  return res;
}
