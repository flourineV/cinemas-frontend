import type {
  MovieShowtimeResponse,
  ShowtimeResponse,
} from "@/types/showtime/showtime.type";

export const mockShowtimeData: MovieShowtimeResponse = {
  availableDates: ["2025-11-16", "2025-11-17"],

  showtimesByDate: {
    "2025-11-16": [
      {
        id: "st001",
        movieId: "movie123",
        theaterName: "CGV Vincom Landmark 81",
        roomId: "room1",
        roomName: "Phòng chiếu 2D Số 1",
        startTime: "2025-11-16T14:30:00",
        endTime: "2025-11-16T16:30:00",
      },
      {
        id: "st002",
        movieId: "movie123",
        theaterName: "CGV Vincom Landmark 81",
        roomId: "room1",
        roomName: "Phòng chiếu 2D Số 1",
        startTime: "2025-11-16T18:00:00",
        endTime: "2025-11-16T20:00:00",
      },
      {
        id: "st003",
        movieId: "movie123",
        theaterName: "Galaxy Nguyễn Du",
        roomId: "room3",
        roomName: "Phòng chiếu 4K Số 3",
        startTime: "2025-11-16T15:00:00",
        endTime: "2025-11-16T17:10:00",
      },
    ],

    "2025-11-17": [
      {
        id: "st004",
        movieId: "movie123",
        theaterName: "CGV Vincom Landmark 81",
        roomId: "room1",
        roomName: "Phòng chiếu 2D Số 1",
        startTime: "2025-11-17T13:00:00",
        endTime: "2025-11-17T15:00:00",
      },
      {
        id: "st005",
        movieId: "movie123",
        theaterName: "Galaxy Nguyễn Du",
        roomId: "room3",
        roomName: "Phòng chiếu 4K Số 3",
        startTime: "2025-11-17T20:00:00",
        endTime: "2025-11-17T22:00:00",
      },
    ],
  },
};
