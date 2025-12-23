import React, { useEffect, useState } from "react";
import { reviewService } from "@/services/review/review.service";
import type { ReviewRequest, ReviewResponse } from "@/types/review/review.type";
import { Star } from "lucide-react";
import Swal from "sweetalert2";
import { useAuthStore } from "@/stores/authStore";
import { userProfileService } from "@/services/userprofile/userProfileService";
import { useLanguage } from "@/contexts/LanguageContext";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "dayjs/locale/en";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

interface MovieCommentsProps {
  movieId: string;
  userId?: string;
  hasBooked: boolean;
  onCommentSubmit?: () => void;
}

const MovieComments: React.FC<MovieCommentsProps> = ({
  movieId,
  userId,
  hasBooked,
  onCommentSubmit,
}) => {
  const { user } = useAuthStore();
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Set dayjs locale based on language
  useEffect(() => {
    dayjs.locale(language);
  }, [language]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const list = await reviewService.getReviewsByMovie(movieId);

      // Sort từ mới đến cũ
      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReviews(sorted);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [movieId]);

  // Load user profile for avatar
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      try {
        const profile = await userProfileService.getProfileByUserId(userId);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };
    loadUserProfile();
  }, [userId]);

  const handleSubmit = async () => {
    console.log(
      "💬 [MovieComments] Submit attempt - hasBooked:",
      hasBooked,
      "userId:",
      userId
    );

    if (!userId) {
      return Swal.fire({
        icon: "warning",
        title: t("comment.loginRequired"),
        text: t("comment.loginRequiredDesc"),
        scrollbarPadding: false,
      });
    }
    if (!hasBooked) {
      console.log("❌ [MovieComments] Blocking comment - hasBooked is false");
      return Swal.fire({
        icon: "warning",
        title: t("comment.bookingRequired"),
        text: t("comment.bookingRequiredDesc"),
        scrollbarPadding: false,
      });
    }

    console.log("✅ [MovieComments] Allowing comment - hasBooked is true");
    if (comment.trim().length < 3) {
      return Swal.fire({
        icon: "warning",
        title: t("comment.tooShort"),
        text: t("comment.tooShortDesc"),
        scrollbarPadding: false,
      });
    }

    const payload: ReviewRequest = {
      movieId,
      userId: userId!,
      fullName: userProfile?.fullName || user?.username || "Anonymous",
      avatarUrl: userProfile?.avatarUrl || "",
      comment,
      // Rating đã tách riêng - chỉ gửi comment
    };

    console.log("💬 [MovieComments] Sending payload:", payload);

    setLoading(true);
    try {
      await reviewService.createReview(payload);
      setComment("");
      // Reload reviews from server to get correct timestamp
      await loadReviews();
      onCommentSubmit?.();
    } catch (error) {
      console.error("❌ [MovieComments] Error creating review:", error);
      console.error(
        "❌ [MovieComments] Error details:",
        (error as any).response?.data
      );
      Swal.fire({
        icon: "error",
        title: t("comment.error"),
        text: t("comment.errorDesc"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* REVIEW LIST - Ở trên với scroll */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent max-h-96">
        {loadingReviews ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.length === 0 && (
              <p className="text-white/60 text-center py-8">
                {t("comment.noComments")}
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
                    {rev.rating && rev.rating > 0 && (
                      <div className="flex items-center text-yellow-500 text-sm">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} className="fill-yellow-500" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-white/90 whitespace-pre-wrap">
                  {rev.comment}
                </p>

                <div className="text-white/50 text-sm mt-2">
                  {dayjs(rev.createdAt)
                    .tz("Asia/Ho_Chi_Minh")
                    .format("DD/MM/YYYY HH:mm")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMMENT FORM - Ở dưới cùng, cố định */}
      <div className="flex-shrink-0 rounded-xl border border-white/20">
        {/* Input với nút gửi bên trong */}
        <div className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              !userId
                ? t("comment.loginPlaceholder")
                : !hasBooked
                  ? t("comment.bookingPlaceholder")
                  : t("comment.placeholder")
            }
            disabled={!userId || !hasBooked}
            className={`w-full p-3 pr-24 rounded-lg bg-white/10 text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
              !userId || !hasBooked ? "opacity-50 cursor-not-allowed" : ""
            }`}
            rows={3}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !userId || !hasBooked}
            className="absolute bottom-3 right-3 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? t("comment.sending") : t("comment.send")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieComments;
