// src/routes/defineRoute/PublicRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getUserRole, isTokenExpired } from "@/utils/authHelper";
import type { UserRole } from "@/constants/UserRole";

/**
 * Robust PublicRoute:
 * - Normalize role (uppercase string)
 * - Check both accessToken and optionally currentUser.role (if you store user in localStorage)
 * - If token expired -> treat as guest (behaviour unchanged)
 * - If any unexpected error -> fallback to redirect admin-like roles for safety
 */

interface PublicRouteProps {
  children: React.ReactNode;
  blockedRoles?: UserRole[]; // default admin-like
}

const DEFAULT_BLOCKED: UserRole[] = ["MANAGER", "ADMIN"];

const roleToDashboard = (role: string) => {
  const r = role?.toUpperCase?.();
  switch (r) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "CUSTOMER":
      return "/profile";
    default:
      return "/";
  }
};

function normalizeRole(raw: unknown): string | null {
  if (!raw) return null;
  if (typeof raw === "string") return raw.toUpperCase();
  // if enum object, return as string
  try {
    return String(raw).toUpperCase();
  } catch {
    return null;
  }
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  blockedRoles = DEFAULT_BLOCKED,
}) => {
  try {
    const token = localStorage.getItem("accessToken");

    // 1) no token => guest
    if (!token) return <>{children}</>;

    // 2) if token expired -> treat as guest (same as before)
    if (isTokenExpired(token)) return <>{children}</>;

    // 3) get role from helper (may parse token)
    const rawRole = getUserRole(token);
    const role = normalizeRole(rawRole) as string | null;

    // 4) fallback: if you keep user object in localStorage e.g. 'currentUser', try that
    if (!role) {
      try {
        const raw = localStorage.getItem("currentUser");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.role) {
            const nr = normalizeRole(parsed.role);
            if (nr) {
              if ((blockedRoles as string[]).includes(nr)) {
                return <Navigate to={roleToDashboard(nr)} replace />;
              }
              return <>{children}</>;
            }
          }
        }
      } catch (e) {
        // ignore parse errors
      }
      // if still no role, allow view (safe fallback), but log
      console.warn("PublicRoute: no role detected, allowing public view");
      return <>{children}</>;
    }

    // 5) If role normalized is in blocked list -> redirect
    if ((blockedRoles as string[]).map((r) => r.toUpperCase()).includes(role)) {
      return <Navigate to={roleToDashboard(role)} replace />;
    }

    // 6) Not blocked -> allow
    return <>{children}</>;
  } catch (err) {
    console.error("PublicRoute unexpected error:", err);
    // Safer fallback: if error, do NOT expose public page to admin-like if possible.
    // Try to infer role from localStorage and block admin-like:
    try {
      const raw = localStorage.getItem("currentUser");
      if (raw) {
        const parsed = JSON.parse(raw);
        const maybe = normalizeRole(parsed?.role);
        if (maybe && ["ADMIN", "MANAGER"].includes(maybe)) {
          return <Navigate to={roleToDashboard(maybe)} replace />;
        }
      }
    } catch {}
    // final fallback: allow
    return <>{children}</>;
  }
};

export default PublicRoute;
