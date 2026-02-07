import { History } from "lucide-react";
import type { Sale } from "@/hooks/useTeaApi";

interface SalesHistoryProps {
  sales: Sale[];
  loading: boolean;
}

const SalesHistory = ({ sales, loading }: SalesHistoryProps) => {
  return (
    <div className="bg-card rounded-xl card-shadow animate-slide-up stagger-3">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-card-foreground">
          Sales History
        </h2>
        <span className="ml-auto text-xs font-body bg-tea-gold-light text-accent px-2.5 py-1 rounded-full font-medium">
          {sales.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-6 py-3 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Product
              </th>
              <th className="text-right px-6 py-3 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Quantity (kg)
              </th>
              <th className="text-right px-6 py-3 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Total Price
              </th>
              <th className="text-right px-6 py-3 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 rounded bg-muted animate-pulse w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-body">
                  No sales recorded yet.
                </td>
              </tr>
            ) : (
              sales.map((s, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4 font-body font-medium text-card-foreground">
                    {s.product}
                  </td>
                  <td className="px-6 py-4 text-right font-body text-card-foreground">
                    {s.quantity_kg}
                  </td>
                  <td className="px-6 py-4 text-right font-body font-semibold text-card-foreground">
                    ₹ {s.total_price}
                  </td>
                  <td className="px-6 py-4 text-right font-body text-sm text-muted-foreground">
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
