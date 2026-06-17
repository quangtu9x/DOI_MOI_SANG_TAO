import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult, IKeHoach, TrangThaiDuyet } from '@/models';
import { TDTable } from '@/app/components';
import { useKeHoachChoDuyetTable } from './useKeHoachChoDuyetTable';
import { KeHoachChoDuyetDetailModal } from './KeHoachChoDuyetDetailModal';
import { LOAI_BANGS, TRANG_THAIS } from '@/data';
import { formatNumber } from '@/utils/utils';

interface KeHoachChoDuyetTableProps {
  searchData?: SearchData;
  selectedRowKeys?: React.Key[];
  setSelectedRowKeys?: (keys: React.Key[]) => void;
}

export const KeHoachChoDuyetTable: React.FC<KeHoachChoDuyetTableProps> = ({ searchData, selectedRowKeys, setSelectedRowKeys }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisibleCapHai = useSelector((state: RootState) => state.modal.modalVisibleCapHai);
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useKeHoachChoDuyetTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IKeHoach): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModalCapHai(record));
            dispatch(actionsModal.setModalVisibleCapHai(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`KeHoachs/${record.id}`);
            if (response?.data?.succeeded) {
              toast.success('Xóa thành công!');
              dispatch(actionsGlobal.setRandom());
            } else {
              toast.error(response?.data?.message || 'Xóa thất bại, vui lòng thử lại!');
            }
            break;

          default:
            break;
        }
      } catch (error) {
        console.error('Error handling action:', error);
        toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
      }
    },
    [dispatch]
  );

  const columns: TableProps<IKeHoach>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tên',
      dataIndex: 'ten',
      key: 'ten',
      render: (text, record) => {
        return <a
          className="fw-bold"
          data-toggle="m-tooltip"
          title={`Bấm để xem chi tiết`}
          style={{ textAlign: "center" }}
          onClick={() => {
            dispatch(actionsModal.setDataModalCapHai({ ...record, readOnly: true }));
            dispatch(actionsModal.setModalVisibleCapHai(true));
          }}
        >
          {text}
        </a>
      }
    },
    {
      title: 'Thời gian thực hiện',
      dataIndex: 'thoiGianThucHien',
      key: 'thoiGianThucHien',
      className: 'text-center',
    },
    {
      title: 'Phân loại',
      dataIndex: 'phanLoai',
      key: 'phanLoai',
      render: (text, record) => LOAI_BANGS.find(item => item.id === record.phanLoai)?.name || ''
    },

    {
      title: 'Nhu cầu kinh phí (VNĐ)',
      dataIndex: 'nhuCauKinhPhi',
      key: 'nhuCauKinhPhi',
      className: 'text-center',
      render: data => formatNumber(data),
    },

    searchData?.trangThai == TrangThaiDuyet.DaDuyet && {
      title: 'Dự toán được duyệt (VNĐ)',
      dataIndex: 'duToanDuocDuyet',
      key: 'duToanDuocDuyet',
      className: 'text-center',
      render: data => formatNumber(data),
    },

    searchData?.trangThai == TrangThaiDuyet.TuChoi && {
      title: 'Lý do từ chối',
      dataIndex: 'lyDoTuChoi',
      key: 'lyDoTuChoi',
    },

    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      className: 'text-center',
      render: (text, record) => {
        const trangThai = TRANG_THAIS.find(item => item.id === record.trangThai);
        return (
          <span className={trangThai ? trangThai.className : 'badge badge-light-secondary'}>
            {trangThai ? trangThai.name : 'Chưa xác định'}
          </span>
        );
      }
    },

    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      className: 'text-center',
      width: 100,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết"
              onClick={() => {
                handleAction(`detail`, { ...record, readOnly: true });
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>

          </div >
        );
      },
    },
  ].filter(Boolean) as TableProps<IKeHoach>['columns'];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys?.(keys);
    },
    type: searchData?.trangThai === TrangThaiDuyet.ChoDuyet ? 'radio' : 'checkbox',
  } as any;



  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IKeHoach>
            dataSource={data}
            columns={columns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
            rowSelection={selectedRowKeys ? rowSelection : undefined}
          />
        </div>
      </div>
      {modalVisibleCapHai ? <KeHoachChoDuyetDetailModal totalCount={totalCount} /> : <></>}
    </>
  );
};

