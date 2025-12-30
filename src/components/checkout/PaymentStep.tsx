import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { promotionService } from "@/services/promotion/promotionService";
import { paymentService } from "@/services/payment/payment.service";
import { bookingService } from "@/services/booking/booking.service";
import type {
  PromotionResponse,
  UserPromotionsResponse,
  RefundVoucherResponse,
} from "@/types/promotion/promotion.type";
import type {
  FinalizeBookingRequest,
  CalculatedFnbItemDto,
} from "@/types/booking/booking.type";
import type { SelectedComboItem } from "@/components/checkout/SelectComboStep";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  appliedPromo: PromotionResponse | null;
  onApplyPromo: (promo: PromotionResponse | null) => void;
  selectedRefundVoucher: RefundVoucherResponse | null;
  onSelectRefundVoucher: (voucher: RefundVoucherResponse | null) => void;
  bookingId: string;
  selectedCombos: Record<string, SelectedComboItem>;
  userId?: string;
  movieId?: string;
  useRankDiscount: boolean;
  onToggleRankDiscount: (value: boolean) => void;
  onRankDiscountValueChange: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Removed MySwal as it's not used anymore

const PaymentStep: React.FC<Props> = ({
  appliedPromo,
  onApplyPromo,
  selectedRefundVoucher,
  onSelectRefundVoucher,
  bookingId,
  selectedCombos,
  userId,
  movieId,
  useRankDiscount,
  onToggleRankDiscount,
  onRankDiscountValueChange,
  onPrev,
}) => {
  const { t, language } = useLanguage();
  const [userPromotions, setUserPromotions] =
    useState<UserPromotionsResponse | null>(null);
  const [refundVouchers, setRefundVouchers] = useState<RefundVoucherResponse[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [userRank, setUserRank] = useState<string | null>(null);
  const [rankDiscountPercent, setRankDiscountPercent] = useState<number>(0);

  console.log(
    "🎨 PaymentStep render - userRank:",
    userRank,
    "rankDiscountPercent:",
    rankDiscountPercent
  );

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        if (userId) {
          // User đã đăng nhập - lấy promotions theo user
          const data =
            await promotionService.getActivePromotionsForUser(userId);
          setUserPromotions(data);

          // Fetch refund vouchers for logged-in user
          try {
            const vouchers =
              await promotionService.getAvailableRefundVouchers(userId);
            setRefundVouchers(vouchers);
          } catch (voucherErr) {
            console.error("Lấy refund vouchers thất bại:", voucherErr);
          }
        } else {
          // Guest - lấy tất cả active promotions nhưng đặt vào notApplicable
          const allPromotions = await promotionService.getActivePromotions();
          setUserPromotions({
            applicable: [],
            notApplicable: allPromotions.map((promo) => ({
              promotion: promo,
              reason: t("checkout.loginToUsePromo"),
            })),
          });
        }
      } catch (err) {
        console.error("Lấy danh sách promotion thất bại:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [userId, t]);

  useEffect(() => {
    const fetchRankDiscount = async () => {
      console.log("🎯 PaymentStep - userId:", userId);
      if (userId) {
        try {
          const { userProfileService } = await import(
            "@/services/userprofile/userProfileService"
          );
          const data = await userProfileService.getRankAndDiscount(userId);
          console.log("🎯 PaymentStep - rank data:", data);
          setUserRank(data.rankName);
          setRankDiscountPercent(data.discountRate);
          onRankDiscountValueChange(data.discountRate);
        } catch (error) {
          console.error("❌ Failed to fetch rank discount:", error);
        }
      } else {
        console.log("⚠️ No userId provided to PaymentStep");
      }
    };
    fetchRankDiscount();
  }, [userId, onRankDiscountValueChange]);

  // Handle selecting refund voucher - mutually exclusive with promotion
  const handleSelectRefundVoucher = (voucher: RefundVoucherResponse | null) => {
    if (voucher) {
      // Clear promotion when selecting refund voucher
      onApplyPromo(null);
    }
    onSelectRefundVoucher(voucher);
  };

  // Handle selecting promotion - mutually exclusive with refund voucher
  const handleSelectPromotion = (promo: PromotionResponse | null) => {
    if (promo) {
      // Clear refund voucher when selecting promotion
      onSelectRefundVoucher(null);
    }
    onApplyPromo(promo);
  };

  // Không cần handleSelectPromo nữa vì chọn trực tiếp từ danh sách

  const handlePayment = async () => {
    if (!bookingId) {
      await Swal.fire({
        icon: "error",
        title: t("booking.error"),
        text: t("checkout.noBookingInfo"),
        confirmButtonColor: "#d97706",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Creating payment with bookingId:", bookingId);

      // Bước 1: Chuẩn bị dữ liệu FNB items
      const fnbItems: CalculatedFnbItemDto[] = Object.values(
        selectedCombos
      ).map((combo) => ({
        fnbItemId: combo.id,
        quantity: combo.qty,
        unitPrice: combo.price,
        totalFnbItemPrice: combo.qty * combo.price,
      }));

      // Bước 2: Gọi API finalize booking
      const finalizeRequest: FinalizeBookingRequest = {
        fnbItems: fnbItems,
        promotionCode: appliedPromo?.code,
        refundVoucherCode: selectedRefundVoucher?.code,
        useLoyaltyDiscount: useRankDiscount,
        language: language, // Send current language for email/notification
      };

      console.log("Finalizing booking with data:", finalizeRequest);
      const finalizedBooking = await bookingService.finalizeBooking(
        bookingId,
        finalizeRequest
      );

      // Bước 3: Kiểm tra finalPrice - nếu = 0 thì không cần qua ZaloPay
      if (finalizedBooking.finalPrice === 0) {
        console.log(
          "Final price is 0, confirming booking directly without payment gateway"
        );

        // Gọi API confirm booking trực tiếp (không qua ZaloPay)
        await paymentService.confirmFreeBooking(bookingId);

        // Redirect to success page
        window.location.href = `/payment/result?bookingId=${bookingId}&status=success&free=true`;
        return;
      }

      // Bước 4: Gọi API tạo ZaloPay URL (chỉ khi finalPrice > 0)
      const response = await paymentService.createZaloPayUrl(bookingId);

      if (response.return_code === 1 && response.order_url) {
        // Save pending payment state before redirecting to ZaloPay
        const pendingPayment = {
          bookingId,
          movieId: movieId || "",
          timestamp: Date.now(),
        };
        sessionStorage.setItem(
          "cinehub-payment-pending",
          JSON.stringify(pendingPayment)
        );

        // Chuyển hướng đến trang thanh toán ZaloPay
        // Không set isProcessing = false vì sẽ chuyển trang ngay
        window.location.href = response.order_url;
        // Spinner sẽ tiếp tục xoay cho đến khi trang mới load
        return; // Exit early, không chạy finally
      } else {
        throw new Error(
          response.return_message || t("checkout.cannotCreatePayment")
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo thanh toán:", error);
      await Swal.fire({
        icon: "error",
        title: t("checkout.paymentError"),
        text: error.message || t("checkout.cannotCreatePayment"),
        confirmButtonColor: "#d97706",
      });
      // Chỉ set isProcessing = false khi có lỗi
      setIsProcessing(false);
    }
    // Bỏ finally block để spinner tiếp tục xoay khi thành công
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Rank Discount Card */}
      {userRank && rankDiscountPercent >= 0 && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-zinc-800 mb-4">
            {t("checkout.rankDiscount")}
          </h3>
          <div
            onClick={() => onToggleRankDiscount(!useRankDiscount)}
            className={`relative cursor-pointer rounded-xl p-5 border-2 transition-all duration-300 ${
              useRankDiscount
                ? "bg-yellow-500 border-yellow-600 shadow-lg"
                : "bg-white border-zinc-300 hover:border-yellow-400 hover:shadow-md"
            }`}
          >
            {useRankDiscount && (
              <div className="absolute -top-2 -right-2 bg-zinc-900 text-yellow-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm border-2 border-yellow-500">
                ✓
              </div>
            )}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div
                  className={`font-bold text-lg mb-1 ${useRankDiscount ? "text-black" : "text-zinc-800"}`}
                >
                  {t("checkout.rank")} {userRank}
                </div>
                <div
                  className={`text-sm mb-2 ${useRankDiscount ? "text-zinc-900" : "text-zinc-600"}`}
                >
                  {t("checkout.rankDiscountDesc")} {userRank}
                </div>
                <div
                  className={`text-xs font-semibold ${useRankDiscount ? "text-zinc-800" : "text-yellow-600"}`}
                >
                  {t("checkout.discount")} {rankDiscountPercent}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách mã giảm giá */}
      <div>
        <h3 className="text-2xl font-bold text-zinc-800 mb-4">
          {t("checkout.promoCode")}
        </h3>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-yellow-500"></div>
            <p className="text-zinc-600 mt-4 font-medium">
              {t("checkout.loadingPromo")}
            </p>
          </div>
        ) : !userPromotions ||
          (userPromotions.applicable.length === 0 &&
            userPromotions.notApplicable.length === 0) ? (
          <div className="text-zinc-600 text-center py-8 bg-zinc-100 rounded-xl border border-zinc-300">
            {t("checkout.noPromo")}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Promotions có thể sử dụng - hiển thị đầu tiên */}
            {userPromotions.applicable.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-zinc-700 mb-3">
                  {t("checkout.canUse")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userPromotions.applicable.map((item) => {
                    const promo = item.promotion;
                    const isSelected = appliedPromo?.code === promo.code;
                    return (
                      <div
                        key={promo.code}
                        onClick={() =>
                          handleSelectPromotion(isSelected ? null : promo)
                        }
                        className={`relative cursor-pointer rounded-xl p-5 border-2 transition-all duration-300 ${
                          isSelected
                            ? "bg-yellow-500 border-yellow-600 shadow-lg"
                            : "bg-white border-zinc-300 hover:border-yellow-400 hover:shadow-md"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-zinc-900 text-yellow-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm border-2 border-yellow-500">
                            ✓
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div
                              className={`font-bold text-lg mb-1 ${isSelected ? "text-black" : "text-zinc-800"}`}
                            >
                              {promo.code}
                            </div>
                            <div
                              className={`text-sm mb-2 ${isSelected ? "text-zinc-900" : "text-zinc-600"}`}
                            >
                              {language === "en" && promo.descriptionEn
                                ? promo.descriptionEn
                                : promo.description}
                            </div>
                            <div
                              className={`text-xs font-semibold ${isSelected ? "text-zinc-800" : "text-yellow-600"}`}
                            >
                              {promo.discountType === "PERCENTAGE"
                                ? `${t("checkout.discountPercent")} ${promo.discountValue}%`
                                : `${t("checkout.discountAmount")} ${Number(promo.discountValue).toLocaleString()}đ`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Promotions không thể sử dụng - hiển thị sau và disable */}
            {userPromotions.notApplicable.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-zinc-500 mb-3">
                  {!userId
                    ? t("checkout.loginToUsePromo")
                    : t("checkout.cannotUse")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userPromotions.notApplicable.map((item) => {
                    const promo = item.promotion;
                    return (
                      <div
                        key={promo.code}
                        className="relative rounded-xl p-5 border-2 bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-lg mb-1 text-gray-500">
                              {promo.code}
                            </div>
                            <div className="text-sm mb-2 text-gray-400">
                              {language === "en" && promo.descriptionEn
                                ? promo.descriptionEn
                                : promo.description}
                            </div>
                            <div className="text-xs font-semibold text-gray-400">
                              {promo.discountType === "PERCENTAGE"
                                ? `${t("checkout.discountPercent")} ${promo.discountValue}%`
                                : `${t("checkout.discountAmount")} ${Number(promo.discountValue).toLocaleString()}đ`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refund Vouchers Section - chỉ hiển thị cho user đã đăng nhập */}
      {userId && (
        <div>
          <h3 className="text-2xl font-bold text-zinc-800 mb-4">
            {t("checkout.refundVoucher")}
          </h3>
          {refundVouchers.length === 0 ? (
            <div className="text-zinc-600 text-center py-8 bg-zinc-100 rounded-xl border border-zinc-300">
              {t("checkout.noRefundVoucher")}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {refundVouchers.map((voucher) => {
                  const isSelected =
                    selectedRefundVoucher?.code === voucher.code;
                  const expiredDate = new Date(voucher.expiredAt);
                  return (
                    <div
                      key={voucher.code}
                      onClick={() =>
                        handleSelectRefundVoucher(isSelected ? null : voucher)
                      }
                      className={`relative cursor-pointer rounded-xl p-5 border-2 transition-all duration-300 ${
                        isSelected
                          ? "bg-green-500 border-green-600 shadow-lg"
                          : "bg-white border-zinc-300 hover:border-green-400 hover:shadow-md"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-zinc-900 text-green-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm border-2 border-green-500">
                          ✓
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div
                            className={`font-bold text-lg mb-1 ${isSelected ? "text-black" : "text-zinc-800"}`}
                          >
                            {voucher.code}
                          </div>
                          <div
                            className={`text-sm mb-2 ${isSelected ? "text-zinc-900" : "text-zinc-600"}`}
                          >
                            {t("checkout.refundVoucherDesc")}
                          </div>
                          <div
                            className={`text-xs font-semibold ${isSelected ? "text-zinc-800" : "text-green-600"}`}
                          >
                            {t("checkout.voucherValue")}{" "}
                            {Number(voucher.value).toLocaleString()}đ
                          </div>
                          <div
                            className={`text-xs mt-1 ${isSelected ? "text-zinc-700" : "text-zinc-500"}`}
                          >
                            {t("checkout.expiredAt")}{" "}
                            {expiredDate.toLocaleDateString(
                              language === "en" ? "en-US" : "vi-VN"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedRefundVoucher && (
                <p className="text-sm text-green-600 mt-2">
                  {t("checkout.refundVoucherNote")}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="bg-zinc-800 text-white py-3 px-6 rounded-lg hover:bg-zinc-700 transition font-semibold border border-zinc-700"
          disabled={isProcessing}
        >
          {t("checkout.back")}
        </button>
        <button
          onClick={handlePayment}
          className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isProcessing}
        >
          {isProcessing && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
          )}
          {isProcessing
            ? t("checkout.creatingPayment")
            : t("checkout.confirmPay")}
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentStep;
