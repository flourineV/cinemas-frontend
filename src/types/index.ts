export interface User {
  id: string;
  username: string;
  role: "GUEST" | "CUSTOMER" | "STAFF" | "MANAGER" | "ADMIN";
}
