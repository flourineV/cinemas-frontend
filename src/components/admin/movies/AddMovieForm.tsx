"use client";
import React, { useState } from "react";
import { Plus, Film, Minus, ArrowUpFromLine } from "lucide-react";
import Swal from "sweetalert2";
import { movieManagementService } from "@/services/movie/movieManagementService";
import DateInput from "@/components/ui/DateInput";

interface MovieRow {
  id: string;
  tmdbId: string;
  startDate: string;
  endDate: string;
}

interface AddMovieFormProps {
  onSuccess?: () => void;
}

export default function AddMovieForm({
  onSuccess,
}: AddMovieFormProps): React.JSX.Element {
  const [movieRows, setMovieRows] = useState<MovieRow[]>([
    {
      id: Date.now().toString(),
      tmdbId: "",
      startDate: "",
      endDate: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMovieRow = () => {
    setMovieRows([
      ...movieRows,
      {
        id: Date.now().toString(),
        tmdbId: "",
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const removeMovieRow = (id: string) => {
    if (movieRows.length > 1) {
      setMovieRows(movieRows.filter((row) => row.id !== id));
    }
  };

  const updateMovieRow = (
    id: string,
    field: keyof Omit<MovieRow, "id">,
    value: string
  ) => {
    setMovieRows(
      movieRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all rows
    const validRows = movieRows.filter((row) => row.tmdbId.trim());

    if (validRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng nhập ít nhất một TMDB ID",
      });
      return;
    }

    // Validate each row
    for (const row of validRows) {
      if (!row.startDate || !row.endDate) {
        Swal.fire({
          icon: "warning",
          title: "Vui lòng chọn ngày",
          text: `TMDB ID ${row.tmdbId} thiếu ngày bắt đầu hoặc kết thúc`,
        });
        return;
      }

      if (new Date(row.startDate) > new Date(row.endDate)) {
        Swal.fire({
          icon: "warning",
          title: "Ngày không hợp lệ",
          text: `TMDB ID ${row.tmdbId}: Ngày bắt đầu phải trước ngày kết thúc`,
        });
        return;
      }

      const tmdbId = parseInt(row.tmdbId.trim());
      if (isNaN(tmdbId) || tmdbId <= 0) {
        Swal.fire({
          icon: "warning",
          title: "TMDB ID không hợp lệ",
          text: `"${row.tmdbId}" không phải là số hợp lệ`,
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Process each movie individually
      const results = [];
      let successCount = 0;
      let failedCount = 0;

      for (const row of validRows) {
        try {
          const result = await movieManagementService.bulkFromTmdb({
            movies: [
              {
                tmdbId: parseInt(row.tmdbId.trim()),
                startDate: row.startDate,
                endDate: row.endDate,
              },
            ],
          });

          results.push({
            tmdbId: parseInt(row.tmdbId.trim()),
            success: result.successCount > 0,
            message: result.successCount > 0 ? "Thành công" : "Thất bại",
          });

          if (result.successCount > 0) successCount++;
          else failedCount++;
        } catch (error: any) {
          let errorMessage = "Lỗi không xác định";

          // Extract error message from API response
          if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error?.message) {
            errorMessage = error.message;
          }

          results.push({
            tmdbId: parseInt(row.tmdbId.trim()),
            success: false,
            message: errorMessage,
          });
          failedCount++;
        }
      }

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
        title: "Kết quả thêm phim",
        html: successMessage,
        confirmButtonText: "OK",
      });

      // Reset form on success
      if (successCount > 0) {
        setMovieRows([
          {
            id: Date.now().toString(),
            tmdbId: "",
            startDate: "",
            endDate: "",
          },
        ]);
        onSuccess?.();
      }

      // Show detailed results if there are failures
      if (failedCount > 0) {
        const failedResults = results
          .filter((r) => !r.success)
          .map((r) => {
            const statusClass =
              r.message.includes("đang được chiếu") ||
              r.message.includes("sắp được chiếu")
                ? "text-orange-600"
                : "text-red-600";
            return `<span class="${statusClass}">TMDB ID ${r.tmdbId}: ${r.message}</span>`;
          })
          .join("<br>");

        await Swal.fire({
          icon: "info",
          title: "Chi tiết kết quả",
          html: `<div class="text-left text-sm">${failedResults}</div>`,
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error adding movies:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi thêm phim",
        text:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi thêm phim",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-400 rounded-lg p-3">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Movie Rows */}
        <div className="space-y-0">
          {movieRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 items-end"
            >
              {/* TMDB ID - Tăng lên 5/12 cột để dài hơn */}
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TMDB ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={row.tmdbId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      updateMovieRow(row.id, "tmdbId", value);
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg
            bg-white border border-gray-400
            text-gray-700 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500
            transition"
                    placeholder="12345"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Start Date - Giữ nguyên 3/12 cột */}
              <div className="md:col-span-3">
                <DateInput
                  label="Ngày bắt đầu"
                  value={row.startDate}
                  onChange={(value) =>
                    updateMovieRow(row.id, "startDate", value)
                  }
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* End Date - Giữ nguyên 3/12 cột */}
              <div className="md:col-span-3">
                <DateInput
                  label="Ngày kết thúc"
                  value={row.endDate}
                  onChange={(value) => updateMovieRow(row.id, "endDate", value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Remove Button - 1/12 cột, căn giữa nút tròn */}
              <div className="md:col-span-1 flex items-end justify-center pb-[2px]">
                <button
                  type="button"
                  onClick={() => removeMovieRow(row.id)}
                  disabled={movieRows.length <= 1 || isSubmitting}
                  // Sửa style tại đây: w-10 h-10, rounded-full, xóa w-full và padding chữ nhật
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
            onClick={addMovieRow}
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
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Đang thêm...
              </>
            ) : (
              <>
                <ArrowUpFromLine size={16} />
                Thêm tất cả phim
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
