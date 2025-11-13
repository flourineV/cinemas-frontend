import dayjs from "dayjs";
import type { ProvinceResponse } from "@/types/showtime/province.type";
import type { TheaterResponse } from "@/types/showtime/theater.type";
import type { ShowtimeResponse } from "@/types/showtime/showtime.type";

export const MOCK_PROVINCES: ProvinceResponse[] = [
  { id: "p1", name: "TP. Hồ Chí Minh" },
  { id: "p2", name: "Hà Nội" },
  { id: "p3", name: "Đà Nẵng" },
];

export const MOCK_THEATERS: TheaterResponse[] = [
  {
    id: "t1",
    name: "CGV Vincom Đồng Khởi",
    address: "72 Lê Thánh Tôn, Quận 1, TP.HCM",
    description: "Rạp CGV sang trọng nằm tại trung tâm thành phố, trang bị phòng chiếu 4DX hiện đại.",
    provinceName: "TP. Hồ Chí Minh",
  },
  {
    id: "t2",
    name: "Lotte Cộng Hòa",
    address: "20 Cộng Hòa, Quận Tân Bình, TP.HCM",
    description: "Rạp nổi tiếng với màn hình lớn và âm thanh Dolby Atmos sống động.",
    provinceName: "TP. Hồ Chí Minh",
  },
  {
    id: "t3",
    name: "CGV Times City",
    address: "458 Minh Khai, Hai Bà Trưng, Hà Nội",
    description: "Rạp tọa lạc trong khu đô thị Times City, phục vụ cả phòng chiếu VIP và tiêu chuẩn.",
    provinceName: "Hà Nội",
  },
  {
    id: "t4",
    name: "Lotte Đà Nẵng",
    address: "6 Nại Nam, Hải Châu, Đà Nẵng",
    description: "Không gian rộng rãi, gần trung tâm Đà Nẵng, thích hợp cho nhóm bạn hoặc gia đình.",
    provinceName: "Đà Nẵng",
  },
];

export const MOCK_SHOWTIMES: ShowtimeResponse[] = [
  {
    id: "s1",
    movieId: "1",
    theaterName: "CGV Vincom Đồng Khởi",
    roomName: "Phòng 1",
    startTime: dayjs().hour(10).minute(30).toISOString(),
    endTime: dayjs().hour(12).minute(15).toISOString(),
    price: 85000,
  },
  {
    id: "s2",
    movieId: "1",
    theaterName: "CGV Vincom Đồng Khởi",
    roomName: "Phòng 2",
    startTime: dayjs().hour(14).minute(0).toISOString(),
    endTime: dayjs().hour(15).minute(45).toISOString(),
    price: 90000,
  },
  {
    id: "s3",
    movieId: "1",
    theaterName: "Lotte Cộng Hòa",
    roomName: "Phòng 3",
    startTime: dayjs().hour(17).minute(30).toISOString(),
    endTime: dayjs().hour(19).minute(15).toISOString(),
    price: 95000,
  },
  {
    id: "s4",
    movieId: "1",
    theaterName: "CGV Times City",
    roomName: "Phòng 1",
    startTime: dayjs().add(1, "day").hour(9).minute(0).toISOString(),
    endTime: dayjs().add(1, "day").hour(10).minute(45).toISOString(),
    price: 80000,
  },
  {
    id: "s5",
    movieId: "1",
    theaterName: "Lotte Đà Nẵng",
    roomName: "Phòng 2",
    startTime: dayjs().add(4, "day").hour(18).minute(0).toISOString(),
    endTime: dayjs().add(4, "day").hour(20).minute(0).toISOString(),
    price: 88000,
  },
];
