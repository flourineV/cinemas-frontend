import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { fnbService } from "@/services/fnb/fnbService";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { apiClient } from "@/services/apiClient";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
}

const FnbCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theater, cart, totalAmount } = location.state as {
    theater: TheaterResponse;
    cart: CartItem[];
    totalAmount: number;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<CustomerInfo> = {};

    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!customerInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      // Create FnB order
      const orderData = {
        theaterId: theater.id,
        items: cart.map((item) => ({
          fnbItemId: item.id,
          quantity: item.quantity,
        })),
        customerInfo,
      };

      const order = await fnbService.createOrder(orderData);

      // Create ZaloPay payment URL for FnB
      const paymentResponse = await apiClient.post(
        `/payments/create-zalopay-url-fnb?fnbOrderId=${order.id}`
      );

      if (paymentResponse.data.order_url) {
        // Redirect to ZaloPay
        window.location.href = paymentResponse.data.order_url;
      } else {
        throw new Error("Không thể tạo link thanh toán");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");
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
            <AnimatedButton
              variant="orange-to-f3ea28"
              onClick={() => navigate("/popcorn-drink")}
            >
              Quay lại đặt bắp nước
            </AnimatedButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-yellow-500 mb-4">
              THANH TOÁN BẮP NƯỚC
            </h1>

            {/* Steps */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div
                className={`flex items-center gap-2 ${currentStep >= 1 ? "text-yellow-500" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-yellow-500 text-white" : "bg-gray-300"}`}
                >
                  1
                </div>
                <span className="font-semibold">Thông tin</span>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div
                className={`flex items-center gap-2 ${currentStep >= 2 ? "text-yellow-500" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-yellow-500 text-white" : "bg-gray-300"}`}
                >
                  2
                </div>
                <span className="font-semibold">Thanh toán</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Thông tin khách hàng
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={customerInfo.fullName}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="example@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={customerInfo.phoneNumber}
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="0912345678"
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => navigate("/popcorn-drink")}
                      className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Quay lại
                    </button>

                    <AnimatedButton
                      variant="orange-to-f3ea28"
                      onClick={handleNextStep}
                      className="flex items-center gap-2 px-8 py-3"
                    >
                      Tiếp tục
                      <ArrowRight className="w-5 h-5" />
                    </AnimatedButton>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Phương thức thanh toán
                  </h2>

                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
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
                        <p className="font-semibold text-gray-900">ZaloPay</p>
                        <p className="text-sm text-gray-600">
                          Thanh toán qua ví điện tử ZaloPay
                        </p>
                      </div>
                      <CreditCard className="w-6 h-6 text-blue-600 ml-auto" />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Quay lại
                    </button>

                    <AnimatedButton
                      variant="orange-to-f3ea28"
                      onClick={handleCreateOrder}
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          Thanh toán
                          <CreditCard className="w-5 h-5" />
                        </>
                      )}
                    </AnimatedButton>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Đơn hàng của bạn
                </h3>

                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{theater.name}</p>
                  <p className="text-sm text-gray-600">{theater.address}</p>
                </div>

                <div className="space-y-3 mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.price.toLocaleString()}đ x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-gray-900">
                      Tổng cộng:
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {totalAmount.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FnbCheckoutPage;
