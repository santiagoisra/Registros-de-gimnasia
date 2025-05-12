import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AsistenciasList } from '../AsistenciasList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAsistencias } from '@/hooks/useAsistencias'

jest.mock('@/components/ui/Spinner', () => ({ Spinner: () => <div data-testid="spinner">Cargando...</div> }))
jest.mock('@/components/ui/Alert', () => ({ Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div> }))

const baseAsistencias = [
  {
    id: '1',
    created_at: '2024-05-10T10:00:00Z',
    updated_at: '2024-05-10T10:00:00Z',
    alumno_id: 'alumno1',
    fecha: '2024-05-10',
    sede: 'Plaza Arenales' as const,
    estado: 'presente' as const,
    alumno: { nombre: 'Juan', apellido: 'Pérez', id: 'alumno1', created_at: '', email: '', telefono: '', sede: 'Plaza Arenales' as const, activo: true },
    notas: 'Llegó puntual'
  },
  {
    id: '2',
    created_at: '2024-05-10T10:00:00Z',
    updated_at: '2024-05-10T10:00:00Z',
    alumno_id: 'alumno2',
    fecha: '2024-05-10',
    sede: 'Plaza Terán' as const,
    estado: 'ausente' as const,
    alumno: { nombre: 'Ana', apellido: 'García', id: 'alumno2', created_at: '', email: '', telefono: '', sede: 'Plaza Terán' as const, activo: true },
    notas: ''
  }
]

jest.mock('@/hooks/useAsistencias', () => ({
  useAsistencias: jest.fn()
}))

const mockedUseAsistencias = jest.mocked(useAsistencias)

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('AsistenciasList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock global fetch para /api/shifts
    global.fetch = jest.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/shifts')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([
            { id: 'shift1', nombre: 'Mañana', is_active: true, start_time: '08:00', end_time: '12:00' },
            { id: 'shift2', nombre: 'Tarde', is_active: true, start_time: '14:00', end_time: '18:00' }
          ])
        } as Response)
      }
      // fallback
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([])
      } as Response)
    })
  })

  it('renderiza asistencias y resumen', async () => {
    mockedUseAsistencias.mockReturnValue({
      asistencias: baseAsistencias,
      totalPages: 1,
      estadisticas: undefined,
      loading: false,
      error: null,
      actualizarAsistencia: jest.fn(),
      crearAsistencia: jest.fn(),
      eliminarAsistencia: jest.fn(),
      obtenerAsistenciasPorPeriodo: jest.fn()
    })
    renderWithQueryClient(<AsistenciasList />)
    // @ts-expect-error
    expect(screen.getByText((content, node) => node?.textContent === 'Juan Pérez')).toBeInTheDocument()
    // @ts-expect-error
    expect(screen.getByText((content, node) => node?.textContent === 'Ana García')).toBeInTheDocument()
    // @ts-expect-error
    expect(screen.getAllByText('Presente').length).toBeGreaterThan(0)
    // @ts-expect-error
    expect(screen.getAllByText('Ausente').length).toBeGreaterThan(0)
    // @ts-expect-error
    expect(screen.getByText(/Total:/)).toBeInTheDocument()
  })

  it('muestra loading', () => {
    mockedUseAsistencias.mockReturnValue({ asistencias: [], totalPages: 1, estadisticas: undefined, loading: true, error: null, actualizarAsistencia: jest.fn(), crearAsistencia: jest.fn(), eliminarAsistencia: jest.fn(), obtenerAsistenciasPorPeriodo: jest.fn() })
    renderWithQueryClient(<AsistenciasList />)
    // @ts-expect-error
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('muestra error', () => {
    mockedUseAsistencias.mockReturnValue({ asistencias: [], totalPages: 1, estadisticas: undefined, loading: false, error: { name: 'Error', message: 'Error de conexión' }, actualizarAsistencia: jest.fn(), crearAsistencia: jest.fn(), eliminarAsistencia: jest.fn(), obtenerAsistenciasPorPeriodo: jest.fn() })
    renderWithQueryClient(<AsistenciasList />)
    // @ts-expect-error
    expect(screen.getByTestId('alert')).toHaveTextContent('Error de conexión')
  })

  it('permite alternar estado de asistencia', async () => {
    const actualizarAsistencia = jest.fn()
    mockedUseAsistencias.mockReturnValue({
      asistencias: [baseAsistencias[0]],
      totalPages: 1,
      estadisticas: undefined,
      loading: false,
      error: null,
      actualizarAsistencia,
      crearAsistencia: jest.fn(),
      eliminarAsistencia: jest.fn(),
      obtenerAsistenciasPorPeriodo: jest.fn()
    })
    renderWithQueryClient(<AsistenciasList />)
    // Buscar el primer botón de estado (Presente/Ausente)
    const btn = screen.getAllByRole('button').find(b => b.textContent?.toLowerCase().includes('presente') || b.textContent?.toLowerCase().includes('ausente'))
    // @ts-expect-error
    expect(btn).toBeDefined()
    fireEvent.click(btn as HTMLElement)
    await waitFor(() => {
      // @ts-expect-error
      expect(actualizarAsistencia).toHaveBeenCalled()
    })
  })
}) 