import type { DateRange } from "@/lib/booking";
import { getStripe } from "@/lib/stripe";

export async function paidRangesForSlug(slug: string): Promise<DateRange[]> {
  const stripe = getStripe();
  if (!stripe) return [];

  const ranges: DateRange[] = [];
  let startingAfter: string | undefined;

  for (let page = 0; page < 5; page++) {
    const list = await stripe.checkout.sessions.list({
      status: "complete",
      limit: 100,
      starting_after: startingAfter,
    });

    for (const session of list.data) {
      if (session.metadata?.slug !== slug) continue;
      const from = session.metadata.checkIn;
      const to = session.metadata.checkOut;
      if (from && to && to > from) ranges.push({ from, to });
    }

    if (!list.has_more) break;
    startingAfter = list.data.at(-1)?.id;
    if (!startingAfter) break;
  }

  return ranges;
}
