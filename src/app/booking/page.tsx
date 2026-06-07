'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { DatesStep } from '@/components/steps/DatesStep'
import { RoomsStep } from '@/components/steps/RoomsStep'
import { SummaryStep } from '@/components/steps/SummaryStep'
import { useBookingStore, type BookingStep } from '@/store/bookingStore'

const BOOKING_STEPS = [
  { number: 1 as BookingStep, label: 'Dates' },
  { number: 2 as BookingStep, label: 'Rooms' },
  { number: 3 as BookingStep, label: 'Summary' },
]

function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  return (
    <nav aria-label="Booking progress" className="mb-8">
      <ol className="grid grid-cols-3 gap-4">
        {BOOKING_STEPS.map((step) => {
          const isActive = currentStep === step.number
          const isComplete = currentStep > step.number

          return (
            <li key={step.number} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : isComplete
                      ? 'bg-zinc-200 text-zinc-900'
                      : 'border border-zinc-300 bg-white text-zinc-500'
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-zinc-900' : 'text-zinc-500'
                }`}
              >
                {step.label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function BookingContent() {
  const step = useBookingStore((state) => state.step)

  function renderStep() {
    switch (step) {
      case 1:
        return <DatesStep />
      case 2:
        return <RoomsStep />
      case 3:
        return <SummaryStep />
      default:
        return <SummaryStep />
    }
  }

  const indicatorStep = step <= 3 ? step : 3

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <StepIndicator currentStep={indicatorStep} />
      {renderStep()}
    </main>
  )
}

export default function BookingPage() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <BookingContent />
    </QueryClientProvider>
  )
}
