import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/usmanfarhat@outlook.com";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(1, "Please add a subject").max(150),
  message: z.string().trim().min(5, "Please add a brief message").max(4000),
});

type Props = {
  defaultSubject?: string;
  defaultMessage?: string;
  context?: Record<string, string>;
};

export function ContactForm({ defaultSubject = "", defaultMessage = "", context }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState(defaultMessage);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountedAt = useRef<number>(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    setSubject(defaultSubject);
    setMessage(defaultMessage);
  }, [defaultSubject, defaultMessage]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Anti-spam: honeypot must stay empty + form must be alive for >1.5s
    if (honeypotRef.current?.value) return;
    if (Date.now() - mountedAt.current < 1500) {
      toast.error("Please take a moment before submitting.");
      return;
    }

    const parsed = schema.safeParse({ name, email, subject, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }

    setSubmitting(true);
    try {
      const contextLines = context
        ? Object.entries(context)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n")
        : "";
      const fullMessage = contextLines
        ? `${parsed.data.message}\n\n— Context —\n${contextLines}`
        : parsed.data.message;

      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          _subject: `[CourtLinks] ${parsed.data.subject}`,
          _replyto: parsed.data.email,
          _captcha: "true",
          _template: "table",
          message: fullMessage,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSubmitted(true);
      toast.success("Thanks — your message has been sent.");
      setName("");
      setEmail("");
      setSubject(defaultSubject);
      setMessage(defaultMessage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg ring-1 ring-black/5 bg-white p-6 text-center">
        <h3 className="font-serif text-2xl mb-2">Message sent</h3>
        <p className="text-sm text-brand-muted">
          We'll review it shortly. Thanks for helping keep CourtLinks accurate.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* honeypot — hidden from humans */}
      <input
        ref={honeypotRef}
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] w-0 h-0 opacity-0"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cf-name">Your name</Label>
          <Input
            id="cf-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="cf-email">Email</Label>
          <Input
            id="cf-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="cf-subject">Subject</Label>
        <Input
          id="cf-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={150}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="cf-message">Message</Label>
        <Textarea
          id="cf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={4000}
          required
          rows={6}
          className="mt-1"
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Send message"}
      </Button>
      <p className="text-xs text-brand-muted">
        Protected by a honeypot and reCAPTCHA. We'll only use your email to respond.
      </p>
    </form>
  );
}
