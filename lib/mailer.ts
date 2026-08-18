import nodemailer from "nodemailer";

// Transactional email, gated behind SMTP_* env vars exactly like Chapa
// is gated behind CHAPA_SECRET_KEY — unset, sendEmail is a silent no-op
// (logged, not thrown) so nothing that triggers an email (placing an
// order, changing its status, a contact form submission) ever breaks
// because email isn't configured yet.
let transporter: ReturnType<typeof nodemailer.createTransport> | null | undefined;

function getTransporter(): ReturnType<typeof nodemailer.createTransport> | null {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) {
    transporter = null;
    return null;
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.log(`[mailer] SMTP not configured — skipping "${input.subject}" to ${input.to}`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  try {
    await t.sendMail({ from, to: input.to, subject: input.subject, html: input.html, text: input.text });
  } catch (err) {
    // Never let a failed email break the order/contact flow that triggered it.
    console.error("[mailer] Failed to send email:", err);
  }
}
