import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import Sidebar from '@/components/Sidebar'
import { logError } from '@/lib/logger'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Registros de Gimnasia',
  description: 'Sistema de gestión para entrenamiento funcional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Manejo global de errores a nivel layout (solo client-side)
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logError('Global error', event.error)
    })
    window.addEventListener('unhandledrejection', (event) => {
      logError('Unhandled promise rejection', event.reason)
    })
  }

  return (
    <html lang="es">
      <body className={inter.className}>
        <ClientProviders>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  )
} 