import { alumnosService } from './alumnos'
import { asistenciasService } from './asistencias'
import { pagosService } from './pagos'
import type { Alumno, AlertConfig, AlertType } from '@/types'

export interface Alerta {
  id: string
  alumnoId: string
  nombre: string
  tipo: AlertType
  mensaje: string
  fecha: string
  dismissible?: boolean
  notas?: string
}

export async function getAlertas(configs: AlertConfig[]): Promise<Alerta[]> {
  // Obtener todos los alumnos con alertas activas
  const { data: alumnos } = await alumnosService.getAlumnos({})
  const alertas: Alerta[] = []
  const now = new Date()

  for (const alumno of alumnos) {
    if (!alumno.alertasActivas) continue
    const config = configs.find(c => c.type === 'asistencia')
    // Ausencias prolongadas
    if (config?.enabled && config.threshold) {
      const fechaUltima = alumno.fechaUltimaAsistencia ? new Date(alumno.fechaUltimaAsistencia) : null
      if (fechaUltima) {
        const diff = Math.floor((now.getTime() - fechaUltima.getTime()) / (1000 * 60 * 60 * 24))
        if (diff >= config.threshold) {
          alertas.push({
            id: `asistencia-${alumno.id}`,
            alumnoId: alumno.id,
            nombre: alumno.nombre + ' ' + alumno.apellido,
            tipo: 'asistencia',
            mensaje: `No asiste hace ${diff} días`,
            fecha: now.toISOString(),
            dismissible: true
          })
        }
      }
    }
    // Pagos vencidos
    const pagoConfig = configs.find(c => c.type === 'pago')
    if (pagoConfig?.enabled && pagoConfig.reminderDays) {
      if (alumno.estadoPago === 'atrasado') {
        alertas.push({
          id: `pago-${alumno.id}`,
          alumnoId: alumno.id,
          nombre: alumno.nombre + ' ' + alumno.apellido,
          tipo: 'pago',
          mensaje: `Pago vencido`,
          fecha: now.toISOString(),
          dismissible: true
        })
      }
    }
  }
  return alertas
} 