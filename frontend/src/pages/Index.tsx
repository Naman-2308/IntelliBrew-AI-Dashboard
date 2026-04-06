import { useMemo, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import ProductsTable from "@/components/ProductsTable";
import AddSaleForm from "@/components/AddSaleForm";
import SalesHistory from "@/components/SalesHistory";
import AnalyticsCharts from "@/components/AnalyticsCharts";
import AddProductForm from "@/components/AddProductForm";
import StockAlertBanner from "@/components/StockAlertBanner";
import WhatsAppAlertSettings from "@/components/WhatsAppAlertSettings";
import AIDemandCard from "@/components/AIDemandCard";
import { useTeaApi, type DateRangeDays } from "@/hooks/useTeaApi";
import { filterSalesInLastDays } from "@/lib/saleDates";
import { exportSalesToCsv } from "@/lib/exportSalesCsv";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Index() {
  const [rangeDays, setRangeDays] = useState<DateRangeDays>(7);
  const {
    products,
    sales,
    loading,
    addSale,
    addProduct,
    refresh,
    profitSummary,
    demandInsights,
    alertPrefs,
    updateAlertPrefs,
    sendTestWhatsApp,
  } = useTeaApi(rangeDays);

  const filteredSales = useMemo(
    () => filterSalesInLastDays(sales, rangeDays),
    [sales, rangeDays]
  );

  const lowStockCount = products.filter((p) => p.low_stock).length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground tracking-tight">
              Dashboard
            </h2>
            <p className="text-sm font-body text-muted-foreground mt-0.5">
              Inventory, sales, and AI signals for your tea business
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-lg border border-border bg-secondary/30 p-0.5"
              role="group"
              aria-label="Date range"
            >
              {([7, 30] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setRangeDays(d)}
                  className={cn(
                    "px-3.5 py-2 rounded-md text-xs font-body font-medium transition-all",
                    rangeDays === d
                      ? "bg-card text-card-foreground shadow-sm border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Last {d} days
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading}
              className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary font-body text-sm font-medium text-card-foreground flex items-center gap-2 transition-colors card-shadow disabled:opacity-60"
            >
              <RefreshCw
                className={cn("w-4 h-4", loading && "animate-spin")}
              />
              Refresh
            </button>
          </div>
        </div>

        <WhatsAppAlertSettings
          prefs={alertPrefs}
          loading={loading}
          onUpdate={updateAlertPrefs}
          onSendTest={sendTestWhatsApp}
        />

        <StockAlertBanner lowStockCount={lowStockCount} alertPrefs={alertPrefs} />

        <StatsCards
          profitSummary={profitSummary}
          products={products}
          salesCountInRange={filteredSales.length}
          loading={loading}
        />

        <AnalyticsCharts
          profitSummary={profitSummary}
          filteredSales={filteredSales}
          rangeDays={rangeDays}
          loading={loading}
        />

        <AIDemandCard insights={demandInsights} loading={loading} />

        <ProductsTable products={products} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
          <div className="lg:col-span-1 min-w-0 flex min-h-0">
            <AddSaleForm products={products} onAddSale={addSale} />
          </div>
          <div className="lg:col-span-2 min-w-0 min-h-0 flex">
            <SalesHistory
              sales={filteredSales}
              loading={loading}
              rangeLabel={`Last ${rangeDays} days`}
              onExportCsv={() =>
                exportSalesToCsv(
                  filteredSales,
                  `teabiz-sales-${rangeDays}d.csv`
                )
              }
            />
          </div>
        </div>

        <AddProductForm onAddProduct={addProduct} />
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-border">
        <p className="text-center text-xs font-body text-muted-foreground">
          © 2026 TeaBiz — Crafted with care for your tea business
        </p>
      </footer>
    </div>
  );
}
