import { nightsBetween, quoteStay, type BookingConfig } from "@/lib/booking";
import type { PaidStay } from "@/lib/owner-types";

export const ZENVILLA_FEE_RATE = 0.2;

export function staysInYear(stays: readonly PaidStay[], year: number) {
  return stays.filter((stay) =>
    nightsBetween(stay.checkIn, stay.checkOut).some((night) => night.startsWith(String(year))),
  );
}

export function yearFinance(stays: readonly PaidStay[], config: BookingConfig, year: number) {
  const rows = staysInYear(stays, year).map((stay) => {
    const quote = quoteStay(stay.checkIn, stay.checkOut, config);
    const lines = quote.lines.filter(line => line.date.startsWith(`${year}-`));
    const lodging = lines.reduce((total, line) => total + line.amount, 0);
    return {
      stay,
      lodging,
      nights: lines.length,
      fee: Math.round(lodging * ZENVILLA_FEE_RATE),
      net: lodging - Math.round(lodging * ZENVILLA_FEE_RATE),
    };
  });
  const lodging = rows.reduce((sum, row) => sum + row.lodging, 0);
  const fee = rows.reduce((sum, row) => sum + row.fee, 0);
  return {
    year,
    rows,
    lodging,
    fee,
    net: lodging - fee,
    nights: rows.reduce((sum, row) => sum + row.nights, 0),
    feeRate: ZENVILLA_FEE_RATE,
  };
}
