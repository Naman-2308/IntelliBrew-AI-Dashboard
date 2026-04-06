import {
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";

const BACKEND = "http://127.0.0.1:5000";

export interface Product {
  id: number;
  name: string;
  category: string;
  price_per_kg: number;
  cost_per_kg: number;
  stock_kg: number;
  low_stock: boolean;
}

export interface Sale {
  id?: number;
  product: string;
  quantity_kg: number;
  total_price: number;
  profit?: number;
  created_at: string;
}

export interface ProfitSummary {
  days: number;
  total_revenue: number;
  total_profit: number;
  daily: { date: string; revenue: number; profit: number }[];
}

export type DemandStatus = "SAFE" | "LOW" | "REORDER";

export interface DemandInsight {
  product: string;
  avg_daily_sale: number;
  predicted_7_day_demand: number;
  current_stock: number;
  days_until_stockout: number | null;
  demand_trend: string;
  status: DemandStatus;
  insight: string;
}

export type DateRangeDays = 7 | 30;

export type WhatsAppProviderName =
  | "twilio"
  | "meta_cloud"
  | "webhook"
  | "callmebot";

export interface AlertPrefs {
  enabled: boolean;
  phone_number: string;
  last_alert_at: string | null;
  provider_configured: boolean;
  provider_name: WhatsAppProviderName | null;
}

export type WhatsAppTestResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      detail?: string;
      status?: number;
    };

function pickStr(obj: Record<string, unknown> | null, key: string): string | undefined {
  const v = obj?.[key];
  return typeof v === "string" && v.trim() ? v : undefined;
}

type EvaluateResponse = { sent?: boolean };

async function safeJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Background low-stock check; logs issues, only updates state when refetch succeeds. */
async function runAlertEvaluateAndMaybeRefresh(
  setAlertPrefs: Dispatch<SetStateAction<AlertPrefs | null>>
): Promise<void> {
  try {
    const evRes = await fetch(`${BACKEND}/settings/alerts/evaluate`, {
      method: "POST",
    });
    if (!evRes.ok) {
      console.warn(
        "[TeaBiz] POST /settings/alerts/evaluate failed:",
        evRes.status,
        evRes.statusText
      );
      return;
    }

    const evaluated = await safeJson<EvaluateResponse>(evRes);
    if (evaluated === null) {
      console.warn("[TeaBiz] alerts/evaluate returned empty or invalid JSON");
      return;
    }
    if (evaluated.sent !== true) {
      return;
    }

    const ar = await fetch(`${BACKEND}/settings/alerts`);
    if (!ar.ok) {
      console.warn(
        "[TeaBiz] GET /settings/alerts (after send) failed:",
        ar.status,
        ar.statusText
      );
      return;
    }

    const refreshed = await safeJson<AlertPrefs>(ar);
    if (refreshed === null) {
      console.warn("[TeaBiz] alerts refetch returned empty or invalid JSON");
      return;
    }

    setAlertPrefs(refreshed);
  } catch (err) {
    console.warn("[TeaBiz] alert evaluate / refetch error:", err);
  }
}

export function useTeaApi(rangeDays: DateRangeDays) {
  const [revenue, setRevenue] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null);
  const [demandInsights, setDemandInsights] = useState<DemandInsight[]>([]);
  const [alertPrefs, setAlertPrefs] = useState<AlertPrefs | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        revRes,
        prodRes,
        salesRes,
        profitRes,
        demandRes,
        alertRes,
      ] = await Promise.all([
        fetch(`${BACKEND}/analytics/revenue`),
        fetch(`${BACKEND}/products/`),
        fetch(`${BACKEND}/sales/`),
        fetch(`${BACKEND}/analytics/profit-summary?days=${rangeDays}`),
        fetch(`${BACKEND}/analytics/demand`),
        fetch(`${BACKEND}/settings/alerts`),
      ]);

      const revData = await revRes.json();
      const prodData = await prodRes.json();
      const salesData = await salesRes.json();
      const profitData = await profitRes.json();
      const demandData = await demandRes.json();
      const alertData = alertRes.ok ? await alertRes.json() : null;

      setRevenue(revData.total_revenue);
      setProducts(prodData);
      setSales(salesData);
      setProfitSummary(profitData);
      setDemandInsights(demandData);
      setAlertPrefs(alertData);

      /* Finish alert evaluate + optional prefs refetch before clearing loading so
         alertPrefs is not updated after the UI leaves the loading state. */
      await runAlertEvaluateAndMaybeRefresh(setAlertPrefs);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateAlertPrefs = useCallback(
    async (patch: { enabled?: boolean; phone_number?: string }) => {
      const res = await fetch(`${BACKEND}/settings/alerts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("update failed");
      const data = (await res.json()) as AlertPrefs;
      setAlertPrefs(data);
      return data;
    },
    []
  );

  const sendTestWhatsApp = useCallback(async (): Promise<WhatsAppTestResult> => {
    const res = await fetch(`${BACKEND}/settings/alerts/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const body = await safeJson<Record<string, unknown>>(res);

    if (!res.ok) {
      return {
        ok: false,
        error:
          pickStr(body, "error") ||
          `Test request failed (${res.status} ${res.statusText})`,
        detail: pickStr(body, "detail"),
        status: res.status,
      };
    }

    if (body === null) {
      return {
        ok: false,
        error: "Empty or invalid response from server",
        status: res.status,
      };
    }

    if (body.ok === true) {
      return { ok: true };
    }

    return {
      ok: false,
      error:
        pickStr(body, "error") ||
        pickStr(body, "message") ||
        "Test message was not sent (server reported failure)",
      detail: pickStr(body, "detail"),
      status: res.status,
    };
  }, []);

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
    stockKg: number,
    costPerKg: number
  ) => {
    await fetch(`${BACKEND}/products/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        price_per_kg: pricePerKg,
        cost_per_kg: costPerKg,
        stock_kg: stockKg,
      }),
    });
    fetchAll();
  };

  return {
    revenue,
    products,
    sales,
    profitSummary,
    demandInsights,
    alertPrefs,
    loading,
    addSale,
    addProduct,
    refresh: fetchAll,
    updateAlertPrefs,
    sendTestWhatsApp,
  };
}
