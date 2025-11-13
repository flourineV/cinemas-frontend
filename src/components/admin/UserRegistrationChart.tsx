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
      title: "Exported",
      timer: 1200,
      showConfirmButton: false,
      background: "#0b1020",
      color: "#fff",
    });
  }

  return (
    <div className="bg-black text-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">User registrations (monthly)</h3>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-1 border border-gray-700 rounded text-sm bg-gray-800"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
            <XAxis dataKey="name" stroke="#cfcfcf" />
            <YAxis allowDecimals={false} stroke="#cfcfcf" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b1020",
                borderColor: "#2d2d2d",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {loading && <div className="text-sm text-gray-400 mt-2">Loading...</div>}
    </div>
  );
}
