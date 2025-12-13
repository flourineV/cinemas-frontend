"use client";
import React, { useEffect, useState } from "react";
import { Film, Play, Calendar, Archive } from "lucide-react";
import { movieService } from "@/services/movie/movieService";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

interface MovieStats {
  totalMovies: number;
  nowPlaying: number;
  upcoming: number;
  archived: number;
}

interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, icon }) => {
  const displayValue =
    typeof value === "number" ? value.toLocaleString("vi-VN") : String(value);

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-yellow-500">{displayValue}</p>
    </div>
  );
};

export default function OverviewMovieCards(): React.JSX.Element {
  const [stats, setStats] = useState<MovieStats>({
    totalMovies: 0,
    nowPlaying: 0,
    upcoming: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await movieService.getStatsOverview();
      setStats(data);
    } catch (error) {
      console.error("Error loading movie stats:", error);
      setError("Không thể tải dữ liệu thống kê phim.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="lg:col-span-4 p-4 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
        {error}
      </div>
    );
  }

  const items: StatCardProps[] = [
    {
      label: "Tổng số phim",
      value: stats.totalMovies,
      icon: <Film size={20} className="text-gray-600" />,
    },
    {
      label: "Đang chiếu",
      value: stats.nowPlaying,
      icon: <Play size={20} className="text-gray-600" />,
    },
    {
      label: "Sắp chiếu",
      value: stats.upcoming,
      icon: <Calendar size={20} className="text-gray-600" />,
    },
    {
      label: "Lưu trữ",
      value: stats.archived,
      icon: <Archive size={20} className="text-gray-600" />,
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
          <StatCard value={it.value} label={it.label} icon={it.icon} />
        </motion.div>
      ))}
    </motion.div>
  );
}
