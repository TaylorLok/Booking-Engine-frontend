import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type BookingStep = 1 | 2 | 3 | 4 | 5

export type SelectedRoom = {
  id: string
  slug: string
  name: string
  price_per_night_cents: number
  adults: number
  children: number
}

export type User = {
  id: string
  firstname: string
  surname: string
  email: string
  cellphone: string
}

type BookingSlice = {
  step: BookingStep
  checkIn: string | null
  checkOut: string | null
  selectedRooms: SelectedRoom[]
  guests: number
  idempotencyKey: string | null
}

type AuthSlice = {
  user: User | null
  isAuthenticated: boolean
  authModalOpen: boolean
}

type BookingActions = {
  setDates: (checkIn: string | null, checkOut: string | null) => void
  setStep: (step: BookingStep) => void
  nextStep: () => void
  prevStep: () => void
  addRoom: (room: SelectedRoom) => void
  removeRoom: (id: string) => void
  setGuests: (guests: number) => void
  generateIdempotencyKey: () => void
  resetBooking: () => void
}

type AuthActions = {
  setUser: (user: User) => void
  logout: () => void
  openAuthModal: () => void
  closeAuthModal: () => void
}

type BookingStore = BookingSlice & AuthSlice & BookingActions & AuthActions

const initialBookingState: BookingSlice = {
  step: 1,
  checkIn: null,
  checkOut: null,
  selectedRooms: [],
  guests: 1,
  idempotencyKey: null,
}

const initialAuthState: AuthSlice = {
  user: null,
  isAuthenticated: false,
  authModalOpen: false,
}

const sessionStorageAdapter = createJSONStorage<BookingSlice>(() => {
  if (typeof window !== 'undefined') {
    return sessionStorage
  }

  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
})

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      ...initialBookingState,
      ...initialAuthState,

      setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),

      setStep: (step) => set({ step }),

      nextStep: () => {
        const { step } = get()
        if (step < 5) {
          set({ step: (step + 1) as BookingStep })
        }
      },

      prevStep: () => {
        const { step } = get()
        if (step > 1) {
          set({ step: (step - 1) as BookingStep })
        }
      },

      addRoom: (room) =>
        set((state) => ({
          selectedRooms: [...state.selectedRooms, room],
        })),

      removeRoom: (id) =>
        set((state) => ({
          selectedRooms: state.selectedRooms.filter((room) => room.id !== id),
        })),

      setGuests: (guests) => set({ guests }),

      generateIdempotencyKey: () =>
        set({ idempotencyKey: crypto.randomUUID() }),

      resetBooking: () => set(initialBookingState),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          authModalOpen: false,
        }),

      logout: () => set(initialAuthState),

      openAuthModal: () => set({ authModalOpen: true }),

      closeAuthModal: () => set({ authModalOpen: false }),
    }),
    {
      name: 'booking-store',
      storage: sessionStorageAdapter,
      partialize: (state) => ({
        step: state.step,
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        selectedRooms: state.selectedRooms,
        guests: state.guests,
        idempotencyKey: state.idempotencyKey,
      }),
    },
  ),
)
