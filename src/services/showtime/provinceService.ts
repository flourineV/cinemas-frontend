import { showtimeClient } from "../apiClient";
import type {
  ProvinceRequest,
  ProvinceResponse,
} from "@/types/showtime/province.type";

export const provinceService = {
  createProvince: async (data: ProvinceRequest): Promise<ProvinceResponse> => {
    const res = await showtimeClient.post<ProvinceResponse>("/provinces", data);
    return res.data;
  },

  getProvinceById: async (id: string): Promise<ProvinceResponse> => {
    const res = await showtimeClient.get<ProvinceResponse>(`/provinces/${id}`);
    return res.data;
  },

  getAllProvinces: async (): Promise<ProvinceResponse[]> => {
    const res = await showtimeClient.get<ProvinceResponse[]>("/provinces");
    return res.data;
  },

  updateProvince: async (
    id: string,
    data: ProvinceRequest
  ): Promise<ProvinceResponse> => {
    const res = await showtimeClient.put<ProvinceResponse>(
      `/provinces/${id}`,
      data
    );
    return res.data;
  },

  deleteProvince: async (id: string): Promise<void> => {
    await showtimeClient.delete(`/provinces/${id}`);
  },
};
