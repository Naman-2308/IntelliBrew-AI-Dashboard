import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/hooks/useTeaApi";
import DashboardCardHeader from "@/components/DashboardCardHeader";

interface AddSaleFormProps {
  products: Product[];
  onAddSale: (productId: number, quantity: number) => Promise<void>;
}

const AddSaleForm = ({ products, onAddSale }: AddSaleFormProps) => {
  const [productId, setProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!productId || !quantity) return;
    setSubmitting(true);
    try {
      await onAddSale(Number(productId), Number(quantity));
      setProductId("");
      setQuantity("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl card-shadow border border-border/60 w-full h-full min-h-0 flex flex-col animate-slide-up stagger-3">
      <DashboardCardHeader
        icon={<ShoppingCart className="text-primary" />}
        title="Record a sale"
      />

      <div className="px-6 h-52 min-h-52 max-h-52 flex flex-col justify-center gap-2.5 box-border overflow-hidden">
        <div className="min-h-0 shrink-0">
          <label className="block text-sm font-body font-medium text-card-foreground mb-1.5">
            Select product
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full h-11 rounded-lg border border-input bg-background px-3 font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
          >
            <option value="">Choose a product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Stock: {p.stock_kg} kg)
              </option>
            ))}
          </select>
        </div>

        <div className="min-h-0 shrink-0">
          <label className="block text-sm font-body font-medium text-card-foreground mb-1.5">
            Quantity sold (kg)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="w-full h-11 rounded-lg border border-input bg-background px-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !productId || !quantity}
          className="w-full h-11 rounded-lg tea-gradient text-primary-foreground font-body font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shrink-0"
        >
          {submitting ? "Recording…" : "Add sale"}
        </button>
      </div>
    </div>
  );
};

export default AddSaleForm;
