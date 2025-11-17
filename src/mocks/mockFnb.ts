import type { FnbItemResponse } from "@/types/fnb/fnb.type";

export const mockFnbData: FnbItemResponse[] = [
  {
    id: "c1",
    name: "Combo 1: Bắp + Nước",
    description: "1 bắp rang + 1 nước ngọt",
    unitPrice: 50000,
    image: "https://xuongin.com/assets/images/popcorn-bag/hop-dung-bap-rang-bo-cgv.jpg",
  },
  {
    id: "c2",
    name: "Combo 2: Bắp + 2 Nước",
    description: "1 bắp rang + 2 nước",
    unitPrice: 90000,
    image: "https://cellphones.com.vn/sforum/wp-content/uploads/2023/07/gia-bap-nuoc-cgv-1.jpg",
  },
  {
    id: "c3",
    name: "Combo 3: Bắp Lớn + Nước",
    description: "Bắp size lớn + nước ngọt",
    unitPrice: 65000,
    image: "https://cf.shopee.vn/file/90d5a2a65c0d94272bb6755d3bd65b27",
  },
];
