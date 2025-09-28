import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { authService } from "../../services/authService"; // file api bạn đã có
import type { UserProfile } from "../../types";
import { useAuth } from "../../stores/authStore";
import { useAuthActions } from "../../hooks/useAuthActions";
// 💡 BƯỚC 1: Import icon User từ lucide-react
import { User } from 'lucide-react'; 

const InputField = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <div className="flex flex-col">
    <label className="text-gray-300 text-sm font-medium mb-1">{label}:</label>
    <input
      type="text"
      defaultValue={value || ""}
      className="p-2 border border-gray-600 rounded-md bg-slate-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
      disabled // Tạm thời khóa để hiển thị dữ liệu
    />
  </div>
);

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { logout } = useAuthActions();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
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

  // Các hàm xử lý hành động (cần implement logic)
  const handleSaveInfo = () => {
    alert("Chức năng Lưu thông tin đang được phát triển!");
  };

  const handleChangePassword = () => {
    alert("Chức năng Đổi mật khẩu đang được phát triển!");
  };
  
  const handleLogout = () => {
    logout(); // Gọi hàm đăng xuất từ Auth Store
  }

  // --- Loading và Error States ---

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
          Không thể tải thông tin người dùng. Vui lòng thử lại.
        </div>
      </Layout>
    );
  }

  // --- Main Render ---

  // Lấy các trường dữ liệu cần thiết từ profile
  const fullName = profile.username || "Chưa cập nhật";
  const dateOfBirth = profile.dateOfBirth || "";
  const phoneNumber = profile.phoneNumber || "";
  const email = profile.email || "";
  const loyaltyPoint = profile.loyaltyPoint ?? 0; // Điểm thưởng
  const rank = profile.rank || "Mới"; // Hạng thành viên

  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 text-white pt-20 pb-10" style={{ backgroundImage: `url('path/to/your/background-image.jpg')`, backgroundSize: 'cover' }}>
        <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8">
          
          {/* CỘT BÊN TRÁI: AVATAR VÀ THÔNG TIN TÓM TẮT */}
          <div className="md:w-1/3 flex flex-col items-center p-4 bg-slate-700 rounded-lg shadow-inner">
            
            {/* Vùng Avatar */}
            <div className="relative w-32 h-32 mb-4">
                {/* 💡 BƯỚC 2: Thay thế thẻ <img> bằng logic điều kiện */}
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full border-4 border-yellow-400 object-cover"
                  />
                ) : (
                    // Hiển thị icon User khi không có URL
                  <div className="w-full h-full rounded-full border-4 border-yellow-400 bg-gray-600 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}

                {/* Giả lập thành viên "Bạc" */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-[-10px] bg-gray-300 text-slate-800 text-xs font-bold py-1 px-3 rounded-full shadow-md">
                  Thành viên "{rank}"
                </div>
            </div>

            <p className="text-2xl font-bold mb-1 text-center">{fullName}</p>
            <p className="text-gray-400 text-sm mb-4">@{profile.username}</p>

            {/* Nút Thay đổi ảnh đại diện */}
            <button className="text-purple-300 hover:text-purple-400 border border-purple-300 px-3 py-1 rounded-md text-sm mb-6 transition duration-200">
              Thay đổi ảnh đại diện
            </button>

            {/* Tích điểm thành viên */}
            <div className="w-full mb-6">
              <p className="text-sm font-medium mb-1">Tích điểm thành viên: {loyaltyPoint}/1000</p>
              <div className="w-full bg-gray-600 rounded-full h-2.5">
                <div 
                  className="bg-yellow-400 h-2.5 rounded-full" 
                  style={{ width: `${Math.min((loyaltyPoint / 1000) * 100, 100)}%` }} // Tối đa 100%
                ></div>
              </div>
            </div>

            {/* Nút Xem lợi ích */}
            <button className="w-full py-2 mb-4 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition duration-200">
              Xem lợi ích
            </button>
            
            {/* Nút Đăng xuất */}
            <button 
              onClick={handleLogout} 
              className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition duration-200"
            >
              Đăng xuất
            </button>

          </div>

          {/* CỘT BÊN PHẢI: FORM THÔNG TIN VÀ ĐỔI MẬT KHẨU */}
          <div className="md:w-2/3 p-4">
            
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">THÔNG TIN KHÁCH HÀNG</h2>

            {/* Vùng 1: Thông tin cơ bản */}
            <div className="space-y-4 mb-8 border-b border-gray-600 pb-6">
              <h3 className="text-xl font-semibold mb-3">Thông tin cơ bản:</h3>
              <InputField label="Họ và tên" value={fullName} />
              <InputField label="Ngày sinh" value={dateOfBirth} />
              <InputField label="Số điện thoại" value={phoneNumber} />
              <InputField label="Email" value={email} />
              
              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSaveInfo} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Lưu thông tin
                </button>
              </div>
            </div>

            {/* Vùng 2: Đổi mật khẩu */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-3">Đổi mật khẩu:</h3>
              <InputField label="Mật khẩu cũ" value="" /> {/* Luôn để trống */}
              <InputField label="Mật khẩu mới" value="" /> {/* Luôn để trống */}
              <InputField label="Xác thực mật khẩu" value="" /> {/* Luôn để trống */}
              
              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleChangePassword} 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
