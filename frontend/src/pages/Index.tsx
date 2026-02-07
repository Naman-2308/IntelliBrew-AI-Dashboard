import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import ProductsTable from "@/components/ProductsTable";
import AddSaleForm from "@/components/AddSaleForm";
import SalesHistory from "@/components/SalesHistory";
import SalesChart from "@/components/SalesChart";
import AddProductForm from "@/components/AddProductForm";
import { useTeaApi } from "@/hooks/useTeaApi";
import { RefreshCw } from "lucide-react";

const Index = () => {
  const { revenue, products, sales, loading, addSale, addProduct, refresh } =
    useTeaApi();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page title row */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Dashboard
            </h2>
            <p className="text-sm font-body text-muted-foreground mt-0.5">
              Manage your tea inventory and sales
            </p>
          </div>
          <button
            onClick={refresh}
            className="h-10 px-4 rounded-lg border border-border bg-card hover:bg-secondary font-body text-sm font-medium text-card-foreground flex items-center gap-2 transition-colors card-shadow"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <StatsCards
          revenue={revenue}
          products={products}
          sales={sales}
          loading={loading}
        />
        {/* Sales Chart */}
          <SalesChart 
          sales={sales}
          loading={loading} 
          />

        {/* Products table */}
        <ProductsTable products={products} loading={loading} />

        {/* Two-column: Sale form + Sales history */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AddSaleForm products={products} onAddSale={addSale} />
          </div>
          <div className="lg:col-span-2">
            <SalesHistory sales={sales} loading={loading} />
          </div>
        </div>

        {/* Add product */}
        <AddProductForm onAddProduct={addProduct} />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-border">
        <p className="text-center text-xs font-body text-muted-foreground">
          © 2026 TeaBiz — Crafted with care for your tea business
        </p>
      </footer>
    </div>
  );
};

export default Index;
