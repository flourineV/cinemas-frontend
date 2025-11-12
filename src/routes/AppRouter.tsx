import { Routes, Route, Navigate } from "react-router-dom";
import { publicRoutes, protectedRoutes } from "./RouteConfig";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {/* Protected routes */}
      {protectedRoutes.map(({ path, element, role }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute requiredRole={role}>{element}</ProtectedRoute>
          }
        />
      ))}

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
