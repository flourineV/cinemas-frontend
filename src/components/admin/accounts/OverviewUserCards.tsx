"use client";
import React, { useEffect, useState } from "react";
import type { StatsOverviewResponse } from "@/types/auth/stats.type";
import { userAdminService } from "@/services/auth/userService";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

interface StatCardProps {
  value: number | string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
  const displayValue =
    typeof value === "number" ? value.toLocaleString("vi-VN") : String(value);

  return (
    <div
      className="
        bg-black/60 backdrop-blur-md 
        border border-yellow-400/40 
        rounded-2xl p-5 shadow-2xl
        transition-all duration-300
        hover:bg-yellow-500/30 hover:border-yellow-400/40
        bg-yellow-500/20
      "
    >
      <p className="text-2xl font-bold text-yellow-300">{displayValue}</p>
      <p className="text-sm text-gray-300 mt-1">{label}</p>
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

  // Skeleton loading — dùng style giống Card real nhưng animate
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="
              bg-black/40 backdrop-blur-md 
              border border-yellow-400/10 
              rounded-2xl h-24 animate-pulse
            "
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          lg:col-span-6 p-4 text-center 
          text-red-400 bg-black/60 backdrop-blur-md 
          border border-red-500/40 rounded-2xl shadow-xl
        "
      >
        {error}
      </div>
    );
  }

  const items: StatCardProps[] = [
    { label: "Số lượng người dùng", value: overview?.totalUsers ?? "-" },
    { label: "Số lượng khách hàng", value: overview?.totalCustomers ?? "-" },
    { label: "Số lượng nhân viên", value: overview?.totalStaff ?? "-" },
    { label: "Số lượng quản lí", value: overview?.totalManagers ?? "-" },
    { label: "Số lượng quản trị", value: overview?.totalAdmins ?? "-" },
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
      className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4"
      initial={shouldReduceMotion ? undefined : "hidden"}
      animate={shouldReduceMotion ? undefined : "show"}
      variants={containerVariants}
      aria-live="polite"
    >
      {items.map((it, idx) => (
        <motion.div
          key={idx}
          variants={cardVariants}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
        >
          <StatCard value={it.value} label={it.label} />
        </motion.div>
      ))}
    </motion.div>
  );
}
