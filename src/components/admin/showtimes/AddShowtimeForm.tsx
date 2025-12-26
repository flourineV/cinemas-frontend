import React, { useState, useEffect } from "react";
import { Plus, Minus, ArrowUpFromLine } from "lucide-react";
import Swal from "sweetalert2";
import { showtimeService } from "@/services/showtime/showtimeService";
import { movieManagementService } from "@/services/movie/movieManagementService";
import { theaterService } from "@/services/showtime/theaterService";
import { roomService } from "@/services/showtime/roomService";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import DateInput from "@/components/ui/DateInput";

interface ShowtimeRow {
  id: string;
  movieId: string;
  theaterId: string;
  roomId: string;
  date: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
}

interface AddShowtimeFormProps {
  onSuccess?: () => void;
}

export default function AddShowtimeForm({
  onSuccess,
}: AddShowtimeFormProps): React.JSX.Element {
  const [showtimeRows, setShowtimeRows] = useState<ShowtimeRow[]>([
    {
      id: Date.now().toString(),
      movieId: "",
      theaterId: "",
      roomId: "",
      date: "",
      startHour: "",
      startMinute: "",
      endHour: "",
      endMinute: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data
  const [movies, setMovies] = useState<any[]>([]);
  const [theaters, setTheaters] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load movies
        const moviesRes = await movieManagementService.adminList({
          page: 1,
          size: 1000,
          status: "NOW_PLAYING",
        });
        setMovies(moviesRes.data ?? []);

        // Load theaters
        const theatersRes = await theaterService.getAllTheaters();
        setTheaters(theatersRes);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      }
    };
    loadData();
  }, []);

  const loadRoomsForTheater = async (theaterId: string) => {
    try {
      const roomsRes = await roomService.getRoomsByTheaterId(theaterId);
      setRooms((prev) => ({ ...prev, [theaterId]: roomsRes }));
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  };

  const addShowtimeRow = () => {
    setShowtimeRows([
      ...showtimeRows,
      {
        id: Date.now().toString(),
        movieId: "",
        theaterId: "",
        roomId: "",
        date: "",
        startHour: "",
        startMinute: "",
        endHour: "",
        endMinute: "",
      },
    ]);
  };

  const removeShowtimeRow = (id: string) => {
    if (showtimeRows.length > 1) {
      setShowtimeRows(showtimeRows.filter((row) => row.id !== id));
    }
  };

  const updateShowtimeRow = (
    id: string,
    field: keyof Omit<ShowtimeRow, "id">,
    value: string
  ) => {
    setShowtimeRows(
      showtimeRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // Reset roomId when theater changes
          if (field === "theaterId") {
            updatedRow.roomId = "";
            if (value) {
              loadRoomsForTheater(value);
            }
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all rows
    const validRows = showtimeRows.filter(
      (row) =>
        row.movieId &&
        row.theaterId &&
        row.roomId &&
        row.date &&
        row.startHour &&
        row.startMinute &&
        row.endHour &&
        row.endMinute
    );

    if (validRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng điền đầy đủ thông tin ít nhất một lịch chiếu",
      });
      return;
    }

    // Validate each row
    for (const row of validRows) {
      // Construct datetime strings
      const startDateTime = `${row.date}T${row.startHour.padStart(2, "0")}:${row.startMinute.padStart(2, "0")}:00`;
      const endDateTime = `${row.date}T${row.endHour.padStart(2, "0")}:${row.endMinute.padStart(2, "0")}:00`;

      const startTime = new Date(startDateTime);
      const endTime = new Date(endDateTime);

      if (startTime >= endTime) {
        Swal.fire({
          icon: "warning",
          title: "Thời gian không hợp lệ",
          text: "Thời gian bắt đầu phải trước thời gian kết thúc",
        });
        return;
      }

      if (startTime <= new Date()) {
        Swal.fire({
          icon: "warning",
          title: "Thời gian không hợp lệ",
          text: "Thời gian bắt đầu phải sau thời điểm hiện tại",
        });
        return;
      }

      // Validate minimum duration (e.g., 30 minutes)
      const durationMinutes =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      if (durationMinutes < 30) {
        Swal.fire({
          icon: "warning",
          title: "Thời gian không hợp lệ",
          text: "Thời lượng lịch chiếu phải ít nhất 30 phút",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Prepare batch request
      const showtimes = validRows.map((row) => {
        const startDateTime = `${row.date}T${row.startHour.padStart(2, "0")}:${row.startMinute.padStart(2, "0")}:00`;
        const endDateTime = `${row.date}T${row.endHour.padStart(2, "0")}:${row.endMinute.padStart(2, "0")}:00`;

        return {
          movieId: row.movieId,
          theaterId: row.theaterId,
          roomId: row.roomId,
          startTime: startDateTime,
          endTime: endDateTime,
        };
      });

      const result = await showtimeService.batchCreate({
        showtimes,
        skipOnConflict: true,
      });

      const successCount = result.successCount || 0;
      const failedCount = result.errors?.length || 0;
      const totalRequests = validRows.length;

      // Show success message with details
      let successMessage = `
        <div class="text-left">
          <p><strong>Tổng số yêu cầu:</strong> ${totalRequests}</p>
          <p><strong>Thành công:</strong> ${successCount}</p>
          <p><strong>Thất bại:</strong> ${failedCount}</p>
        </div>
      `;

      // Show detailed errors if there are failures
      if (failedCount > 0 && result.errors) {
        const conflictErrors = result.errors.filter(
          (error: string) =>
            error.includes("conflict") ||
            error.includes("overlap") ||
            error.includes("trùng")
        );

        if (conflictErrors.length > 0) {
          successMessage += `<br><div class="text-left text-sm mt-2 text-red-600">
            <strong>Lỗi trùng lịch:</strong><br>
            ${conflictErrors
              .map(
                (error: string, index: number) =>
                  `• Lịch chiếu ${index + 1}: ${error}`
              )
              .join("<br>")}
          </div>`;
        }
      }

      await Swal.fire({
        icon: successCount > 0 ? "success" : "warning",
        title: "Kết quả tạo lịch chiếu",
        html: successMessage,
        confirmButtonText: "OK",
      });

      // Reset form on success
      if (successCount > 0) {
        setShowtimeRows([
          {
            id: Date.now().toString(),
            movieId: "",
            theaterId: "",
            roomId: "",
            date: "",
            startHour: "",
            startMinute: "",
            endHour: "",
            endMinute: "",
          },
        ]);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating showtimes:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi tạo lịch chiếu",
        text:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo lịch chiếu",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-6">
      {/* Header */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Showtime Rows */}
        <div className="space-y-0">
          {showtimeRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 items-end"
            >
              {/* Movie - 3/12 cột */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phim <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={[
                    { value: "", label: "Chọn phim" },
                    ...movies.map((movie) => ({
                      value: movie.id,
                      label: movie.title,
                    })),
                  ]}
                  value={row.movieId}
                  onChange={(value) =>
                    updateShowtimeRow(row.id, "movieId", value)
                  }
                  placeholder="Chọn phim"
                  fullWidth
                />
              </div>

              {/* Theater - 2/12 cột */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rạp <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={[
                    { value: "", label: "Chọn rạp" },
                    ...theaters.map((theater) => ({
                      value: theater.id,
                      label: theater.name,
                    })),
                  ]}
                  value={row.theaterId}
                  onChange={(value) =>
                    updateShowtimeRow(row.id, "theaterId", value)
                  }
                  placeholder="Chọn rạp"
                  fullWidth
                />
              </div>

              {/* Room - 2/12 cột */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={[
                    { value: "", label: "Chọn phòng" },
                    ...(rooms[row.theaterId] || []).map((room) => ({
                      value: room.id,
                      label: room.name,
                    })),
                  ]}
                  value={row.roomId}
                  onChange={(value) =>
                    updateShowtimeRow(row.id, "roomId", value)
                  }
                  placeholder="Chọn phòng"
                  disabled={!row.theaterId}
                  fullWidth
                />
              </div>

              {/* Date - 2/12 cột */}
              <div className="md:col-span-2">
                <DateInput
                  label="Ngày chiếu"
                  value={row.date}
                  onChange={(value) => updateShowtimeRow(row.id, "date", value)}
                  required
                />
              </div>

              {/* Start Time - 1/12 cột */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={
                    row.startHour && row.startMinute
                      ? `${row.startHour.padStart(2, "0")}:${row.startMinute.padStart(2, "0")}`
                      : ""
                  }
                  onChange={(e) => {
                    const [hour, minute] = e.target.value.split(":");
                    updateShowtimeRow(row.id, "startHour", hour || "");
                    updateShowtimeRow(row.id, "startMinute", minute || "");
                  }}
                  className="w-full px-2 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                  disabled={isSubmitting}
                />
              </div>

              {/* End Time - 1/12 cột */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={
                    row.endHour && row.endMinute
                      ? `${row.endHour.padStart(2, "0")}:${row.endMinute.padStart(2, "0")}`
                      : ""
                  }
                  onChange={(e) => {
                    const [hour, minute] = e.target.value.split(":");
                    updateShowtimeRow(row.id, "endHour", hour || "");
                    updateShowtimeRow(row.id, "endMinute", minute || "");
                  }}
                  className="w-full px-2 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                  disabled={isSubmitting}
                />
              </div>

              {/* Remove Button - 1/12 cột */}
              <div className="md:col-span-1 flex items-end justify-center pb-[2px]">
                <button
                  type="button"
                  onClick={() => removeShowtimeRow(row.id)}
                  disabled={showtimeRows.length <= 1 || isSubmitting}
                  className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-red-200"
                  title="Xóa dòng này"
                >
                  <Minus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={addShowtimeRow}
            className="flex items-center justify-center w-10 h-10 bg-yellow-500 text-black rounded-full hover:bg-yellow-600 transition-colors"
            disabled={isSubmitting}
            title="Thêm dòng mới"
          >
            <Plus size={18} />
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <ArrowUpFromLine size={16} />
                Tạo tất cả lịch chiếu
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
