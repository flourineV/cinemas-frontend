import React from "react";
import { motion } from "framer-motion";
import SelectCombo from "@/components/booking/SelectCombo";
import { useNavigate } from "react-router-dom";

export interface SelectedComboItem {
  name: string;
  qty: number;
  price: number;
}

interface Props {
  selectedCombos: Record<string, SelectedComboItem>;
  setSelectedCombos: (val: Record<string, SelectedComboItem>) => void;
  onNext: () => void;
  onPrev?: () => void;
  movieId: string;
}

const SelectComboStep: React.FC<Props> = ({
  selectedCombos,
  setSelectedCombos,
  onNext,
  movieId,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-yellow-300">Chọn bắp nước</h2>
      <p className="text-sm text-gray-300">
        Chọn combo bắp nước bạn muốn thêm vào đơn hàng.
      </p>
      <div className="mt-4">
        <SelectCombo onComboSelect={setSelectedCombos} />
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={handleBack}
          className="bg-gray-700 text-white py-3 px-6 rounded-md shadow-md"
        >
          Quay lại
        </button>
        <button
          onClick={onNext}
          className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-md shadow-md"
        >
          Tiếp theo
        </button>
      </div>
    </motion.div>
  );
};

export default SelectComboStep;
