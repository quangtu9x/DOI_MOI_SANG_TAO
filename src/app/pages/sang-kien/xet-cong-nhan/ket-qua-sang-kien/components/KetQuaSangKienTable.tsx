import { TableProps } from 'antd/es/table';

import { SearchData } from '@/types';
import { IHoSoSangKien } from '@/models';
import { TDTable } from '@/app/components';
import { useKetQuaSangKienTable } from './useKetQuaSangKienTable';
import { TRANG_THAI_HO_SO_SANG_KIEN } from '@/data/sang-kien';
import React from 'react';

interface KetQuaSangKienTableProps {
  searchData?: SearchData;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
  setSelectedRows: (rows: IHoSoSangKien[]) => void;
  onEditHoSo: (record: IHoSoSangKien) => void;
  onNhanXetHoSo: (record: IHoSoSangKien) => void;
}

export const KetQuaSangKienTable = ({
  searchData,
  selectedRowKeys,
  setSelectedRowKeys,
  setSelectedRows,
  onEditHoSo,
  onNhanXetHoSo,
}: KetQuaSangKienTableProps) => {
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useKetQuaSangKienTable({ searchData });

  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: IHoSoSangKien[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    type: 'checkbox' as const,
    getCheckboxProps: (record: IHoSoSangKien) => ({
      disabled: !!record.ketQuaSangKienId,
      title: record.ketQuaSangKienId ? `Đã thuộc kết quả ${record.ketQuaSangKienSoQuyetDinh ?? ''}` : undefined,
    }),
  };

  const columns: TableProps<IHoSoSangKien>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tên sáng kiến',
      dataIndex: 'ten',
      key: 'ten',
      render: (text, record) => {
        return <a
          className="fw-bold"
          data-toggle="m-tooltip"
          title={`Bấm để cập nhật thông tin`}
          style={{ textAlign: "center" }}
          onClick={() => onEditHoSo(record)}
        >
          {text}
        </a>
      }
    },
    {
      title: 'Đợt xét sáng kiến',
      dataIndex: 'dotXetSangKienTen',
      key: 'dotXetSangKienTen',
      width: '15%'
    },
    {
      title: 'Đơn vị được yêu cầu công nhận',
      dataIndex: 'donViDuocYeuCauTen',
      key: 'donViDuocYeuCauTen',
      width: '15%'
    },
    {
      title: "Chủ đầu tư",
      dataIndex: "chuDauTu",
      key: "chuDauTu",
      className: "text-center",
      width: '15%',
    },
    {
      title: 'Điểm trung bình',
      dataIndex: 'diemTrungBinh',
      key: 'diemTrungBinh',
      className: 'text-center',
      width: 110,
      render: (val) => val ?? '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      className: 'text-center',
      width: '10%',
      render: (data) => {
        const trangThai = TRANG_THAI_HO_SO_SANG_KIEN.find(item => item.id === data);
        return (
          <span className={trangThai ? trangThai.className : 'badge badge-light-secondary'}>
            {trangThai ? trangThai.name : 'Chưa xác định'}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      className: 'text-center',
      render: (_text, record) => (
        <div className="d-flex justify-content-center gap-1">
          <button className="btn btn-icon btn-bg-light btn-active-color-success btn-sm" title="Cập nhật thông tin sáng kiến" onClick={() => onEditHoSo(record)}>
            <i className="fa-regular fa-pen-to-square"></i>
          </button>
          <button
            className="btn btn-icon btn-bg-light btn-active-color-success btn-sm"
            title="Nhận xét tính mới, nội dung giải pháp, kết quả, khả năng áp dụng, lợi ích"
            onClick={() => onNhanXetHoSo(record)}
          >
            <i className="fa-regular fa-message-lines"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IHoSoSangKien>
            dataSource={data}
            columns={columns}
            isPagination={true}
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
    </>
  );
};

