import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IDeXuatDeTai } from '@/models';
import { TDTable } from '@/app/components';
import { useDeXuatDeTaiTable } from './useDeXuatDeTaiTable';
import { DeXuatDeTaiDetailModal } from './DeXuatDeTaiDetailModal';
import { formatNumber } from '@/utils/utils';
import { TRANG_THAI_DE_XUAT } from '@/data';

interface DeXuatDeTaiTableProps {
  searchData?: SearchData;
}

export const DeXuatDeTaiTable: React.FC<DeXuatDeTaiTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useDeXuatDeTaiTable({ searchData });

  const columns: TableProps<IDeXuatDeTai>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tên đề tài',
      dataIndex: 'ten',
      key: 'ten',
      render: (text, record) => {
        return <a
          className="fw-bold"
          data-toggle="m-tooltip"
          title={`Bấm để xem chi tiết`}
          style={{ textAlign: "center" }}
          onClick={() => {
            dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
            dispatch(actionsModal.setModalVisible(true));
          }}
        >
          {text}
        </a>
      }
    },
    {
      title: 'Nhiệm vụ đặt hàng',
      dataIndex: 'datHangNhiemVuTen',
      key: 'datHangNhiemVuTen',
      width: '30%'
    },
    {
      title: 'Kinh phí dự kiến (VNĐ)',
      dataIndex: 'kinhPhiDuKien',
      key: 'kinhPhiDuKien',
      className: 'text-center',
      width: '15%',
      render: data => formatNumber(data),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      className: 'text-center',
      width: '15%',
      render: (data) => {
        const trangThai = TRANG_THAI_DE_XUAT.find(item => item.id === data);
        return (
          <span className={trangThai ? trangThai.className : 'badge badge-light-secondary'}>
            {trangThai ? trangThai.name : 'Chưa xác định'}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      className: 'text-center',
      width: 80,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết"
              onClick={() => {
                dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
                dispatch(actionsModal.setModalVisible(true));
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
          </div >
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IDeXuatDeTai>
            dataSource={data}
            columns={columns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
          />
        </div>
      </div>
      {modalVisible ? <DeXuatDeTaiDetailModal totalCount={totalCount} /> : <></>}
    </>
  );
};
