// Logger centralizado para la app

export function logInfo(message: string, ...args: unknown[]) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.info('[INFO]', message, ...args)
  }
}

export function logWarn(message: string, ...args: unknown[]) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('[WARN]', message, ...args)
  }
}

export function logError(message: string, ...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.error('[ERROR]', message, ...args)
  // TODO: Integrar Sentry.captureException si está disponible
}

export function captureException(error: unknown) {
  // TODO: Integrar Sentry.captureException(error)
  logError('Excepción capturada', error)
} 