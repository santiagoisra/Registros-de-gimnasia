import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface OrderParams {
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface DateRangeParams {
  fechaDesde?: string
  fechaHasta?: string
}

export function applyPagination<T>(
  query: PostgrestFilterBuilder<T>,
  { page = 1, pageSize = 10 }: PaginationParams
): PostgrestFilterBuilder<T> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return query.range(from, to)
}

export function applyOrder<T>(
  query: PostgrestFilterBuilder<T>,
  { orderBy, orderDirection = 'desc' }: OrderParams
): PostgrestFilterBuilder<T> {
  if (!orderBy) return query
  return query.order(orderBy, { ascending: orderDirection === 'asc' })
}

export function applyDateRange<T>(
  query: PostgrestFilterBuilder<T>,
  { fechaDesde, fechaHasta }: DateRangeParams,
  dateField = 'fecha'
): PostgrestFilterBuilder<T> {
  if (fechaDesde) {
    query = query.gte(dateField, fechaDesde)
  }
  if (fechaHasta) {
    query = query.lte(dateField, fechaHasta)
  }
  return query
}

export function buildWhereClause(conditions: Record<string, unknown>): Record<string, unknown> {
  return Object.entries(conditions)
    .filter(([_, value]) => value !== undefined && value !== null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

export function optimizeBatchQuery<T>(items: T[], batchSize = 100): T[][] {
  return items.reduce((batches: T[][], item: T, index: number) => {
    const batchIndex = Math.floor(index / batchSize)
    if (!batches[batchIndex]) {
      batches[batchIndex] = []
    }
    batches[batchIndex].push(item)
    return batches
  }, [])
} 