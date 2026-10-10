"use client";

import emailjs from "@emailjs/browser"

const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export async function sendContactMessage(form: HTMLFormElement) {
  return emailjs.sendForm(
    serviceID,
    templateID,
    form,
    { publicKey: publicKey}
  )
}
