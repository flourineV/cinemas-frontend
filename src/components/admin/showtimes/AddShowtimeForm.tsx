import React, { useState, useEffect } from "react";
import { Plus, Clock, Minus } from "lucide-react";
import Swal from "sweetalert2";
import { showtimeService } from "@/services/showtime/showtimeService";
import { movieManagementService } from "@/services/movie/movieManagementService";
import { theaterService } from "@/services/showtime/theaterService";
import { roomService } from "@/services/showtime/roomService";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

interface ShowtimeRow {
  id: string;
  movieId: string;
  theaterId: string;
  roomId: string;
  startTime: string;
  endTime: string;
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
      startTime: "",
      endTime: "",
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
        startTime: "",
        endTime: "",
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
        row.startTime &&
        row.endTime
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
      if (new Date(row.startTime) >= new Date(row.endTime)) {
        Swal.fire({
          icon: "warning",
          title: "Thời gian không hợp lệ",
          text: "Thời gian bắt đầu phải trước thời gian kết thúc",
        });
        return;
      }

      if (new Date(row.startTime) <= new Date()) {
        Swal.fire({
          icon: "warning",
          title: "Thời gian không hợp lệ",
          text: "Thời gian bắt đầu phải sau thời điểm hiện tại",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Prepare batch request
      const showtimes = validRows.map((row) => ({
        movieId: row.movieId,
        theaterId: row.theaterId,
        roomId: row.roomId,
        startTime: row.startTime,
        endTime: row.endTime,
      }));

      const result = await showtimeService.batchCreate({
        showtimes,
        skipOnConflict: true,
      });

      const successCount = result.successCount || 0;
      const failedCount = result.errors?.length || 0;
      const totalRequests = validRows.length;

      // Show success message with details
      const successMessage = `
        <div class="text-left">
          <p><strong>Tổng số yêu cầu:</strong> ${totalRequests}</p>
          <p><strong>Thành công:</strong> ${successCount}</p>
          <p><strong>Thất bại:</strong> ${failedCount}</p>
        </div>
      `;

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
            startTime: "",
            endTime: "",
          },
        ]);
        onSuccess?.();
      }

      // Show detailed errors if there are failures
      if (failedCount > 0 && result.errors) {
        const errorMessages = result.errors
          .map(
            (error: any, index: number) => `Lịch chiếu ${index + 1}: ${error}`
          )
          .join("<br>");

        await Swal.fire({
          icon: "info",
          title: "Chi tiết lỗi",
          html: `<div class="text-left text-sm">${errorMessages}</div>`,
          confirmButtonText: "OK",
        });
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Tạo lịch chiếu
          </h3>
        </div>
        <button
          type="button"
          onClick={addShowtimeRow}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          disabled={isSubmitting}
        >
          <Plus size={14} />
          Thêm lịch chiếu
        </button>
      </div>

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
                />
              </div>

              {/* Start Time - 2/12 cột */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={row.startTime}
                    onChange={(e) =>
                      updateShowtimeRow(row.id, "startTime", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg
                      bg-white border border-gray-300
                      text-gray-700
                      focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                      transition"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* End Time - 2/12 cột */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={row.endTime}
                    onChange={(e) =>
                      updateShowtimeRow(row.id, "endTime", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg
                      bg-white border border-gray-300
                      text-gray-700
                      focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
                      transition"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Remove Button - 1/12 cột */}
              <div className="md:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={() => removeShowtimeRow(row.id)}
                  disabled={showtimeRows.length <= 1 || isSubmitting}
                  className="w-full px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1 border border-red-200"
                  title="Xóa dòng này"
                >
                  <Minus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Plus size={16} />
                Tạo tất cả lịch chiếu
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
