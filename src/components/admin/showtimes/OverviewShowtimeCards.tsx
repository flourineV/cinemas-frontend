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
  weeklyShowtimes: number;
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
    weeklyShowtimes: 0,
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
          weeklyShowtimes: overallStats.weeklyShowtimes || 0,
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
        <div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
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
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Thống kê tổng quan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng lịch chiếu
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalShowtimes}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Đang hoạt động
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeShowtimes}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Đã tạm ngưng
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.suspendedShowtimes || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theater Stats - Bar Chart using Recharts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
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
