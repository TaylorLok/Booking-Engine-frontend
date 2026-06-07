'use client'

import { useQuery } from '@tanstack/react-query'
import { getProperty } from '@/lib/api'
import type { PropertyRoom } from '@/lib/api'
import { useBookingStore } from '@/store/bookingStore'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function RoomsStep() {
  const selectedRooms = useBookingStore((state) => state.selectedRooms)
  const guests = useBookingStore((state) => state.guests)
  const addRoom = useBookingStore((state) => state.addRoom)
  const removeRoom = useBookingStore((state) => state.removeRoom)
  const setGuests = useBookingStore((state) => state.setGuests)
  const nextStep = useBookingStore((state) => state.nextStep)

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property'],
    queryFn: getProperty,
  })

  function isRoomSelected(roomId: string): boolean {
    return selectedRooms.some((room) => room.id === roomId)
  }

  function handleAddRoom(room: PropertyRoom) {
    addRoom({
      id: room.id,
      slug: room.slug,
      name: room.name,
      price_per_night_cents: room.price_per_night_cents,
      adults: 1,
      children: 0,
    })
  }

  function handleGuestsChange(value: number) {
    if (value >= 1) {
      setGuests(value)
    }
  }

  if (isLoading) {
    return (
      <section className="flex flex-col gap-6">
        <p className="text-sm text-zinc-600">Loading rooms…</p>
      </section>
    )
  }

  if (error || !property) {
    return (
      <section className="flex flex-col gap-6">
        <p className="text-sm text-red-600">Unable to load rooms. Please try again.</p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Choose your rooms</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Select one or more rooms for your stay at {property.name}.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
        <label htmlFor="guests" className="text-sm font-medium text-zinc-900">
          Guests
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleGuestsChange(guests - 1)}
            disabled={guests <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Decrease guests"
          >
            −
          </button>
          <span id="guests" className="min-w-6 text-center text-sm font-medium">
            {guests}
          </span>
          <button
            type="button"
            onClick={() => handleGuestsChange(guests + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
            aria-label="Increase guests"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {property.rooms.map((room) => {
          const selected = isRoomSelected(room.id)

          return (
            <article
              key={room.id}
              className={`flex flex-col rounded-lg border p-4 transition-colors ${
                selected
                  ? 'border-zinc-900 bg-zinc-50'
                  : 'border-zinc-200 bg-white'
              }`}
            >
              <div className="flex flex-1 flex-col gap-2">
                <h3 className="font-semibold text-zinc-900">{room.name}</h3>
                <p className="text-sm text-zinc-600">{room.type}</p>
                <p className="text-sm font-medium text-zinc-900">
                  {formatPrice(room.price_per_night_cents)} per night
                </p>
                <p className="text-sm text-zinc-600">
                  Max {room.max_adults} adult{room.max_adults === 1 ? '' : 's'},{' '}
                  {room.max_children} child
                  {room.max_children === 1 ? '' : 'ren'}
                </p>
              </div>

              <div className="mt-4">
                {selected ? (
                  <button
                    type="button"
                    onClick={() => removeRoom(room.id)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
                  >
                    Remove room
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddRoom(room)}
                    className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    Add room
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <button
        type="button"
        onClick={nextStep}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        Continue
      </button>
    </section>
  )
}
