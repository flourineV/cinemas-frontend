import React from "react";

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * GuestRoute: Cho phép tất cả mọi người truy cập (guest và user đã login)
 * Không có bất kỳ logic kiểm tra token/role nào
 * Không wrap Layout vì các page components đã tự wrap Layout rồi
 */
const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default GuestRoute;
