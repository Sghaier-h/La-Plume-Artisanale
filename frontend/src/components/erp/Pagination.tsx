/**
 * Composant de pagination réutilisable
 * Système ERP La Plume Artisanale
 */

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationState, PaginationControls } from '../../hooks/usePagination';

interface PaginationProps {
  state: PaginationState;
  controls: PaginationControls;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  state,
  controls,
  showPageSize = true,
  pageSizeOptions = [10, 20, 50, 100]
}) => {
  const { currentPage, pageSize, totalItems, totalPages } = state;
  const { goToPage, nextPage, previousPage, setPageSize } = controls;

  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        background: 'var(--erp-bg-secondary)',
        borderRadius: 'var(--erp-border-radius-lg)',
        border: '1px solid var(--erp-border-color)',
        marginTop: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {showPageSize && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--erp-text-secondary)' }}>
              Afficher:
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="erp-field-input"
              style={{ padding: '4px 8px', minWidth: '80px' }}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
        <span style={{ fontSize: '14px', color: 'var(--erp-text-secondary)' }}>
          {startItem}-{endItem} sur {totalItems}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="erp-btn erp-btn-outline"
          style={{ padding: '6px 8px' }}
          title="Première page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={previousPage}
          disabled={currentPage === 1}
          className="erp-btn erp-btn-outline"
          style={{ padding: '6px 8px' }}
          title="Page précédente"
        >
          <ChevronLeft size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={currentPage === pageNum ? 'erp-btn erp-btn-primary' : 'erp-btn erp-btn-outline'}
                style={{ padding: '6px 12px', minWidth: '40px' }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="erp-btn erp-btn-outline"
          style={{ padding: '6px 8px' }}
          title="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="erp-btn erp-btn-outline"
          style={{ padding: '6px 8px' }}
          title="Dernière page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
