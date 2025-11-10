export interface TheaterRequest {
  provinceId: string;
  name: string;
  address: string;
  description: string;
}

export interface TheaterResponse {
  id: string;
  name: string;
  address: string;
  description: string;
  provinceName: string;
}
