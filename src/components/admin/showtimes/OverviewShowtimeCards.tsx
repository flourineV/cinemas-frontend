import React, { useEffect, useState } from "react";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { showtimeService } from "@/services/showtime/showtimeService";
import { theaterService } from "@/services/showtime/theaterService";

interface ShowtimeStats {
  totalShowtimes: number;
  activeShowtimes: number;
  suspendedShowtimes: number;
  upcomingShowtimes: number;
}

interface TheaterStats {
  theaterId: string;
  theaterName: string;
  totalShowtimes: number;
  activeShowtimes: number;
}

export default function OverviewShowtimeCards(): React.JSX.Element {
  const [stats, setStats] = useState<ShowtimeStats>({
    totalShowtimes: 0,
    activeShowtimes: 0,
    suspendedShowtimes: 0,
    upcomingShowtimes: 0,
  });
  const [theaterStats, setTheaterStats] = useState<TheaterStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch overall stats
        const overallStats = await showtimeService.getStatsOverview();
        setStats({
          totalShowtimes: overallStats.totalShowtimes || 0,
          activeShowtimes: overallStats.activeShowtimes || 0,
          suspendedShowtimes: (overallStats as any).suspendedShowtimes || 0,
          upcomingShowtimes: overallStats.upcomingShowtimes || 0,
        });

        // Fetch all theaters and their stats
        const theaters = await theaterService.getAllTheaters();
        const theaterStatsPromises = theaters.map(async (theater) => {
          try {
            const theaterStat = await showtimeService.getStatsOverview(
              theater.id
            );
            return {
              theaterId: theater.id,
              theaterName: theater.name,
              totalShowtimes: theaterStat.totalShowtimes || 0,
              activeShowtimes: theaterStat.activeShowtimes || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching stats for theater ${theater.id}:`,
              error
            );
            return {
              theaterId: theater.id,
              theaterName: theater.name,
              totalShowtimes: 0,
              activeShowtimes: 0,
            };
          }
        });

        const theaterStatsResults = await Promise.all(theaterStatsPromises);
        setTheaterStats(theaterStatsResults);
      } catch (error) {
        console.error("Error fetching showtime stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Overall Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-400 rounded-lg p-6 animate-pulse"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Theater Stats Skeleton */}
        <div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
            <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for recharts - keep full theater name
  const chartData = theaterStats.map((theater) => ({
    name: theater.theaterName,
    "Tổng lịch chiếu": theater.totalShowtimes,
    "Đang hoạt động": theater.activeShowtimes,
  }));

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Tổng lịch chiếu
            </span>
            <Calendar size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.totalShowtimes.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Đang chiếu
            </span>
            <Clock size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.activeShowtimes.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">Sắp chiếu</span>
            <Calendar size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.upcomingShowtimes.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Đã tạm ngưng
            </span>
            <AlertTriangle size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {(stats.suspendedShowtimes || 0).toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Theater Stats - Bar Chart using Recharts */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Thống kê theo rạp
        </h3>
        <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
          {theaterStats.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                barGap={0}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#374151" }}
                  angle={0}
                  textAnchor="middle"
                  height={50}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ fontWeight: "bold", color: "#111827" }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="rect" />
                <Bar
                  dataKey="Tổng lịch chiếu"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Đang hoạt động"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
