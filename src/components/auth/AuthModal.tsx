'use client'

import { useEffect, useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useBookingStore } from '@/store/bookingStore'

type AuthTab = 'login' | 'register'

export function AuthModal() {
  const authModalOpen = useBookingStore((state) => state.authModalOpen)
  const closeAuthModal = useBookingStore((state) => state.closeAuthModal)
  const [activeTab, setActiveTab] = useState<AuthTab>('login')

  useEffect(() => {
    if (authModalOpen) {
      setActiveTab('login')
    }
  }, [authModalOpen])

  useEffect(() => {
    if (!authModalOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAuthModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [authModalOpen, closeAuthModal])

  if (!authModalOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeAuthModal}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-modal-title" className="text-lg font-semibold text-zinc-900">
              {activeTab === 'login' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {activeTab === 'login'
                ? 'Sign in to continue your booking.'
                : 'Register to continue your booking.'}
            </p>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close"
            className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="mb-6 flex rounded-md bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'register'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  )
}
