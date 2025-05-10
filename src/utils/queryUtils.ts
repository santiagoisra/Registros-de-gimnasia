import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import type { SupabaseSchema, Database } from '@/types/supabase'

type TableName = keyof Database['public']['Tables']
type RowType<T extends TableName> = Database['public']['Tables'][T]['Row']
type InsertType<T extends TableName> = Database['public']['Tables'][T]['Insert']
type UpdateType<T extends TableName> = Database['public']['Tables'][T]['Update']

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

export function applyPagination(
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  { page = 1, pageSize = 10 }: PaginationParams
): PostgrestFilterBuilder<any, any, any, any, any> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  return query.range(from, to)
}

export function applyOrder(
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  { orderBy, orderDirection = 'desc' }: OrderParams
): PostgrestFilterBuilder<any, any, any, any, any> {
  if (!orderBy) return query
  return query.order(orderBy as string, { ascending: orderDirection === 'asc' })
}

export function applyDateRange(
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  { fechaDesde, fechaHasta }: DateRangeParams,
  dateField = 'fecha'
): PostgrestFilterBuilder<any, any, any, any, any> {
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
    .filter(([, value]) => value !== undefined && value !== null)
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