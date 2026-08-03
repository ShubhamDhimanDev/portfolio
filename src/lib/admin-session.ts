/** Mutable holder for the admin session's CSRF token, read by api-client.ts on every mutating request. */

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}
