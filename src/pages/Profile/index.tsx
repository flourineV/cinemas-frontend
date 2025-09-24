import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { authService } from "../../services/authService"; // file api bạn đã có
import type { UserProfile } from "../../types";
import { useAuth } from "../../stores/authStore";

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

   useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return; // nếu chưa có user thì không gọi API
      try {
        const data = await authService.getProfile(user.id);
        console.log("Profile API data:", data);
        setProfile(data);
      } catch (err) {
        console.error("Lỗi khi lấy profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-white">
          Đang tải thông tin...
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center text-red-400">
          Không thể tải thông tin người dùng.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">Thông tin cá nhân</h2>

          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <img
              src={profile.avatarUrl || "/default-avatar.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-yellow-400 object-cover"
            />
            <div>
              <p className="text-xl font-semibold">{profile.username}</p>
              <p className="text-gray-400">{profile.email}</p>
              <p className="text-sm text-yellow-400">ID: {profile.id}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400">Số điện thoại</p>
              <p className="font-medium">{profile.phoneNumber || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">CMND/CCCD</p>
              <p className="font-medium">{profile.nationalId || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Ngày sinh</p>
              <p className="font-medium">{profile.dateOfBirth || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Giới tính</p>
              <p className="font-medium">{profile.gender || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Điểm thưởng</p>
              <p className="font-medium">{profile.loyaltyPoint}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Hạng</p>
              <p className="font-medium">{profile.rank}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Trạng thái</p>
              <p className="font-medium">{profile.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Ngày tạo</p>
              <p className="font-medium">{new Date(profile.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Favorite Genres */}
          <div>
            <p className="text-sm text-gray-400">Thể loại yêu thích</p>
            <p className="font-medium">{profile.favoriteGenres || "Chưa có"}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
