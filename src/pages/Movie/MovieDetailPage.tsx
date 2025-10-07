import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { getPosterUrl } from "../../utils/getPosterUrl";

import SeatMap from "@/components/ui/SeatMapRealtime";

//import Services
import { movieService, type MovieDetail } from "@/services/movie/movieService";
import { showtimeService } from "@/services/showtime/showtimeService";
import { socketService } from "@/services/socketService";
import type { ShowtimeResponse } from "@/services/showtime/showtimeService";

import dayjs from "dayjs";
// Thêm ngôn ngữ tiếng Việt cho Day.js
import "dayjs/locale/vi";
dayjs.locale("vi");

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeResponse[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [seatUpdates, setSeatUpdates] = useState<any[]>([]);

  // Lấy detail phim
  useEffect(() => {
    if (!id) return;
    const fetchMovie = async () => {
      setLoading(true);
      try {
        // ID từ useParams là string, phải đảm bảo service xử lý được (hoặc truyền string)
        const res = await movieService.getMovieDetail(id); 
        setMovie(res);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin phim.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Lấy lịch chiếu theo phim
  useEffect(() => {
    if (!id) return;
    showtimeService.getShowtimesByMovie(id)
      .then((res) => {
        setShowtimes(res);
        // Lấy danh sách ngày duy nhất
        const uniqueDates = Array.from(
          new Set(res.map((s) => dayjs(s.startTime).format("YYYY-MM-DD")))
        );
        // Sắp xếp ngày nếu cần, hiện tại set Dates và SelectedDate đầu tiên
        setDates(uniqueDates);
        setSelectedDate(uniqueDates[0]);
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể tải lịch chiếu.");
      });
  }, [id]);

  useEffect(() => {
    //Khi người dùng chọn khung giờ (showtimeId), bắt đầu listen
    if (!selectedShowtime) return;
    socketService.connect(() => {
      socketService.subscribe(
        `/topic/showtime/${selectedShowtime}/seats`,
        (msg) => {
          console.log("Seat update: ", msg);
          setSeatUpdates((prev) => [...prev, msg]);
        }
      );
    });

    return () => {
      socketService.disconnect();
    };
  }, [selectedShowtime]);

  // Lọc lịch chiếu theo ngày đã chọn
  const filteredShowtimes = showtimes.filter(
    (s) => dayjs(s.startTime).format("YYYY-MM-DD") === selectedDate
  );

  // Xử lý trạng thái Loading
  if (loading)
    return (
      <Layout>
        <div className="text-center text-white mt-20">Đang tải...</div>
      </Layout>
    );

  // Xử lý trạng thái Error
  if (error)
    return (
      <Layout>
        <div className="text-center text-red-400 mt-20">{error}</div>
      </Layout>
    );

  // Xử lý trạng thái Không tìm thấy phim
  if (!movie)
    return (
      <Layout>
        <div className="text-center text-gray-400 mt-20">Không tìm thấy phim.</div>
      </Layout>
    );

  // Gom showtimes theo rạp (theater) và phòng (room)
  const groupedByTheater = filteredShowtimes.reduce((acc, s) => {
    const key = `${s.theaterName}__${s.roomName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, ShowtimeResponse[]>);

  // Render giao diện chi tiết phim và lịch chiếu
  return (
    <Layout>
      <main className="max-w-6xl mx-auto px-4 text-white pt-20 md:pt-24 pb-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full md:w-[350px] lg:w-[400px] flex-shrink-0 mx-auto md:mx-0">
            <img 
              src={getPosterUrl(movie.posterUrl)} 
              alt={movie.title} 
              className="w-full h-auto object-cover rounded-xl shadow-lg" 
            />
          </div>

          {/* Thông tin phim */}
          <div className="flex-1 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left">
              {movie.title}
            </h1>
            <div className="space-y-2 text-sm md:text-base">
              <p><span className="font-bold">🎭 Thể loại:</span> {movie.genres.join(", ")}</p>
              <p><span className="font-bold">⏱ Thời lượng:</span> {movie.time}’</p>
              <p><span className="font-bold">🗣 Ngôn ngữ:</span> {movie.spokenLanguages.join(", ")}</p>
              <p><span className="font-bold">🌍 Quốc gia:</span> {movie.country}</p>
              <p><span className="font-bold">🔞 Độ tuổi:</span> {movie.age}</p>
              <p><span className="font-bold">📅 Ngày phát hành:</span> {movie.releaseDate}</p>
            </div>

            {/* Nội dung phim */}
            <div className="mt-6">
              <h2 className="text-lg md:text-xl font-bold mb-2">📖 Nội dung phim</h2>
              <p className="text-justify leading-relaxed">{movie.overview}</p>
            </div>

            {/* Đạo diễn */}
            {movie.crew && movie.crew.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2">🎬 Đạo diễn</h2>
                <p>{movie.crew.join(", ")}</p>
              </div>
            )}

            {/* Diễn viên */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2">⭐ Diễn viên</h2>
                <p>{movie.cast.join(", ")}</p>
              </div>
            )}

            {/* Trailer */}
            {movie.trailer && (
              <div className="mt-8">
                <h2 className="text-lg md:text-xl font-semibold mb-4">📺 Trailer</h2>
                <div className="aspect-video">
                  <iframe
                    src={movie.trailer}
                    title="Trailer"
                    allowFullScreen
                    className="w-full h-full rounded-xl shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === LỊCH CHIẾU === */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">LỊCH CHIẾU</h2>

          {/* --- Dãy ngày --- */}
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            {dates.map((d, idx) => {
              const date = dayjs(d);
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(d)}
                  className={`px-4 py-2 rounded-md border ${
                    selectedDate === d
                      ? "bg-yellow-400 text-black font-bold"
                      : "border-yellow-400 text-yellow-400"
                  }`}
                >
                  <div>{date.format("DD/MM")}</div>
                  {/* Dùng locale 'vi' để hiển thị thứ tiếng Việt */}
                  <div className="text-xs">{date.format("ddd")}</div> 
                </button>
              );
            })}
          </div>

          {/* --- Danh sách rạp --- */}
          <div className="space-y-6">
            {Object.entries(groupedByTheater).map(([key, list], idx) => {
              const [theaterName, roomName] = key.split("__");
              return (
                <div
                  key={idx}
                  className="bg-purple-700 rounded-xl p-4 shadow-md max-w-3xl mx-auto"
                >
                  <h3 className="font-semibold text-lg mb-1 text-yellow-300">
                    {theaterName}
                  </h3>
                  <p className="text-sm text-gray-200 mb-3">{roomName}</p>
                  <div className="flex gap-2 flex-wrap">
                    {list.map((s) => (
                      <button
                        key={s.id}
                        className="px-3 py-1 border border-white rounded-md hover:bg-white hover:text-black"
                        onClick={() => setSelectedShowtime(s.id)}
                      >
                        {dayjs(s.startTime).format("HH:mm")}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedShowtime && (
            <div className="mt-10">
              <SeatMap showtimeId={selectedShowtime} />
            </div>
          )}
          
          {/* Xử lý trường hợp không có lịch chiếu cho ngày đã chọn */}
          {filteredShowtimes.length === 0 && selectedDate && (
             <div className="text-center text-gray-400 mt-8">
               Chưa có lịch chiếu cho ngày {dayjs(selectedDate).format("DD/MM/YYYY")}.
             </div>
          )}
          {dates.length === 0 && !loading && (
             <div className="text-center text-gray-400 mt-8">
               Phim này hiện chưa có lịch chiếu.
             </div>
          )}
        </div>
      </main>
    </Layout>
  );
}