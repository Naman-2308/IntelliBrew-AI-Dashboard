import { IndianRupee, Package, ShoppingCart, TrendingUp } from "lucide-react";
import type { Product, Sale } from "@/hooks/useTeaApi";

interface StatsCardsProps {
  revenue: number | null;
  products: Product[];
  sales: Sale[];
  loading: boolean;
}

const StatsCards = ({ revenue, products, sales, loading }: StatsCardsProps) => {
  const lowStockCount = products.filter((p) => p.low_stock).length;
  const totalProducts = products.length;
  const totalSales = sales.length;

  const stats = [
    {
      label: "Total Revenue",
      value: revenue !== null ? `₹ ${revenue.toLocaleString("en-IN")}` : "—",
      icon: IndianRupee,
      accent: "tea-gradient",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      highlight: true,
    },
    {
      label: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      accent: "",
      iconBg: "bg-tea-gold-light",
      iconColor: "text-accent",
      highlight: false,
    },
    {
      label: "Total Sales",
      value: totalSales.toString(),
      icon: ShoppingCart,
      accent: "",
      iconBg: "bg-tea-green-light",
      iconColor: "text-primary",
      highlight: false,
    },
    {
      label: "Low Stock Items",
      value: lowStockCount.toString(),
      icon: TrendingUp,
      accent: "",
      iconBg: lowStockCount > 0 ? "bg-destructive/10" : "bg-tea-green-light",
      iconColor: lowStockCount > 0 ? "text-destructive" : "text-primary",
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`rounded-xl p-5 card-shadow hover:card-shadow-hover transition-all duration-300 animate-slide-up stagger-${i + 1} ${
            stat.highlight
              ? "tea-gradient text-primary-foreground"
              : "bg-card"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className={`text-xs font-body font-medium uppercase tracking-wider mb-1 ${
                  stat.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {stat.label}
              </p>
              <p className="text-2xl font-display font-bold mt-1">
                {loading ? (
                  <span className="inline-block w-20 h-7 rounded bg-muted/30 animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
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
