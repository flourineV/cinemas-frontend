import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { paymentService } from "@/services/payment/payment.service";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { useAuthStore } from "@/stores/authStore";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";
import FnbOrderSummary from "@/components/fnb/FnbOrderSummary";
import { useAccurateTimer } from "@/hooks/useAccurateTimer";

interface CartItem {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
}

const FNB_STEPS = [
  { id: 1, labelKey: "fnb.step1" },
  { id: 2, labelKey: "fnb.step2" },
  { id: 3, labelKey: "fnb.step3" },
];

const FnbCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t, language } = useLanguage();

  const { theater, cart, totalAmount, order, ttl, ttlTimestamp } =
    (location.state as {
      theater: TheaterResponse;
      cart: CartItem[];
      totalAmount: number;
      order: any;
      ttl: number;
      ttlTimestamp: number;
    }) || {};

  const [activeStep] = useState(2);
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
        title: t("fnb.timeExpired"),
        text: t("fnb.orderExpired"),
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
        title: t("fnb.loginRequired"),
        text: t("fnb.loginRequiredDesc"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: t("fnb.login"),
        cancelButtonText: t("fnb.cancel"),
        confirmButtonColor: "#eab308",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth");
        } else {
          navigate("/popcorn-drink");
        }
      });
    }
  }, [user, navigate, t]);

  const handlePayment = async () => {
    if (!user || !order) {
      Swal.fire({
        title: t("fnb.error"),
        text: t("fnb.orderNotFound"),
        icon: "error",
        confirmButtonColor: "#eab308",
      });
      return;
    }

    setLoading(true);

    Swal.fire({
      title: t("fnb.processingPayment"),
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      background: "#18181b",
      color: "#fff",
    });

    try {
      const fnbOrderId =
        typeof order.id === "string" ? order.id : order.id.toString();
      const paymentResponse =
        await paymentService.createZaloPayUrlForFnb(fnbOrderId);

      if (paymentResponse.order_url) {
        window.location.href = paymentResponse.order_url;
      } else {
        throw new Error(t("fnb.paymentLinkError"));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t("fnb.paymentLinkError");

      Swal.fire({
        title: t("fnb.error"),
        text: `${errorMessage}. ${t("fnb.tryAgain")}`,
        icon: "error",
        confirmButtonColor: "#eab308",
        background: "#18181b",
        color: "#fff",
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
            <p className="text-gray-500 mb-4">{t("fnb.noOrderInfo")}</p>
            <button
              onClick={() => navigate("/popcorn-drink")}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              {t("fnb.backToOrder")}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex flex-col pb-10">
        <main className="container mx-auto px-4 md:px-6 mt-14 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* LEFT COLUMN */}
            <div className="flex flex-col space-y-8 lg:col-span-2">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-500 mb-6 uppercase tracking-tighter">
                  {t("fnb.checkoutTitle")}{" "}
                  <span className="text-black">
                    {t("fnb.checkoutHighlight")}
                  </span>
                </h1>

                {/* Steps Bar - giống CheckoutPage */}
                <div className="flex justify-between items-start w-full mt-16">
                  {FNB_STEPS.map((step, index) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;
                    return (
                      <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center z-10 relative flex-1">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                              isActive || isCompleted
                                ? "bg-yellow-500 text-black"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            <span className="text-xl font-bold">{step.id}</span>
                          </div>
                          <span
                            className={`text-[10px] md:text-xs font-bold uppercase text-center transition-colors ${
                              isActive || isCompleted
                                ? "text-yellow-500"
                                : "text-gray-500"
                            }`}
                          >
                            {t(step.labelKey)}
                          </span>
                        </div>
                        {index < FNB_STEPS.length - 1 && (
                          <div className="flex-1 h-[2px] mt-6 relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-gray-700"></div>
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: isCompleted ? "100%" : "0%" }}
                              transition={{ duration: 0.5 }}
                              className="absolute top-0 left-0 h-full bg-yellow-500"
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="rounded-xl min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeStep === 2 && (
                      <div className="space-y-6">
                        {/* FnB Items Display */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-400">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {t("fnb.selectedItems")}
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cart.map((item) => (
                              <div
                                key={item.id}
                                className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-400"
                              >
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900">
                                    {language === "en" && item.nameEn
                                      ? item.nameEn
                                      : item.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {item.unitPrice.toLocaleString()}đ x{" "}
                                    {item.quantity}
                                  </p>
                                  <p className="font-semibold text-yellow-600 mt-1">
                                    {(
                                      item.unitPrice * item.quantity
                                    ).toLocaleString()}
                                    đ
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Section */}
                        <div className="flex justify-between items-center w-full mt-8">
                          {/* Nút Quay lại */}
                          <button
                            onClick={() => navigate("/popcorn-drink")}
                            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-semibold"
                          >
                            {t("fnb.backToSelect")}
                          </button>

                          {/* Nút Thanh toán */}
                          <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="px-10 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading
                              ? t("fnb.processingPayment")
                              : t("fnb.payNow")}
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT COLUMN - Summary */}
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
        </main>
      </div>
    </Layout>
  );
};

export default FnbCheckoutPage;
