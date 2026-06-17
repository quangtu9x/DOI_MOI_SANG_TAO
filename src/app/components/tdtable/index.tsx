import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import type { TableProps, TablePaginationConfig } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';

interface TDTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
  count?: number;
  pageSize?: number;
  setOffset?: (page: number) => void;
  setPageSize?: (size: number) => void;
  isPagination?: boolean;
  rowSelection?: TableRowSelection<T>;
  offset?: number;
  pageSizeOptions?: string[];
  position?: TablePaginationConfig['position'];
}

const DEFAULT_PAGE_SIZES = ['10', '20', '50', '100'];
const DEFAULT_ROW_KEY = 'id';

const TDTable = <T,>({
  rowClassName,
  loading = false,
  count = 0,
  pageSize = 10,
  setOffset,
  setPageSize,
  isPagination = true,
  rowSelection,
  rowKey = DEFAULT_ROW_KEY,
  offset = 1,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  position = ['bottomRight'],
  ...restProps
}: TDTableProps<T>) => {
  const handleTableChange = useCallback(
    (page: number) => {
      setOffset?.(page);
    },
    [setOffset]
  );

  const handleSizeChange = useCallback(
    (_: number, newPageSize: number) => {
      setPageSize?.(newPageSize);
    },
    [setPageSize]
  );

  const handleShowTotal = useCallback((total: number, range: [number, number]) => {
    return `${range[0]}-${range[1]} của ${total} mục`;
  }, []);

  const defaultRowClassName = useCallback((_: T, index: number) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark'), []);

  const paginationConfig = useMemo(
    (): TablePaginationConfig | false =>
      isPagination
        ? {
          position,
          total: count,
          defaultPageSize: pageSize,
          pageSizeOptions,
          onChange: handleTableChange,
          showSizeChanger: true,
          onShowSizeChange: handleSizeChange,
          current: offset,
          showTotal: handleShowTotal,
          locale: { items_per_page: '/ trang' },
          size: 'default',
        }
        : false,
    [isPagination, position, count, pageSize, pageSizeOptions, handleTableChange, handleSizeChange, offset, handleShowTotal]
  );

  return (
    <Table<T>
      {...restProps}
      rowKey={rowKey}
      bordered
      style={{ backgroundColor: '#fff', width: '100%' }}
      rowClassName={rowClassName || defaultRowClassName}
      loading={loading}
      size="small"
      pagination={paginationConfig}
      rowSelection={rowSelection}
      tableLayout="fixed"
    />
  );
};

export default TDTable;
