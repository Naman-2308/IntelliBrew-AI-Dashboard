import type { Sale } from "@/hooks/useTeaApi";

function escapeCsvCell(val: string | number | undefined): string {
  if (val === undefined || val === null) return "";
  const s = String(val);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportSalesToCsv(sales: Sale[], filename = "teabiz-sales.csv") {
  const headers = ["id", "product", "quantity_kg", "total_price", "profit", "created_at"];
  const lines = [
    headers.join(","),
    ...sales.map((s) =>
      [
        escapeCsvCell(s.id),
        escapeCsvCell(s.product),
        escapeCsvCell(s.quantity_kg),
        escapeCsvCell(s.total_price),
        escapeCsvCell(s.profit),
        escapeCsvCell(s.created_at),
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
