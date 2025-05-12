"use client"
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // TODO: Integrar Sentry.captureException(error)
    // console.error(error)
  }, [error])

  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Ocurrió un error inesperado</h2>
        <p className="text-red-600 mb-2">{error.message}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => reset()}
        >
          Reintentar
        </button>
      </body>
    </html>
  )
} 