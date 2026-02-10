'use client';

import React, { useState, useMemo } from 'react';
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
import { DynamicText } from '@/dynamic/v3/DynamicText';
import { DynamicWrapper } from '@/dynamic/v1/DynamicWrapper';

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

export function DataTable<T extends Record<string, any>>({
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

      const comparison = aVal < bVal ? -1 : 1;
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

  return (
    <DynamicWrapper className={className}>
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
                      <DynamicText value={column.header} type="text" />
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
                    <DynamicText value={column.header} type="text" />
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
                  <DynamicText value="No data available" type="text" />
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow
                  key={index}
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
                        <DynamicText
                          value={item[column.key]}
                          type="text"
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DynamicWrapper>
  );
}
