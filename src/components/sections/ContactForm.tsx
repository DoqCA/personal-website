"use client";

import { useState, type FormEvent } from "react";
import { contact } from "@/data/site";
import { sendContactMessage } from "@/lib/contact";

type Status = "idle" | "sending" | "success" | "error";

const field =
  "w-full rounded-lg border border-white/10 bg-black/30 px-4 text-white placeholder:text-muted transition-colors outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const { form } = contact;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    setStatus("sending");
    try {
      await sendContactMessage({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      formElement.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const sending = status === "sending";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 backdrop-blur-md md:p-8"
    >
      <label htmlFor="contact-name" className="sr-only">
        {form.nameLabel}
      </label>
      <input
        id="contact-name"
        name="name"
        type="text"
        required
        autoComplete="name"
        placeholder={form.nameLabel}
        className={`${field} h-11 md:h-10`}
      />

      <label htmlFor="contact-email" className="sr-only">
        {form.emailLabel}
      </label>
      <input
        id="contact-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder={form.emailLabel}
        className={`${field} h-11 md:h-10`}
      />

      <label htmlFor="contact-message" className="sr-only">
        {form.messageLabel}
      </label>
      <textarea
        id="contact-message"
        name="message"
        required
        rows={6}
        autoComplete="off"
        placeholder={form.messageLabel}
        className={`${field} resize-y py-3`}
      />

      <button
        type="submit"
        disabled={sending}
        className="mt-2 h-11 w-full rounded-lg bg-black font-medium text-white transition-colors outline-none hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-60 md:h-10"
      >
        {sending ? form.sending : form.submit}
      </button>

      <p aria-live="polite" className="min-h-5 text-sm text-muted">
        {status === "success" && form.success}
        {status === "error" && form.error}
      </p>
    </form>
  );
}
