import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { promotionService } from "@/services/promotion/promotionService";
import { paymentService } from "@/services/payment/payment.service";
import { bookingService } from "@/services/booking/booking.service";
import type { PromotionResponse } from "@/types/promotion/promotion.type";
import type {
  FinalizeBookingRequest,
  CalculatedFnbItemDto,
} from "@/types/booking/booking.type";
import type { SelectedComboItem } from "@/components/checkout/SelectComboStep";

interface Props {
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  appliedPromo: PromotionResponse | null;
  onApplyPromo: (promo: PromotionResponse | null) => void;
  bookingId: string;
  selectedCombos: Record<string, SelectedComboItem>;
  userId?: string;
  useRankDiscount: boolean;
  onToggleRankDiscount: (value: boolean) => void;
  onRankDiscountValueChange: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

const MySwal = withReactContent(Swal);

const PaymentStep: React.FC<Props> = ({
  paymentMethod,
  setPaymentMethod,
  appliedPromo,
  onApplyPromo,
  bookingId,
  selectedCombos,
  userId,
  useRankDiscount,
  onToggleRankDiscount,
  onRankDiscountValueChange,
  onPrev,
}) => {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
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
        const data = await promotionService.getAllPromotions();
        setPromotions(data);
      } catch (err) {
        console.error("Lấy danh sách promotion thất bại:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

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

  const handleSelectPromo = async () => {
    let selectedPromo: PromotionResponse | null = appliedPromo;

    await MySwal.fire({
      title: "Áp dụng mã giảm giá",
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: "Tiếp tục",
      confirmButtonColor: "#eab308",
      html: (
        <div className="space-y-2">
          <input
            id="promo-input"
            placeholder="Nhập mã giảm giá"
            defaultValue={appliedPromo?.code || ""}
            className="w-full p-2 rounded border border-gray-300 bg-zinc-800 text-white"
          />
          <div className="max-h-40 overflow-y-auto border border-gray-700 rounded p-2">
            {loading ? (
              <div className="text-gray-400">Đang tải...</div>
            ) : (
              promotions.map((p) => (
                <div
                  key={p.code}
                  className="p-2 cursor-pointer hover:bg-yellow-400 hover:text-black rounded"
                  onClick={() => {
                    selectedPromo = p;
                    const input = document.getElementById(
                      "promo-input"
                    ) as HTMLInputElement;
                    if (input) input.value = p.code;
                  }}
                >
                  <div className="font-semibold">{p.code}</div>
                  <div className="text-sm text-gray-300">{p.description}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ),
      preConfirm: () => {
        const input = document.getElementById(
          "promo-input"
        ) as HTMLInputElement;
        const code = input?.value || "";
        return promotions.find((p) => p.code === code) || null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onApplyPromo(result.value); // trả về toàn bộ object hoặc null
      }
    });
  };

  const handlePayment = async () => {
    if (!bookingId) {
      await Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không tìm thấy thông tin booking. Vui lòng thử lại!",
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
        useLoyaltyDiscount: false,
      };

      console.log("Finalizing booking with data:", finalizeRequest);
      await bookingService.finalizeBooking(bookingId, finalizeRequest);

      // Bước 3: Gọi API tạo ZaloPay URL
      const response = await paymentService.createZaloPayUrl(bookingId);

      if (response.return_code === 1 && response.order_url) {
        // Chuyển hướng đến trang thanh toán ZaloPay
        window.location.href = response.order_url;
      } else {
        throw new Error(
          response.return_message || "Không thể tạo liên kết thanh toán"
        );
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo thanh toán:", error);
      await Swal.fire({
        icon: "error",
        title: "Lỗi thanh toán",
        text:
          error.message ||
          "Không thể tạo liên kết thanh toán. Vui lòng thử lại!",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setIsProcessing(false);
    }
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
            Giảm giá theo hạng
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
                  Hạng {userRank}
                </div>
                <div
                  className={`text-sm mb-2 ${useRankDiscount ? "text-zinc-900" : "text-zinc-600"}`}
                >
                  Giảm giá dành riêng cho thành viên hạng {userRank}
                </div>
                <div
                  className={`text-xs font-semibold ${useRankDiscount ? "text-zinc-800" : "text-yellow-600"}`}
                >
                  Giảm {rankDiscountPercent}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách mã giảm giá */}
      <div>
        <h3 className="text-2xl font-bold text-zinc-800 mb-4">Mã giảm giá</h3>
        {loading ? (
          <div className="text-zinc-600 text-center py-8">Đang tải...</div>
        ) : promotions.length === 0 ? (
          <div className="text-zinc-600 text-center py-8 bg-zinc-100 rounded-xl border border-zinc-300">
            Không có mã giảm giá nào
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((promo) => {
              const isSelected = appliedPromo?.code === promo.code;
              return (
                <div
                  key={promo.code}
                  onClick={() => onApplyPromo(isSelected ? null : promo)}
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
                        {promo.description}
                      </div>
                      <div
                        className={`text-xs font-semibold ${isSelected ? "text-zinc-800" : "text-yellow-600"}`}
                      >
                        {promo.discountType === "PERCENTAGE"
                          ? `Giảm ${promo.discountValue}%`
                          : `Giảm ${Number(promo.discountValue).toLocaleString()}đ`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          className="bg-zinc-800 text-white py-3 px-6 rounded-lg hover:bg-zinc-700 transition font-semibold border border-zinc-700"
          disabled={isProcessing}
        >
          Quay lại
        </button>
        <button
          onClick={handlePayment}
          className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing}
        >
          {isProcessing ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentStep;
