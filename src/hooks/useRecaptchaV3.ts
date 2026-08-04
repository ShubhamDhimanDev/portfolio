import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SCRIPT_ID = "grecaptcha-v3-script";
let scriptLoadingPromise: Promise<void> | null = null;

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (window.grecaptcha) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * reCAPTCHA v3 is invisible - no checkbox/widget. Call the returned
 * execute(action) right before a form submit to mint a fresh, single-use
 * token scoped to that action; the backend verifies it (score + matching
 * action) via api/lib/recaptcha.php. Returns "" when siteKey is unset
 * (local dev without keys), matching the backend's skip-if-unconfigured
 * behavior.
 */
export function useRecaptchaV3(siteKey: string | undefined) {
  const readyRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    readyRef.current = loadRecaptchaScript(siteKey);
  }, [siteKey]);

  return useCallback(
    async (action: string): Promise<string> => {
      if (!siteKey) return "";

      await (readyRef.current ?? loadRecaptchaScript(siteKey));

      return new Promise((resolve, reject) => {
        window.grecaptcha!.ready(() => {
          window
            .grecaptcha!.execute(siteKey, { action })
            .then(resolve)
            .catch((err: unknown) => reject(err));
        });
      });
    },
    [siteKey],
  );
}
