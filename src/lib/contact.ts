export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

/**
 * STUB: nothing is sent yet.
 * TODO: wire to real email/API (e.g. a route handler or server action).
 */
export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  void payload;
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
