// src/components/common/Badge.tsx
"use client";
import React from "react";

type BadgeType = "AccountRole" | "AccountStatus";

interface BadgeProps {
  type?: BadgeType;
  value: string;
  className?: string;
}

/**
 * Simple Badge component used by the tables.
 * - AccountRole: different colors per role
 * - AccountStatus: green for active, red/gray for others
 */
export const Badge: React.FC<BadgeProps> = ({
  type = "AccountRole",
  value,
  className = "",
}) => {
  const base =
    "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium";

  if (type === "AccountRole") {
    // map some common role -> color
    const cls =
      value === "Khách hàng" || value.toLowerCase().includes("customer")
        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        : value === "Nhân viên" || value.toLowerCase().includes("staff")
          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          : value === "Quản lý" || value.toLowerCase().includes("manager")
            ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
            : value.toLowerCase().includes("admin")
              ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-200";

    return <span className={`${base} ${cls} ${className}`}>{value}</span>;
  }

  // AccountStatus
  const statusCls =
    value.toLowerCase().includes("đang") ||
    value.toLowerCase().includes("active")
      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      : value.toLowerCase().includes("vô") ||
          value.toLowerCase().includes("inactive")
        ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        : "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-200";

  return <span className={`${base} ${statusCls} ${className}`}>{value}</span>;
};

export default Badge;
