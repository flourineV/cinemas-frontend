import React from "react";
import { motion } from "framer-motion";
import SelectCombo from "@/components/booking/SelectCombo";
import { useNavigate } from "react-router-dom";

export interface SelectedComboItem {
  id: string;
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
      className="space-y-6"
    >
      <div>
        <SelectCombo onComboSelect={setSelectedCombos} />
      </div>
      <div className="flex justify-between mt-10">
        <button
          onClick={handleBack}
          className="bg-zinc-800 text-white py-3 px-6 rounded-lg shadow-md hover:bg-zinc-700 transition font-semibold border border-zinc-700"
        >
          Quay lại
        </button>
        <button
          onClick={onNext}
          className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg shadow-md hover:bg-yellow-400 transition"
        >
          Tiếp theo
        </button>
      </div>
    </motion.div>
  );
};

export default SelectComboStep;
