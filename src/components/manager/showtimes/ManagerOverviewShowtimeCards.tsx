import React, { useEffect, useState } from "react";
import { Calendar, Clock, AlertTriangle, Building2 } from "lucide-react";
import { showtimeService } from "@/services/showtime/showtimeService";
import { theaterService } from "@/services/showtime/theaterService";
import { managerService, userProfileService } from "@/services/userprofile";
import { useAuthStore } from "@/stores/authStore";

interface ShowtimeStats {
  totalShowtimes: number;
  activeShowtimes: number;
  suspendedShowtimes: number;
  upcomingShowtimes: number;
}

export default function ManagerOverviewShowtimeCards(): React.JSX.Element {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ShowtimeStats>({
    totalShowtimes: 0,
    activeShowtimes: 0,
    suspendedShowtimes: 0,
    upcomingShowtimes: 0,
  });
  const [theaterName, setTheaterName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get manager's theater info
        const profile = await userProfileService.getProfileByUserId(user.id);
        const managerInfo = await managerService.getManagerByUser(profile.id);
        setTheaterName(managerInfo.managedCinemaName);

        // Get theater ID from name
        const theaters = await theaterService.getAllTheaters();
        const theater = theaters.find(
          (t) => t.name === managerInfo.managedCinemaName
        );

        if (theater) {
          // Fetch theater-specific stats
          const theaterStats = await showtimeService.getStatsOverview(
            theater.id
          );
          setStats({
            totalShowtimes: theaterStats.totalShowtimes || 0,
            activeShowtimes: theaterStats.activeShowtimes || 0,
            suspendedShowtimes: (theaterStats as any).suspendedShowtimes || 0,
            upcomingShowtimes: theaterStats.upcomingShowtimes || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching manager showtime stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Theater Header */}
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Thống kê lịch chiếu - {theaterName}
        </h3>
      </div>

      {/* Theater-specific Stats */}
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
    </div>
  );
}
