import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string;
  exportable?: boolean; // default: true
  /**
   * Valeur brute à utiliser pour tri/export. Fallback: row[key].
   */
  value?: (row: T) => any;
};

export type BulkAction = {
  label: string;
  icon?: React.ReactNode;
  onClick: (ids: Array<string | number>) => void;
  danger?: boolean;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T | ((row: T) => string | number);
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  bulkActions?: BulkAction[];
  pageSize?: number;
  pageSizeOptions?: number[];
  exportable?: boolean;
  exportApiUrl?: string;
  exportFilename?: string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  /** Classe appliquée au wrapper externe */
  className?: string;
};

type SortState = { key: string; direction: 'asc' | 'desc' } | null;

function getRowKey<T>(
  row: T,
  rowKey: keyof T | ((row: T) => string | number),
): string | number {
  if (typeof rowKey === 'function') return rowKey(row);
  const v = (row as any)[rowKey];
  return v ?? '';
}

function getCellValue<T>(row: T, col: Column<T>): any {
  if (col.value) return col.value(row);
  return (row as any)[col.key];
}

function compareValues(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && a !== '' && b !== '') {
    return na - nb;
  }
  return String(a).localeCompare(String(b), 'fr', { numeric: true });
}

function toExportRow<T>(row: T, cols: Column<T>[]): Record<string, any> {
  const out: Record<string, any> = {};
  cols.forEach((c) => {
    if (c.exportable === false) return;
    const raw = getCellValue(row, c);
    if (raw == null) {
      out[c.label] = '';
    } else if (typeof raw === 'object' && !(raw instanceof Date)) {
      try {
        out[c.label] = JSON.stringify(raw);
      } catch {
        out[c.label] = String(raw);
      }
    } else {
      out[c.label] = raw;
    }
  });
  return out;
}

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) {
    const blob = new Blob([''], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${filename}.csv`);
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    if (/[",;\n\r]/.test(s)) return `"${s}"`;
    return s;
  };
  const lines = [headers.join(';')];
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(';'));
  const bom = '﻿';
  const blob = new Blob([bom + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  triggerDownload(blob, `${filename}.csv`);
}

function downloadXlsx(filename: string, rows: Record<string, any>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Export');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns,
    data,
    rowKey,
    onRowClick,
    selectable = false,
    bulkActions = [],
    pageSize: pageSizeProp,
    pageSizeOptions = [10, 25, 50, 100],
    exportable = false,
    exportApiUrl,
    exportFilename = 'export',
    emptyState,
    loading = false,
    className,
  } = props;

  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(pageSizeProp ?? 25);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset page si data change
  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = getCellValue(a, col);
      const bv = getCellValue(b, col);
      const cmp = compareValues(av, bv);
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [data, sort, columns]);

  const total = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageData = useMemo(
    () => sortedData.slice(startIdx, startIdx + pageSize),
    [sortedData, startIdx, pageSize],
  );

  const toggleSort = useCallback(
    (col: Column<T>) => {
      if (col.sortable === false) return;
      setSort((prev) => {
        if (!prev || prev.key !== col.key) return { key: col.key, direction: 'asc' };
        if (prev.direction === 'asc') return { key: col.key, direction: 'desc' };
        return null;
      });
    },
    [],
  );

  const pageKeys = useMemo(
    () => pageData.map((r) => getRowKey(r, rowKey)),
    [pageData, rowKey],
  );
  const allPageSelected =
    pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const somePageSelected = pageKeys.some((k) => selected.has(k));

  const toggleAllPage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageKeys.forEach((k) => next.delete(k));
      else pageKeys.forEach((k) => next.add(k));
      return next;
    });
  };

  const toggleOne = (k: string | number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const handleExportCsv = () => {
    const rows = sortedData.map((r) => toExportRow(r, columns));
    downloadCsv(exportFilename, rows);
  };

  const handleExportXlsx = async () => {
    if (exportApiUrl) {
      try {
        const res = await fetch(exportApiUrl);
        if (!res.ok) throw new Error('export api failed');
        const blob = await res.blob();
        triggerDownload(blob, `${exportFilename}.xlsx`);
        return;
      } catch (err) {
        console.warn('[DataTable] export API failed, fallback client-side', err);
      }
    }
    const rows = sortedData.map((r) => toExportRow(r, columns));
    downloadXlsx(exportFilename, rows);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!pageData.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(pageData.length - 1, (i < 0 ? 0 : i + 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(0, (i < 0 ? 0 : i - 1)));
    } else if (e.key === ' ' && selectable && focusedIndex >= 0) {
      e.preventDefault();
      const row = pageData[focusedIndex];
      if (row) toggleOne(getRowKey(row, rowKey));
    }
  };

  const colsCount = columns.length + (selectable ? 1 : 0);

  const headerStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontWeight: 600,
    fontSize: 'var(--text-xs)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--fg-primary)',
    whiteSpace: 'nowrap',
  };

  const cellStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: 'var(--text-sm)',
    color: 'var(--fg-primary)',
    whiteSpace: 'nowrap',
  };

  // Pagination buttons list: 1, 2, 3, …, N
  const pagerPages = useMemo<(number | 'ellipsis')[]>(() => {
    const arr: (number | 'ellipsis')[] = [];
    const push = (v: number | 'ellipsis') => arr.push(v);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) push(i);
      return arr;
    }
    push(1);
    if (safePage > 4) push('ellipsis');
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) push(i);
    if (safePage < totalPages - 3) push('ellipsis');
    push(totalPages);
    return arr;
  }, [safePage, totalPages]);

  const selectedCount = selected.size;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={className}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        outline: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Header toolbar : bulk actions + export */}
      {(selectedCount > 0 || exportable) && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--s-3)',
            padding: '0.6rem 0.9rem',
            background:
              selectedCount > 0
                ? 'color-mix(in srgb, var(--accent-terracotta) 10%, var(--bg-elevated))'
                : 'var(--bg-canvas)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
            {selectedCount > 0 ? (
              <>
                <span style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>
                  {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''} :
                </span>
                {bulkActions.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => a.onClick(Array.from(selected))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '0.35rem 0.7rem',
                      borderRadius: 'var(--radius-sm)',
                      background: a.danger
                        ? 'var(--color-danger-bg)'
                        : 'var(--bg-elevated)',
                      color: a.danger ? 'var(--color-danger)' : 'var(--fg-primary)',
                      border: '1px solid var(--border-default)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {a.icon}
                    {a.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearSelection}
                  style={{
                    padding: '0.3rem 0.6rem',
                    border: '1px solid transparent',
                    background: 'transparent',
                    color: 'var(--fg-muted)',
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  Désélectionner
                </button>
              </>
            ) : (
              <span style={{ color: 'var(--fg-muted)' }}>
                {total} ligne{total > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {exportable && (
            <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
              <button
                type="button"
                onClick={handleExportCsv}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.35rem 0.7rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--fg-primary)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                }}
              >
                <Download size={14} />
                CSV
              </button>
              <button
                type="button"
                onClick={handleExportXlsx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0.35rem 0.7rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--fg-primary)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                }}
              >
                <FileSpreadsheet size={14} />
                XLSX
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <table
          style={{
            width: '100%',
            minWidth: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead style={{ background: 'var(--bg-canvas)' }}>
            <tr>
              {selectable && (
                <th style={{ ...headerStyle, width: 40 }}>
                  <input
                    type="checkbox"
                    aria-label="Tout sélectionner"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allPageSelected && somePageSelected;
                    }}
                    onChange={toggleAllPage}
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const isSortable = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    style={{
                      ...headerStyle,
                      width: col.width,
                      textAlign: col.align || 'left',
                      cursor: isSortable ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    onClick={isSortable ? () => toggleSort(col) : undefined}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {col.label}
                      {isSortable && (
                        <span
                          style={{ color: isSorted ? 'var(--accent-terracotta)' : 'var(--fg-muted)' }}
                        >
                          {isSorted && sort?.direction === 'asc' ? (
                            <ArrowUp size={12} />
                          ) : isSorted ? (
                            <ArrowDown size={12} />
                          ) : (
                            <ArrowUpDown size={12} />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, r) => (
                <tr key={`skeleton-${r}`}>
                  {Array.from({ length: colsCount }).map((__, c) => (
                    <td key={c} style={cellStyle}>
                      <div
                        style={{
                          height: 14,
                          width: '80%',
                          background: 'var(--bg-hover)',
                          borderRadius: 'var(--radius-xs)',
                          animation: 'lp-pulse 1.4s ease-in-out infinite',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={colsCount}
                  style={{
                    ...cellStyle,
                    textAlign: 'center',
                    padding: '2.5rem 1rem',
                    color: 'var(--fg-muted)',
                  }}
                >
                  {emptyState || 'Aucune donnée.'}
                </td>
              </tr>
            ) : (
              pageData.map((row, rowIdx) => {
                const k = getRowKey(row, rowKey);
                const isSelected = selected.has(k);
                const isFocused = focusedIndex === rowIdx;
                return (
                  <tr
                    key={String(k)}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      background: isSelected
                        ? 'color-mix(in srgb, var(--accent-terracotta) 8%, transparent)'
                        : isFocused
                        ? 'var(--bg-hover)'
                        : 'transparent',
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                    onMouseEnter={(e) => {
                      if (isSelected) return;
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (isSelected) return;
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        isFocused ? 'var(--bg-hover)' : 'transparent';
                    }}
                  >
                    {selectable && (
                      <td
                        style={{ ...cellStyle, width: 40 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          aria-label="Sélectionner la ligne"
                          checked={isSelected}
                          onChange={() => toggleOne(k)}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const content = col.render
                        ? col.render(row, startIdx + rowIdx)
                        : (() => {
                            const v = getCellValue(row, col);
                            return v == null ? '-' : String(v);
                          })();
                      return (
                        <td
                          key={col.key}
                          style={{
                            ...cellStyle,
                            textAlign: col.align || 'left',
                            width: col.width,
                          }}
                        >
                          {content as React.ReactNode}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && !loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--s-3)',
            padding: '0.6rem 0.9rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-canvas)',
            fontSize: 'var(--text-xs)',
            color: 'var(--fg-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
            <span>Lignes par page :</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              style={{
                padding: '0.2rem 0.4rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
                color: 'var(--fg-primary)',
              }}
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span>
              {startIdx + 1}–{Math.min(startIdx + pageSize, total)} sur {total}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              style={pagerBtnStyle(safePage <= 1)}
              aria-label="Page précédente"
            >
              <ChevronLeft size={14} />
            </button>
            {pagerPages.map((p, idx) =>
              p === 'ellipsis' ? (
                <span key={`e-${idx}`} style={{ padding: '0 4px', color: 'var(--fg-muted)' }}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  style={{
                    ...pagerBtnStyle(false),
                    ...(p === safePage
                      ? {
                          background: 'var(--accent-terracotta)',
                          color: 'var(--fg-inverse)',
                          borderColor: 'var(--accent-terracotta)',
                        }
                      : {}),
                  }}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              style={pagerBtnStyle(safePage >= totalPages)}
              aria-label="Page suivante"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes lp-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

function pagerBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    height: 28,
    padding: '0 8px',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-elevated)',
    color: disabled ? 'var(--fg-muted)' : 'var(--fg-primary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
  };
}

export default DataTable;
