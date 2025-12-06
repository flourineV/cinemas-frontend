import React, { useEffect, useState } from "react";
import { reviewService } from "@/services/review/review.service";
import type { ReviewRequest, ReviewResponse } from "@/types/review/review.type";
import { Star } from "lucide-react";

interface MovieCommentsProps {
  movieId: string;
  userId?: string;
}

const MovieComments: React.FC<MovieCommentsProps> = ({ movieId, userId }) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [visibleCount, setVisibleCount] = useState(3); // Hiển thị tối đa 3 review

  const loadReviews = async () => {
    const list = await reviewService.getReviewsByMovie(movieId);
    const avg = await reviewService.getAverageRating(movieId);

    // Sort từ mới đến cũ
    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setReviews(sorted);
    setAvgRating(avg || 0);
  };

  useEffect(() => {
    loadReviews();
  }, [movieId]);

  const handleSubmit = async () => {
    if (!userId) return alert("Bạn cần đăng nhập để bình luận!");
    if (rating === 0) return alert("Vui lòng chọn số sao đánh giá!");
    if (comment.trim().length < 3) return alert("Bình luận quá ngắn!");

    const payload: ReviewRequest = {
      movieId,
      userId,
      rating,
      comment,
    };

    setLoading(true);
    try {
      const newReview = await reviewService.createReview(payload);
      setReviews([newReview, ...reviews]);
      setRating(0);
      setComment("");
      loadReviews();
    } finally {
      setLoading(false);
    }
  };

  const displayedReviews = reviews.slice(0, visibleCount);

  return (
    <div className="w-full mt-12">
      {/* AVG Rating */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Đánh giá phim</h2>
        <div className="flex items-center gap-2">
          <span className="text-yellow-500 text-2xl font-semibold">
            {avgRating.toFixed(1)}
          </span>
          <Star className="text-yellow-500" />
          <span className="text-gray-500 text-xl">/ 5</span>
          {/* Tổng lượt đánh giá */}
          <span className="text-gray-600 text-lg ml-2">
            ({reviews.length} lượt đánh giá)
          </span>
        </div>
      </div>

      {/* COMMENT FORM */}
      <div className="bg-white p-5 rounded-xl mb-8 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Viết bình luận
        </h3>

        {/* STAR SELECTOR — FULL STAR WHEN ON */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((num) => {
            const isActive = (hoverRating || rating) >= num;

            return (
              <Star
                key={num}
                className={`cursor-pointer transition-all ${
                  isActive ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                }`}
                onMouseEnter={() => setHoverRating(num)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(num)}
              />
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Bạn nghĩ gì về bộ phim này?"
          className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          rows={3}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Gửi bình luận"}
        </button>
      </div>

      {/* REVIEW LIST */}
      <div className="flex flex-col gap-4">
        {reviews.length === 0 && (
          <p className="text-gray-500">Chưa có bình luận nào.</p>
        )}

        {displayedReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={rev.avatarUrl}
                className="w-10 h-10 rounded-full object-cover"
                alt="avatar"
              />
              <div>
                <p className="text-gray-900 font-semibold">{rev.fullName}</p>
                <div className="flex items-center text-yellow-500 text-sm">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-500" />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-700 whitespace-pre-wrap">{rev.comment}</p>

            <div className="text-gray-400 text-sm mt-2">
              {new Date(rev.createdAt).toLocaleString("vi-VN")}
            </div>
          </div>
        ))}
      </div>

      {/* LOAD MORE / COLLAPSE BUTTON */}
      {reviews.length > 3 && (
        <div className="mt-4">
          {visibleCount < reviews.length ? (
            <button
              onClick={() => setVisibleCount(reviews.length)}
              className="text-yellow-600 font-semibold hover:underline"
            >
              Xem thêm ({reviews.length - visibleCount} bình luận)
            </button>
          ) : (
            <button
              onClick={() => setVisibleCount(3)}
              className="text-gray-600 font-semibold hover:underline"
            >
              Thu gọn
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieComments;
