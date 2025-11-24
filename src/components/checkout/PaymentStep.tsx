import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { promotionService } from "@/services/promotion/promotionService";
import type { PromotionResponse } from "@/types/promotion/promotion.type";

interface Props {
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  appliedPromo: PromotionResponse | null;
  onApplyPromo: (promo: PromotionResponse | null) => void; // đổi kiểu
  onNext: () => void;
  onPrev: () => void;
}

const MySwal = withReactContent(Swal);

const PaymentStep: React.FC<Props> = ({ paymentMethod, setPaymentMethod, appliedPromo, onApplyPromo, onNext, onPrev }) => {
  const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
                    const input = document.getElementById("promo-input") as HTMLInputElement;
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
        const input = document.getElementById("promo-input") as HTMLInputElement;
        const code = input?.value || "";
        return promotions.find(p => p.code === code) || null;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onApplyPromo(result.value); // trả về toàn bộ object hoặc null
      }
    });
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-yellow-300">Phương thức thanh toán</h2>
      <p className="text-sm text-gray-300">Chọn một phương thức để hoàn tất thanh toán.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {["momo", "card", "visa"].map((method) => (
          <label
            key={method}
            className={`p-4 rounded-lg border cursor-pointer ${
              paymentMethod === method ? "bg-yellow-400 text-black" : "bg-zinc-800 border-zinc-700"
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
              {method === "momo" ? "Momo" : method === "card" ? "Thẻ nội địa" : "Thẻ quốc tế"}
            </div>
            <div className="text-sm text-gray-300">
              {method === "momo" ? "Thanh toán qua ví Momo" : method === "card" ? "Ngân hàng nội địa" : "Visa / MasterCard"}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-300 font-semibold">Mã giảm giá</label>
        <div className="flex items-center mt-2 gap-2">
          <input
            value={appliedPromo?.code || ""}
            readOnly
            placeholder="Chưa áp dụng"
            className="flex-1 bg-zinc-800 p-3 rounded-l-md border border-gray-700 text-white"
          />
          <button
            type="button"
            onClick={handleSelectPromo}
            className="bg-yellow-400 text-black font-semibold py-3 px-4 rounded-r-md whitespace-nowrap"
          >
            Chọn mã
          </button>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onPrev} className="bg-gray-700 py-2 px-5 rounded-md">Quay lại</button>
        <button onClick={onNext} className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-md">
          Xác nhận & Thanh toán
        </button>
      </div>
    </motion.div>
  );
};

export default PaymentStep;
