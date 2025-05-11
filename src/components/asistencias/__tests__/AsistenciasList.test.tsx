import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AsistenciasList } from '../AsistenciasList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

jest.mock('@/components/ui/Spinner', () => ({ Spinner: () => <div data-testid="spinner">Cargando...</div> }))
jest.mock('@/components/ui/Alert', () => ({ Alert: ({ children }: any) => <div data-testid="alert">{children}</div> }))

const baseAsistencias = [
  {
    id: '1',
    alumno: { nombre: 'Juan', apellido: 'Pérez' },
    fecha: '2024-05-10',
    estado: 'presente',
    sede: 'Plaza Arenales',
    notas: 'Llegó puntual'
  },
  {
    id: '2',
    alumno: { nombre: 'Ana', apellido: 'García' },
    fecha: '2024-05-10',
    estado: 'ausente',
    sede: 'Plaza Terán',
    notas: ''
  }
]

jest.mock('@/hooks/useAsistencias', () => ({
  useAsistencias: jest.fn()
}))
const { useAsistencias } = require('@/hooks/useAsistencias')

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
    useAsistencias.mockReturnValue({
      asistencias: baseAsistencias,
      totalPages: 1,
      loading: false,
      error: null,
      actualizarAsistencia: jest.fn(),
      crearAsistencia: jest.fn(),
      eliminarAsistencia: jest.fn(),
      obtenerAsistenciasPorPeriodo: jest.fn()
    })
    renderWithQueryClient(<AsistenciasList />)
    // Buscar por función matcher para nombre y apellido
    expect(screen.getByText((content, node) => node?.textContent === 'Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText((content, node) => node?.textContent === 'Ana García')).toBeInTheDocument()
    expect(screen.getAllByText('Presente').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ausente').length).toBeGreaterThan(0)
    expect(screen.getByText(/Total:/)).toBeInTheDocument()
  })

  it('muestra loading', () => {
    useAsistencias.mockReturnValue({ asistencias: [], loading: true, error: null })
    renderWithQueryClient(<AsistenciasList />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('muestra error', () => {
    useAsistencias.mockReturnValue({ asistencias: [], loading: false, error: { message: 'Error de conexión' } })
    renderWithQueryClient(<AsistenciasList />)
    expect(screen.getByTestId('alert')).toHaveTextContent('Error de conexión')
  })

  it('permite alternar estado de asistencia', async () => {
    const actualizarAsistencia = jest.fn()
    useAsistencias.mockReturnValue({
      asistencias: [baseAsistencias[0]],
      totalPages: 1,
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
    expect(btn).toBeDefined()
    fireEvent.click(btn as HTMLElement)
    await waitFor(() => {
      expect(actualizarAsistencia).toHaveBeenCalled()
    })
  })
}) 