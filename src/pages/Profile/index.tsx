import { useEffect, useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../../components/layout/Layout";
import {
  userProfileService,
  loyaltyHistoryService,
} from "@/services/userprofile";
import { bookingService } from "@/services/booking/booking.service";
import { movieService } from "@/services/movie/movieService";
import type {
  UserProfileResponse,
  LoyaltyHistoryItem,
} from "@/types/userprofile";
import { useAuthStore } from "../../stores/authStore";
import { getPosterUrl } from "@/utils/getPosterUrl";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

import { fnbService } from "@/services/fnb/fnbService";
import type { FnbOrderResponse } from "@/types/fnb/fnb.type";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Swal from "sweetalert2";
import CustomSelect from "@/components/ui/CustomSelect";
import {
  User,
  Award,
  Save,
  X,
  History,
  Heart,
  Ticket,
  TrendingUp,
  Camera,
  Coffee,
  Phone,
  MapPin,
  Users,
} from "lucide-react";

type TabType = "info" | "bookings" | "favorites" | "loyalty" | "fnb";

// Custom Input Component (giống Auth modal)
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ElementType;
  label: string;
  error?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  icon: Icon,
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {/* Label nằm trên input */}
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
        {label}
      </label>

      <div className="relative group">
        {/* Icon bên trái */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
          <Icon size={20} />
        </div>

        {/* Input chính */}
        <input
          {...props}
          className={`w-full pl-10 pr-4 py-3 bg-white border border-gray-400 rounded-xl 
            text-zinc-800 placeholder-gray-400 caret-black
            focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20
            hover:border-gray-500 transition-all duration-200 ${
              error ? "border-red-300 bg-red-50" : ""
            } ${className}`}
        />
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <p className="text-red-500 text-xs mt-1 ml-1 font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

// Custom Textarea Component
interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  icon: React.ElementType;
  label: string;
  error?: string;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  icon: Icon,
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {/* Label nằm trên textarea */}
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
        {label}
      </label>

      <div className="relative group">
        {/* Icon bên trái */}
        <div className="absolute left-3 top-3 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
          <Icon size={20} />
        </div>

        {/* Textarea chính */}
        <textarea
          {...props}
          className={`w-full pl-10 pr-4 py-3 bg-white border border-gray-400 rounded-xl 
            text-zinc-800 placeholder-gray-400 caret-black resize-none
            focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20
            hover:border-gray-500 transition-all duration-200 ${
              error ? "border-red-300 bg-red-50" : ""
            } ${className}`}
        />
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <p className="text-red-500 text-xs mt-1 ml-1 font-medium animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

const Profile = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfileResponse>>({});
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [bookings, setBookings] = useState<any[]>([]);
  const [displayedBookings, setDisplayedBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [hasMoreBookings, setHasMoreBookings] = useState(true);
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [loyaltyHistory, setLoyaltyHistory] = useState<LoyaltyHistoryItem[]>(
    []
  );
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [fnbOrders, setFnbOrders] = useState<FnbOrderResponse[]>([]);
  const [fnbLoading, setFnbLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    totalFavoriteMovies: 0,
    totalLoyaltyPoints: 0,
  });

  // Lock body scroll when modal is open
  useBodyScrollLock(isModalOpen);

  // Force scroll to top before any rendering (only on initial load)
  useLayoutEffect(() => {
    // Disable browser's automatic scroll restoration
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Force scroll to top on initial load only
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []); // Empty dependency array = only run once on mount

  // Scroll to top when page loads (but not on tab changes)
  useScrollToTop(undefined, "auto");

  // Handle tab query parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["info", "bookings", "favorites", "loyalty", "fnb"].includes(tabParam)
    ) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const data = await userProfileService.getProfileByUserId(user.id);
        setProfile(data);
        setEditData(data);

        // Fetch user stats
        const stats = await userProfileService.getUserStats(user.id);
        setUserStats(stats);
      } catch (err) {
        console.error("Lỗi khi lấy profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) return;
      setBookingsLoading(true);
      try {
        const data = await bookingService.getBookingsByUser(user.id);
        console.log("📦 All bookings:", data);
        // Filter only CONFIRMED bookings
        const confirmedBookings = data.filter(
          (b: any) => b.status === "CONFIRMED"
        );
        console.log("✅ Confirmed bookings:", confirmedBookings);
        setBookings(confirmedBookings);
        setDisplayedBookings(confirmedBookings.slice(0, 10));
        setHasMoreBookings(confirmedBookings.length > 10);
      } catch (error) {
        console.error("Lỗi khi lấy bookings:", error);
      } finally {
        setBookingsLoading(false);
      }
    };

    if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [user?.id, activeTab]);

  // Fetch favorite movies
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) return;
      setFavoritesLoading(true);
      try {
        const favorites = await userProfileService.getFavorites(user.id);
        console.log("📦 Favorites from API:", favorites);

        // Fetch movie details for each favorite using movieId
        const moviePromises = favorites.map((fav) =>
          movieService.getMovieDetail(fav.movieId)
        );
        const movies = await Promise.all(moviePromises);
        console.log("🎬 Movies fetched:", movies);

        setFavoriteMovies(movies);
      } catch (error) {
        console.error("Lỗi khi lấy phim yêu thích:", error);
      } finally {
        setFavoritesLoading(false);
      }
    };

    if (activeTab === "favorites") {
      fetchFavorites();
    }
  }, [user?.id, activeTab]);

  // Fetch loyalty history
  useEffect(() => {
    const fetchLoyaltyHistory = async () => {
      if (!user?.id) return;
      setLoyaltyLoading(true);
      try {
        const response = await loyaltyHistoryService.getUserLoyaltyHistory(
          user.id,
          1,
          20
        );
        setLoyaltyHistory(response.content);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử điểm thưởng:", error);
      } finally {
        setLoyaltyLoading(false);
      }
    };

    if (activeTab === "loyalty") {
      fetchLoyaltyHistory();
    }
  }, [user?.id, activeTab]);

  // Fetch FnB orders
  useEffect(() => {
    const fetchFnbOrders = async () => {
      if (!user?.id) return;
      setFnbLoading(true);
      try {
        const orders = await fnbService.getOrdersByUser(user.id);
        console.log("📦 FnB orders:", orders);
        // Filter only CONFIRMED orders
        const confirmedOrders = orders.filter(
          (order) => order.status === "CONFIRMED"
        );
        setFnbOrders(confirmedOrders);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử đặt bắp nước:", error);
      } finally {
        setFnbLoading(false);
      }
    };

    if (activeTab === "fnb") {
      fetchFnbOrders();
    }
  }, [user?.id, activeTab]);

  const loadMoreBookings = () => {
    const currentLength = displayedBookings.length;
    const nextBatch = bookings.slice(currentLength, currentLength + 10);
    setDisplayedBookings([...displayedBookings, ...nextBatch]);
    setHasMoreBookings(currentLength + 10 < bookings.length);
  };

  const handleAvatarChange = (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "File quá lớn",
        text: "Kích thước file không được vượt quá 5MB!",
        confirmButtonColor: "#EAB308",
      });
      return;
    }

    // Validate file type (only JPEG and PNG)
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Định dạng không hỗ trợ",
        text: "Vui lòng chọn file JPEG hoặc PNG!",
        confirmButtonColor: "#EAB308",
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    // Validation
    if (!editData.fullName?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập họ và tên!",
        confirmButtonColor: "#EAB308",
      });
      return;
    }

    if (editData.phoneNumber && !/^[0-9]{10,11}$/.test(editData.phoneNumber)) {
      Swal.fire({
        icon: "warning",
        title: "Số điện thoại không hợp lệ",
        text: "Vui lòng nhập 10-11 chữ số.",
        confirmButtonColor: "#EAB308",
      });
      return;
    }

    // Remove nationalId validation since it's read-only

    setIsSaving(true);
    try {
      let avatarUrl = editData.avatarUrl;

      // Upload avatar if a new file is selected
      if (avatarFile) {
        try {
          avatarUrl = await userProfileService.uploadAvatar(avatarFile);
        } catch (uploadError) {
          console.error("Lỗi khi upload avatar:", uploadError);
          Swal.fire({
            icon: "error",
            title: "Lỗi upload ảnh",
            text: "Không thể upload ảnh đại diện! Vui lòng thử lại.",
            confirmButtonColor: "#EAB308",
          });
          return;
        }
      }

      const updated = await userProfileService.updateProfile(user.id, {
        fullName: editData.fullName?.trim(),
        gender: editData.gender as "MALE" | "FEMALE" | "OTHER" | undefined,
        phoneNumber: editData.phoneNumber?.trim() || undefined,
        address: editData.address?.trim() || undefined,
        avatarUrl: avatarUrl,
        // Remove dateOfBirth and nationalId - BE doesn't support them
      });

      setProfile(updated);
      setEditData(updated);
      setIsModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview("");

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật thông tin thành công!",
        confirmButtonColor: "#EAB308",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi cập nhật",
        text: "Không thể lưu thông tin! Vui lòng thử lại.",
        confirmButtonColor: "#EAB308",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 relative">
          <div
            className="flex flex-col items-center justify-center"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
            }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500 mb-4"></div>
            <div className="text-gray-600 text-lg">{t("profile.loading")}</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-red-600 text-xl">{t("profile.cannotLoad")}</div>
        </div>
      </Layout>
    );
  }

  const loyaltyPercent = Math.min((profile.loyaltyPoint / 1000) * 100, 100);

  const tabs = [
    { id: "info" as TabType, label: t("profile.info"), icon: User },
    { id: "bookings" as TabType, label: t("profile.bookings"), icon: Ticket },
    { id: "fnb" as TabType, label: t("profile.fnb"), icon: Coffee },
    { id: "favorites" as TabType, label: t("profile.favorites"), icon: Heart },
    { id: "loyalty" as TabType, label: t("profile.loyalty"), icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white">
          <div className="max-w-5xl mx-auto py-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600 p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left mt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-3xl text-gray-900 font-semibold">
                    {profile.fullName || t("profile.notUpdated")}
                  </p>

                  <button
                    onClick={() => {
                      setEditData(profile);
                      setAvatarFile(null);
                      setAvatarPreview("");
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-1.5 bg-transparent border border-gray-400 text-gray-900 text-md font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    {t("profile.edit")}
                  </button>
                </div>
                <h1 className="text-2xl font-light text-gray-900 mb-5">
                  {profile.username}
                </h1>

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-10 mb-4">
                  <div className="text-center">
                    <span className="block text-gray-900 font-semibold">
                      {userStats.totalBookings}
                    </span>
                    <span className="text-gray-600 text-md">
                      {t("profile.ticketsBooked")}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-900 font-semibold">
                      {userStats.totalFavoriteMovies}
                    </span>
                    <span className="text-gray-600 text-md">
                      {t("profile.favoriteMovies")}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-900 font-semibold">
                      {profile.loyaltyPoint}
                    </span>
                    <span className="text-gray-600 text-md">
                      {t("profile.loyaltyPoints")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white -mt-5">
          <div className="max-w-5xl mx-auto space-y-1">
            <div className="flex items-center gap-2 text-gray-900 text-lg">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="font-semibold">
                {t("profile.memberRank")} {profile.rankName || "Bronze"}
              </span>
            </div>
          </div>
        </div>

        {/* Loyalty Progress */}
        <div className="bg-white mb-5">
          <div className="max-w-5xl mx-auto py-4">
            <div className="flex items-center gap-6">
              {/* Label */}
              <span className="text-gray-600 text-md whitespace-nowrap">
                {t("profile.rankProgress")}
              </span>

              {/* Progress bar */}
              <div className="flex-1 max-w-md">
                <div className="w-full bg-gray-300 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${loyaltyPercent}%` }}
                  />
                </div>
              </div>

              {/* Points */}
              <span className="text-yellow-600 text-md font-semibold whitespace-nowrap">
                {profile.loyaltyPoint}/1000
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-5 gap-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 py-4 border-t transition-colors ${
                      isActive
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto py-8">
          {activeTab === "info" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              <InfoItem
                label={t("profile.fullName")}
                value={profile.fullName || t("profile.notUpdated")}
              />
              <InfoItem label={t("profile.email")} value={profile.email} />
              <InfoItem
                label={t("profile.phone")}
                value={profile.phoneNumber || t("profile.notUpdated")}
              />
              <InfoItem
                label={t("profile.gender")}
                value={
                  profile.gender === "MALE"
                    ? t("profile.male")
                    : profile.gender === "FEMALE"
                      ? t("profile.female")
                      : profile.gender === "OTHER"
                        ? t("profile.other")
                        : t("profile.notUpdated")
                }
              />
              <InfoItem
                label="Date of Birth"
                value={
                  profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                    : t("profile.notUpdated")
                }
              />
              <InfoItem
                label="National ID"
                value={profile.nationalId || t("profile.notUpdated")}
              />
              <InfoItem
                label={t("profile.address")}
                value={profile.address || t("profile.notUpdated")}
              />

              <InfoItem
                label="Status"
                value={
                  profile.status === "ACTIVE"
                    ? t("profile.active")
                    : t("profile.blocked")
                }
              />
              <InfoItem
                label="Created Date"
                value={
                  profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"
                }
              />
            </motion.div>
          )}

          {activeTab === "bookings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {bookingsLoading ? (
                <div className="text-center py-16">
                  <div className="text-gray-500">{t("profile.loading")}</div>
                </div>
              ) : displayedBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("profile.noBookingHistory")}
                  </h3>
                  <p className="text-gray-500">
                    {t("profile.bookingHistoryDesc")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedBookings.map((booking) => (
                    <div
                      key={booking.bookingId}
                      className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.movieTitle || "Phim"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t("profile.bookingCode")}: {booking.bookingCode}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "CONFIRMED"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="text-gray-600">
                          <span className="font-medium">
                            {t("profile.theater")}:
                          </span>{" "}
                          {booking.showtime?.theaterName || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">
                            {t("profile.room")}:
                          </span>{" "}
                          {booking.showtime?.roomName || "N/A"}
                        </div>
                        <div className="text-gray-600 col-span-2">
                          <span className="font-medium">
                            {t("profile.showtime")}:
                          </span>{" "}
                          {booking.showtime?.startTime
                            ? new Date(
                                booking.showtime.startTime
                              ).toLocaleString("vi-VN")
                            : "N/A"}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {t("profile.seats")}:{" "}
                          <span className="font-semibold text-gray-900">
                            {booking.seats
                              ?.map((s: any) => s.seatNumber || s)
                              .join(", ") || "N/A"}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-yellow-600">
                          {booking.totalPrice?.toLocaleString() || 0} VNĐ
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMoreBookings && (
                    <button
                      onClick={loadMoreBookings}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
                    >
                      {t("profile.seeMore")}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "favorites" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {favoritesLoading ? (
                <div className="text-center py-16">
                  <div className="text-gray-500">{t("profile.loading")}</div>
                </div>
              ) : favoriteMovies.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("profile.noFavoriteMovies")}
                  </h3>
                  <p className="text-gray-500">
                    {t("profile.favoriteMoviesDesc")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {favoriteMovies.map((movie) => (
                    <div key={movie.id} className="group relative">
                      {/* Remove button */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!user?.id) return;
                          try {
                            await userProfileService.removeFavorite(
                              user.id, // Use actual userId from auth
                              movie.id
                            );
                            setFavoriteMovies((prev) =>
                              prev.filter((m) => m.id !== movie.id)
                            );
                          } catch (error) {
                            console.error("Error removing favorite:", error);
                            Swal.fire({
                              icon: "error",
                              title: "Lỗi",
                              text: "Không thể xóa phim yêu thích!",
                              confirmButtonText: "OK",
                              confirmButtonColor: "#f59e0b",
                            });
                          }
                        }}
                        className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/60 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>

                      <div
                        onClick={() => navigate(`/movie/${movie.id}`)}
                        className="cursor-pointer"
                      >
                        <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all">
                          <img
                            src={getPosterUrl(movie.posterUrl)}
                            alt={movie.title}
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h4 className="text-white font-semibold text-sm line-clamp-2">
                                {movie.title}
                              </h4>
                              <p className="text-gray-300 text-xs mt-1">
                                {movie.releaseDate}
                              </p>
                            </div>
                          </div>
                        </div>
                        <h4 className="mt-2 text-gray-900 font-medium text-sm line-clamp-2">
                          {movie.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "fnb" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {fnbLoading ? (
                <div className="text-center py-16">
                  <div className="text-gray-500">{t("profile.loading")}</div>
                </div>
              ) : fnbOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("profile.noFnbHistory")}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {t("profile.fnbHistoryDesc")}
                  </p>
                  <button
                    onClick={() => navigate("/popcorn-drink")}
                    className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
                  >
                    {t("profile.orderNow")}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {fnbOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl p-6 shadow hover:shadow-md transition border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {t("profile.fnbOrder")}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t("profile.orderCode")}: {order.orderCode}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "CONFIRMED"
                              ? "bg-green-100 text-green-700"
                              : order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.status === "CONFIRMED"
                            ? t("profile.confirmed")
                            : order.status === "PENDING"
                              ? t("profile.pending")
                              : t("profile.cancelled")}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          {t("profile.orderedItems")}:
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-gray-900">
                                  {item.name}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  x{item.quantity}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-gray-900 font-medium">
                                  {item.subtotal.toLocaleString()} VNĐ
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.unitPrice.toLocaleString()} VNĐ/món
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {t("profile.orderTime")}:
                          </span>{" "}
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </div>
                        <div className="text-lg font-bold text-yellow-600">
                          {t("profile.total")}:{" "}
                          {order.totalAmount.toLocaleString()} VNĐ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "loyalty" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              {/* Loyalty Card */}
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm opacity-90 mb-1">
                      {t("profile.membershipRank")}
                    </p>
                    <h2 className="text-3xl font-bold">
                      {profile.rankName || "Bronze"}
                    </h2>
                  </div>
                  <Award className="w-16 h-16 opacity-30" />
                </div>
                <div className="mb-4">
                  <p className="text-sm opacity-90 mb-2">
                    {t("profile.currentPoints")}
                  </p>
                  <p className="text-4xl font-bold">{profile.loyaltyPoint}</p>
                </div>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div
                    className="bg-white/40 h-2 rounded-full transition-all"
                    style={{ width: `${loyaltyPercent}%` }}
                  />
                </div>
                <p className="text-sm opacity-90">
                  {t("profile.pointsRemaining")} {1000 - profile.loyaltyPoint}{" "}
                  {t("profile.pointsToNext")}
                </p>
              </div>

              {/* Loyalty History */}
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {t("profile.loyaltyHistory")}
                </h3>
                {loyaltyLoading ? (
                  <div className="text-center py-16">
                    <div className="text-gray-500">{t("profile.loading")}</div>
                  </div>
                ) : loyaltyHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {t("profile.noLoyaltyHistory")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loyaltyHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                item.transactionType === "EARNED"
                                  ? "bg-green-100 text-green-700"
                                  : item.transactionType === "REDEEMED"
                                    ? "bg-red-100 text-red-700"
                                    : item.transactionType === "BONUS"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {item.transactionType === "EARNED"
                                ? t("profile.earned")
                                : item.transactionType === "REDEEMED"
                                  ? t("profile.redeemed")
                                  : item.transactionType === "BONUS"
                                    ? t("profile.bonus")
                                    : t("profile.expired")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-lg font-bold ${
                              item.transactionType === "EARNED" ||
                              item.transactionType === "BONUS"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.transactionType === "EARNED" ||
                            item.transactionType === "BONUS"
                              ? "+"
                              : "-"}
                            {Math.abs(item.points)}
                          </span>
                          <p className="text-xs text-gray-500">
                            {t("profile.points")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{t("profile.edit")}</h3>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setAvatarFile(null);
                      setAvatarPreview("");
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Avatar Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600 p-1">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : editData.avatarUrl ? (
                          <img
                            src={editData.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {/* Overlay for better UX */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <button
                      onClick={() => {
                        const modalFileInput = document.createElement("input");
                        modalFileInput.type = "file";
                        modalFileInput.accept = "image/jpeg,image/png";
                        modalFileInput.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files?.[0]) {
                            handleAvatarChange(target.files[0]);
                          }
                        };
                        modalFileInput.click();
                      }}
                      className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                      title={t("profile.changeAvatar")}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-xs text-gray-400 mt-1">
                      {t("profile.avatarFormat")}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInput
                    label={`${t("profile.fullName")} *`}
                    icon={User}
                    type="text"
                    value={editData.fullName || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, fullName: e.target.value })
                    }
                    placeholder={t("profile.fullName")}
                    error={
                      !editData.fullName?.trim()
                        ? `${t("profile.fullName")} ${t("profile.requiredField")}`
                        : undefined
                    }
                  />

                  <CustomInput
                    label={t("profile.phone")}
                    icon={Phone}
                    type="tel"
                    value={editData.phoneNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setEditData({
                        ...editData,
                        phoneNumber: value,
                      });
                    }}
                    placeholder={t("profile.phone")}
                    maxLength={11}
                    error={
                      editData.phoneNumber &&
                      !/^[0-9]{10,11}$/.test(editData.phoneNumber)
                        ? t("profile.phoneInvalid")
                        : undefined
                    }
                  />

                  <div className="w-full">
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5 ml-1">
                      {t("profile.gender")}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300 z-10">
                        <Users size={20} />
                      </div>
                      <CustomSelect
                        options={[
                          { value: "", label: t("profile.selectGender") },
                          { value: "MALE", label: t("profile.male") },
                          { value: "FEMALE", label: t("profile.female") },
                          { value: "OTHER", label: t("profile.other") },
                        ]}
                        value={editData.gender || ""}
                        onChange={(value: string) =>
                          setEditData({
                            ...editData,
                            gender: value as "MALE" | "FEMALE" | "OTHER",
                          })
                        }
                        placeholder={t("profile.selectGender")}
                        variant="default"
                        className="w-[180px]"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <CustomTextarea
                      label={t("profile.address")}
                      icon={MapPin}
                      value={editData.address || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      rows={3}
                      placeholder={t("profile.address")}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !editData.fullName?.trim()}
                    className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {t("profile.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {t("profile.saveChanges")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Info Item Component
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1">
      {label}
    </label>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
);

export default Profile;
