import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { UserRegistrationStatsResponse } from "@/types/auth/stats.type";
import { userAdminService } from "@/services/auth/userService";
import { Download } from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

export default function UserRegistrationChart() {
  const [data, setData] = useState<UserRegistrationStatsResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthly();
  }, []);

  async function fetchMonthly() {
    setLoading(true);
    try {
      const res = await userAdminService.getUserRegistrationsByMonth();
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    return data
      .slice()
      .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year))
      .map((d) => ({ name: `${d.month}/${d.year}`, total: d.total }));
  }, [data]);

  function exportCSV() {
    const headers = ["year", "month", "total"];
    const rows = data.map((r) => [r.year, r.month, r.total]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_registrations_monthly.csv";
    a.click();
    URL.revokeObjectURL(url);
    Swal.fire({
      icon: "success",
      title: "Đã xuất file CSV",
      timer: 1200,
      showConfirmButton: false,
    });
  }

  function exportExcel() {
    // Tạo workbook
    const wb = XLSX.utils.book_new();

    // Tạo worksheet data
    const wsData = [
      ["Năm", "Tháng", "Tổng số đăng ký"],
      ...data.map((r) => [r.year, r.month, r.total]),
    ];

    // Tạo worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Tự động điều chỉnh độ rộng cột
    const colWidths = [
      { wch: 10 }, // Năm
      { wch: 10 }, // Tháng
      { wch: 20 }, // Tổng số đăng ký
    ];
    ws["!cols"] = colWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Thống kê đăng ký");

    // Xuất file
    XLSX.writeFile(
      wb,
      `user_registrations_${new Date().toISOString().split("T")[0]}.xlsx`
    );

    Swal.fire({
      icon: "success",
      title: "Đã xuất file Excel",
      timer: 1200,
      showConfirmButton: false,
    });
  }

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-6">
      <div className="flex items-center justify-end mb-6 gap-2">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-50 transition"
        >
          <Download size={16} /> Export CSV
        </button>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-3 py-2 border border-gray-400 rounded-lg text-sm bg-green-600 text-white hover:bg-green-700 transition"
        >
          <Download size={16} /> Export Excel
        </button>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis allowDecimals={false} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#d1d5db",
                color: "#374151",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              itemStyle={{ color: "#374151" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#3b82f6", fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {loading && <div className="text-sm text-gray-500 mt-2">Đang tải...</div>}
    </div>
  );
}
