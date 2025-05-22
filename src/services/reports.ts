import { getPagosPorFiltros } from './pagos'
import { asistenciasService } from './asistencias'
import { alumnosService } from './alumnos'
import type { Pago } from '@/types'

export async function getDashboardMetrics({ mes, anio }: { mes: number; anio: number }) {
  // Calcular fechas de inicio y fin del mes
  const fechaInicio = `${anio}-${String(mes).padStart(2, '0')}-01`
  const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0]

  // Alumnos activos
  const { data: alumnos } = await alumnosService.getAlumnos({})
  const alumnosActivos = alumnos.filter(a => a.activo).length

  // Asistencias del mes
  const { data: asistencias } = await asistenciasService.getAsistencias({ fecha: undefined })
  const asistenciasMes = asistencias.filter(a => a.fecha >= fechaInicio && a.fecha <= fechaFin).length

  // Ingresos del mes
  const pagos = await getPagosPorFiltros({ fechaDesde: fechaInicio, fechaHasta: fechaFin })
  const ingresosMes = pagos.reduce((sum: number, p: Pago) => sum + p.monto, 0)

  // Pagos pendientes
  const pagosPendientes = alumnos.filter(a => a.estadoPago === 'atrasado').length

  return {
    alumnosActivos,
    asistenciasMes,
    ingresosMes,
    pagosPendientes
  }
}

export async function getAttendanceTrends({ mes, anio }: { mes: number; anio: number }) {
  // Devuelve asistencias por día de la semana para el mes
  const fechaInicio = `${anio}-${String(mes).padStart(2, '0')}-01`
  const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0]
  const { data: asistencias } = await asistenciasService.getAsistencias({})
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
  const data = [0, 0, 0, 0, 0]
  asistencias.forEach(a => {
    if (a.fecha >= fechaInicio && a.fecha <= fechaFin) {
      const dia = new Date(a.fecha).getDay()
      if (dia > 0 && dia < 6) data[dia - 1]++
    }
  })
  return { labels: dias, data }
}

export async function getIncomeTrends({ anio }: { anio: number }) {
  // Devuelve ingresos por mes del año
  const meses = Array.from({ length: 12 }, (_, i) => i + 1)
  const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const data: number[] = []
  for (const mes of meses) {
    const fechaInicio = `${anio}-${String(mes).padStart(2, '0')}-01`
    const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0]
    const pagos = await getPagosPorFiltros({ fechaDesde: fechaInicio, fechaHasta: fechaFin })
    data.push(pagos.reduce((sum: number, p: Pago) => sum + p.monto, 0))
  }
  return { labels, data }
}

export async function getStudentStatus() {
  // Devuelve resumen de estado de alumnos
  const { data: alumnos } = await alumnosService.getAlumnos({})
  const alDia = alumnos.filter(a => a.estadoPago === 'al_dia').length
  const atrasados = alumnos.filter(a => a.estadoPago === 'atrasado').length
  const pendientes = alumnos.filter(a => a.estadoPago === 'pendiente').length
  return { alDia, atrasados, pendientes }
} 