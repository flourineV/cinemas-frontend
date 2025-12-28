import React, { useEffect, useState } from "react";
import { Film, Play, Calendar, Archive, Building2 } from "lucide-react";
import { movieService } from "@/services/movie/movieService";
import { managerService, userProfileService } from "@/services/userprofile";
import { useAuthStore } from "@/stores/authStore";

interface MovieStats {
  totalMovies: number;
  nowPlaying: number;
  upcoming: number;
  archived: number;
}

export default function ManagerOverviewMovieCards(): React.JSX.Element {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<MovieStats>({
    totalMovies: 0,
    nowPlaying: 0,
    upcoming: 0,
    archived: 0,
  });
  const [theaterName, setTheaterName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get manager's theater info for display
        const profile = await userProfileService.getProfileByUserId(user.id);
        const managerInfo = await managerService.getManagerByUser(profile.id);
        setTheaterName(managerInfo.managedCinemaName);

        // Fetch global movie stats (movies are not theater-specific)
        const movieStats = await movieService.getStatsOverview();
        setStats(movieStats);
      } catch (error) {
        console.error("Error fetching manager movie stats:", error);
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
          Thống kê phim - {theaterName}
        </h3>
      </div>

      {/* Movie Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Tổng số phim
            </span>
            <Film size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.totalMovies.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Đang chiếu
            </span>
            <Play size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.nowPlaying.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">Sắp chiếu</span>
            <Calendar size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.upcoming.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">Lưu trữ</span>
            <Archive size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.archived.toLocaleString("vi-VN")}
          </p>
        </div>
      </div>
    </div>
  );
}
