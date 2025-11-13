"use client";
import React from "react";

type BadgeType = "AccountRole" | "AccountStatus";

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
    "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm";

  if (type === "AccountRole") {
    const role = (raw ?? value).toString().toLowerCase();

    const cls =
      role === "admin"
        ? "bg-black/40 border-yellow-400/40 text-red-300"
        : role === "manager"
          ? "bg-black/40 border-yellow-400/40 text-yellow-300"
          : role === "staff"
            ? "bg-black/40 border-yellow-400/40 text-green-300"
            : role === "customer"
              ? "bg-black/40 border-yellow-400/40 text-blue-300"
              : "bg-black/40 border-yellow-400/40 text-white/90";

    return <span className={`${base} ${cls} ${className}`}>{value}</span>;
  }

  // AccountStatus
  const status = (raw ?? value).toString().toLowerCase();
  const statusCls =
    status === "active" || status.includes("đang")
      ? "bg-black/30 border-green-400/40 text-green-300"
      : "bg-black/30 border-red-400/40 text-red-300";

  return <span className={`${base} ${statusCls} ${className}`}>{value}</span>;
};

export default Badge;
