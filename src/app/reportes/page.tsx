import { Suspense } from 'react'
import ReporteGeneral from '@/components/reportes/ReporteGeneral'
import ReporteAlumnos from '@/components/reportes/ReporteAlumnos'
import ReportePagos from '@/components/reportes/ReportePagos'
import Loading from '@/components/Loading'

export default function ReportesPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">
        Reportes y Estadísticas
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Suspense fallback={<Loading />}>
          <ReporteGeneral />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <ReporteAlumnos />
        </Suspense>

        <Suspense fallback={<Loading />}>
          <ReportePagos />
        </Suspense>
      </div>
    </div>
  )
} 