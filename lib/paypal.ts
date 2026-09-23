import { CONTACT } from "@/lib/constants";

type PayPalPayOptions = {
  returnUrl?: string;
  cancelUrl?: string;
  custom?: string;
};

/** Paiement immédiat du montant (paypal.me ou checkout PayPal avec l’email du compte). */
export function paypalPayUrl(amountEur: number, itemName: string, extras: PayPalPayOptions = {}) {
  const me = process.env.NEXT_PUBLIC_PAYPAL_ME?.trim();
  if (me) {
    const handle = me
      .replace(/^https?:\/\//i, "")
      .replace(/^(www\.)?paypal\.me\//i, "")
      .split("/")[0];
    const euros = Number.isInteger(amountEur) ? String(amountEur) : amountEur.toFixed(2);
    return `https://www.paypal.com/paypalme/${encodeURIComponent(handle)}/${euros}EUR`;
  }

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
  if (extras.returnUrl) q.set("return", extras.returnUrl);
  if (extras.cancelUrl) q.set("cancel_return", extras.cancelUrl);
  return `https://www.paypal.com/cgi-bin/webscr?${q.toString()}`;
}
