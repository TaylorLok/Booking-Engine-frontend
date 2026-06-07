'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { getBooking } from '@/lib/api'
import { useBookingStatus } from '@/hooks/useBookingStatus'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(year, month - 1, day))
}

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm text-zinc-600">Confirming your booking…</p>
    </div>
  )
}

function ConfirmationContent({ reference }: { reference: string }) {
  const { data: statusData, isLoading: isStatusLoading } = useBookingStatus(
    reference,
    Boolean(reference),
  )

  const isConfirmed = statusData?.status === 'confirmed'

  const { data: booking, isLoading: isBookingLoading } = useQuery({
    queryKey: ['booking', reference],
    queryFn: () => getBooking(reference),
    enabled: isConfirmed,
  })

  if (!reference) {
    return (
      <p className="text-sm text-red-600">Invalid booking reference.</p>
    )
  }

  if (isStatusLoading && !statusData) {
    return <Spinner />
  }

  if (!statusData || statusData.status === 'pending') {
    return <Spinner />
  }

  if (statusData.status === 'failed') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-900">Booking failed</h1>
        <p className="mt-2 text-sm text-red-800">
          {statusData.failure_reason ??
            'Your booking could not be confirmed. Please try again.'}
        </p>
        <p className="mt-4 text-sm text-red-700">
          Reference: <span className="font-medium">{reference}</span>
        </p>
      </div>
    )
  }

  if (statusData.status === 'cancelled') {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h1 className="text-lg font-semibold text-zinc-900">Booking cancelled</h1>
        <p className="mt-2 text-sm text-zinc-600">
          This booking was cancelled.
        </p>
        <p className="mt-4 text-sm text-zinc-600">
          Reference: <span className="font-medium">{reference}</span>
        </p>
      </div>
    )
  }

  if (statusData.status === 'confirmed') {
    if (isBookingLoading || !booking) {
      return <Spinner />
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h1 className="text-lg font-semibold text-green-900">
            Booking confirmed
          </h1>
          <p className="mt-2 text-sm text-green-800">
            Your reservation has been successfully confirmed.
          </p>
          <p className="mt-4 text-sm text-green-800">
            Reference:{' '}
            <span className="font-medium">{booking.reference}</span>
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-zinc-600">Check in</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {formatDate(booking.check_in)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600">Check out</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {formatDate(booking.check_out)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600">Guests</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {booking.guests}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-600">Total</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {formatPrice(booking.total_cents)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Rooms</h2>
          </div>
          <ul className="divide-y divide-zinc-200">
            {booking.rooms.map((room) => (
              <li
                key={room.id}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{room.name}</p>
                  <p className="text-sm text-zinc-600">
                    {room.adults} adult{room.adults === 1 ? '' : 's'},{' '}
                    {room.children} child{room.children === 1 ? '' : 'ren'}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {formatPrice(room.price_per_night_cents)} per night
                  </p>
                </div>
                <p className="text-sm font-medium text-zinc-900">
                  {formatPrice(room.line_total_cents)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <p className="text-sm text-zinc-600">
      Unknown booking status: {statusData.status}
    </p>
  )
}

export default function ConfirmationPage() {
  const params = useParams<{ reference: string }>()
  const reference = params.reference

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
      <ConfirmationContent reference={reference} />
    </main>
  )
}
