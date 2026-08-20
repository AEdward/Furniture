import type { ContactMessage } from "@/lib/db";
import type { SiteSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/products";

function wrapper(siteName: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; color: #2a2420;">
      <h2 style="font-weight: 600;">${siteName}</h2>
      ${bodyHtml}
    </div>
  `;
}

type OrderConfirmationInput = {
  id: number;
  customerName: string;
  address: string;
  city: string;
  subtotal: number;
  discountAmount: number;
  items: { name: string; price: number; quantity: number; variant?: string }[];
};

export function orderConfirmationEmail(
  order: OrderConfirmationInput,
  settings: SiteSettings
): { subject: string; html: string; text: string } {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 6px 0;">${item.name}${item.variant ? ` (${item.variant})` : ""} × ${item.quantity}</td>
          <td style="padding: 6px 0; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const itemsText = order.items
    .map((item) => `- ${item.name}${item.variant ? ` (${item.variant})` : ""} × ${item.quantity}: ${formatPrice(item.price * item.quantity)}`)
    .join("\n");

  const total = Math.max(0, order.subtotal - order.discountAmount);
  const discountHtml =
    order.discountAmount > 0
      ? `<p>Discount: -${formatPrice(order.discountAmount)}</p>`
      : "";
  const discountText = order.discountAmount > 0 ? `Discount: -${formatPrice(order.discountAmount)}\n` : "";

  const subject = `Order confirmed — #${order.id}`;
  const html = wrapper(
    settings.name,
    `<p>Hi ${order.customerName},</p>
     <p>Thanks for your order! Here's a summary:</p>
     <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>
     ${discountHtml}
     <p style="font-weight: 600; margin-top: 12px;">Total: ${formatPrice(total)}</p>
     <p>Delivery to: ${order.address}, ${order.city}</p>
     <p>We'll email you again once your order ships.</p>`
  );
  const text = `Hi ${order.customerName},\n\nThanks for your order! Order #${order.id}:\n${itemsText}\n\n${discountText}Total: ${formatPrice(total)}\nDelivery to: ${order.address}, ${order.city}\n\nWe'll email you again once your order ships.`;

  return { subject, html, text };
}

type OrderStatusUpdateInput = {
  id: number;
  customerName: string;
  status: string;
};

export function orderStatusUpdateEmail(
  order: OrderStatusUpdateInput,
  settings: SiteSettings
): { subject: string; html: string; text: string } {
  const subject = `Order #${order.id} update: ${order.status}`;
  const html = wrapper(
    settings.name,
    `<p>Hi ${order.customerName},</p>
     <p>Your order #${order.id} status has been updated to: <strong>${order.status}</strong>.</p>`
  );
  const text = `Hi ${order.customerName},\n\nYour order #${order.id} status has been updated to: ${order.status}.`;

  return { subject, html, text };
}

export function backInStockEmail(
  productName: string,
  productUrl: string,
  settings: SiteSettings
): { subject: string; html: string; text: string } {
  const subject = `Back in stock: ${productName}`;
  const html = wrapper(
    settings.name,
    `<p>Good news — <strong>${productName}</strong> is back in stock.</p>
     <p><a href="${productUrl}">View it here</a> before it sells out again.</p>`
  );
  const text = `Good news — ${productName} is back in stock.\n\nView it here: ${productUrl}`;

  return { subject, html, text };
}

export function otpEmail(
  purpose: "password_reset" | "email_change",
  code: string,
  settings: SiteSettings
): { subject: string; html: string; text: string } {
  const label = purpose === "password_reset" ? "Reset your password" : "Confirm your new email";
  const explain =
    purpose === "password_reset"
      ? "Use this code to reset your password. It expires in 10 minutes."
      : "Use this code to confirm your new email address. It expires in 10 minutes.";
  const subject = `${label} — your verification code`;
  const html = wrapper(
    settings.name,
    `<p>${explain}</p>
     <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">${code}</p>
     <p style="color: #7a7268; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>`
  );
  const text = `${explain}\n\nYour code: ${code}\n\nIf you didn't request this, you can safely ignore this email.`;

  return { subject, html, text };
}

export function contactNotificationEmail(
  message: ContactMessage,
  settings: SiteSettings
): { subject: string; html: string; text: string } {
  const subject = `New contact form message from ${message.name}`;
  const html = wrapper(
    settings.name,
    `<p>New message from the contact form:</p>
     <p><strong>${message.name}</strong> — ${message.email}</p>
     <p style="white-space: pre-wrap;">${message.message}</p>`
  );
  const text = `New message from the contact form:\n\n${message.name} (${message.email})\n\n${message.message}`;

  return { subject, html, text };
}
