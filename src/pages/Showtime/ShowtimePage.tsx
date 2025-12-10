import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { theaterService } from "@/services/showtime/theaterService";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import { MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const ShowtimePage = () => {
  const [theaters, setTheaters] = useState<TheaterResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheaters = async () => {
      try {
        const theaterList = await theaterService.getAllTheaters();
        setTheaters(theaterList);
      } catch (error) {
        console.error("Error loading theaters:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTheaters();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-yellow-500 mb-4">
              LỊCH CHIẾU PHIM
            </h1>
            <p className="text-gray-600 text-lg">
              Chọn rạp để xem lịch chiếu chi tiết
            </p>
          </div>

          {/* Theaters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theaters.map((theater) => (
              <Link
                key={theater.id}
                to={`/theater/${theater.id}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 overflow-hidden group"
              >
                {/* Theater Image */}
                {theater.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={theater.imageUrl}
                      alt={theater.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {theater.name}
                      </h3>
                    </div>
                  </div>
                )}

                {/* Theater Info */}
                <div className="p-6">
                  {!theater.imageUrl && (
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {theater.name}
                    </h3>
                  )}

                  <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2">{theater.address}</p>
                  </div>

                  {theater.provinceName && (
                    <p className="text-xs text-gray-500 mb-4">
                      {theater.provinceName}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Xem lịch chiếu
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                      <svg
                        className="w-4 h-4 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {theaters.length === 0 && !loading && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-xl">Hiện tại chưa có rạp nào</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ShowtimePage;
