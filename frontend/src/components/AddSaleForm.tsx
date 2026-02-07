import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/hooks/useTeaApi";

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
    <div className="bg-card rounded-xl card-shadow animate-slide-up stagger-3">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-accent" />
        <h2 className="font-display text-lg font-semibold text-card-foreground">
          Record a Sale
        </h2>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-body font-medium text-card-foreground mb-1.5">
            Select Product
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

        <div>
          <label className="block text-sm font-body font-medium text-card-foreground mb-1.5">
            Quantity Sold (kg)
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
          onClick={handleSubmit}
          disabled={submitting || !productId || !quantity}
          className="w-full h-11 rounded-lg tea-gradient text-primary-foreground font-body font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {submitting ? "Recording…" : "Add Sale"}
        </button>
      </div>
    </div>
  );
};

export default AddSaleForm;
