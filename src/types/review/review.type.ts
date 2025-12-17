// src/services/review/review.type.ts

export interface ReviewRequest {
  movieId: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  comment: string;
  // Rating đã tách riêng - không cần trong ReviewRequest
}

export interface ReviewResponse {
  id: string;
  movieId: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  status: string;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RatingRequest {
  userId?: string; // Will be set by backend
  rating: number;
}

export interface RatingResponse {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface AverageRatingResponse {
  averageRating: number;
  ratingCount: number;
}
