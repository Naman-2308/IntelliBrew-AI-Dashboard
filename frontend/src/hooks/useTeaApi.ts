import { useState, useEffect, useCallback } from "react";

const BACKEND = "http://127.0.0.1:5000";

export interface Product {
  id: number;
  name: string;
  category: string;
  price_per_kg: number;
  stock_kg: number;
  low_stock: boolean;
}

export interface Sale {
  product: string;
  quantity_kg: number;
  total_price: number;
  created_at: string;
}

export function useTeaApi() {
  const [revenue, setRevenue] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [revRes, prodRes, salesRes] = await Promise.all([
        fetch(`${BACKEND}/analytics/revenue`),
        fetch(`${BACKEND}/products/`),
        fetch(`${BACKEND}/sales/`),
      ]);

      const revData = await revRes.json();
      const prodData = await prodRes.json();
      const salesData = await salesRes.json();

      setRevenue(revData.total_revenue);
      setProducts(prodData);
      setSales(salesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addSale = async (productId: number, quantityKg: number) => {
    await fetch(`${BACKEND}/sales/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        quantity_kg: quantityKg,
      }),
    });
    fetchAll();
  };

  const addProduct = async (
    name: string,
    category: string,
    pricePerKg: number,
    stockKg: number
  ) => {
    await fetch(`${BACKEND}/products/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        price_per_kg: pricePerKg,
        stock_kg: stockKg,
      }),
    });
    fetchAll();
  };

  return { revenue, products, sales, loading, addSale, addProduct, refresh: fetchAll };
}
