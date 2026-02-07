import { useState } from "react";
import { Plus } from "lucide-react";

interface AddProductFormProps {
  onAddProduct: (name: string, category: string, price: number, stock: number) => Promise<void>;
}

const AddProductForm = ({ onAddProduct }: AddProductFormProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !category || !price || !stock) return;
    setSubmitting(true);
    try {
      await onAddProduct(name, category, Number(price), Number(stock));
      setName("");
      setCategory("");
      setPrice("");
      setStock("");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "h-11 rounded-lg border border-input bg-background px-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow";

  return (
    <div className="bg-card rounded-xl card-shadow animate-slide-up stagger-4">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <Plus className="w-5 h-5 text-success" />
        <h2 className="font-display text-lg font-semibold text-card-foreground">
          Add New Product
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price / kg"
            className={inputClass}
          />
          <input
            type="number"
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
          {submitting ? "Adding…" : "Add Product"}
        </button>
      </div>
    </div>
  );
};

export default AddProductForm;
