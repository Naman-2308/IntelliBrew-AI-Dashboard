import { Download, History } from "lucide-react";
import type { Sale } from "@/hooks/useTeaApi";
import DashboardCardHeader from "@/components/DashboardCardHeader";

interface SalesHistoryProps {
  sales: Sale[];
  loading: boolean;
  rangeLabel?: string;
  onExportCsv?: () => void;
}

/** ~4 compact rows visible; thead sticky. */
const TABLE_BODY_VIEWPORT = "h-52";

const SalesHistory = ({
  sales,
  loading,
  rangeLabel,
  onExportCsv,
}: SalesHistoryProps) => {
  const tableScrollClass = `overflow-x-auto overflow-y-auto ${TABLE_BODY_VIEWPORT} overscroll-y-contain min-h-0`;

  return (
    <div className="bg-card rounded-xl card-shadow border border-border/60 flex flex-col h-full min-h-0 w-full animate-slide-up stagger-3">
      <DashboardCardHeader
        icon={<History className="text-primary" />}
        title="Sales history"
        meta={
          <>
            {rangeLabel && (
              <span className="text-xs font-body text-muted-foreground whitespace-nowrap hidden sm:inline">
                {rangeLabel}
              </span>
            )}
            <span className="text-xs font-body bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
              {sales.length} records
            </span>
          </>
        }
        actions={
          onExportCsv ? (
            <button
              type="button"
              onClick={onExportCsv}
              disabled={loading || sales.length === 0}
              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-body font-medium text-card-foreground hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          ) : undefined
        }
      />

      <div className={`${tableScrollClass} rounded-b-xl`}>
        <table className="w-full min-w-[640px] border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-secondary/95 backdrop-blur-sm shadow-[0_1px_0_0_hsl(var(--border))]">
              <th className="text-left px-6 py-2 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/95">
                Product
              </th>
              <th className="text-right px-6 py-2 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/95">
                Qty (kg)
              </th>
              <th className="text-right px-6 py-2 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/95">
                Revenue
              </th>
              <th className="text-right px-6 py-2 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/95">
                Profit
              </th>
              <th className="text-right px-6 py-2 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/95">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-2">
                      <div className="h-4 rounded bg-muted animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sales.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-muted-foreground font-body text-sm"
                >
                  No sales in this range.
                </td>
              </tr>
            ) : (
              sales.map((s, idx) => (
                <tr
                  key={s.id ?? `${s.created_at}-${idx}`}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-2 font-body font-medium text-sm text-card-foreground">
                    {s.product}
                  </td>
                  <td className="px-6 py-2 text-right font-body text-sm text-card-foreground">
                    {s.quantity_kg}
                  </td>
                  <td className="px-6 py-2 text-right font-body text-sm font-semibold text-card-foreground">
                    ₹ {s.total_price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-2 text-right font-body text-sm font-semibold text-primary">
                    {s.profit != null
                      ? `₹ ${s.profit.toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td className="px-6 py-2 text-right font-body text-sm text-muted-foreground whitespace-nowrap">
                    {s.created_at}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesHistory;
