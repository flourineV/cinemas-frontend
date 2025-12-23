import React, { useEffect, useState } from "react";
import { Ticket, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { bookingService } from "@/services/booking/booking.service";

interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export default function OverviewBookingCards(): React.JSX.Element {
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getStatsOverview();
        setStats({
          totalBookings: data.totalBookings || 0,
          confirmedBookings: data.confirmedBookings || 0,
          cancelledBookings: data.cancelledBookings || 0,
          pendingBookings: data.pendingBookings || 0,
          totalRevenue: data.totalRevenue || 0,
        });
      } catch (error) {
        console.error("Error fetching booking stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng đặt vé</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalBookings}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Ticket className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.confirmedBookings}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Đang chờ</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pendingBookings}
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Đã hủy</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.cancelledBookings}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="p-3 bg-emerald-100 rounded-full">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
