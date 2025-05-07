/**
 * Formatea un número como moneda según la configuración regional y moneda especificada
 */
export function formatCurrency(amount: number, currency: string = 'ARS', locale: string = 'es-AR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
} 