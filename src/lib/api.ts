import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { User } from "@/store/bookingStore";

export type PropertyRoom = {
  id: number;
  slug: string;
  name: string;
  room_type_slug: string;
  price_per_night_cents: number;
  max_adults: number;
  max_children: number;
};

export type Property = {
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  rooms: PropertyRoom[];
};

export type RegisterData = {
  firstname: string;
  surname: string;
  email: string;
  cellphone: string;
  password: string;
  password_confirmation: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type CreateBookingData = {
  idempotency_key: string;
  check_in: string;
  check_out: string;
  adults: number;
  children?: number;
  rooms: { room_id: number; adults: number; children?: number }[];
  special_requests?: string | null;
};

export type BookingRoom = {
  room_id: number;
  slug: string;
  name: string;
  adults: number;
  children: number;
  price_per_night_cents: number;
  nights_count: number;
  line_total_cents: number;
};

export type Booking = {
  reference: string;
  status: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  subtotal_cents: number;
  taxes_cents: number;
  total_cents: number;
  special_requests: string | null;
  failure_reason: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  rooms: BookingRoom[];
};

export type BookingStatus = {
  reference: string;
  status: string;
  failure_reason: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getXsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  if (!match) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

function applyXsrfToken(config: InternalAxiosRequestConfig): void {
  const token = getXsrfToken();
  if (token) {
    config.headers.set("X-XSRF-TOKEN", token);
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  applyXsrfToken(config);
  return config;
});

async function ensureCsrfCookie(): Promise<void> {
  await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  });
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 419 && config && !config._retry) {
      config._retry = true;
      await ensureCsrfCookie();
      applyXsrfToken(config);
      return api(config);
    }

    return Promise.reject(error);
  },
);

export async function getProperty(): Promise<Property> {
  const { data } = await api.get<Property>("/api/v1/property");
  return data;
}

export async function register(payload: RegisterData): Promise<User> {
  await ensureCsrfCookie();
  const { data } = await api.post<{ user: User }>("/api/v1/register", payload);
  return data.user;
}

export async function login(payload: LoginData): Promise<User> {
  await ensureCsrfCookie();
  const { data } = await api.post<{ user: User }>("/api/v1/login", payload);
  return data.user;
}

export async function logout(): Promise<void> {
  await ensureCsrfCookie();
  await api.post("/api/v1/logout");
}

export async function getMe(): Promise<User | null> {
  try {
    const { data } = await api.get<{ user: User }>("/api/v1/me");
    return data.user;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function createBooking(
  payload: CreateBookingData,
): Promise<Booking> {
  await ensureCsrfCookie();
  const { data } = await api.post<Booking>("/api/v1/bookings", payload);
  return data;
}

export async function getBooking(reference: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/api/v1/bookings/${reference}`);
  return data;
}

export async function getBookingStatus(
  reference: string,
): Promise<BookingStatus> {
  const { data } = await api.get<BookingStatus>(
    `/api/v1/bookings/${reference}/status`,
  );
  return data;
}
