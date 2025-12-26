import React, { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  paymentService,
  type PaymentStatsResponse,
} from "@/services/payment/payment.service";

export default function OverviewPaymentCards(): React.JSX.Element {
  const [stats, setStats] = useState<PaymentStatsResponse>({
    totalPayments: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getStatsOverview();
        setStats({
          totalPayments: data.totalPayments || 0,
          successfulPayments: data.successfulPayments || 0,
          failedPayments: data.failedPayments || 0,
          pendingPayments: data.pendingPayments || 0,
          totalRevenue: data.totalRevenue || 0,
        });
      } catch (error) {
        console.error("Error fetching payment stats:", error);
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
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">
            Tổng giao dịch
          </span>
          <CreditCard size={20} className="text-gray-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-500">
          {stats.totalPayments.toLocaleString("vi-VN")}
        </p>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Thành công</span>
          <CheckCircle size={20} className="text-gray-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-500">
          {stats.successfulPayments.toLocaleString("vi-VN")}
        </p>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Đang chờ</span>
          <Clock size={20} className="text-gray-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-500">
          {stats.pendingPayments.toLocaleString("vi-VN")}
        </p>
      </div>

      <div className="bg-white border border-gray-400 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Thất bại</span>
          <XCircle size={20} className="text-gray-600" />
        </div>
        <p className="text-3xl font-bold text-yellow-500">
          {stats.failedPayments.toLocaleString("vi-VN")}
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
