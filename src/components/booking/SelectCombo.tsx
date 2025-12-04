import React, { useEffect, useState } from "react";
import { fnbService } from "@/services/fnb/fnbService";
import type { FnbItemResponse } from "@/types/fnb/fnb.type";
import { Plus, Minus } from "lucide-react";

interface SelectedComboItem {
  id: string;
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
      setCombos(res);
      setLoading(false);
    };
    fetchFnb();
  }, []);

  const handleChange = (id: string, delta: number) => {
    setSelected((prev) => {
      const prevCount = prev[id] || 0;
      const newCount = Math.max(prevCount + delta, 0);
      const updated = { ...prev, [id]: newCount };

      const selectedCombosForParent: Record<string, SelectedComboItem> = {};
      Object.entries(updated).forEach(([key, qty]) => {
        if (qty > 0) {
          const combo = combos.find((c) => c.id === key);
          if (combo) {
            selectedCombosForParent[key] = {
              id: combo.id,
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-10">
      {combos.slice(0, 6).map((c) => {
        const count = selected[c.id] || 0;
        const isSelected = count > 0;

        return (
          <div key={c.id} className="relative group">
            {/* Badge số lượng */}
            {isSelected && (
              <div className="absolute -top-3 -right-3 bg-yellow-500 text-black font-extrabold rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-30 animate-in zoom-in duration-200 border-2 border-zinc-900">
                {count}
              </div>
            )}

            {/* Card combo */}
            <div
              className={`relative h-full border rounded-2xl flex p-6 transition-all duration-300 overflow-hidden ${
                isSelected
                  ? "bg-zinc-900 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {/* Lớp màu vàng cố định */}
              <div className="absolute bottom-0 left-0 w-full h-4 bg-yellow-500"></div>

              {/* IMAGE */}
              <img
                src={c.imageUrl}
                alt={c.name}
                className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg shadow-lg mr-4 flex-shrink-0 relative z-10 border border-zinc-800"
              />

              {/* INFO + CONTROLS */}
              <div className="flex flex-col justify-between flex-1 relative z-10">
                <div>
                  <span className="font-bold text-lg text-white tracking-wide">
                    {c.name}
                  </span>
                  {c.description && (
                    <div className="text-zinc-400 text-sm font-light mt-1 line-clamp-2">
                      {c.description}
                    </div>
                  )}
                  <div className="text-yellow-500 font-semibold text-xl mt-2 tracking-tighter">
                    {c.unitPrice.toLocaleString()}
                    <span className="text-sm font-normal text-zinc-500 ml-1">
                      đ
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <button
                    type="button"
                    aria-label="Giảm"
                    onClick={() => handleChange(c.id, -1)}
                    disabled={count <= 0}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-xl transition-all ${
                      count <= 0
                        ? "text-zinc-700 cursor-not-allowed"
                        : "bg-zinc-800 text-white hover:bg-zinc-700 hover:text-red-400 active:scale-95"
                    }`}
                  >
                    −
                  </button>

                  <div className="min-w-[50px] text-center font-mono text-xl text-white font-bold">
                    {count}
                  </div>

                  <button
                    type="button"
                    aria-label="Tăng"
                    onClick={() => handleChange(c.id, 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-500 text-black font-bold text-xl transition-all hover:bg-yellow-400 active:scale-95 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectCombo;
