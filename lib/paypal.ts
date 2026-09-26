import { CONTACT } from "@/lib/constants";

type PayPalPayOptions = {
  returnUrl?: string;
  cancelUrl?: string;
  custom?: string;
  notifyUrl?: string;
  invoice?: string;
};

/** Checkout PayPal (_xclick) — paypal.me n’envoie pas d’IPN, donc on ne l’utilise plus. */
export function paypalPayUrl(amountEur: number, itemName: string, extras: PayPalPayOptions = {}) {
  const q = new URLSearchParams({
    cmd: "_xclick",
    business: CONTACT.email,
    item_name: itemName.slice(0, 127),
    amount: amountEur.toFixed(2),
    currency_code: "EUR",
    no_shipping: "1",
    charset: "utf-8",
  });
  if (extras.custom) q.set("custom", extras.custom.slice(0, 255));
  if (extras.invoice) q.set("invoice", extras.invoice.slice(0, 127));
  if (extras.notifyUrl) q.set("notify_url", extras.notifyUrl);
  if (extras.returnUrl) q.set("return", extras.returnUrl);
  if (extras.cancelUrl) q.set("cancel_return", extras.cancelUrl);
  return `https://www.paypal.com/cgi-bin/webscr?${q.toString()}`;
}

export function publicSiteOrigin(req?: Request) {
  if (req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    if (host.includes("localhost") || host.startsWith("127.")) {
      const proto = req.headers.get("x-forwarded-proto") || "http";
      return `${proto}://${host}`;
    }
  }
  return "https://www.zen-villa.fr";
}
