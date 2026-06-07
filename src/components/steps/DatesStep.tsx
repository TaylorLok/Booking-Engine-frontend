'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useBookingStore } from '@/store/bookingStore'

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return formatLocalDate(date)
}

const datesSchema = z
  .object({
    checkIn: z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
  })
  .superRefine((data, ctx) => {
    const today = formatLocalDate(new Date())

    if (data.checkIn < today) {
      ctx.addIssue({
        code: 'custom',
        message: 'Check-in must be today or later',
        path: ['checkIn'],
      })
    }

    if (data.checkOut <= data.checkIn) {
      ctx.addIssue({
        code: 'custom',
        message: 'Check-out must be after check-in',
        path: ['checkOut'],
      })
    }
  })

type DatesFormValues = {
  checkIn: string
  checkOut: string
}

export function DatesStep() {
  const storedCheckIn = useBookingStore((state) => state.checkIn)
  const storedCheckOut = useBookingStore((state) => state.checkOut)
  const setDates = useBookingStore((state) => state.setDates)
  const nextStep = useBookingStore((state) => state.nextStep)

  const today = formatLocalDate(new Date())

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DatesFormValues>({
    resolver: zodResolver(datesSchema),
    defaultValues: {
      checkIn: storedCheckIn ?? '',
      checkOut: storedCheckOut ?? '',
    },
  })

  const checkInValue = watch('checkIn')
  const minCheckOut = checkInValue
    ? addDaysToDateString(checkInValue, 1)
    : addDaysToDateString(today, 1)

  function onSubmit(values: DatesFormValues) {
    setDates(values.checkIn, values.checkOut)
    nextStep()
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Select your dates</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Choose your check-in and check-out dates to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="check-in" className="text-sm font-medium">
              Check in
            </label>
            <input
              id="check-in"
              type="date"
              min={today}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              {...register('checkIn')}
            />
            {errors.checkIn && (
              <p className="text-sm text-red-600">{errors.checkIn.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="check-out" className="text-sm font-medium">
              Check out
            </label>
            <input
              id="check-out"
              type="date"
              min={minCheckOut}
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              {...register('checkOut')}
            />
            {errors.checkOut && (
              <p className="text-sm text-red-600">{errors.checkOut.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Continue
        </button>
      </form>
    </section>
  )
}
