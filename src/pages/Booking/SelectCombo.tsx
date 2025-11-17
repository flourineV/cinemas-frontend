import React, { useEffect, useState } from "react";
import { fnbService } from "@/services/fnb/fnbService";
import type { FnbItemResponse } from "@/types/fnb/fnb.type";

interface SelectComboProps {
  onComboSelect: (selected: Record<string, number>) => void;
}

const SelectCombo: React.FC<SelectComboProps> = ({ onComboSelect }) => {
  const [combos, setCombos] = useState<FnbItemResponse[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFnb = async () => {
      const res = await fnbService.getAllFnbItems(); 
      setCombos(
        res.map(item => ({
          ...item,
          image: item.image ?? "https://xuongin.com/assets/images/popcorn-bag/hop-dung-bap-rang-bo-cgv.jpg", // fallback nếu item không có ảnh
        }))
      );
      setLoading(false);
    };

    fetchFnb();
  }, []);

  const handleChange = (id: string, delta: number) => {
    setSelected(prev => {
      const count = Math.max((prev[id] || 0) + delta, 0);
      const updated = { ...prev, [id]: count };
      onComboSelect(updated);
      return updated;
    });
  };

  if (loading) {
    return <p className="text-center text-yellow-300">Đang tải combo...</p>;
  }

  return (
    <div className="flex gap-4 flex-wrap justify-center">
      {combos.map(c => (
        <div
          key={c.id}
          className="border border-yellow-100/80 bg-zinc-900/40 p-4 rounded-xl w-48 shadow-md"
        >
          <img
            src={c.image}
            alt={c.name}
            className="w-full h-28 object-cover rounded-md mb-2"
          />

          <div className="font-bold text-lg text-white">{c.name}</div>

          {c.description && (
            <div className="text-xs text-gray-300 mb-1">{c.description}</div>
          )}

          <div className="text-yellow-400 font-semibold">
            {c.unitPrice.toLocaleString()} VNĐ
          </div>

          <div className="flex gap-2 mt-3 justify-center items-center">
            <button
              className="px-2 py-1 bg-red-600 rounded text-white"
              onClick={() => handleChange(c.id, -1)}
            >
              -
            </button>

            <span className="text-white w-5 text-center">
              {selected[c.id] || 0}
            </span>

            <button
              className="px-2 py-1 bg-green-600 rounded text-white"
              onClick={() => handleChange(c.id, 1)}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectCombo;
