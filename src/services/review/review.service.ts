// src/services/review/review.service.ts
import { reviewClient } from "../apiClient";
import type { ReviewRequest, ReviewResponse } from "@/types/review/review.type";

export const reviewService = {
  // CREATE
  createReview: async (data: ReviewRequest): Promise<ReviewResponse> => {
    const res = await reviewClient.post<ReviewResponse>("", data);
    return res.data;
  },

  // UPDATE
  updateReview: async (
    id: string,
    data: ReviewRequest
  ): Promise<ReviewResponse> => {
    const res = await reviewClient.put<ReviewResponse>(`/${id}`, data);
    return res.data;
  },

  // DELETE
  deleteReview: async (id: string): Promise<void> => {
    await reviewClient.delete(`/${id}`);
  },

  // GET ALL REVIEWS OF MOVIE
  getReviewsByMovie: async (movieId: string): Promise<ReviewResponse[]> => {
    const res = await reviewClient.get<ReviewResponse[]>(
      `/movie/${movieId}`
    );
    return res.data;
  },

  // AVG RATING
  getAverageRating: async (movieId: string): Promise<number> => {
    const res = await reviewClient.get<number>(
      `/movie/${movieId}/average-rating`
    );
    return res.data;
  },

  // REPORT REVIEW
  reportReview: async (id: string): Promise<ReviewResponse> => {
    const res = await reviewClient.post<ReviewResponse>(`/${id}/report`);
    return res.data;
  },

  // HIDE REVIEW
  hideReview: async (id: string): Promise<ReviewResponse> => {
    const res = await reviewClient.post<ReviewResponse>(`/${id}/hide`);
    return res.data;
  },
};
