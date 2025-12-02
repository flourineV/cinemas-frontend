import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();

  // ZaloPay sẽ trả về url dạng: http://localhost:5173/payment-result?amount=50000&appid=2553&...
  // Bạn có thể lấy thông tin từ đây để hiển thị
  const status = searchParams.get("status"); // (Tuỳ ZaloPay trả về gì)

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Đang xử lý thanh toán...</h1>
      <p>Vui lòng đợi trong giây lát.</p>
      {/* Gọi API check status đơn hàng lần cuối nếu cần */}
    </div>
  );
};

export default PaymentResult;
