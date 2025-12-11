import React, { useEffect, useState } from "react";
import { reviewService } from "@/services/review/review.service";
import type { ReviewResponse } from "@/types/review/review.type";
import { Star, Edit2, Trash2, EyeOff, Eye } from "lucide-react";
import Swal from "sweetalert2";

interface AdminMovieCommentsProps {
  movieId: string;
}

const AdminMovieComments: React.FC<AdminMovieCommentsProps> = ({ movieId }) => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState<string>("");
  const [avgRating, setAvgRating] = useState<number>(0);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const [reviewList, avgRatingData] = await Promise.all([
        reviewService.getReviewsByMovie(movieId),
        reviewService.getAverageRating(movieId),
      ]);

      // Sort từ mới đến cũ
      const sorted = [...reviewList].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReviews(sorted);
      setAvgRating(avgRatingData || 0);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
      setAvgRating(0);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [movieId]);

  const handleEdit = (review: ReviewResponse) => {
    setEditingId(review.id);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async (reviewId: string, userId: string) => {
    if (editComment.trim().length < 3) {
      Swal.fire({
        icon: "warning",
        title: "Bình luận quá ngắn",
        text: "Bình luận phải có ít nhất 3 ký tự",
      });
      return;
    }

    try {
      await reviewService.updateReview(reviewId, {
        movieId,
        userId,
        rating: 5, // Keep existing rating
        comment: editComment.trim(),
      });

      setEditingId(null);
      setEditComment("");
      loadReviews();

      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating review:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi cập nhật",
        text: "Không thể cập nhật bình luận",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditComment("");
  };

  const handleDelete = async (reviewId: string) => {
    const confirm = await Swal.fire({
      title: "Xóa bình luận?",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Hủy",
    });

    if (!confirm.isConfirmed) return;

    try {
      await reviewService.deleteReview(reviewId);
      loadReviews();

      Swal.fire({
        icon: "success",
        title: "Đã xóa bình luận",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi xóa",
        text: "Không thể xóa bình luận",
      });
    }
  };

  const handleHideToggle = async (reviewId: string) => {
    try {
      await reviewService.hideReview(reviewId);
      loadReviews();

      Swal.fire({
        icon: "success",
        title: "Đã cập nhật trạng thái",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error hiding review:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi cập nhật",
        text: "Không thể cập nhật trạng thái bình luận",
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Rating Summary */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-lg font-semibold text-gray-900">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">
              ({reviews.length} đánh giá)
            </span>
          </div>
        </div>
      </div>

      {/* REVIEW LIST */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {loadingReviews ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {reviews.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Chưa có bình luận nào.
              </p>
            )}

            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatarUrl || "/LogoIconfinal.png"}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="avatar"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {rev.fullName}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-yellow-500 text-sm">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="fill-yellow-500"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(rev.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(rev)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleHideToggle(rev.id)}
                      className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      title="Ẩn/Hiện bình luận"
                    >
                      {rev.status === "HIDDEN" ? (
                        <Eye size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Comment Content */}
                {editingId === rev.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white text-black"
                      rows={3}
                      placeholder="Nhập bình luận..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(rev.id, rev.userId)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`text-gray-900 whitespace-pre-wrap ${
                      rev.status === "HIDDEN" ? "opacity-50 line-through" : ""
                    }`}
                  >
                    {rev.comment}
                  </p>
                )}

                {rev.status === "HIDDEN" && (
                  <div className="mt-2 text-xs text-orange-600 font-medium">
                    Bình luận đã bị ẩn
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMovieComments;
