import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { useNavigate } from "react-router-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  User,
  Award,
  LogOut,
  Edit2,
  Save,
  X,
  History,
  Heart,
  Ticket,
  TrendingUp,
  Camera,
  Upload,
} from "lucide-react";

type TabType = "info" | "bookings" | "favorites" | "loyalty";

const Profile = () => {
  const { user, signout } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfileResponse>>({});
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Lock body scroll when modal is open
  useBodyScrollLock(isModalOpen);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const data = await userProfileService.getProfileByUserId(user.id);
        setProfile(data);
        setEditData(data);
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

  const loadMoreBookings = () => {
    const currentLength = displayedBookings.length;
    const nextBatch = bookings.slice(currentLength, currentLength + 10);
    setDisplayedBookings([...displayedBookings, ...nextBatch]);
    setHasMoreBookings(currentLength + 10 < bookings.length);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      let avatarUrl = editData.avatarUrl;

      // Upload avatar if a new file is selected
      if (avatarFile) {
        const uploadResult = await userProfileService.uploadAvatar(
          user.id,
          avatarFile
        );
        avatarUrl = uploadResult.avatarUrl;
      }

      const updated = await userProfileService.updateProfile(user.id, {
        fullName: editData.fullName,
        gender: editData.gender as "MALE" | "FEMALE" | "OTHER" | undefined,
        phoneNumber: editData.phoneNumber,
        address: editData.address,
        avatarUrl: avatarUrl,
        dateOfBirth: editData.dateOfBirth,
        nationalId: editData.nationalId,
      });
      setProfile(updated);
      setEditData(updated);
      setIsModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Không thể lưu thông tin!");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-yellow-600 text-xl">Đang tải...</div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-red-600 text-xl">Không thể tải thông tin!</div>
        </div>
      </Layout>
    );
  }

  const loyaltyPercent = Math.min((profile.loyaltyPoint / 1000) * 100, 100);

  const tabs = [
    { id: "info" as TabType, label: "Thông tin", icon: User },
    { id: "bookings" as TabType, label: "Lịch sử đặt vé", icon: Ticket },
    { id: "favorites" as TabType, label: "Phim yêu thích", icon: Heart },
    { id: "loyalty" as TabType, label: "Điểm thưởng", icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-8">
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
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-4">
                  <h1 className="text-2xl font-light text-gray-900">
                    {profile.username}
                  </h1>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditData(profile);
                        setAvatarFile(null);
                        setAvatarPreview("");
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-1.5 bg-transparent border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Chỉnh sửa trang cá nhân
                    </button>
                    <button
                      onClick={signout}
                      className="px-4 py-1.5 bg-transparent border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-8 mb-4">
                  <div className="text-center">
                    <span className="block text-gray-900 font-semibold">
                      12
                    </span>
                    <span className="text-gray-600 text-sm">vé đã đặt</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-900 font-semibold">8</span>
                    <span className="text-gray-600 text-sm">
                      phim yêu thích
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-gray-900 font-semibold">
                      {profile.loyaltyPoint}
                    </span>
                    <span className="text-gray-600 text-sm">điểm</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <p className="text-gray-900 font-semibold">
                    {profile.fullName || "Chưa cập nhật"}
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 text-sm">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>Hạng {profile.rankName || "Bronze"}</span>
                  </div>
                  {profile.email && (
                    <p className="text-gray-600 text-sm">{profile.email}</p>
                  )}
                </div>

                {/* Loyalty Progress */}
                <div className="mt-4 max-w-md">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Tiến độ lên hạng</span>
                    <span className="text-yellow-600 font-semibold">
                      {profile.loyaltyPoint}/1000
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${loyaltyPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex justify-center gap-16">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 border-t transition-colors ${
                      isActive
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider hidden md:inline">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {activeTab === "info" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              <InfoItem
                label="Họ và tên"
                value={profile.fullName || "Chưa cập nhật"}
              />
              <InfoItem label="Email" value={profile.email} />
              <InfoItem
                label="Số điện thoại"
                value={profile.phoneNumber || "Chưa cập nhật"}
              />
              <InfoItem
                label="Giới tính"
                value={
                  profile.gender === "MALE"
                    ? "Nam"
                    : profile.gender === "FEMALE"
                      ? "Nữ"
                      : profile.gender === "OTHER"
                        ? "Khác"
                        : "Chưa cập nhật"
                }
              />
              <InfoItem
                label="Ngày sinh"
                value={
                  profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"
                }
              />
              <InfoItem
                label="CMND/CCCD"
                value={profile.nationalId || "Chưa cập nhật"}
              />
              <div className="md:col-span-2">
                <InfoItem
                  label="Địa chỉ"
                  value={profile.address || "Chưa cập nhật"}
                />
              </div>
              <InfoItem
                label="Trạng thái"
                value={profile.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
              />
              <InfoItem
                label="Ngày tạo"
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
                  <div className="text-gray-500">Đang tải...</div>
                </div>
              ) : displayedBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có lịch sử đặt vé
                  </h3>
                  <p className="text-gray-500">
                    Các vé bạn đặt sẽ hiển thị ở đây
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
                            Mã đặt vé: {booking.bookingCode}
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
                          <span className="font-medium">Rạp:</span>{" "}
                          {booking.showtime?.theaterName || "N/A"}
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">Phòng:</span>{" "}
                          {booking.showtime?.roomName || "N/A"}
                        </div>
                        <div className="text-gray-600 col-span-2">
                          <span className="font-medium">Thời gian:</span>{" "}
                          {booking.showtime?.startTime
                            ? new Date(
                                booking.showtime.startTime
                              ).toLocaleString("vi-VN")
                            : "N/A"}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Ghế:{" "}
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
                      Xem thêm
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
                  <div className="text-gray-500">Đang tải...</div>
                </div>
              ) : favoriteMovies.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chưa có phim yêu thích
                  </h3>
                  <p className="text-gray-500">
                    Các phim bạn yêu thích sẽ hiển thị ở đây
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
                              user.id,
                              movie.tmdbId
                            );
                            setFavoriteMovies((prev) =>
                              prev.filter((m) => m.id !== movie.id)
                            );
                          } catch (error) {
                            console.error("Error removing favorite:", error);
                            alert("Không thể xóa phim yêu thích!");
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
                    <p className="text-sm opacity-90 mb-1">Hạng thành viên</p>
                    <h2 className="text-3xl font-bold">
                      {profile.rankName || "Bronze"}
                    </h2>
                  </div>
                  <Award className="w-16 h-16 opacity-30" />
                </div>
                <div className="mb-4">
                  <p className="text-sm opacity-90 mb-2">Điểm hiện tại</p>
                  <p className="text-4xl font-bold">{profile.loyaltyPoint}</p>
                </div>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div
                    className="bg-white/40 h-2 rounded-full transition-all"
                    style={{ width: `${loyaltyPercent}%` }}
                  />
                </div>
                <p className="text-sm opacity-90">
                  Còn {1000 - profile.loyaltyPoint} điểm để lên hạng tiếp theo
                </p>
              </div>

              {/* Loyalty History */}
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Lịch sử điểm thưởng
                </h3>
                {loyaltyLoading ? (
                  <div className="text-center py-16">
                    <div className="text-gray-500">Đang tải...</div>
                  </div>
                ) : loyaltyHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Chưa có lịch sử giao dịch</p>
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
                                ? "Tích điểm"
                                : item.transactionType === "REDEEMED"
                                  ? "Đổi điểm"
                                  : item.transactionType === "BONUS"
                                    ? "Thưởng"
                                    : "Hết hạn"}
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
                          <p className="text-xs text-gray-500">điểm</p>
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
        <AnimatePresence>
          {isModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="fixed inset-0 bg-black/50 z-50"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Chỉnh sửa thông tin
                    </h2>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setAvatarFile(null);
                        setAvatarPreview("");
                      }}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
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
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white transition"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-500 text-center">
                        Nhấn vào biểu tượng camera để thay đổi ảnh đại diện
                      </p>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          value={editData.fullName || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={editData.phoneNumber || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giới tính
                        </label>
                        <select
                          value={editData.gender || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              gender: e.target.value as
                                | "MALE"
                                | "FEMALE"
                                | "OTHER",
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          value={editData.dateOfBirth || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CMND/CCCD
                        </label>
                        <input
                          type="text"
                          value={editData.nationalId || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              nationalId: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Nhập số CMND/CCCD"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ
                        </label>
                        <textarea
                          value={editData.address || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              address: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                          placeholder="Nhập địa chỉ đầy đủ"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setAvatarFile(null);
                        setAvatarPreview("");
                      }}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
