import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { User } from '@/store/bookingStore'

export type PropertyRoom = {
  id: string
  slug: string
  name: string
  type: string
  price_per_night_cents: number
  max_adults: number
  max_children: number
}

export type Property = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  timezone: string
  rooms: PropertyRoom[]
}

export type RegisterData = {
  firstname: string
  surname: string
  email: string
  cellphone: string
  password: string
  password_confirmation: string
}

export type LoginData = {
  email: string
  password: string
}

export type CreateBookingRoom = {
  id: string
  adults: number
  children: number
}

export type CreateBookingData = {
  check_in: string
  check_out: string
  guests: number
  rooms: CreateBookingRoom[]
  idempotency_key: string
}

export type BookingRoom = {
  id: string
  name: string
  adults: number
  children: number
  price_per_night_cents: number
  line_total_cents: number
}

export type Booking = {
  reference: string
  status: string
  check_in: string
  check_out: string
  guests: number
  total_cents: number
  created_at: string
  rooms: BookingRoom[]
}

export type BookingStatus = {
  reference: string
  status: string
  failure_reason: string | null
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined

    if (error.response?.status === 419 && config && !config._retry) {
      config._retry = true
      await api.get('/sanctum/csrf-cookie')
      return api(config)
    }

    return Promise.reject(error)
  },
)

export async function getProperty(): Promise<Property> {
  const { data } = await api.get<Property>('/api/property')
  return data
}

export async function register(payload: RegisterData): Promise<User> {
  const { data } = await api.post<{ user: User }>('/api/register', payload)
  return data.user
}

export async function login(payload: LoginData): Promise<User> {
  const { data } = await api.post<{ user: User }>('/api/login', payload)
  return data.user
}

export async function logout(): Promise<void> {
  await api.post('/api/logout')
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/api/me')
  return data.user
}

export async function createBooking(payload: CreateBookingData): Promise<Booking> {
  const { data } = await api.post<Booking>('/api/bookings', payload)
  return data
}

export async function getBooking(reference: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/api/bookings/${reference}`)
  return data
}

export async function getBookingStatus(reference: string): Promise<BookingStatus> {
  const { data } = await api.get<BookingStatus>(
    `/api/bookings/${reference}/status`,
  )
  return data
}
