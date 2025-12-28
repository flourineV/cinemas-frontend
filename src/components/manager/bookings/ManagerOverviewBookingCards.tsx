import React, { useEffect, useState } from "react";
import {
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Building2,
} from "lucide-react";
import { bookingService } from "@/services/booking/booking.service";
import { theaterService } from "@/services/showtime/theaterService";
import { managerService, userProfileService } from "@/services/userprofile";
import { useAuthStore } from "@/stores/authStore";

interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export default function ManagerOverviewBookingCards(): React.JSX.Element {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
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
          // Fetch theater-specific booking stats
          const bookingStats = await bookingService.getStatsOverview(
            theater.id
          );
          setStats(bookingStats);
        }
      } catch (error) {
        console.error("Error fetching manager booking stats:", error);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
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
          Thống kê đặt vé - {theaterName}
        </h3>
      </div>

      {/* Theater-specific Booking Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Tổng đặt vé
            </span>
            <Ticket size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.totalBookings.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Đã xác nhận
            </span>
            <CheckCircle size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.confirmedBookings.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">Đã hủy</span>
            <XCircle size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.cancelledBookings.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">Chờ xử lý</span>
            <Clock size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.pendingBookings.toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="bg-white border border-gray-400 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Tổng doanh thu
            </span>
            <DollarSign size={20} className="text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-500">
            {stats.totalRevenue.toLocaleString("vi-VN")} ₫
          </p>
        </div>
      </div>
    </div>
  );
}
