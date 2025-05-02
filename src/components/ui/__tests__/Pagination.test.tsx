import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '../Pagination'

describe('Pagination', () => {
  const mockOnPageChange = jest.fn()

  beforeEach(() => {
    mockOnPageChange.mockClear()
  })

  it('renderiza correctamente con los botones de navegación', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('Anterior')).toBeInTheDocument()
    expect(screen.getByText('Siguiente')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('deshabilita el botón "Anterior" en la primera página', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('Anterior')).toBeDisabled()
  })

  it('deshabilita el botón "Siguiente" en la última página', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    )

    expect(screen.getByText('Siguiente')).toBeDisabled()
  })

  it('llama a onPageChange con el número de página correcto al hacer clic', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    )

    fireEvent.click(screen.getByText('2'))
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })
}) 