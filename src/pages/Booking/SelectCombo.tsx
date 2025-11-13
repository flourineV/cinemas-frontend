import React, { useState } from "react";

interface Combo {
  id: string;
  name: string;
  price: number;
}

const MOCK_COMBOS: Combo[] = [
  { id: "c1", name: "Combo 1: Bắp + Nước", price: 50000 },
  { id: "c2", name: "Combo 2: Bắp + 2 Nước", price: 90000 },
  { id: "c3", name: "Combo 3: Bắp Lớn + Nước", price: 65000 },
];

interface SelectComboProps {
  onComboSelect: (selected: Record<string, number>) => void;
}

const SelectCombo: React.FC<SelectComboProps> = ({ onComboSelect }) => {
  const [selected, setSelected] = useState<Record<string, number>>({});

  const handleChange = (id: string, delta: number) => {
    setSelected(prev => {
      const count = Math.max((prev[id] || 0) + delta, 0);
      const updated = { ...prev, [id]: count };
      onComboSelect(updated);
      return updated;
    });
  };

  return (
    <div className="flex gap-4 flex-wrap justify-center">
      {MOCK_COMBOS.map(c => (
        <div key={c.id} className="border border-yellow-100/80 p-4 rounded-md w-48">
          <div className="font-bold text-white">{c.name}</div>
          <div className="text-yellow-400 font-semibold">{c.price.toLocaleString()} VNĐ</div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => handleChange(c.id, -1)}>-</button>
            <span className="text-white">{selected[c.id] || 0}</span>
            <button onClick={() => handleChange(c.id, 1)}>+</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectCombo;
