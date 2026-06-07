'use client'

import { useQuery } from '@tanstack/react-query'
import { getBookingStatus } from '@/lib/api'

export function useBookingStatus(reference: string, enabled: boolean) {
  return useQuery({
    queryKey: ['booking-status', reference],
    queryFn: () => getBookingStatus(reference),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? 2000 : false,
  })
}
