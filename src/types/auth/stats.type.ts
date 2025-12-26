export interface StatsOverviewResponse {
  totalUsers: number;
  totalCustomers: number;
  totalStaff: number;
  totalManagers: number;
  totalAdmins: number;
}

export interface UserListResponse {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string | null;
  status: string;
  createdAt: string | number[]; // Can be string or array format from Java LocalDateTime
}

export interface UserRegistrationStatsResponse {
  year: number;
  month: number;
  total: number;
}

export interface GetUsersParams {
  page?: number;
  size?: number;
  keyword?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortType?: "ASC" | "DESC";
}
