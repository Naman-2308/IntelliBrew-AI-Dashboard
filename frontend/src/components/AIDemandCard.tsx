import { Brain, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { DemandInsight, DemandStatus } from "@/hooks/useTeaApi";
import { cn } from "@/lib/utils";

interface AIDemandCardProps {
  insights: DemandInsight[];
  loading: boolean;
}

function statusStyles(status: DemandStatus) {
  switch (status) {
    case "SAFE":
      return {
        pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        row: "border-l-2 border-l-emerald-500/60",
      };
    case "LOW":
      return {
        pill: "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/25",
        row: "border-l-2 border-l-amber-500/60",
      };
    case "REORDER":
      return {
        pill: "bg-destructive/10 text-destructive border-destructive/20",
        row: "border-l-2 border-l-destructive",
      };
    default:
      return {
        pill: "bg-secondary text-secondary-foreground",
        row: "",
      };
  }
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "increasing")
    return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
  if (trend === "decreasing")
    return <TrendingDown className="w-3.5 h-3.5 text-muted-foreground" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

const AIDemandCard = ({ insights, loading }: AIDemandCardProps) => {
  return (
    <div className="bg-card rounded-xl card-shadow border border-border/60 overflow-hidden animate-slide-up stagger-2">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-card-foreground">
            AI demand insights
          </h2>
          <p className="text-xs font-body text-muted-foreground">
            7-day window · predicted demand and stock runway
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-h-[28rem] overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground font-body text-center py-8">
            Add products to see AI insights.
          </p>
        ) : (
          <ul className="space-y-3">
            {insights.map((row) => {
              const st = statusStyles(row.status);
              return (
                <li
                  key={row.product}
                  className={cn(
                    "rounded-lg border border-border/80 bg-secondary/20 px-4 py-3 pl-3",
                    st.row
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-body font-semibold text-card-foreground">
                      {row.product}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-body font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        st.pill
                      )}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="text-xs font-body text-muted-foreground mt-2 leading-relaxed">
                    {row.insight}
                  </p>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-body">
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">
                        Avg daily
                      </p>
                      <p className="font-semibold text-card-foreground mt-0.5">
                        {row.avg_daily_sale} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">
                        7d demand
                      </p>
                      <p className="font-semibold text-card-foreground mt-0.5">
                        {row.predicted_7_day_demand} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide">
                        Stock
                      </p>
                      <p className="font-semibold text-card-foreground mt-0.5">
                        {row.current_stock} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        Trend
                        <TrendIcon trend={row.demand_trend} />
                      </p>
                      <p className="font-semibold text-card-foreground mt-0.5 capitalize">
                        {row.demand_trend}
                      </p>
                    </div>
                  </div>
                  {row.days_until_stockout != null && (
                    <p className="text-[11px] font-body text-muted-foreground mt-2">
                      Runway: ~{row.days_until_stockout} day
                      {row.days_until_stockout === 1 ? "" : "s"} at current
                      daily rate
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AIDemandCard;
