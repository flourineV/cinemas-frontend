import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface Props {
  customer: { name: string; email: string; phone: string };
  setCustomer: (val: { name: string; email: string; phone: string }) => void;
  onNext: () => void;
  onPrev: () => void;
  userLoggedIn: boolean;
}

const CustomerInfoStep: React.FC<Props> = ({
  customer,
  setCustomer,
  onNext,
  onPrev,
  userLoggedIn,
}) => {
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  // Skip if logged in
  useEffect(() => {
    if (userLoggedIn) onNext();
  }, [userLoggedIn, onNext]);

  // Realtime validation
  useEffect(() => {
    const newErrors: typeof errors = {};
    if (customer.name && customer.name.trim().length === 0) newErrors.name = "Họ và tên là bắt buộc";
    if (customer.email && !/^[\w.-]+@[\w.-]+\.\w+$/.test(customer.email)) newErrors.email = "Email không hợp lệ";
    if (customer.phone && !/^\d{9,11}$/.test(customer.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
    setErrors(newErrors);
  }, [customer]);

  const validateAll = async () => {
    const newErrors: typeof errors = {};
    if (!customer.name.trim()) newErrors.name = "Họ và tên là bắt buộc";
    if (!customer.email.trim()) newErrors.email = "Email là bắt buộc";
    else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(customer.email)) newErrors.email = "Email không hợp lệ";
    if (!customer.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    else if (!/^\d{9,11}$/.test(customer.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      await Swal.fire({
        icon: "warning",
        title: "Thông tin chưa hợp lệ",
        html: `
          ${newErrors.name ? `<p>- ${newErrors.name}</p>` : ""}
          ${newErrors.email ? `<p>- ${newErrors.email}</p>` : ""}
          ${newErrors.phone ? `<p>- ${newErrors.phone}</p>` : ""}
        `,
        confirmButtonColor: "#eab308",
      });
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (await validateAll()) onNext();
  };

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-yellow-300">Thông tin khách hàng</h2>
      <p className="text-sm text-gray-300">Nhập thông tin người nhận vé (dùng để liên hệ & xác nhận).</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm text-gray-300">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            className={`w-full bg-zinc-800 p-3 rounded mt-2 ${errors.name ? "border border-red-500" : ""}`}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className="text-sm text-gray-300">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            className={`w-full bg-zinc-800 p-3 rounded mt-2 ${errors.email ? "border border-red-500" : ""}`}
            placeholder="email@example.com"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-300">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            className={`w-full bg-zinc-800 p-3 rounded mt-2 ${errors.phone ? "border border-red-500" : ""}`}
            placeholder="09xx xxx xxx"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onPrev} className="bg-gray-700 py-2 px-5 rounded-md">Quay lại</button>
        <button onClick={handleNext} className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-md">Tiếp theo</button>
      </div>
    </motion.div>
  );
};

export default CustomerInfoStep;
