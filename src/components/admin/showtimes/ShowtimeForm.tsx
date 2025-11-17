"use client";
import React, { useEffect, useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

import { showtimeService } from "@/services/showtime/showtimeService";
import { movieService } from "@/services/movie/movieService";
import { provinceService } from "@/services/showtime/provinceService";
import { theaterService } from "@/services/showtime/theaterService";
import { roomService } from "@/services/showtime/roomService";
import { CustomDropdown } from "@/components/ui/CustomDropdownPortal";

import type {
  BatchShowtimeRequest,
  BatchShowtimeResponse,
} from "@/types/showtime/showtime.type";

interface NewShowtimeRow {
  id: string;
  movieId: string;
  selectedProvinceId: string;
  theaterId: string;
  roomId: string;
  startTime: string;
  endTime: string;
}

interface ShowtimeFormProps {
  onSuccess?: () => void;
}

export default function ShowtimeForm({
  onSuccess,
}: ShowtimeFormProps): React.JSX.Element {
  const [newRows, setNewRows] = useState<NewShowtimeRow[]>([
    {
      id: Date.now().toString(),
      movieId: "",
      selectedProvinceId: "",
      theaterId: "",
      roomId: "",
      startTime: "",
      endTime: "",
    },
  ]);

  const [movies, setMovies] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [theatersByProvince, setTheatersByProvince] = useState<{
    [key: string]: any[];
  }>({});
  const [roomsByTheater, setRoomsByTheater] = useState<{
    [key: string]: any[];
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [moviesRes, provincesRes] = await Promise.all([
          movieService.getNowPlaying(0, 100),
          provinceService.getAllProvinces(),
        ]);
        setMovies(moviesRes.content ?? []);
        setProvinces(provincesRes);
      } catch (err) {
        console.error("Error loading dropdown data", err);
      }
    };
    loadData();
  }, []);

  const loadTheatersForRow = async (provinceId: string) => {
    if (theatersByProvince[provinceId]) return;
    try {
      const theatersRes =
        await theaterService.getTheatersByProvince(provinceId);
      setTheatersByProvince((prev) => ({ ...prev, [provinceId]: theatersRes }));
    } catch (err) {
      console.error("Error loading theaters", err);
    }
  };

  const loadRoomsForRow = async (theaterId: string) => {
    if (roomsByTheater[theaterId]) return;
    try {
      const roomsRes = await roomService.getRoomsByTheaterId(theaterId);
      setRoomsByTheater((prev) => ({ ...prev, [theaterId]: roomsRes }));
    } catch (err) {
      console.error("Error loading rooms", err);
    }
  };

  const addNewRow = () =>
    setNewRows((s) => [
      ...s,
      {
        id: Date.now().toString(),
        movieId: "",
        selectedProvinceId: "",
        theaterId: "",
        roomId: "",
        startTime: "",
        endTime: "",
      },
    ]);

  const removeRow = (id: string) =>
    setNewRows((s) => s.filter((r) => r.id !== id));

  const updateRow = (
    id: string,
    field: keyof NewShowtimeRow,
    value: string
  ) => {
    setNewRows((s) =>
      s.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          if (field === "selectedProvinceId" && value) {
            loadTheatersForRow(value);
            updated.theaterId = "";
            updated.roomId = "";
          }
          if (field === "theaterId" && value) {
            loadRoomsForRow(value);
            updated.roomId = "";
          }
          return updated;
        }
        return row;
      })
    );
  };

  const submitBatch = async () => {
    if (newRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Chưa có lịch chiếu nào để tạo",
        background: "#0b1020",
        color: "#fff",
      });
      return;
    }

    const invalidRows = newRows.filter(
      (r) =>
        !r.movieId || !r.theaterId || !r.roomId || !r.startTime || !r.endTime
    );
    if (invalidRows.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng điền đầy đủ thông tin cho tất cả các dòng",
        background: "#0b1020",
        color: "#fff",
      });
      return;
    }

    try {
      const batchData: BatchShowtimeRequest = {
        showtimes: newRows.map((row) => ({
          movieId: row.movieId,
          theaterId: row.theaterId,
          roomId: row.roomId,
          startTime: row.startTime,
          endTime: row.endTime,
        })),
        skipOnConflict: true, // Skip conflicting showtimes instead of failing entire batch
      };
      const result: BatchShowtimeResponse =
        await showtimeService.createShowtimesBatch(batchData);

      Swal.fire({
        icon: result.failedCount === 0 ? "success" : "warning",
        title: `Tạo batch hoàn tất`,
        html: `<div class="text-left">
          <p>Tổng số: ${result.totalRequested}</p>
          <p class="text-green-400">Thành công: ${result.successCount}</p>
          <p class="text-red-400">Thất bại: ${result.failedCount}</p>
          ${result.errors.length > 0 ? `<div class="mt-2 text-xs"><strong>Lỗi:</strong><br/>${result.errors.join("<br/>")}</div>` : ""}
        </div>`,
        background: "#0b1020",
        color: "#fff",
      });

      if (result.successCount > 0) {
        setNewRows([
          {
            id: Date.now().toString(),
            movieId: "",
            selectedProvinceId: "",
            theaterId: "",
            roomId: "",
            startTime: "",
            endTime: "",
          },
        ]);
        onSuccess?.();
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Tạo batch thất bại",
        text: err?.response?.data?.message || "Có lỗi xảy ra",
        background: "#0b1020",
        color: "#fff",
      });
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-light mb-3 text-yellow-300">
          Thêm lịch chiếu
        </h2>
        <div className="flex gap-2">
          <button
            onClick={addNewRow}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <Plus size={18} /> Thêm dòng
          </button>
          {newRows.length > 0 && (
            <button
              onClick={submitBatch}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-400 transition"
            >
              <Send size={18} /> Gửi ({newRows.length})
            </button>
          )}
        </div>
      </div>

      {newRows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-yellow-400/40">
          {/* table-fixed + min-w-0 để các cell truncate đúng */}
          <table className="w-full text-sm table-fixed min-w-0">
            <thead className="bg-yellow-500/20 text-yellow-300 uppercase text-xs border-b border-yellow-400/40">
              <tr>
                <th className="w-[200px] px-2 py-2 text-center text-sm font-semibold">
                  Phim
                </th>
                <th className="w-[160px] px-2 py-2 text-center text-sm font-semibold">
                  Tỉnh/TP
                </th>
                <th className="w-[160px] px-2 py-2 text-center text-sm font-semibold">
                  Rạp
                </th>
                <th className="w-[170px] px-2 py-2 text-center text-sm font-semibold">
                  Phòng
                </th>
                <th className="w-[210px] px-2 py-2 text-center text-sm font-semibold">
                  Bắt đầu
                </th>
                <th className="w-[210px] px-2 py-2 text-center text-sm font-semibold">
                  Kết thúc
                </th>
                <th className="w-[70px] px-2 py-2 text-center text-sm font-semibold">
                  Xóa
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-400/20">
              {newRows.map((row) => (
                <tr key={row.id} className="hover:bg-yellow-400/5">
                  {/* mỗi ô dropdown bọc min-w-0 và .truncate trong button đảm bảo không bung */}
                  <td className="px-2 py-2">
                    <div className="min-w-0">
                      <CustomDropdown
                        options={[
                          { value: "", label: "-- Chọn phim --" },
                          ...movies.map((m) => ({
                            value: m.id,
                            label: m.title,
                          })),
                        ]}
                        value={row.movieId}
                        onChange={(val) => updateRow(row.id, "movieId", val)}
                        placeholder="-- Chọn phim --"
                      />
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="min-w-0">
                      <CustomDropdown
                        options={[
                          { value: "", label: "-- Chọn tỉnh --" },
                          ...provinces.map((p) => ({
                            value: p.id,
                            label: p.name,
                          })),
                        ]}
                        value={row.selectedProvinceId}
                        onChange={(val) =>
                          updateRow(row.id, "selectedProvinceId", val)
                        }
                        placeholder="-- Chọn tỉnh --"
                      />
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="min-w-0">
                      <CustomDropdown
                        options={[
                          { value: "", label: "-- Chọn rạp --" },
                          ...(
                            theatersByProvince[row.selectedProvinceId] || []
                          ).map((t) => ({ value: t.id, label: t.name })),
                        ]}
                        value={row.theaterId}
                        onChange={(val) => updateRow(row.id, "theaterId", val)}
                        placeholder="-- Chọn rạp --"
                        disabled={!row.selectedProvinceId}
                      />
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="min-w-0">
                      <CustomDropdown
                        options={[
                          { value: "", label: "-- Chọn phòng --" },
                          ...(roomsByTheater[row.theaterId] || []).map((r) => ({
                            value: r.id,
                            label: r.name,
                          })),
                        ]}
                        value={row.roomId}
                        onChange={(val) => updateRow(row.id, "roomId", val)}
                        placeholder="-- Chọn phòng --"
                        disabled={!row.theaterId}
                      />
                    </div>
                  </td>

                  <td className="px-2 py-2 w-[200px]">
                    <input
                      type="datetime-local"
                      value={row.startTime}
                      onChange={(e) =>
                        updateRow(row.id, "startTime", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-yellow-400/40 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </td>

                  <td className="px-2 py-2 w-[200px]">
                    <input
                      type="datetime-local"
                      value={row.endTime}
                      onChange={(e) =>
                        updateRow(row.id, "endTime", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-yellow-400/40 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </td>

                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/30 transition"
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-400 py-4 text-sm">
          Nhấn "Thêm dòng" để bắt đầu thêm lịch chiếu
        </p>
      )}
    </div>
  );
}
