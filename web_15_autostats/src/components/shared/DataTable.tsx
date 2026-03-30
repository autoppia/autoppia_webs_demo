'use client';

import type React from 'react';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useDynamicSystem } from '@/dynamic/shared';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;

      const aStr = String(aVal ?? '');
      const bStr = String(bVal ?? '');
      const comparison = aStr < bStr ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const dyn = useDynamicSystem();

  return (
    <div className={className}>
      {dyn.v1.addWrapDecoy('data-table', (
        <div className="rounded-md border border-zinc-800 bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`text-zinc-400 ${column.className || ''}`}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="h-auto p-0 hover:bg-transparent hover:text-zinc-100"
                    >
                      {column.header}
                      {sortKey === column.key && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-zinc-500"
                >
                  {dyn.v3.getVariant('no_data_available', undefined, 'No data available')}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow
                  key={columns[0] ? String(item[columns[0].key] ?? index) : index}
                  onClick={() => onRowClick?.(item)}
                  className={`border-zinc-800 ${
                    onRowClick ? 'cursor-pointer hover:bg-zinc-900' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`text-zinc-300 ${column.className || ''}`}
                    >
                      {column.render ? (
                        column.render(item)
                      ) : (
                        String(item[column.key] ?? '')
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      ))}
    </div>
  );
}
