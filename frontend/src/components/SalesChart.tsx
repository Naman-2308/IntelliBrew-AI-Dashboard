import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { format, subDays } from "date-fns";
import { Line } from "react-chartjs-2";
import type { Sale } from "@/hooks/useTeaApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Props {
  sales: Sale[];
}

export default function SalesChart({ sales }: Props) {

  // 1️⃣ Generate last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) =>
    format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
  );

  // 2️⃣ Aggregate revenue per day
  const revenueByDate = last7Days.map(date => {
    const total = sales
      .filter(s => s.created_at.startsWith(date))
      .reduce((sum, s) => sum + s.total_price, 0);

    return total;
  });

  const chartData = {
    labels: last7Days,
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueByDate,
        borderColor: "hsl(38 75% 52%)",
        backgroundColor: "hsl(38 75% 52% / 0.2)",
        tension: 0.4,
        fill: true,
      }
    ]
  };

  return (
    <div className="bg-card p-6 rounded-xl card-shadow">
      <h2 className="text-xl mb-4 font-semibold">
        📊 Last 7 Days Revenue
      </h2>
      <Line data={chartData} />
    </div>
  );
}

