import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import type { ProfitSummary, Sale } from "@/hooks/useTeaApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const chartFont = {
  family: "'DM Sans', sans-serif",
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "hsl(var(--card))",
      titleColor: "hsl(var(--card-foreground))",
      bodyColor: "hsl(var(--muted-foreground))",
      borderColor: "hsl(var(--border))",
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: "hsl(var(--muted-foreground))",
        maxRotation: 0,
        font: chartFont,
      },
    },
    y: {
      grid: { color: "hsl(var(--border) / 0.5)" },
      ticks: {
        color: "hsl(var(--muted-foreground))",
        font: chartFont,
      },
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        color: "hsl(var(--muted-foreground))",
        font: chartFont,
        boxWidth: 12,
        padding: 12,
      },
    },
    tooltip: {
      backgroundColor: "hsl(var(--card))",
      titleColor: "hsl(var(--card-foreground))",
      bodyColor: "hsl(var(--muted-foreground))",
      borderColor: "hsl(var(--border))",
      borderWidth: 1,
    },
  },
};

const PIE_COLORS = [
  "hsl(38 75% 52%)",
  "hsl(152 45% 38%)",
  "hsl(220 14% 46%)",
  "hsl(280 35% 48%)",
  "hsl(12 76% 48%)",
  "hsl(199 70% 42%)",
];

interface Props {
  profitSummary: ProfitSummary | null;
  filteredSales: Sale[];
  rangeDays: number;
  loading: boolean;
}

function aggregateSalesByProduct(sales: Sale[]) {
  const map = new Map<string, number>();
  for (const s of sales) {
    map.set(s.product, (map.get(s.product) ?? 0) + s.total_price);
  }
  return Array.from(map.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
}

export default function AnalyticsCharts({
  profitSummary,
  filteredSales,
  rangeDays,
  loading,
}: Props) {
  const daily = profitSummary?.daily ?? [];
  const labels = daily.map((d) => {
    try {
      return format(parseISO(d.date), "MMM d");
    } catch {
      return d.date;
    }
  });

  const revenueData = {
    labels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: daily.map((d) => d.revenue),
        borderColor: "hsl(38 75% 52%)",
        backgroundColor: "hsl(38 75% 52% / 0.12)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const profitData = {
    labels,
    datasets: [
      {
        label: "Profit (₹)",
        data: daily.map((d) => d.profit),
        borderColor: "hsl(152 45% 38%)",
        backgroundColor: "hsl(152 45% 38% / 0.12)",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const pairs = aggregateSalesByProduct(filteredSales);
  const pieData = {
    labels: pairs.map(([k]) => k),
    datasets: [
      {
        data: pairs.map(([, v]) => v),
        backgroundColor: pairs.map(
          (_, i) => PIE_COLORS[i % PIE_COLORS.length]
        ),
        borderWidth: 0,
      },
    ],
  };

  const skeleton = (
    <div className="h-[240px] rounded-lg bg-muted/30 animate-pulse" />
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-5 rounded-xl card-shadow border border-border/60">
          <h3 className="text-sm font-body font-semibold text-card-foreground mb-1">
            Revenue
          </h3>
          <p className="text-xs text-muted-foreground font-body mb-4">
            Last {rangeDays} days
          </p>
          <div className="h-[240px]">
            {loading ? skeleton : <Line data={revenueData} options={lineOptions} />}
          </div>
        </div>
        <div className="bg-card p-5 rounded-xl card-shadow border border-border/60">
          <h3 className="text-sm font-body font-semibold text-card-foreground mb-1">
            Profit
          </h3>
          <p className="text-xs text-muted-foreground font-body mb-4">
            Last {rangeDays} days
          </p>
          <div className="h-[240px]">
            {loading ? skeleton : <Line data={profitData} options={lineOptions} />}
          </div>
        </div>
      </div>
      <div className="bg-card p-5 rounded-xl card-shadow border border-border/60">
        <h3 className="text-sm font-body font-semibold text-card-foreground mb-1">
          Sales by product
        </h3>
        <p className="text-xs text-muted-foreground font-body mb-4">
          Share of revenue · selected period
        </p>
        <div className="h-[280px] md:h-[240px] xl:h-[320px] flex items-center justify-center">
          {loading ? (
            skeleton
          ) : pairs.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body">
              No sales in this range.
            </p>
          ) : (
            <Pie data={pieData} options={pieOptions} />
          )}
        </div>
      </div>
    </div>
  );
}
