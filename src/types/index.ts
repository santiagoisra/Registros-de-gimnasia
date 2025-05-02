export type Ubicacion = 'Plaza Arenales' | 'Plaza Terán';

export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Mercado Pago';

export interface Alumno {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  fechaAlta: string;
  activo: boolean;
  notas?: string;
  precioMensual: number;
}

export interface Asistencia {
  id: string;
  alumnoId: string;
  fecha: string;
  ubicacion: Ubicacion;
}

export interface Pago {
  id: string;
  alumnoId: string;
  fecha: string;
  monto: number;
  metodoPago: MetodoPago;
  periodoDesde: string;
  periodoHasta: string;
  notas?: string;
}

export interface HistorialPrecios {
  id: string;
  alumnoId: string;
  precio: number;
  fechaDesde: string;
  fechaHasta?: string;
}

export interface Nota {
  id: string;
  alumnoId: string;
  fecha: string;
  contenido: string;
  tipo: 'Ausencia' | 'Lesión' | 'Vacaciones' | 'General';
} 