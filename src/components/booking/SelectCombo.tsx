import React, { useEffect, useState } from "react";
import { fnbService } from "@/services/fnb/fnbService";
import type { FnbItemResponse } from "@/types/fnb/fnb.type";

interface SelectedComboItem {
  name: string;
  qty: number;
  price: number;
}

interface SelectComboProps {
  onComboSelect: (selected: Record<string, SelectedComboItem>) => void;
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
          image:
            item.image ??
            "https://xuongin.com/assets/images/popcorn-bag/hop-dung-bap-rang-bo-cgv.jpg",
        }))
      );
      setLoading(false);
    };
    fetchFnb();
  }, []);

  const handleChange = (id: string, delta: number) => {
    setSelected(prev => {
      const prevCount = prev[id] || 0;
      const newCount = Math.max(prevCount + delta, 0);
      const updated = { ...prev, [id]: newCount };

      // Build object để gửi ra parent
      const selectedCombosForParent: Record<string, { name: string; qty: number; price: number }> = {};
      Object.entries(updated).forEach(([key, qty]) => {
        if (qty > 0) {
          const combo = combos.find(c => c.id === key);
          if (combo) {
            selectedCombosForParent[key] = {
              name: combo.name,
              qty,
              price: combo.unitPrice,
            };
          }
        }
      });

      onComboSelect(selectedCombosForParent);
      return updated;
    });
  };

  if (loading)
    return <p className="text-white text-center mt-6">Đang tải combo...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
      {combos.slice(0, 6).map(c => {
        const count = selected[c.id] || 0;

        return (
          <div
            key={c.id}
            className="border border-yellow-700 bg-zinc-900/40 rounded-xl shadow-sm 
            flex p-4 hover:border-yellow-500 transition"
          >
            {/* IMAGE */}
            <img
              src={c.image}
              alt={c.name}
              className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-md shadow mr-4 flex-shrink-0"
            />

            {/* INFO + CONTROLS */}
            <div className="flex flex-col justify-between flex-1">
              <div>
                <span className="font-semibold text-lg text-white">{c.name}</span>
                {c.description && (
                  <div className="text-gray-400 text-sm mt-1">{c.description}</div>
                )}
                <div className="text-yellow-400 font-semibold text-base mt-1">
                  {c.unitPrice.toLocaleString()} VNĐ
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  aria-label="Giảm số lượng combo"
                  onClick={() => handleChange(c.id, -1)}
                  disabled={count <= 0}
                  className={`w-8 h-8 flex items-center justify-center rounded-full 
                    text-sm transition active:scale-95
                    ${count <= 0
                      ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"}`}
                >
                  -
                </button>

                <div className="min-w-[32px] px-2 py-1 bg-zinc-800 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">{count}</span>
                </div>

                <button
                  type="button"
                  aria-label="Tăng số lượng combo"
                  onClick={() => handleChange(c.id, 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full 
                  bg-green-600 hover:bg-green-700 text-white text-sm transition active:scale-95"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectCombo;
