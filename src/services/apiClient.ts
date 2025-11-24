import axios from "axios";
import type { AxiosInstance } from "axios";
import { applyInterceptors } from "./apiInterceptor";

const baseURL = import.meta.env.VITE_GATEWAY_URL as string;

export const apiClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  })
);

export const authClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL: `${baseURL}/auth`,
    headers: { "Content-Type": "application/json" },
  })
);

export const profileClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL: `${baseURL}/profiles`,
    headers: { "Content-Type": "application/json" },
  })
);

export const movieClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL: `${baseURL}/movies`,
    headers: { "Content-Type": "application/json" },
  })
);

export const showtimeClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL: `${baseURL}/showtimes`,
    headers: { "Content-Type": "application/json" },
  })
);

export const bookingClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL: `${baseURL}/bookings`,
    headers: { "Content-Type": "application/json" },
  })
);

export const fnbClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL: `${baseURL}/fnb`,
    headers: { "Content-Type": "application/json" },
  })
);

export const pricingClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL: `${baseURL}/pricing`,
    headers: { "Content-Type": "application/json" },
  })
);

export const promotionClient: AxiosInstance = applyInterceptors(
  axios.create({
    baseURL: `${baseURL}/promotions`,
    headers: { "Content-Type": "application/json" },
  })
);
