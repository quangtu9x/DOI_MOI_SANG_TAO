import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { ActionModalConfig, ActionModalType, IResult, INghiemThuKhoiLuong } from '@/models';
import { ActionModal, TDTable } from '@/app/components';
import { useNghiemThuKhoiLuongTable } from './useNghiemThuKhoiLuongTable';
import { NghiemThuKhoiLuongDetailModal } from './NghiemThuKhoiLuongDetailModal';
import { formatNumber, toViewDateString } from '@/utils/utils';

interface NghiemThuKhoiLuongTableProps {
  searchData?: SearchData;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
}

export interface NghiemThuKhoiLuongTableHandle {
  handleBulkAction: (type: 'approve' | 'reject') => void;
}

export const NghiemThuKhoiLuongTable = forwardRef<NghiemThuKhoiLuongTableHandle, NghiemThuKhoiLuongTableProps>(({ searchData, selectedRowKeys, setSelectedRowKeys }, ref) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [actionConfig, setActionConfig] = React.useState<ActionModalConfig | null>(null);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useNghiemThuKhoiLuongTable({ searchData });

  useImperativeHandle(ref, () => ({
    handleBulkAction: (type: 'approve' | 'reject') => {
      if (type === 'approve') {
        setActionConfig({
          type: ActionModalType.Confirm,
          visible: true,
          title: 'Phê duyệt khối lượng công việc hoàn thành',
          apiEndpoint: 'NghiemThuKhoiLuongs/trang-thai-multi',
          payload: { ids: selectedRowKeys, chuyenVienDaDuyet: true },
          message: 'Bạn có chắc chắn phê duyệt các bản ghi nghiệm thu khối lượng đã chọn không?',
        });
      } else {
        setActionConfig({
          type: ActionModalType.Reject,
          visible: true,
          title: 'Từ chối khối lượng công việc hoàn thành',
          apiEndpoint: 'NghiemThuKhoiLuongs/trang-thai-multi',
          payload: { ids: selectedRowKeys, chuyenVienDaDuyet: false },
          fieldName: 'yKienChuyenVien',
          fieldLabel: 'Lý do từ chối',
          attachmentFieldName: 'dinhKem',
          attachmentFieldLabel: 'Đính kèm',
        });
      }
    },
  }));

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: INghiemThuKhoiLuong) => ({
      disabled: record.chuyenVienDaDuyet !== null && record.chuyenVienDaDuyet !== undefined,
      name: record.keHoachHopDongTen ?? record.hopDongTen ?? record.id,
    }),
  };

  const handleAction = useCallback(
    async (type: string, record: INghiemThuKhoiLuong): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete': {
            const response = await requestDELETE<IResult<boolean>>(`NghiemThuKhoiLuongs/${record.id}`);
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

  const columns: TableProps<INghiemThuKhoiLuong>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Kế hoạch hợp đồng',
      dataIndex: 'keHoachHopDongTen',
      key: 'keHoachHopDongTen',
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
      title: 'Hợp đồng',
      dataIndex: 'hopDongTen',
      key: 'hopDongTen',
      className: 'text-left',
      width: '20%',
    },
    {
      title: 'Ngày nghiệm thu',
      dataIndex: 'ngayNghiemThu',
      key: 'ngayNghiemThu',
      className: 'text-center',
      width: '12%',
      render: data => toViewDateString(data),
    },
    {
      title: 'Khối lượng được duyệt (%)',
      dataIndex: 'khoiLuongDuocDuyet',
      key: 'khoiLuongDuocDuyet',
      className: 'text-center',
      width: '12%',
      render: data => formatNumber(data),
    },

    {
      title: 'Số tiền đề nghị thanh toán (VNĐ)',
      dataIndex: 'soTienDeNghiThanhToan',
      key: 'soTienDeNghiThanhToan',
      className: 'text-center',
      width: '12%',
      render: data => formatNumber(data),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'chuyenVienDaDuyet',
      key: 'chuyenVienDaDuyet',
      className: 'text-center',
      width: '12%',
      render: data => {
        if (data === true) {
          return <span className="badge badge-light-success">Đã phê duyệt</span>;
        }

        if (data === false) {
          return <span className="badge badge-light-danger">Từ chối</span>;
        }

        return <span className="badge badge-light-warning">Chờ phê duyệt</span>;
      },
    },

    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      className: 'text-center',
      width: 140,
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
            <a
              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Chỉnh sửa"
              onClick={() => {
                handleAction(`detail`, record);
              }}
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </a>
            <Popconfirm
              title="Xoá?"
              onConfirm={() => {
                handleAction(`delete`, record);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
                <i className="fa-regular fa-trash"></i>
              </a>
            </Popconfirm>
          </div >
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<INghiemThuKhoiLuong>
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
      {modalVisible ? <NghiemThuKhoiLuongDetailModal totalCount={totalCount} /> : <></>}
      {actionConfig && (
        <ActionModal
          config={actionConfig}
          onClose={() => setActionConfig(null)}
          onSuccess={() => {
            dispatch(actionsGlobal.setRandom());
            setSelectedRowKeys([]);
            setActionConfig(null);
          }}
        />
      )}
    </>
  );
});

