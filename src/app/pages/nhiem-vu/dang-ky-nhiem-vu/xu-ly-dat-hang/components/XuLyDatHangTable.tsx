import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, MenuProps, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult, IDatHangNhiemVu, TrangThaiDatHang, ActionModalConfig, ActionModalType } from '@/models';
import { ActionModal, TDTable } from '@/app/components';
import { useXuLyDatHangTable } from './useXuLyDatHangTable';
import { formatNumber } from '@/utils/utils';
import { TRANG_THAI_DAT_HANG } from '@/data';
import { DatHangNhiemVuDetailModal } from '../../dat-hang-nhiem-vu/components/DatHangNhiemVuDetailModal';

interface XuLyDatHangTableProps {
  searchData?: SearchData;
}

export const XuLyDatHangTable: React.FC<XuLyDatHangTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [actionConfig, setActionConfig] = React.useState<ActionModalConfig | null>(null);
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useXuLyDatHangTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IDatHangNhiemVu): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`XuLyDatHangs/${record.id}`);
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

  const columns: TableProps<IDatHangNhiemVu>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tên nhiệm vụ đặt hàng',
      dataIndex: 'ten',
      key: 'ten',
      render: (text, record) => {
        return <a
          className="fw-bold"
          data-toggle="m-tooltip"
          title={`Bấm để xem chi tiết`}
          style={{ textAlign: "center" }}
          onClick={() => {
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
          }}
        >
          {text}
        </a>
      }
    },
    {
      title: 'Đợt đặt hàng',
      dataIndex: 'dotDangKyTen',
      key: 'dotDangKyTen',
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
        const trangThai = TRANG_THAI_DAT_HANG.find(item => item.id === data);
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
      width: 100,
      render: (text, record) => {
        const items: MenuProps['items'] = [
          {
            label: (
              <a
                className="e-1 p-2"
                data-toggle="m-tooltip"
                title="Đồng ý tiếp nhận"
                onClick={() => {
                  setActionConfig({
                    type: ActionModalType.Confirm,
                    visible: true,
                    title: 'Đồng ý tiếp nhận đặt hàng nhiệm vụ',
                    apiEndpoint: 'dathangnhiemvus/trang-thai',
                    payload: { id: record.id, trangThai: TrangThaiDatHang.DaTiepNhan },
                    message: 'Bạn có chắc chắn đồng ý tiếp nhận đặt hàng nhiệm vụ này không?',
                  });
                }}
                style={{
                  border: 'none',
                  padding: '4px 8px',
                  background: 'transparent',
                  color: '#181C32'
                }}
              >
                <i className="fa-regular fa-circle-check me-2" style={{ fontSize: '16px', color: '#181C32' }}></i>
                Đồng ý tiếp nhận
              </a>
            ),
            key: '1',
          },
          {
            label: (
              <a
                className="e-1 p-2"
                data-toggle="m-tooltip"
                title="Từ chối tiếp nhận"
                onClick={() => {
                  setActionConfig({
                    type: ActionModalType.Reject,
                    visible: true,
                    title: 'Từ chối tiếp nhận đặt hàng nhiệm vụ',
                    apiEndpoint: 'dathangnhiemvus/trang-thai',
                    payload: { id: record.id, trangThai: TrangThaiDatHang.TuChoi },
                    fieldName: "lyDoTuChoi",
                    fieldLabel: "Lý do từ chối",
                  });
                }}
                style={{
                  border: 'none',
                  padding: '4px 8px',
                  background: 'transparent',
                  color: '#181C32'
                }}
              >
                <i className="fa-regular fa-ban me-2" style={{ fontSize: '16px', color: '#181C32' }}></i>
                Từ chối tiếp nhận
              </a>
            ),
            key: '2',
          },

        ].filter(Boolean) as MenuProps['items'];
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết"
              onClick={() => {
                handleAction(`detail`, {
                  ...record, readOnly: true
                });
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
            {record.trangThai === TrangThaiDatHang.ChoDuyet && (
              <Dropdown className='dropdown-in-table' menu={{ items }} trigger={['click']}>
                <a onClick={(e) => e.preventDefault()}>
                  <i className="fas fa-ellipsis-h" style={{ fontSize: '16px', color: '#181C32' }}></i>
                </a>
              </Dropdown>
            )}


          </div >
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IDatHangNhiemVu>
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
      {modalVisible ? <DatHangNhiemVuDetailModal totalCount={totalCount} /> : <></>}
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

