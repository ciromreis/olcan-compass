import { forwardRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseComponentProps } from './types'

export interface PaginationProps extends BaseComponentProps {
  /** Current page (1-indexed) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Number of page buttons to show */
  siblingCount?: number
  /** Whether to show first/last buttons */
  showFirstLast?: boolean
  /** Whether to show page size selector */
  showPageSize?: boolean
  /** Current page size */
  pageSize?: number
  /** Available page sizes */
  pageSizes?: number[]
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void
  /** Whether pagination is disabled */
  disabled?: boolean
}

const DOTS = '...'

/**
 * Pagination component with page size controls
 * Supports URL state synchronization
 */
export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      onPageChange,
      siblingCount = 1,
      showFirstLast = true,
      showPageSize = false,
      pageSize = 10,
      pageSizes = [10, 20, 50, 100],
      onPageSizeChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const paginationRange = useMemo(() => {
      const totalPageNumbers = siblingCount + 5 // siblingCount + firstPage + lastPage + currentPage + 2*DOTS

      // Case 1: If the number of pages is less than the page numbers we want to show
      if (totalPageNumbers >= totalPages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }

      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

      const shouldShowLeftDots = leftSiblingIndex > 2
      const shouldShowRightDots = rightSiblingIndex < totalPages - 2

      const firstPageIndex = 1
      const lastPageIndex = totalPages

      // Case 2: No left dots to show, but rights dots to be shown
      if (!shouldShowLeftDots && shouldShowRightDots) {
        const leftItemCount = 3 + 2 * siblingCount
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
        return [...leftRange, DOTS, totalPages]
      }

      // Case 3: No right dots to show, but left dots to be shown
      if (shouldShowLeftDots && !shouldShowRightDots) {
        const rightItemCount = 3 + 2 * siblingCount
        const rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        )
        return [firstPageIndex, DOTS, ...rightRange]
      }

      // Case 4: Both left and right dots to be shown
      if (shouldShowLeftDots && shouldShowRightDots) {
        const middleRange = Array.from(
          { length: rightSiblingIndex - leftSiblingIndex + 1 },
          (_, i) => leftSiblingIndex + i
        )
        return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex]
      }

      return []
    }, [totalPages, siblingCount, currentPage])

    const handlePageChange = (page: number) => {
      if (disabled || page < 1 || page > totalPages || page === currentPage) return
      onPageChange(page)
    }

    const handlePageSizeChange = (newPageSize: number) => {
      if (disabled) return
      onPageSizeChange?.(newPageSize)
    }

    if (totalPages === 0) return null

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between gap-4 flex-wrap', className)}
        {...props}
      >
        {/* Page Size Selector */}
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-lux-300">Itens por página:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              disabled={disabled}
              className={cn(
                'px-3 py-1 text-sm bg-neutral-800 border border-neutral-700 rounded-lg',
                'text-lux-200 focus:outline-none focus:ring-2 focus:ring-cyan/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pagination Controls */}
        <nav
          role="navigation"
          aria-
          className="flex items-center gap-1"
        >
          {/* First Page */}
          {showFirstLast && (
            <button
              onClick={() => handlePageChange(1)}
              disabled={disabled || currentPage === 1}
              aria-
              className={cn(
                'p-2 rounded-lg transition-colors',
                'hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan/50',
                (disabled || currentPage === 1) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ChevronsLeft size={16} className="text-lux-200" />
            </button>
          )}

          {/* Previous Page */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            aria-
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan/50',
              (disabled || currentPage === 1) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <ChevronLeft size={16} className="text-lux-200" />
          </button>

          {/* Page Numbers */}
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === DOTS) {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-1 text-sm text-lux-300"
                >
                  {DOTS}
                </span>
              )
            }

            const isActive = pageNumber === currentPage

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber as number)}
                disabled={disabled}
                aria-label={`Página ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'min-w-[36px] px-3 py-1 text-sm rounded-lg transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-cyan/50',
                  isActive
                    ? 'bg-cyan text-void-primary font-medium'
                    : 'text-lux-200 hover:bg-neutral-700',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {pageNumber}
              </button>
            )
          })}

          {/* Next Page */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            aria-
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan/50',
              (disabled || currentPage === totalPages) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <ChevronRight size={16} className="text-lux-200" />
          </button>

          {/* Last Page */}
          {showFirstLast && (
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
              aria-
              className={cn(
                'p-2 rounded-lg transition-colors',
                'hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-cyan/50',
                (disabled || currentPage === totalPages) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ChevronsRight size={16} className="text-lux-200" />
            </button>
          )}
        </nav>

        {/* Page Info */}
        <div className="text-sm text-lux-300">
          Página {currentPage} de {totalPages}
        </div>
      </div>
    )
  }
)

Pagination.displayName = 'Pagination'
