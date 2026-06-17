import { TableProps } from 'antd/es/table';

import { IKetQuaSangKien } from '@/models';
import { TDTable } from '@/app/components';
import { SearchData } from '@/types';
import { toViewDateString } from '@/utils/utils';
import { useKetQuaSangKienResultTable } from './useKetQuaSangKienResultTable';
import React from 'react';

interface Props {
  searchData?: SearchData;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
  setSelectedRows: (rows: IKetQuaSangKien[]) => void;
  onEdit: (record: IKetQuaSangKien) => void;
}

export const KetQuaSangKienResultTable = ({ searchData, selectedRowKeys, setSelectedRowKeys, setSelectedRows, onEdit }: Props) => {
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useKetQuaSangKienResultTable({ searchData });

  const rowSelection = {
    selectedRowKeys,
    type: 'radio' as const,
    onChange: (keys: React.Key[], rows: IKetQuaSangKien[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  const columns: TableProps<IKetQuaSangKien>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (_text, _record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Số quyết định',
      dataIndex: 'soQuyetDinh',
      key: 'soQuyetDinh',
      render: (text, record) => (
        <a className="fw-bold" onClick={() => onEdit(record)}>
          {text}
        </a>
      ),
    },
    {
      title: 'Ngày quyết định',
      dataIndex: 'ngayRaKetQua',
      key: 'ngayRaKetQua',
      className: 'text-center',
      width: 160,
      render: value => toViewDateString(value),
    },
    {
      title: 'Đơn vị ban hành',
      dataIndex: 'donViBanHanh',
      key: 'donViBanHanh',
      width: '25%',
    },
    {
      title: 'Hồ sơ sáng kiến',
      dataIndex: 'hoSoSangKiens',
      key: 'hoSoSangKiens',
      render: (_value, record) => {
        const hoSos = record.hoSoSangKiens?.length ? record.hoSoSangKiens : record.hoSoSangKienTen ? [{ ten: record.hoSoSangKienTen }] : [];
        if (!hoSos.length) {
          return '-';
        }

        const visibleItems = hoSos.slice(0, 3);
        const remainingCount = hoSos.length - visibleItems.length;

        return (
          <div>
            {visibleItems.map((item, index) => (
              <div key={`${item.ten}-${index}`} className="text-truncate" style={{ maxWidth: 520, whiteSpace: 'nowrap' }} title={item.ten}>
                {item.ten}
              </div>
            ))}
            {remainingCount > 0 && <div className="text-muted">... (+{remainingCount} hồ sơ còn lại)</div>}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      className: 'text-center',
      render: (_text, record) => (
        <button className="btn btn-icon btn-bg-light btn-active-color-success btn-sm" title="Cập nhật kết quả" onClick={() => onEdit(record)}>
          <i className="fa-regular fa-pen-to-square"></i>
        </button>
      ),
    },
  ];

  return (
    <div className="card-body card-dashboard px-3 py-3">
      <div className="card-dashboard-body table-responsive">
        <TDTable<IKetQuaSangKien>
          dataSource={data}
          columns={columns}
          isPagination
          pageSize={pageSize}
          count={totalCount}
          offset={currentPage}
          setOffset={setCurrentPage}
          setPageSize={setPageSize}
          loading={loading}
          rowSelection={rowSelection}
        />
      </div>
    </div>
  );
};
