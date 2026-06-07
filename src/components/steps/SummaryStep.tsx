'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createBooking } from '@/lib/api'
import { useBookingStore } from '@/store/bookingStore'

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

function calculateNights(checkIn: string, checkOut: string): number {
  const [inYear, inMonth, inDay] = checkIn.split('-').map(Number)
  const [outYear, outMonth, outDay] = checkOut.split('-').map(Number)
  const start = new Date(inYear, inMonth - 1, inDay)
  const end = new Date(outYear, outMonth - 1, outDay)
  const diffMs = end.getTime() - start.getTime()
  return diffMs / (1000 * 60 * 60 * 24)
}

export function SummaryStep() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const checkIn = useBookingStore((state) => state.checkIn)
  const checkOut = useBookingStore((state) => state.checkOut)
  const selectedRooms = useBookingStore((state) => state.selectedRooms)
  const guests = useBookingStore((state) => state.guests)
  const idempotencyKey = useBookingStore((state) => state.idempotencyKey)
  const isAuthenticated = useBookingStore((state) => state.isAuthenticated)
  const generateIdempotencyKey = useBookingStore(
    (state) => state.generateIdempotencyKey,
  )
  const openAuthModal = useBookingStore((state) => state.openAuthModal)

  const nights =
    checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0

  const roomLines = selectedRooms.map((room) => ({
    ...room,
    lineTotalCents: room.price_per_night_cents * nights,
  }))

  const subtotalCents = roomLines.reduce(
    (sum, room) => sum + room.lineTotalCents,
    0,
  )
  const totalCents = subtotalCents

  async function handleConfirmBooking() {
    if (!checkIn || !checkOut || selectedRooms.length === 0) {
      setSubmitError('Please complete your booking details before confirming.')
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      if (!idempotencyKey) {
        generateIdempotencyKey()
      }

      const key = useBookingStore.getState().idempotencyKey

      if (!key) {
        throw new Error('Unable to generate idempotency key')
      }

      const booking = await createBooking({
        check_in: checkIn,
        check_out: checkOut,
        guests,
        rooms: selectedRooms.map((room) => ({
          id: room.id,
          adults: room.adults,
          children: room.children,
        })),
        idempotency_key: key,
      })

      router.push(`/booking/confirmation/${booking.reference}`)
    } catch {
      setSubmitError('Unable to confirm booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Booking summary</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Review your stay details before confirming.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-zinc-600">Check in</dt>
            <dd className="text-sm font-medium text-zinc-900">
              {checkIn ? formatDate(checkIn) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-600">Check out</dt>
            <dd className="text-sm font-medium text-zinc-900">
              {checkOut ? formatDate(checkOut) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-600">Nights</dt>
            <dd className="text-sm font-medium text-zinc-900">{nights}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-600">Guests</dt>
            <dd className="text-sm font-medium text-zinc-900">{guests}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-zinc-900">Selected rooms</h3>
        </div>

        {selectedRooms.length === 0 ? (
          <p className="px-4 py-3 text-sm text-zinc-600">No rooms selected.</p>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {roomLines.map((room) => (
              <li
                key={room.id}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{room.name}</p>
                  <p className="text-sm text-zinc-600">
                    {formatPrice(room.price_per_night_cents)} × {nights} night
                    {nights === 1 ? '' : 's'}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {room.adults} adult{room.adults === 1 ? '' : 's'},{' '}
                    {room.children} child{room.children === 1 ? '' : 'ren'}
                  </p>
                </div>
                <p className="text-sm font-medium text-zinc-900">
                  {formatPrice(room.lineTotalCents)}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="space-y-2 border-t border-zinc-200 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">Subtotal</span>
            <span className="font-medium text-zinc-900">
              {formatPrice(subtotalCents)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-900">Total</span>
            <span className="font-semibold text-zinc-900">
              {formatPrice(totalCents)}
            </span>
          </div>
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-600">{submitError}</p>
      )}

      {isAuthenticated ? (
        <button
          type="button"
          onClick={handleConfirmBooking}
          disabled={isSubmitting}
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Confirming…' : 'Confirm Booking'}
        </button>
      ) : (
        <button
          type="button"
          onClick={openAuthModal}
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Login or Register to confirm
        </button>
      )}
    </section>
  )
}
