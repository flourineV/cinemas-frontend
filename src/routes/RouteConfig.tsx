import Home from "@/pages/Home";
import AuthPage from "@/pages/Auth/AuthPage";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import RedirectReset from "@/pages/Auth/RedirectReset";
import ResetPassword from "@/pages/Auth/ResetPassword";
import About from "@/pages/About";
import Promotions from "@/pages/Promotions";
import PopcornDrinkPage from "@/pages/FnB/PopcornDrinkPage";
import FnbCheckoutPage from "@/pages/FnB/FnbCheckoutPage";
import ShowtimePage from "@/pages/Showtime/ShowtimePage";
import Profile from "@/pages/Profile";
import MovieDetailPage from "@/pages/Movie/MovieDetailPage";
import NowPlayingPage from "@/pages/Movie/NowPlayingPage";
import UpcomingPage from "@/pages/Movie/UpcomingPage";
import AdminDashboard from "@/pages/Dashboard/Admin/AdminDashboard";
import ManagerDashboard from "@/pages/Dashboard/Manager/ManagerDashboard";
import StaffDashboard from "@/pages/Dashboard/Staff/StaffDashboard";
import CheckoutPage from "@/pages/Checkout/CheckoutPage";
import PaymentResult from "@/pages/Payment/PaymentResult";
import TheaterDetail from "@/pages/Theater/TheaterDetail";
import SearchPage from "@/pages/Search/SearchPage";
import SeatSelectionPage from "@/pages/Booking/SeatSelectionPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

import { UserRole } from "@/constants/UserRole";

export const publicRoutes = [
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/promotions", element: <Promotions /> },
  { path: "/showtime", element: <ShowtimePage /> },
  { path: "/popcorn-drink", element: <PopcornDrinkPage /> },
  { path: "/fnb-checkout", element: <FnbCheckoutPage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/movies/now-playing", element: <NowPlayingPage /> },
  { path: "/movies/upcoming", element: <UpcomingPage /> },
  { path: "/movies/:id", element: <MovieDetailPage /> },
  { path: "/theater/:theaterId", element: <TheaterDetail /> },
  { path: "/booking/seats/:showtimeId", element: <SeatSelectionPage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/redirect-reset", element: <RedirectReset /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/checkout", element: <CheckoutPage /> },
  { path: "/payment-result", element: <PaymentResult /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
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
