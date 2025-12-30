import React from "react";
import ManagerOverviewShowtimeCards from "./ManagerOverviewShowtimeCards";
import ManagerShowtimeTable from "./ManagerShowtimeTable";

export default function ManagerShowtimeManagement(): React.JSX.Element {
  return (
    <div className="space-y-8">
      {/* Showtime Stats Overview */}
      <ManagerOverviewShowtimeCards />

      {/* Showtime Table */}
      <ManagerShowtimeTable />
    </div>
  );
}
