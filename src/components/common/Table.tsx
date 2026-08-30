import React from 'react';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
  onRowClick?: (item: T) => void;
  striped?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingMessage = 'Loading records...',
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no records to display in this list.',
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  className = '',
  onRowClick,
  striped = false,
}: TableProps<T>) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={`w-full bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={{ width: col.width }}
                  className={`px-4 py-3.5 ${getAlignClass(col.align)} ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center bg-slate-50/30">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <LoadingSpinner size="md" className="text-blue-600" />
                    <span className="text-xs text-slate-500 font-medium">{loadingMessage}</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const key = keyExtractor(row, index);
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors ${
                      onRowClick ? 'cursor-pointer hover:bg-blue-50/50' : 'hover:bg-slate-50/80'
                    } ${striped && !isEven ? 'bg-slate-50/40' : ''}`}
                  >
                    {columns.map((col) => {
                      const value = (row as Record<string, unknown>)[col.key];
                      const content = col.render ? col.render(row, index) : (value as React.ReactNode);

                      return (
                        <td
                          key={`${String(key)}-${col.key}`}
                          className={`px-4 py-3.5 text-slate-700 align-middle ${getAlignClass(
                            col.align
                          )} ${col.cellClassName || ''}`}
                        >
                          {content}
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
    </div>
  );
}
