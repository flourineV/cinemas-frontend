export const UserRole = {
  GUEST: "GUEST",
  CUSTOMER: "CUSTOMER",
  STAFF: "STAFF",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
