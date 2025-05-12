// Requiere instalar papaparse y jspdf/autotable:
// npm install papaparse jspdf jspdf-autotable
import { alumnosService } from './alumnos'
import { asistenciasService } from './asistencias'
import { getPagosPorFiltros } from './pagos'
import { notasService } from './notas'
import { historialPreciosService } from './historialPrecios'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extensión de tipos para jsPDF y autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF
  }
}

export interface ReportParams {
  tipo: 'alumnos' | 'pagos' | 'asistencias' | 'notas' | 'precios'
  fechaDesde?: string
  fechaHasta?: string
  filtros?: Record<string, unknown>
  metricas?: string[]
}

export async function generateReport(params: ReportParams): Promise<{ columns: string[]; rows: Array<Array<string | number>> }> {
  switch (params.tipo) {
    case 'alumnos': {
      const { data } = await alumnosService.getAlumnos({ ...params.filtros })
      return {
        columns: ['ID', 'Nombre', 'Activo', 'Estado de Pago'],
        rows: data.map(a => [a.id ?? '', a.nombre ?? '', a.activo ? 'Sí' : 'No', a.estadoPago ?? ''])
      }
    }
    case 'pagos': {
      const data = await getPagosPorFiltros({ fechaDesde: params.fechaDesde, fechaHasta: params.fechaHasta, ...params.filtros })
      return {
        columns: ['ID', 'Alumno', 'Monto', 'Fecha', 'Método', 'Estado'],
        rows: data.map((p: import('@/types').Pago) => [p.id ?? '', p.alumnoId ?? '', p.monto ?? 0, p.fecha ?? '', p.metodoPago ?? '', p.estado ?? ''])
      }
    }
    case 'asistencias': {
      const { data } = await asistenciasService.getAsistencias({ fecha: undefined, ...params.filtros })
      return {
        columns: ['ID', 'Alumno', 'Fecha', 'Estado', 'Sede'],
        rows: data.map(a => [a.id ?? '', a.alumnoId ?? '', a.fecha ?? '', a.estado ?? '', a.sede ?? ''])
      }
    }
    case 'notas': {
      const { data } = await notasService.getNotas({ fechaDesde: params.fechaDesde, fechaHasta: params.fechaHasta, ...params.filtros })
      return {
        columns: ['ID', 'Alumno', 'Tipo', 'Categoría', 'Calificación', 'Fecha'],
        rows: data.map(n => [n.id ?? '', n.alumnoId ?? '', n.tipo ?? '', n.categoria ?? '', n.calificacion ?? 0, n.fecha ?? ''])
      }
    }
    case 'precios': {
      const { data } = await historialPreciosService.getHistorialPrecios({ fechaDesde: params.fechaDesde, fechaHasta: params.fechaHasta, ...params.filtros })
      return {
        columns: ['ID', 'Alumno', 'Precio', 'Desde', 'Hasta', 'Servicio', 'Tipo', 'Moneda'],
        rows: data.map(h => [h.id ?? '', h.alumnoId ?? '', h.precio ?? 0, h.fechaDesde ?? '', h.fechaHasta ?? '', h.servicio ?? '', h.tipoServicio ?? '', h.moneda ?? ''])
      }
    }
    default:
      return { columns: [], rows: [] }
  }
}

export function exportToCSV(columns: string[], rows: (string | number)[][]): string {
  return Papa.unparse({ fields: columns, data: rows })
}

export function exportToPDF(title: string, columns: string[], rows: (string | number)[][]): jsPDF {
  const doc = new jsPDF()
  doc.text(title, 14, 16)
  doc.autoTable({ head: [columns], body: rows, startY: 22 })
  return doc
}

// Ejemplo de uso:
// const { columns, rows } = await generateReport({ tipo: 'pagos', fechaDesde, fechaHasta })
// const csv = exportToCSV(columns, rows)
// const pdf = exportToPDF('Reporte de Pagos', columns, rows) 