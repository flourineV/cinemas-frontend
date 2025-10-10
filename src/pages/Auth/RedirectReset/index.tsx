import { useEffect } from "react";
import { Loader2 } from "lucide-react"; // biểu tượng loading (tuỳ chọn, có thể bỏ)

export default function RedirectReset() {
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      // Gửi tín hiệu cho tab cũ (nếu đang mở)
      const channel = new BroadcastChannel("auth-sync");
      channel.postMessage({ type: "RESET_PASSWORD", token });

      // ✅ Thay vì đóng tab, redirect luôn chính tab này sang trang reset password
      setTimeout(() => {
        window.location.href = `/reset-password?token=${token}`;
      }, 800); // delay nhẹ để người dùng thấy "Đang chuyển hướng..."
    } else {
      console.error("Không tìm thấy token trong URL!");
    }
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-yellow-400">
      <Loader2 className="w-10 h-10 mb-4 animate-spin text-yellow-400" />
      <p className="text-lg font-medium mb-1">Đang chuyển hướng đến trang đặt lại mật khẩu...</p>
      <p className="text-sm text-gray-400">Vui lòng đợi giây lát</p>
    </div>
  );
}
