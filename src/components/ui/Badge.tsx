"use client";
import React from "react";

type BadgeType = "AccountRole" | "AccountStatus" | "MovieStatus";

interface BadgeProps {
  type?: BadgeType;
  value: string; // text hiển thị (có thể là tiếng Việt)
  raw?: string; // giá trị thô từ DB (ví dụ 'admin','manager', 'staff', 'customer' hoặc 'ACTIVE','INACTIVE')
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  type = "AccountRole",
  value,
  raw,
  className = "",
}) => {
  const base =
    "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border";

  if (type === "AccountRole") {
    const role = (raw ?? value).toString().toLowerCase();

    const cls =
      role === "admin"
        ? "bg-red-100 border-red-300 text-red-800"
        : role === "manager"
          ? "bg-yellow-100 border-yellow-300 text-yellow-800"
          : role === "staff"
            ? "bg-blue-100 border-blue-300 text-blue-800"
            : role === "customer"
              ? "bg-green-100 border-green-300 text-green-800"
              : "bg-gray-100 border-gray-300 text-gray-800";

    return <span className={`${base} ${cls} ${className}`}>{value}</span>;
  }

  if (type === "MovieStatus") {
    const movieStatus = (raw ?? value).toString().toLowerCase();
    const movieStatusCls =
      movieStatus === "now_playing" || movieStatus.includes("đang chiếu")
        ? "bg-yellow-100 border-yellow-300 text-yellow-800"
        : movieStatus === "upcoming" || movieStatus.includes("sắp chiếu")
          ? "bg-green-100 border-green-300 text-green-800"
          : movieStatus === "archived" || movieStatus.includes("lưu trữ")
            ? "bg-blue-100 border-blue-300 text-blue-800"
            : "bg-gray-100 border-gray-300 text-gray-800";

    return (
      <span className={`${base} ${movieStatusCls} ${className}`}>{value}</span>
    );
  }

  // AccountStatus
  const status = (raw ?? value).toString().toLowerCase();
  const statusCls =
    status === "active" || status.includes("đang")
      ? "bg-green-100 border-green-300 text-green-800"
      : status === "banned" || status.includes("cấm")
        ? "bg-red-100 border-red-300 text-red-800"
        : "bg-gray-100 border-gray-300 text-gray-800";

  return <span className={`${base} ${statusCls} ${className}`}>{value}</span>;
};

export default Badge;
