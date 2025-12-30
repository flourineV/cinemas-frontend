import React, { useEffect, useState } from "react";
import {
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RotateCcw,
} from "lucide-react";
import { bookingService } from "@/services/booking/booking.service";

interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  refundedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export default function OverviewBookingCards(): React.JSX.Element {
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    refundedBookings: 0,
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
          refundedBookings: data.refundedBookings || 0,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Tổng đặt vé</span>
          <Ticket size={20} className="text-gray-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-500">
          {stats.totalBookings.toLocaleString("vi-VN")}
        </p>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Đã xác nhận</span>
          <CheckCircle size={20} className="text-gray-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-500">
          {stats.confirmedBookings.toLocaleString("vi-VN")}
        </p>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Đang chờ</span>
          <Clock size={20} className="text-gray-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-500">
          {stats.pendingBookings.toLocaleString("vi-VN")}
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
          <span className="text-sm font-medium text-gray-700">
            Đã hoàn tiền
          </span>
          <RotateCcw size={20} className="text-gray-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-500">
          {stats.refundedBookings.toLocaleString("vi-VN")}
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
          {formatCurrency(stats.totalRevenue)}
        </p>
      </div>
    </div>
  );
}
