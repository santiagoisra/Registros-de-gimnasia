export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}

export function isValidDate(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return !isNaN(d.getTime())
}

export function getDateRange(months: number): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  }
}

export function getMonthsBetweenDates(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
}

export function addMonths(date: string | Date, months: number): string {
  const d = typeof date === 'string' ? new Date(date) : date
  d.setMonth(d.getMonth() + months)
  return formatDate(d)
} 