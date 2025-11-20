interface DateCardProps {
  date: Date;
  selected: boolean;
  onClick: () => void;
}

export default function DateCard({ date, selected, onClick }: DateCardProps) {
  const day = date.toLocaleDateString("vi-VN", { weekday: "short" });
  const dayNum = date.getDate();

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-20 h-24 rounded-xl border-2 transition-all ${
        selected
          ? "bg-yellow-400 text-black border-yellow-400 shadow-lg scale-105"
          : "bg-gray-800 border-gray-600 text-white hover:border-yellow-300"
      }`}
    >
      <span className="text-sm uppercase font-semibold">{day}</span>
      <span className="text-2xl font-bold">{dayNum}</span>
    </button>
  );
}
