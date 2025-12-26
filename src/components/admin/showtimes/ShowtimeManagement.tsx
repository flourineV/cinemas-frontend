import React, { useState } from "react";
import { Plus } from "lucide-react";
import OverviewShowtimeCards from "./OverviewShowtimeCards";
import AddShowtimeForm from "./AddShowtimeForm";
import ShowtimeTable from "./ShowtimeTable";

export default function ShowtimeManagement(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* Showtime Stats Overview */}
      <OverviewShowtimeCards />

      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-5 h-5 text-yellow-600" />
        <h3 className="text-2xl font-semibold text-gray-800">Tạo lịch chiếu</h3>
      </div>
      {/* Add Showtime Form */}
      <AddShowtimeForm onSuccess={handleFormSuccess} />

      {/* Showtime Table */}
      <ShowtimeTable refreshTrigger={refreshTrigger} />
    </div>
  );
}
