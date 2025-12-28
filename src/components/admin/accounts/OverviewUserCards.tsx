"use client";
import React, { useEffect, useState } from "react";
import { Users, UserCheck, Briefcase, Shield, Crown } from "lucide-react";
import type { StatsOverviewResponse } from "@/types/auth/stats.type";
import { userAdminService } from "@/services/auth/userService";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon, color }) => {
  const displayValue =
    typeof value === "number" ? value.toLocaleString("vi-VN") : String(value);

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className={color}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-yellow-500">{displayValue}</p>
    </div>
  );
};

export default function OverviewCards() {
  const [overview, setOverview] = useState<StatsOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

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

  // Skeleton loading
  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-6 p-4 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
        {error}
      </div>
    );
  }

  const items: StatCardProps[] = [
    {
      label: "Tổng tài khoản",
      value: overview?.totalUsers ?? "-",
      icon: <Users size={20} className="text-gray-600" />,
      color: "",
    },
    {
      label: "Tổng khách hàng",
      value: overview?.totalCustomers ?? "-",
      icon: <UserCheck size={20} className="text-gray-600" />,
      color: "",
    },
    {
      label: "Tổng quản lý",
      value: overview?.totalManagers ?? "-",
      icon: <Shield size={20} className="text-gray-600" />,
      color: "",
    },
    {
      label: "Tổng quản trị",
      value: overview?.totalAdmins ?? "-",
      icon: <Crown size={20} className="text-gray-600" />,
      color: "",
    },
  ];

  // Framer motion variants (or undefined when reduced motion)
  const containerVariants: Variants | undefined = shouldReduceMotion
    ? undefined
    : {
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.06,
          },
        },
      };

  const cardVariants: Variants | undefined = shouldReduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      };

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={shouldReduceMotion ? undefined : "hidden"}
      animate={shouldReduceMotion ? undefined : "show"}
      variants={containerVariants}
      aria-live="polite"
    >
      {items.map((it, idx) => (
        <motion.div key={idx} variants={cardVariants}>
          <StatCard
            value={it.value}
            label={it.label}
            icon={it.icon}
            color={it.color}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
