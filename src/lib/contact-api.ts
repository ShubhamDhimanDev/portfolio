import { api } from "@/lib/api-client";

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  captchaToken: string;
}

/**
 * Public contact-form submission. Hits the flat api/endpoints/send-contact-message.php
 * script directly (not the resource-style /api/admin/... routes) - same
 * pattern as the pre-existing lead-mail endpoints.
 */
export function submitContactMessage(payload: ContactMessagePayload) {
  return api.post<{ ok: true; message: string }>("/endpoints/send-contact-message.php", {
    ...payload,
    source: "contact-section",
  });
}
