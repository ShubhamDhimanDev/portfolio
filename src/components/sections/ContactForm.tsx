import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRecaptchaV3 } from "@/hooks/useRecaptchaV3";
import { ApiError } from "@/lib/api-client";
import { submitContactMessage } from "@/lib/contact-api";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

// Must match RECAPTCHA_ACTION in api/endpoints/send-contact-message.php.
const RECAPTCHA_ACTION = "contact_form_submit";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const executeRecaptcha = useRecaptchaV3(RECAPTCHA_SITE_KEY);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const captchaToken = await executeRecaptcha(RECAPTCHA_ACTION);
      const res = await submitContactMessage({ name, email, phone: phone || undefined, message, captchaToken });
      setStatus({ type: "success", message: res.message });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof ApiError ? err.message : "Could not send your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 text-left">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          required
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
      </div>
      <input
        type="tel"
        placeholder="Phone (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputClasses}
      />
      <textarea
        required
        rows={5}
        placeholder="What are you looking to build?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={inputClasses}
      />

      {status && (
        <p className={status.type === "success" ? "text-sm text-signal" : "text-sm text-red-400"}>
          {status.message}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <Button type="submit" disabled={isSubmitting} icon={Send} className="w-fit">
          {isSubmitting ? "Sending..." : "Send message"}
        </Button>
        {RECAPTCHA_SITE_KEY && (
          <p className="text-xs text-subtle">
            This site is protected by reCAPTCHA and the Google{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-muted">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-muted">
              Terms of Service
            </a>{" "}
            apply.
          </p>
        )}
      </div>
    </form>
  );
}
