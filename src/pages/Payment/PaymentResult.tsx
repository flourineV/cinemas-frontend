import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService } from "@/services/payment/payment.service";
import Layout from "@/components/layout/Layout";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Lấy appTransId từ URL params (ZaloPay redirect sẽ có param này)
        const appTransId = searchParams.get("apptransid");

        if (!appTransId) {
          setStatus("failed");
          setMessage("Không tìm thấy thông tin giao dịch");
          return;
        }

        // Gọi API check status
        const response =
          await paymentService.checkTransactionStatus(appTransId);

        if (response.isSuccess && response.returnCode === 1) {
          setStatus("success");
          setMessage("Thanh toán thành công!");

          // Phân biệt loại payment để redirect đúng tab
          // Check nếu có type parameter hoặc appTransId có pattern FnB
          const paymentType = searchParams.get("type");
          const isFnbPayment =
            paymentType === "fnb" ||
            appTransId.toLowerCase().includes("fnb") ||
            appTransId.toLowerCase().includes("popcorn");

          // Redirect về trang phù hợp sau 3 giây
          setTimeout(() => {
            if (isFnbPayment) {
              navigate("/profile?tab=fnb");
            } else {
              navigate("/profile?tab=bookings");
            }
          }, 3000);
        } else {
          setStatus("failed");
          setMessage(response.returnMessage || "Thanh toán thất bại");
        }
      } catch (error: any) {
        console.error("Error checking payment status:", error);
        setStatus("failed");
        setMessage(error.message || "Không thể kiểm tra trạng thái thanh toán");
      }
    };

    checkPaymentStatus();
  }, [searchParams, navigate]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-zinc-900">
        <div className="bg-zinc-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Đang xử lý thanh toán...
              </h1>
              <p className="text-gray-400">Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>
              <p className="text-gray-400 mb-4">
                Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
              </p>
              <p className="text-sm text-gray-500">
                {(() => {
                  const paymentType = searchParams.get("type");
                  const appTransId = searchParams.get("apptransid") || "";
                  const isFnbPayment =
                    paymentType === "fnb" ||
                    appTransId.toLowerCase().includes("fnb") ||
                    appTransId.toLowerCase().includes("popcorn");
                  return isFnbPayment
                    ? "Đang chuyển hướng đến lịch sử bắp nước..."
                    : "Đang chuyển hướng đến trang lịch sử đặt vé...";
                })()}
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-400 mb-6">{message}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/")}
                  className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Về trang chủ
                </button>
                <button
                  onClick={() => {
                    const paymentType = searchParams.get("type");
                    const appTransId = searchParams.get("apptransid") || "";
                    const isFnbPayment =
                      paymentType === "fnb" ||
                      appTransId.toLowerCase().includes("fnb") ||
                      appTransId.toLowerCase().includes("popcorn");
                    navigate(
                      isFnbPayment
                        ? "/profile?tab=fnb"
                        : "/profile?tab=bookings"
                    );
                  }}
                  className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md hover:bg-yellow-500 transition"
                >
                  Xem đơn hàng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentResult;
