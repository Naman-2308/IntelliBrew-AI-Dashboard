import { Package, AlertTriangle } from "lucide-react";
import type { Product } from "@/hooks/useTeaApi";
import { cn } from "@/lib/utils";

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
}

const ProductsTable = ({ products, loading }: ProductsTableProps) => {
  return (
    <div className="bg-card rounded-xl card-shadow border border-border/60 animate-slide-up stagger-2">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-card-foreground">
          Products & stock
        </h2>
        <span className="ml-auto text-xs font-body bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
          {products.length} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-6 py-3 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </th>
              <th className="text-left px-6 py-3 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </th>
              <th className="text-right px-6 py-3 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Price / kg
              </th>
              <th className="text-right px-6 py-3 text-xs font-body font-semibold uppercase tracking-wider text-muted-foreground">
                Stock (kg)
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
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-muted-foreground font-body"
                >
                  No products yet. Add your first product below.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-border/50 hover:bg-secondary/30 transition-colors",
                    p.low_stock && "bg-destructive/[0.04]"
                  )}
                >
                  <td className="px-6 py-4 font-body font-medium text-card-foreground">
                    <span className="inline-flex items-center gap-2">
                      {p.low_stock && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-destructive/10">
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                        </span>
                      )}
                      {p.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-tea-green-light text-primary text-xs font-body font-medium px-2.5 py-1 rounded-full">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-body font-medium text-card-foreground">
                    ₹ {p.price_per_kg}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        "font-body font-bold tabular-nums",
                        p.low_stock ? "text-destructive" : "text-success"
                      )}
                    >
                      {p.stock_kg}
                    </span>
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

export default ProductsTable;
