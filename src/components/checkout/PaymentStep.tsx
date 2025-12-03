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
  onPrev,
}) => {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">
        Phương thức thanh toán
      </h2>
      <p className="text-sm text-gray-600">
        Chọn một phương thức để hoàn tất thanh toán.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {["momo", "card", "visa"].map((method) => (
          <label
            key={method}
            className={`p-4 rounded-lg border-2 cursor-pointer transition ${
              paymentMethod === method
                ? "bg-yellow-500 text-white border-yellow-500"
                : "bg-gray-50 border-gray-300 hover:border-yellow-400"
            }`}
          >
            <input
              type="radio"
              name="pay"
              className="hidden"
              checked={paymentMethod === method}
              onChange={() => setPaymentMethod(method)}
            />
            <div className="font-semibold">
              {method === "momo"
                ? "Momo"
                : method === "card"
                  ? "Thẻ nội địa"
                  : "Thẻ quốc tế"}
            </div>
            <div className="text-sm text-gray-300">
              {method === "momo"
                ? "Thanh toán qua ví Momo"
                : method === "card"
                  ? "Ngân hàng nội địa"
                  : "Visa / MasterCard"}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-700 font-semibold">
          Mã giảm giá
        </label>
        <div className="flex items-center mt-2 gap-2">
          <input
            value={appliedPromo?.code || ""}
            readOnly
            placeholder="Chưa áp dụng"
            className="flex-1 bg-gray-50 p-3 rounded-l-lg border-2 border-gray-300 text-gray-900"
          />
          <button
            type="button"
            onClick={handleSelectPromo}
            className="bg-yellow-500 text-white font-semibold py-3 px-4 rounded-r-lg whitespace-nowrap hover:bg-yellow-600 transition"
          >
            Chọn mã
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onPrev}
          className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-400 transition font-semibold"
          disabled={isProcessing}
        >
          Quay lại
        </button>
        <button
          onClick={handlePayment}
          className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing}
        >
          {isProcessing ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentStep;
