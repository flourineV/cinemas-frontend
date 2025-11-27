import React, { useState } from "react";
import ShowtimeForm from "./ShowtimeForm";
import ShowtimeTable from "./ShowtimeTable";

export default function ShowtimeManagement(): React.JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFormSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <ShowtimeTable refreshTrigger={refreshTrigger} />
    </div>
  );
}
