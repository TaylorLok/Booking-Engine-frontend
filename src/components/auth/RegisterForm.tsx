'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { register as registerUser } from '@/lib/api'
import { useBookingStore } from '@/store/bookingStore'

const registerSchema = z
  .object({
    firstname: z.string().min(1, 'First name is required'),
    surname: z.string().min(1, 'Surname is required'),
    cellphone: z.string().min(1, 'Cellphone is required'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

const registerFields = new Set<keyof RegisterFormValues>([
  'firstname',
  'surname',
  'cellphone',
  'email',
  'password',
  'password_confirmation',
])

export function RegisterForm() {
  const setUser = useBookingStore((state) => state.setUser)
  const closeAuthModal = useBookingStore((state) => state.closeAuthModal)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: '',
      surname: '',
      cellphone: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setSubmitError(null)

    try {
      const user = await registerUser(values)
      setUser(user)
      closeAuthModal()
    } catch (error) {
      if (isAxiosError(error)) {
        const apiErrors = error.response?.data?.errors as
          | Record<string, string[]>
          | undefined

        if (apiErrors) {
          for (const [field, messages] of Object.entries(apiErrors)) {
            if (registerFields.has(field as keyof RegisterFormValues)) {
              setError(field as keyof RegisterFormValues, {
                message: messages[0],
              })
            }
          }
          return
        }

        const message = error.response?.data?.message as string | undefined
        if (message) {
          setSubmitError(message)
          return
        }
      }

      setSubmitError('Unable to create account. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="register-firstname" className="text-sm font-medium">
            First name
          </label>
          <input
            id="register-firstname"
            type="text"
            autoComplete="given-name"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            {...register('firstname')}
          />
          {errors.firstname && (
            <p className="text-sm text-red-600">{errors.firstname.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="register-surname" className="text-sm font-medium">
            Surname
          </label>
          <input
            id="register-surname"
            type="text"
            autoComplete="family-name"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            {...register('surname')}
          />
          {errors.surname && (
            <p className="text-sm text-red-600">{errors.surname.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-cellphone" className="text-sm font-medium">
          Cellphone
        </label>
        <input
          id="register-cellphone"
          type="tel"
          autoComplete="tel"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          {...register('cellphone')}
        />
        {errors.cellphone && (
          <p className="text-sm text-red-600">{errors.cellphone.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-password-confirmation"
          className="text-sm font-medium"
        >
          Confirm password
        </label>
        <input
          id="register-password-confirmation"
          type="password"
          autoComplete="new-password"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
          {...register('password_confirmation')}
        />
        {errors.password_confirmation && (
          <p className="text-sm text-red-600">
            {errors.password_confirmation.message}
          </p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-red-600">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
