// src/services/review/review.type.ts

export interface ReviewRequest {
  movieId: string;
  userId: string;
  rating: number;
  comment: string;
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
