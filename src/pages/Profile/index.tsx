import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { authService } from "../../services/authService";
import type { UserProfile } from "../../types";
import { useAuth } from "../../stores/authStore";
import { useAuthActions } from "../../hooks/useAuthActions";
import { User, Camera, Calendar } from "lucide-react";
import { FaChevronDown } from 'react-icons/fa'; // Icon mũi tên cho dropdown

// --- Constants ---
const GENDER_OPTIONS = [
  { label: 'Nam', value: 'MALE' },
  { label: 'Nữ', value: 'FEMALE' },
  { label: 'Khác', value: 'OTHER' },
];

// --- Components ---

// Component InputField (Dùng cho Text Input và Date Picker)
const InputField = ({
  label,
  value,
  name,
  onChange,
  disabled = false,
  type = "text",
}: {
  label: string;
  value: string | number | undefined | null;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
}) => {
    const isDate = type === "date";
    const displayValue = value === null || value === undefined ? "" : value.toString();

    const displayPlaceholder = disabled && !displayValue;

    // Class Tailwind
    const baseClass = `p-2 border rounded-md text-white focus:ring-yellow-500 focus:border-yellow-500`;
    const disabledClass = "border-gray-600 bg-slate-700 text-gray-300 cursor-default";
    const enabledClass = "border-yellow-500 bg-slate-800";

    // Giá trị hiển thị khi DISABLED
    const displayedInputValue = (() => {
        if (displayPlaceholder) return "Chưa có";
        if (isDate && disabled && displayValue) {
            // Định dạng ngày cho chế độ xem (ví dụ: 24/09/2025)
            const date = new Date(displayValue);
            return isNaN(date.getTime()) ? displayValue : date.toLocaleDateString('vi-VN');
        }
        return displayValue;
    })();

    // Loại input khi DISABLED
    const inputType = isDate && disabled ? "text" : type;

    return (
        <div className="flex flex-col">
            <label className="text-gray-300 text-sm font-medium mb-2">{label}:</label>
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    value={
                      // Nếu là input type="date" và đang chỉnh sửa, value cần là yyyy-mm-dd
                      (isDate && !disabled) ? displayValue : displayedInputValue
                    }
                    placeholder={displayPlaceholder ? "Chưa có" : `Nhập ${label.toLowerCase()}`}
                    onChange={onChange}
                    className={`${baseClass} w-full ${disabled ? disabledClass : enabledClass} ${isDate && !disabled ? 'appearance-none' : ''}`}
                    disabled={disabled}
                    // Đặc biệt cho input type="date"
                    min="1900-01-01" 
                    max={new Date().toISOString().split('T')[0]} 
                />
                {isDate && disabled && (
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
            </div>
        </div>
    );
};


// Component GenderDropdown (Custom Dropdown)
const GenderDropdown = ({
  label,
  value,
  name,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string | undefined | null;
  name: string;
  onChange: (e: { name: string; value: string }) => void;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = GENDER_OPTIONS.find(opt => opt.value === value);

  const handleSelect = (option: typeof GENDER_OPTIONS[0]) => {
    onChange({ name: name, value: option.value });
    setIsOpen(false);
  };

  const displayLabel = selectedOption ? selectedOption.label : (disabled ? "Chưa có" : "Chọn Giới tính");

  // Nếu đang ở chế độ xem (disabled)
  if (disabled) {
    return (
        <InputField
            label={label}
            value={displayLabel}
            name={name}
            onChange={() => {}} 
            disabled={true} 
        />
    );
  }

  // Chế độ chỉnh sửa (Custom Dropdown)
  return (
    <div className="flex flex-col">
      <label className="text-gray-300 text-sm font-medium mb-2">{label}:</label>
      <div className="relative inline-block text-left w-full z-20">
        <button
          type="button"
          className="inline-flex justify-between items-center w-full px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-yellow-500 rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-400 transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {displayLabel}
          <FaChevronDown className={`-mr-1 ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-yellow-400' : ''}`} />
        </button>

        {isOpen && (
          <div 
            className="origin-top-right absolute left-0 mt-2 w-full rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={{ minWidth: '100%' }}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            <div className="py-1" role="none">
              {GENDER_OPTIONS.map((option) => (
                <a
                  key={option.value}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(option);
                  }}
                  className={`
                    ${value === option.value ? 'bg-yellow-700 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                    block px-4 py-2 text-sm transition-colors duration-150
                  `}
                  role="menuitem"
                >
                  {option.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Profile Component ---

const Profile = () => {
  const { user } = useAuth();
  const { logout } = useAuthActions();
  
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);
  const [editableProfile, setEditableProfile] = useState<UserProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Thêm trạng thái ĐANG LƯU

  // 1. Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const data: UserProfile = await authService.getProfile(user.id);
        setInitialProfile(data);
        setEditableProfile(data);
      } catch (err) {
        console.error("Lỗi khi lấy profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  // 2. Handle Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleDropdownChange = ({ name, value }: { name: string; value: string }) => {
    setEditableProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setEditableProfile(initialProfile);
    setIsEditing(false);
  };

  // 3. Handle Save (API Call)
  const handleSaveInfo = async () => {
    if (!editableProfile || !user?.id) return;

    // Lọc ra các trường cần gửi lên API PUT
    const dataToUpdate: Partial<UserProfile> = {
      fullName: editableProfile.fullName,
      dateOfBirth: editableProfile.dateOfBirth,
      gender: editableProfile.gender,
      phoneNumber: editableProfile.phoneNumber,
      nationalId: editableProfile.nationalId,
    };

    setIsSaving(true);
    try {
      // GỌI API updateProfile THỰC TẾ
      const updatedData = await authService.updateProfile(user.id, dataToUpdate);
      
      console.log("Profile đã cập nhật thành công:", updatedData);
      alert("Thông tin đã được lưu thành công!");
      
      // Cập nhật lại cả hai state với dữ liệu mới nhất từ server
      setInitialProfile(updatedData); 
      setEditableProfile(updatedData);
      setIsEditing(false);

    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
      alert("Lỗi: Không thể lưu thông tin. Vui lòng kiểm tra lại kết nối hoặc dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    alert("Chức năng Đổi mật khẩu đang được phát triển!");
  };

  const handleLogout = () => {
    logout();
  };
  
  // --- Render Logic ---

  if (isLoading) {
    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center text-white">
                Đang tải thông tin...
            </div>
        </Layout>
    );
  }

  const profile = editableProfile;

  if (!profile) {
    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center text-red-400">
                Không thể tải thông tin người dùng. Vui lòng thử lại.
            </div>
        </Layout>
    );
  }

  const fullName = profile.fullName || profile.username || "Chưa cập nhật";
  const loyaltyPoint = profile.loyaltyPoint ?? 0;
  const rank = profile.rank || "Mới";

  return (
    <Layout>
      <div className="relative min-h-screen text-white">
        {/* Background ngang */}
        <div className="absolute inset-x-0 h-40 md:h-72 z-0">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: "url('/background_profile.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* 2 card riêng biệt */}
        <div className="relative z-10 max-w-5xl mx-auto pt-32 flex flex-col md:flex-row gap-8 items-start">
          {/* Card trái */}
          <div className="md:w-1/3 flex flex-col items-center p-6 rounded-xl shadow-2xl bg-white/10 backdrop-blur-xl border border-gray-500">
            {/* Avatar Section */}
            <div className="relative w-48 h-48 mb-4 group">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-full border-4 border-yellow-400 object-cover 
                                     group-hover:opacity-60 transition duration-300"
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-yellow-400 bg-gray-600 flex items-center justify-center
                                         group-hover:opacity-80 transition duration-300">
                  <User className="w-24 h-24 text-white" />
                </div>
              )}
              {/* Overlay icon Camera */}
              <div
                onClick={() => document.getElementById("avatarInput")?.click()}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 
                                  cursor-pointer transition duration-300"
              >
                <Camera className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // TODO: Gọi API upload avatar
                    console.log("File chọn:", file);
                  }
                }}
              />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 
                                     bg-gray-300 text-slate-800 text-xs font-bold 
                                     py-2 px-6 shadow-md whitespace-nowrap"
                style={{
                  clipPath: "polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%)"
                }}
              >
                Thành viên "{rank}"
              </div>
            </div>

            <p className="text-2xl font-bold mb-1 text-center">{fullName}</p>
            {/* Loyalty Point */}
            <div className="w-full mb-6 mt-7">
              <p className="text-sm font-medium mb-1">
                Điểm thành viên: {loyaltyPoint}/1000
              </p>
              <div className="w-full bg-gray-600 rounded-full h-2.5">
                <div
                  className="bg-yellow-400 h-2.5 rounded-full"
                  style={{
                    width: `${Math.min((loyaltyPoint / 1000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            
            <button className="w-full py-2 mb-4 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition duration-200">
              Xem lợi ích
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition duration-200"
            >
              Đăng xuất
            </button>
          </div>

          {/* Card phải */}
          <div className="md:w-2/3 p-6 rounded-xl shadow-2xl bg-white/10 backdrop-blur-xl border border-gray-500 flex-grow">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              THÔNG TIN KHÁCH HÀNG
            </h2>

            <div className="space-y-4 mb-8 border-b border-gray-600 pb-6">
              <h3 className="text-xl font-semibold mb-3">Thông tin cơ bản:</h3>
              {/* Các Input Fields */}
              <InputField label="Họ và tên" value={profile.fullName} name="fullName" onChange={handleInputChange} disabled={!isEditing} />
              <InputField label="Ngày sinh" value={profile.dateOfBirth} name="dateOfBirth" onChange={handleInputChange} disabled={!isEditing} type="date" />
              <GenderDropdown label="Giới tính" value={profile.gender} name="gender" onChange={handleDropdownChange} disabled={!isEditing} /> 
              <InputField label="Số điện thoại" value={profile.phoneNumber} name="phoneNumber" onChange={handleInputChange} disabled={!isEditing} />
              <InputField label="Email" value={profile.email} name="email" onChange={handleInputChange} disabled={true} /> {/* Email luôn disabled */}
              <InputField label="CCCD/CMND" value={profile.nationalId} name="nationalId" onChange={handleInputChange} disabled={!isEditing} /> 
              
              <div className="flex justify-end pt-2 space-x-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                      disabled={isSaving} // Không cho Hủy khi đang Lưu
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveInfo}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
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
    </Layout>
  );
};

export default Profile;