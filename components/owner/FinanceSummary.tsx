import { yearFinance } from "@/lib/owner-finances";
import { getTranslations } from "next-intl/server";
import type { BookingConfig } from "@/lib/booking";
import type { PaidStay } from "@/lib/owner-types";

type Props = {
  locale: string;
  stays: readonly PaidStay[];
  booking: BookingConfig;
  year: number;
};

function stayLabel(stay: PaidStay, t: Awaited<ReturnType<typeof getTranslations>>) {
  if (stay.guestLabel) return stay.guestLabel;
  if (["martin", "laurent", "wright", "rossi"].includes(stay.guestKey)) {
    return t(`guests.${stay.guestKey}`);
  }
  return stay.guestKey;
}

export default async function FinanceSummary({ locale, stays, booking, year }: Props) {
  const t = await getTranslations({ locale, namespace: "Compte" });
  const finance = yearFinance(stays, booking, year);
  const euro = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  return (
    <section className="rounded-2xl border border-sand/40 bg-white p-5 shadow-card sm:p-7">
      <h2 className="font-serif text-2xl font-semibold text-lagoon-dark">{t("financeTitle")}</h2>
      <p className="mt-2 text-sm text-foreground/70">{t("financeLead")}</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-sand-light/80 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">{t("financeGross", { year })}</p>
          <p className="mt-1 font-serif text-2xl text-lagoon-dark">{euro.format(finance.lodging)}</p>
        </div>
        <div className="rounded-xl bg-sand-light/80 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">{t("financeFee")}</p>
          <p className="mt-1 font-serif text-2xl text-lagoon-dark">{euro.format(finance.fee)}</p>
        </div>
        <div className="rounded-xl bg-sand-light/80 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">{t("financeNights", { count: finance.nights })}</p>
          <p className="mt-1 font-serif text-2xl text-lagoon-dark">{finance.nights}</p>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-sand/40 text-sm">
        {finance.rows.map((row) => (
          <li key={row.stay.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <span className="text-foreground/85">
              {t("financeStay", {
                guest: stayLabel(row.stay, t),
                from: row.stay.checkIn,
                to: row.stay.checkOut,
              })}
            </span>
            <span className="font-medium text-lagoon-dark">
              {euro.format(row.lodging)}
              <span className="ml-2 font-normal text-muted">{t("financeFeeOnStay", { amount: euro.format(row.fee) })}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
