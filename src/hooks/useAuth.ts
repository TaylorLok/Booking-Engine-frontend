'use client'

import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useEffect } from 'react'
import { getMe } from '@/lib/api'
import { useBookingStore } from '@/store/bookingStore'

const FIVE_MINUTES_MS = 5 * 60 * 1000

export function useAuth() {
  const setUser = useBookingStore((state) => state.setUser)
  const logout = useBookingStore((state) => state.logout)

  const query = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: FIVE_MINUTES_MS,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  useEffect(() => {
    if (
      query.error &&
      isAxiosError(query.error) &&
      query.error.response?.status === 401
    ) {
      logout()
    }
  }, [query.error, logout])

  return query
}
