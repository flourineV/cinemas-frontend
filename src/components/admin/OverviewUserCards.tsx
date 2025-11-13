"use client";
import React, { useEffect, useState } from "react";
import type { StatsOverviewResponse } from "@/types/auth/stats.type";
import { userAdminService } from "@/services/auth/userService";

interface StatCardProps {
  value: number | string;
  label: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  colorClass = "",
}) => {
  const displayValue =
    typeof value === "number" ? value.toLocaleString("vi-VN") : String(value);

  return (
    <div className="bg-gray-900 dark:bg-gray-900 p-5 rounded-xl border border-gray-700">
      <p className={`text-2xl font-semibold ${colorClass} text-white`}>
        {displayValue}
      </p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
};

export default function OverviewCards() {
  const [overview, setOverview] = useState<StatsOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    setLoading(true);
    setError(null);
    try {
      const res = await userAdminService.getStatsOverview();
      setOverview(res.data);
    } catch (err) {
      console.error("fetchOverview error", err);
      setError("Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  }

  // skeleton / loading: hiển thị 5 placeholders để giữ layout
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 h-24 rounded-xl animate-pulse border border-gray-700"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-6 p-4 text-center text-red-400 border border-red-800 bg-black rounded-lg">
        {error}
      </div>
    );
  }

  // map overview fields to cards (thay đổi label / màu nếu cần)
  const items: StatCardProps[] = [
    {
      label: "Tổng người dùng",
      value: overview?.totalUsers ?? "-",
      colorClass: "text-indigo-400",
    },
    {
      label: "Tổng khách hàng",
      value: overview?.totalCustomers ?? "-",
      colorClass: "text-sky-400",
    },
    {
      label: "Tổng nhân viên",
      value: overview?.totalStaff ?? "-",
      colorClass: "text-green-400",
    },
    {
      label: "Tổng quản lí",
      value: overview?.totalManagers ?? "-",
      colorClass: "text-yellow-400",
    },
    {
      label: "Tổng quản trị",
      value: overview?.totalAdmins ?? "-",
      colorClass: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((it, idx) => (
        <StatCard
          key={idx}
          value={it.value}
          label={it.label}
          colorClass={it.colorClass}
        />
      ))}
    </div>
  );
}
