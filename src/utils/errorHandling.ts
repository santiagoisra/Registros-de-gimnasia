//import { PostgrestError } from '@supabase/supabase-js'

export class DatabaseError extends Error {
  constructor(message: string, public originalError: PostgrestError | Error) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function handleDatabaseError(error: PostgrestError | Error, context: string): DatabaseError {
  const message = error instanceof PostgrestError
    ? `Error en operación de base de datos (${context}): ${error.message}`
    : `Error inesperado (${context}): ${error.message}`
  return new DatabaseError(message, error)
}

export function validateRequired<T>(value: T | null | undefined, fieldName: string): void {
  if (value === null || value === undefined) {
    throw new ValidationError(`El campo ${fieldName} es requerido`)
  }
}

export function validateDateRange(startDate: string, endDate: string | null): void {
  if (!endDate) return
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ValidationError('Fechas inválidas')
  }
  
  if (start > end) {
    throw new ValidationError('La fecha de inicio debe ser anterior a la fecha de fin')
  }
}

export function validateNumericRange(value: number, min: number, max: number, fieldName: string): void {
  if (value < min || value > max) {
    throw new ValidationError(`${fieldName} debe estar entre ${min} y ${max}`)
  }
} 