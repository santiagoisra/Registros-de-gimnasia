'use client'

import { useState, useMemo } from 'react'

interface UsePaginationProps<T> {
  items: T[]
  itemsPerPage: number
}

export function usePagination<T>({ items, itemsPerPage }: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }

  return {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
  }
} 