import React from "react";

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface Props {
  theater: {
    name: string;
    address: string;
  };
  cart: CartItem[];
  totalAmount: number;
  ttl?: number | null;
  orderCode?: string;
}

const FnbOrderSummary: React.FC<Props> = ({
  theater,
  cart,
  totalAmount,
  ttl = null,
  orderCode,
}) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Đơn hàng của bạn</h3>

      {/* Order Code */}
      {orderCode && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">Mã đơn hàng:</p>
          <p className="font-bold text-gray-900">{orderCode}</p>
        </div>
      )}

      {/* TTL Countdown */}
      {ttl !== null && ttl > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div
            className={`p-3 rounded-lg text-center ${
              ttl <= 60
                ? "bg-red-100 border border-red-200"
                : ttl <= 120
                  ? "bg-orange-100 border border-orange-200"
                  : "bg-yellow-100 border border-yellow-200"
            }`}
          >
            <p className="text-xs font-semibold uppercase opacity-90 mb-1">
              Thời gian còn lại
            </p>
            <p
              className={`text-2xl font-extrabold ${
                ttl <= 60
                  ? "text-red-600"
                  : ttl <= 120
                    ? "text-orange-600"
                    : "text-yellow-600"
              }`}
            >
              {formatTime(ttl)}
            </p>
          </div>
        </div>
      )}

      {/* Theater Info */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="font-semibold text-gray-900">{theater.name}</p>
        <p className="text-sm text-gray-600">{theater.address}</p>
      </div>

      {/* Cart Items */}
      <div className="space-y-3 mb-4">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">
                {item.unitPrice.toLocaleString()}đ x {item.quantity}
              </p>
            </div>
            <p className="font-semibold text-gray-900">
              {(item.unitPrice * item.quantity).toLocaleString()}đ
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold text-gray-900">Tổng cộng:</p>
          <p className="text-2xl font-bold text-yellow-600">
            {totalAmount.toLocaleString()}đ
          </p>
        </div>
      </div>
    </div>
  );
};

export default FnbOrderSummary;
