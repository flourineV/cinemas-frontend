import { jwtDecode } from "jwt-decode";
import type { UserRole } from "@/constants/UserRole";

export interface DecodedToken {
  sub: string; // userId
  role: UserRole;
  exp: number;
  iat: number;
  [key: string]: any;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const getUserRole = (token: string | null): UserRole => {
  if (!token) return "GUEST";
  const decoded = decodeToken(token);
  return decoded?.role ?? "GUEST";
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp < Date.now() / 1000;
};

export const getRoleRedirectPath = (role: UserRole): string => {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MANAGER":
      return "/manager/dashboard";
    case "STAFF":
      return "/staff/dashboard";
    case "CUSTOMER":
      return "/";
    default:
      return "/";
  }
};
