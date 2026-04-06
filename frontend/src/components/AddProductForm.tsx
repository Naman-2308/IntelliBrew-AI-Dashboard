import { useState } from "react";
import { Plus } from "lucide-react";

interface AddProductFormProps {
  onAddProduct: (
    name: string,
    category: string,
    price: number,
    stock: number,
    costPerKg: number
  ) => Promise<void>;
}

const AddProductForm = ({ onAddProduct }: AddProductFormProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !category || !price || !stock) return;
    setSubmitting(true);
    try {
      await onAddProduct(
        name,
        category,
        Number(price),
        Number(stock),
        cost === "" ? 0 : Number(cost)
      );
      setName("");
      setCategory("");
      setPrice("");
      setCost("");
      setStock("");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-11 rounded-lg border border-input bg-background px-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow";

  return (
    <div className="bg-card rounded-xl card-shadow border border-border/60 animate-slide-up stagger-4">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <Plus className="w-5 h-5 text-success" />
        <h2 className="font-display text-lg font-semibold text-card-foreground">
          Add new product
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tea name"
            className={inputClass}
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price / kg (₹)"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="Cost / kg (₹)"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Stock (kg)"
            className={inputClass}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || !name || !category || !price || !stock}
          className="h-11 px-8 rounded-lg gold-gradient text-accent-foreground font-body font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {submitting ? "Adding…" : "Add product"}
        </button>
      </div>
    </div>
  );
};

export default AddProductForm;
