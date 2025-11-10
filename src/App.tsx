import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
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
import StaffDashboard from "@/pages/Dashboard/Staff/StaffDashboard";
import "./styles/globals.css";

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/movies/now-playing" element={<NowPlayingPage />} />
        <Route path="/movies/upcoming" element={<UpcomingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/redirect-reset" element={<RedirectReset />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes */}
        <Route path="/profile" element={<Profile />} />

        {/* Role-based dashboard */}
        <Route
          path="/dashboard"
          element={
            user?.role === "ADMIN" ? (
              <Navigate to="/admin/dashboard" />
            ) : user?.role === "STAFF" ? (
              <Navigate to="/staff/dashboard" />
            ) : (
              <Navigate to="/user/dashboard" />
            )
          }
        />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
