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
    <div
      className="
      bg-black/60 backdrop-blur-md 
      border border-yellow-400/40  
      rounded-2xl shadow-2xl p-6
      text-white
    "
    >
      <div className="flex items-center justify-end mb-8">
        <button
          onClick={exportCSV}
          className="
          flex items-center gap-2 px-3 py-1.5 
          border border-yellow-400/40 
          rounded-lg text-sm bg-black/40 
          hover:bg-black/60 transition
        "
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#979797ff" />
            <XAxis dataKey="name" stroke="#e5e5e5" />
            <YAxis allowDecimals={false} stroke="#e5e5e5" />
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
              stroke="#facc15"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#facc15", fill: "#facc15" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {loading && <div className="text-sm text-gray-400 mt-2">Loading...</div>}
    </div>
  );
}
