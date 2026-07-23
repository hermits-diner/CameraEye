import nodemailer, { type Transporter } from "nodemailer";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@workspace/commerce";
import { logger } from "./logger";

/**
 * Mail delivery. Uses SMTP when SMTP_HOST is configured; otherwise every
 * message is logged so local/dev environments keep working end to end.
 *
 * Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAILS
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === "465",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

const FROM = () => process.env.SMTP_FROM ?? "CameraEye <no-reply@cameraeye.studio>";

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    logger.info(
      { to: options.to, subject: options.subject, body: options.text },
      "SMTP not configured — email logged instead of sent",
    );
    return;
  }
  try {
    await transport.sendMail({ from: FROM(), ...options });
  } catch (err) {
    // Email must never break the main flow.
    logger.error({ err, to: options.to, subject: options.subject }, "sendMail failed");
  }
}

interface OrderEmailData {
  orderNumber: string;
  name: string;
  email: string;
  total: number;
  currency: string;
  items: { title: string; sizeId?: string | null; quantity: number; unitPrice: number }[];
  downloads?: { title: string; token: string }[];
}

const won = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

function itemLines(items: OrderEmailData["items"]): string {
  return items
    .map(
      (i) =>
        `  - ${i.title}${i.sizeId ? ` (${i.sizeId.toUpperCase()})` : ""} × ${i.quantity} — ${won(i.unitPrice * i.quantity)}`,
    )
    .join("\n");
}

function downloadBaseUrl(): string {
  return process.env.PUBLIC_SITE_URL ?? "http://localhost:5000";
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const downloadSection = data.downloads?.length
    ? `\n\nYour digital downloads:\n${data.downloads
        .map((d) => `  - ${d.title}: ${downloadBaseUrl()}/downloads/${d.token}`)
        .join("\n")}\n\nEach link allows a limited number of downloads and expires in 7 days.`
    : "";

  await sendMail({
    to: data.email,
    subject: `[CameraEye] Order ${data.orderNumber} received`,
    text: `Hello ${data.name},

Thank you for your order. We have received it and will confirm it shortly.

Order ${data.orderNumber}
${itemLines(data.items)}
Total: ${won(data.total)}${downloadSection}

— CameraEye Studio`,
  });

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  for (const admin of adminEmails) {
    await sendMail({
      to: admin,
      subject: `[CameraEye] New order ${data.orderNumber}`,
      text: `New order from ${data.name} <${data.email}>

Order ${data.orderNumber}
${itemLines(data.items)}
Total: ${won(data.total)}`,
    });
  }
}

export async function sendOrderStatusUpdate(data: {
  orderNumber: string;
  name: string;
  email: string;
  status: OrderStatus;
  trackingNumber?: string | null;
}): Promise<void> {
  const label = ORDER_STATUS_LABELS[data.status];
  const tracking = data.trackingNumber
    ? `\nTracking number: ${data.trackingNumber}`
    : "";
  await sendMail({
    to: data.email,
    subject: `[CameraEye] Order ${data.orderNumber} — ${label.en}`,
    text: `Hello ${data.name},

Your order ${data.orderNumber} is now: ${label.en} (${label.ko})${tracking}

— CameraEye Studio`,
  });
}

export async function sendNewsletterWelcome(email: string): Promise<void> {
  await sendMail({
    to: email,
    subject: "[CameraEye] Welcome to the studio newsletter",
    text: `Thank you for subscribing.

You'll receive occasional notes about new work, print releases and exhibitions. You can unsubscribe at any time by replying to any newsletter email.

— CameraEye Studio`,
  });
}
