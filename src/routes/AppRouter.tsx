import { Routes, Route, Navigate } from "react-router-dom";
import { publicRoutes, protectedRoutes } from "./RouteConfig";
import ProtectedRoute from "@/routes/defineRoute/ProtectedRoute";
import PublicRoute from "@/routes/defineRoute/PublicRoute";
import GuestRoute from "@/routes/defineRoute/GuestRoute";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes with PublicRoute wrapper */}
      {publicRoutes.map(({ path, element }) => {
        // render /login and /signup with GuestRoute
        if (path === "/login" || path === "/signup") {
          return (
            <Route
              key={path}
              path={path}
              element={<GuestRoute>{element}</GuestRoute>}
            />
          );
        }

        return (
          <Route
            key={path}
            path={path}
            element={<PublicRoute>{element}</PublicRoute>}
          />
        );
      })}

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
