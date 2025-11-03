import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import RedirectReset from "./pages/Auth/RedirectReset";
import ResetPassword from "./pages/Auth/ResetPassword";
import About from "./pages/About";
import Promotions from "./pages/Promotions";
import Profile from "./pages/Profile";
import DashboardWrapper from "./components/layout/DashboardWrapper";
import MovieDetailPage from "./pages/Movie/MovieDetailPage";
import NowPlayingPage from "@/pages/Movie/NowPlayingPage";
import UpcomingPage from "@/pages/Movie/UpcomingPage";
import "./styles/globals.css";
import useResetPasswordListener from "@/hooks/useAuthListener"

function App() {
  return (
    <Router>
      <ResetPasswordListenerWrapper />
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
        <Route path="/forgot-password" element={<ForgotPassword/>}/>

        {/* Protected routes (sẽ làm sau với Zustand guard) */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<DashboardWrapper />} />
      </Routes>
    </Router>
  );
}

function ResetPasswordListenerWrapper() {
  // gọi hook custom của ông
  useResetPasswordListener();
  return null; // không render gì cả
}


export default App;
