import { isValid, parse, startOfDay, subDays } from "date-fns";

const SALE_DATE_FMT = "yyyy-MM-dd HH:mm";

export function parseSaleDate(createdAt: string): Date {
  const d = parse(createdAt, SALE_DATE_FMT, new Date());
  return isValid(d) ? d : new Date(createdAt);
}

/** Matches backend profit-summary window: inclusive of today and the prior (days - 1) days. */
export function filterSalesInLastDays<T extends { created_at: string }>(
  rows: T[],
  days: number
): T[] {
  const cutoff = startOfDay(subDays(new Date(), days - 1)).getTime();
  return rows.filter((r) => parseSaleDate(r.created_at).getTime() >= cutoff);
}
