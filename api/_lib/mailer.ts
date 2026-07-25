/* ============================================================
   VALEUM — ENVÍO DE CORREO (SMTP Google Workspace)
   ============================================================ */
import nodemailer, { type Transporter } from "nodemailer";
import { optionalEnv, requireEnv } from "./env";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(optionalEnv("SMTP_PORT", "465"));
    transporter = nodemailer.createTransport({
      host: optionalEnv("SMTP_HOST", "smtp.gmail.com"),
      port,
      secure: port === 465,
      auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASS") },
    });
  }
  return transporter;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendMail({ to, subject, html, text, replyTo }: MailInput): Promise<void> {
  await getTransporter().sendMail({
    from: optionalEnv("MAIL_FROM") || requireEnv("SMTP_USER"),
    to,
    subject,
    html,
    text,
    replyTo,
  });
}
