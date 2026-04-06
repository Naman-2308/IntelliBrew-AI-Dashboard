import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Warehouse,
} from "lucide-react";
import type { Product, ProfitSummary } from "@/hooks/useTeaApi";

interface StatsCardsProps {
  profitSummary: ProfitSummary | null;
  products: Product[];
  salesCountInRange: number;
  loading: boolean;
}

const StatsCards = ({
  profitSummary,
  products,
  salesCountInRange,
  loading,
}: StatsCardsProps) => {
  const lowStockCount = products.filter((p) => p.low_stock).length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.stock_kg * (p.cost_per_kg ?? 0),
    0
  );

  const revenue = profitSummary?.total_revenue ?? null;
  const profit = profitSummary?.total_profit ?? null;

  const staggerClass = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5"];

  const stats = [
    {
      label: "Total revenue",
      value:
        revenue !== null ? `₹ ${revenue.toLocaleString("en-IN")}` : "—",
      sub: "Selected period",
      icon: IndianRupee,
      accent: "tea-gradient",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      highlight: true,
    },
    {
      label: "Total profit",
      value: profit !== null ? `₹ ${profit.toLocaleString("en-IN")}` : "—",
      sub: "Selected period",
      icon: Wallet,
      accent: "",
      iconBg: "bg-tea-green-light",
      iconColor: "text-primary",
      highlight: false,
    },
    {
      label: "Total sales",
      value: salesCountInRange.toString(),
      sub: "Transactions in range",
      icon: ShoppingCart,
      accent: "",
      iconBg: "bg-tea-gold-light",
      iconColor: "text-accent",
      highlight: false,
    },
    {
      label: "Low stock",
      value: lowStockCount.toString(),
      sub: "Below 50 kg",
      icon: TrendingUp,
      accent: "",
      iconBg: lowStockCount > 0 ? "bg-destructive/10" : "bg-tea-green-light",
      iconColor: lowStockCount > 0 ? "text-destructive" : "text-primary",
      highlight: false,
    },
    {
      label: "Inventory value",
      value: `₹ ${inventoryValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      sub: "At cost",
      icon: Warehouse,
      accent: "",
      iconBg: "bg-secondary",
      iconColor: "text-muted-foreground",
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all duration-300 animate-slide-up ${staggerClass[i] ?? "stagger-5"} ${
            stat.highlight
              ? "tea-gradient text-primary-foreground"
              : "bg-card border border-border/60"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`text-xs font-body font-medium uppercase tracking-wider mb-0.5 ${
                  stat.highlight
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {stat.label}
              </p>
              <p className="text-xl sm:text-2xl font-display font-bold mt-1 truncate">
                {loading ? (
                  <span className="inline-block w-24 h-7 rounded bg-muted/30 animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
              <p
                className={`text-[11px] font-body mt-1.5 ${
                  stat.highlight
                    ? "text-primary-foreground/60"
                    : "text-muted-foreground"
                }`}
              >
                {stat.sub}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                stat.highlight ? "bg-primary-foreground/15" : stat.iconBg
              }`}
            >
              <stat.icon
                className={`w-5 h-5 ${
                  stat.highlight ? "text-primary-foreground" : stat.iconColor
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
