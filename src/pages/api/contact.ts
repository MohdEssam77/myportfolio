import type { APIRoute } from "astro";
import { Resend } from "resend";
import { SITE_CONTENT } from "@config";

// Run this route as a serverless function (not prerendered) so the
// RESEND_API_KEY stays server-side and never reaches the browser.
export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

// Where contact messages are delivered. Single source of truth = site config.
const TO_EMAIL = SITE_CONTENT.hero.email;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.RESEND_API_KEY) {
    return json({ success: false, message: "Email service is not configured." }, 500);
  }

  const formData = await request.formData();
  const firstName = formData.get("firstName")?.toString().trim() ?? "";
  const lastName = formData.get("lastName")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const phone = formData.get("phone")?.toString().trim() ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";

  if (!firstName || !lastName || !email || !message) {
    return json({ success: false, message: "Please fill in all required fields." }, 400);
  }

  const fullName = `${firstName} ${lastName}`;

  try {
    const { error } = await resend.emails.send({
      // `onboarding@resend.dev` works without verifying a domain, as long as
      // TO_EMAIL is the address on your Resend account. Swap for an address on
      // your own verified domain later if you want.
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [TO_EMAIL],
      replyTo: email,
      subject: `New contact form submission from ${fullName}`,
      text: [
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);
      return json({ success: false, message: "Failed to send message." }, 502);
    }

    return json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return json({ success: false, message: "Something went wrong." }, 500);
  }
};
