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
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const loadReviews = async () => {
    const list = await reviewService.getReviewsByMovie(movieId);

    // Sort từ mới đến cũ
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setReviews(sorted);
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

  return (
    <div className="w-full h-full flex flex-col">
      {/* REVIEW LIST - Ở trên với scroll */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="flex flex-col gap-4">
          {reviews.length === 0 && (
            <p className="text-white/60 text-center py-8">
              Chưa có bình luận nào.
            </p>
          )}

          {reviews.map((rev) => (
            <div key={rev.id} className="">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={rev.avatarUrl}
                  className="w-10 h-10 rounded-full object-cover"
                  alt="avatar"
                />
                <div>
                  <p className="text-white font-semibold">{rev.fullName}</p>
                  <div className="flex items-center text-yellow-500 text-sm">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-white/90 whitespace-pre-wrap">{rev.comment}</p>

              <div className="text-white/50 text-sm mt-2">
                {new Date(rev.createdAt).toLocaleString("vi-VN")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMMENT FORM - Ở dưới cùng, cố định */}
      <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
        {/* Input với nút gửi bên trong */}
        <div className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bạn nghĩ gì về bộ phim này?"
            className="w-full p-3 pr-24 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="absolute bottom-3 right-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? "Đang gửi..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieComments;
