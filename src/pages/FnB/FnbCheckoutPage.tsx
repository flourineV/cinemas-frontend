import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { paymentService } from "@/services/payment/payment.service";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { Check, CreditCard } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import Swal from "sweetalert2";

// Import FnB components
import FnbOrderSummary from "@/components/fnb/FnbOrderSummary";
import { useAccurateTimer } from "@/hooks/useAccurateTimer";

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

const FNB_STEPS = [
  { id: 1, label: "CHỌN BẮP NƯỚC" },
  { id: 2, label: "THANH TOÁN" },
];

const FnbCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { theater, cart, totalAmount, order, ttl, ttlTimestamp } =
    location.state as {
      theater: TheaterResponse;
      cart: CartItem[];
      totalAmount: number;
      order: any;
      ttl: number;
      ttlTimestamp: number;
    };

  const [activeStep] = useState(2); // Nhảy thẳng step 2
  const [loading, setLoading] = useState(false);

  // Calculate accurate TTL
  const adjustedTTL = ttl
    ? Math.max(0, ttl - Math.floor((Date.now() - ttlTimestamp) / 1000))
    : null;
  const timeLeft = useAccurateTimer({
    initialTime: adjustedTTL,
    enabled: true,
    onExpired: () => {
      Swal.fire({
        title: "Hết thời gian",
        text: "Đơn hàng đã hết hạn. Vui lòng đặt lại.",
        icon: "warning",
        confirmButtonColor: "#eab308",
      }).then(() => {
        navigate("/popcorn-drink");
      });
    },
  });

  // Check authentication on mount
  useEffect(() => {
    if (!user) {
      Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Bạn cần đăng nhập để đặt bắp nước",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Quay lại",
        confirmButtonColor: "#eab308",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth");
        } else {
          navigate("/popcorn-drink");
        }
      });
    }
  }, [user, navigate]);

  const handlePayment = async () => {
    if (!user || !order) {
      Swal.fire({
        title: "Lỗi",
        text: "Không tìm thấy thông tin đơn hàng",
        icon: "error",
        confirmButtonColor: "#eab308",
      });
      return;
    }

    console.log("🔍 [FnbCheckout] Order data:", order);
    console.log("🔍 [FnbCheckout] Order ID:", order.id);

    setLoading(true);
    try {
      // Chỉ tạo ZaloPay payment URL (order đã được tạo ở PopcornDrinkPage)
      // Ensure order.id is string (not UUID object)
      const fnbOrderId =
        typeof order.id === "string" ? order.id : order.id.toString();
      console.log("🔍 [FnbCheckout] Sending fnbOrderId:", fnbOrderId);

      const paymentResponse =
        await paymentService.createZaloPayUrlForFnb(fnbOrderId);

      if (paymentResponse.order_url) {
        // Redirect to ZaloPay
        window.location.href = paymentResponse.order_url;
      } else {
        throw new Error("Không thể tạo link thanh toán");
      }
    } catch (error: any) {
      console.error("❌ [FnbCheckout] Payment error:", error);
      console.error("❌ [FnbCheckout] Error response:", error.response?.data);
      console.error("❌ [FnbCheckout] Error status:", error.response?.status);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi tạo thanh toán";

      Swal.fire({
        title: "Lỗi",
        text: `${errorMessage}. Vui lòng thử lại.`,
        icon: "error",
        confirmButtonColor: "#eab308",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!theater || !cart || cart.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Không có thông tin đơn hàng</p>
            <button
              onClick={() => navigate("/popcorn-drink")}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Quay lại đặt bắp nước
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-yellow-500 mb-4">
              ĐẶT BẮP NƯỚC
            </h1>
            <p className="text-gray-600 text-lg">
              Hoàn tất đơn hàng và thanh toán
            </p>
          </div>

          {/* Steps Progress */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-8">
              {FNB_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step.id <= activeStep
                        ? "bg-yellow-500 border-yellow-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {step.id < activeStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium ${
                      step.id <= activeStep
                        ? "text-yellow-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < FNB_STEPS.length - 1 && (
                    <div
                      className={`w-16 h-0.5 ml-8 ${
                        step.id < activeStep ? "bg-yellow-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Steps */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <AnimatePresence mode="wait">
                  {activeStep === 2 && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                          💳 Thanh toán
                        </h2>

                        {user && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Thông tin khách hàng:
                            </h3>
                            <p className="text-gray-700">👤 {user.username}</p>
                            <p className="text-gray-700">📧 {user.email}</p>
                          </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <img
                              src="/zalopay-logo.png"
                              alt="ZaloPay"
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzAwNTFBNSIvPgo8cGF0aCBkPSJNMTIgMTZIMzZWMzJIMTJWMTZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K";
                              }}
                            />
                            <div>
                              <p className="font-bold text-gray-900 text-lg">
                                Thanh toán qua ZaloPay
                              </p>
                              <p className="text-gray-600">
                                Bạn sẽ được chuyển đến ZaloPay để hoàn tất thanh
                                toán
                              </p>
                            </div>
                            <CreditCard className="w-8 h-8 text-blue-600 ml-auto" />
                          </div>
                        </div>

                        <div className="flex justify-between mt-8">
                          <button
                            onClick={() => navigate("/popcorn-drink")}
                            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold"
                          >
                            ← Quay lại chọn món
                          </button>

                          <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="px-10 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                💳 Thanh toán ngay
                                <CreditCard className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side - Summary */}
            <div className="lg:col-span-1">
              <FnbOrderSummary
                theater={theater}
                cart={cart}
                totalAmount={totalAmount}
                ttl={timeLeft}
                orderCode={order?.orderCode}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FnbCheckoutPage;
