import React, { useEffect, useState } from "react";
import { Calendar, Clock, Building2, Users, TrendingUp } from "lucide-react";
import { showtimeService } from "@/services/showtime/showtimeService";
import { theaterService } from "@/services/showtime/theaterService";

interface ShowtimeStats {
  totalShowtimes: number;
  activeShowtimes: number;
  upcomingShowtimes: number;
  weeklyShowtimes: number;
}

interface TheaterStats {
  theaterId: string;
  theaterName: string;
  totalShowtimes: number;
  activeShowtimes: number;
  upcomingShowtimes: number;
}

export default function OverviewShowtimeCards(): React.JSX.Element {
  const [stats, setStats] = useState<ShowtimeStats>({
    totalShowtimes: 0,
    activeShowtimes: 0,
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
        setStats(overallStats);

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
              upcomingShowtimes: theaterStat.upcomingShowtimes || 0,
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
              upcomingShowtimes: 0,
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Thống kê tổng quan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-sm font-medium text-gray-600">Đang chiếu</p>
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
                <p className="text-sm font-medium text-gray-600">Sắp chiếu</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.upcomingShowtimes}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tuần này</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.weeklyShowtimes}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theater Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Thống kê theo rạp
        </h3>
        <div className="bg-white border border-gray-400 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rạp
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng lịch chiếu
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đang chiếu
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sắp chiếu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {theaterStats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  theaterStats.map((theater) => (
                    <tr key={theater.theaterId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">
                            {theater.theaterName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-900 font-semibold">
                          {theater.totalShowtimes}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {theater.activeShowtimes}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {theater.upcomingShowtimes}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
