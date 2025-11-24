import Home from "@/pages/Home";
import SignIn from "@/pages/Auth/SignIn";
import SignUp from "@/pages/Auth/SignUp";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import RedirectReset from "@/pages/Auth/RedirectReset";
import ResetPassword from "@/pages/Auth/ResetPassword";
import About from "@/pages/About";
import Promotions from "@/pages/Promotions";
import Profile from "@/pages/Profile";
import MovieDetailPage from "@/pages/Movie/MovieDetailPage";
import NowPlayingPage from "@/pages/Movie/NowPlayingPage";
import UpcomingPage from "@/pages/Movie/UpcomingPage";
import AdminDashboard from "@/pages/Dashboard/Admin/AdminDashboard";
import ManagerDashboard from "@/pages/Dashboard/Manager/ManagerDashboard";
import StaffDashboard from "@/pages/Dashboard/Staff/StaffDashboard";
import CheckoutPage from "@/pages/Checkout/CheckoutPage";

import { UserRole } from "@/constants/UserRole";

export const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/promotions", element: <Promotions /> },
  { path: "/movies/now-playing", element: <NowPlayingPage /> },
  { path: "/movies/upcoming", element: <UpcomingPage /> },
  { path: "/movies/:id", element: <MovieDetailPage /> },
  { path: "/login", element: <SignIn /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/redirect-reset", element: <RedirectReset /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/checkout", element: <CheckoutPage /> },
];

export const protectedRoutes = [
  { path: "/profile", element: <Profile />, role: UserRole.CUSTOMER },
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
    role: UserRole.ADMIN,
  },
  {
    path: "/manager/dashboard",
    element: <ManagerDashboard />,
    role: UserRole.MANAGER,
  },
  {
    path: "/staff/dashboard",
    element: <StaffDashboard />,
    role: UserRole.STAFF,
  },
];
