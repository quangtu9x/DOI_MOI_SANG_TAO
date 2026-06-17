import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult, IHoSoSangKien, ActionModalConfig, TrangThaiHoSoSangKien } from '@/models';
import { ActionModal, TDTable } from '@/app/components';
import { useThongKeBaoCaoTable } from './useThongKeBaoCaoTable';
import { ThongKeBaoCaoDetailModal } from './ThongKeBaoCaoDetailModal';
import { TRANG_THAI_HO_SO_SANG_KIEN } from '@/data/sang-kien';

interface HoSoSangKienTableProps {
  searchData?: SearchData;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
}

export const ThongKeBaoCaoTable: React.FC<HoSoSangKienTableProps> = ({ searchData, selectedRowKeys, setSelectedRowKeys }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [actionConfig, setActionConfig] = React.useState<ActionModalConfig | null>(null);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useThongKeBaoCaoTable({ searchData });

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => setSelectedRowKeys(newSelectedRowKeys),
    type: 'radio' as const,
    getCheckboxProps: (record: IHoSoSangKien) => ({
      disabled: record.trangThai !== TrangThaiHoSoSangKien.DuocCongNhan,
    }),
  };

  const handleAction = useCallback(
    async (type: string, record: IHoSoSangKien): Promise<void> => {
      try {
        switch (type) {
          case 'detail': {
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          }
          case 'delete': {
            const response = await requestDELETE<IResult<boolean>>(`HoSoSangKiens/${record.id}`);
            if (response?.data?.succeeded) {
              toast.success('Xóa thành công!');
              dispatch(actionsGlobal.setRandom());
            } else {
              toast.error(response?.data?.message || 'Xóa thất bại, vui lòng thử lại!');
            }
            break;
          }

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
            dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
            dispatch(actionsModal.setModalVisible(true));
          }}
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
                handleAction(`detail`, { ...record, readOnly: true });
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
      {modalVisible ? <ThongKeBaoCaoDetailModal totalCount={totalCount} /> : <></>}
      {actionConfig && (
        <ActionModal
          config={actionConfig}
          onClose={() => setActionConfig(null)}
          onSuccess={() => {
            dispatch(actionsGlobal.setRandom());
            setActionConfig(null);
          }}
        />
      )}
    </>
  );
};

