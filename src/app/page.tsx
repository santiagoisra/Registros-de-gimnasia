import { Suspense } from 'react'
import Dashboard from '@/components/Dashboard'
import Loading from '@/components/Loading'

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Dashboard
      </h1>
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </div>
  )
} 