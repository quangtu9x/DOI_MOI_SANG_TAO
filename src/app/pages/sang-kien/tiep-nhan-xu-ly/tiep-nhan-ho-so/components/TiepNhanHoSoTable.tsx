import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, MenuProps } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult, IHoSoSangKien, ActionModalConfig, TrangThaiHoSoSangKien, ActionModalType } from '@/models';
import { ActionModal, TDTable } from '@/app/components';
import { useTiepNhanHoSoTable } from './useTiepNhanHoSoTable';
import { TiepNhanHoSoDetailModal } from './TiepNhanHoSoDetailModal';
import { TRANG_THAI_HO_SO_SANG_KIEN } from '@/data/sang-kien';
import { NhanXetHoSoModal } from './NhanXetHoSoModal';
import { TrungLapHoSoModal } from './TrungLapHoSoModal';

interface HoSoSangKienTableProps {
  searchData?: SearchData;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
}

export const TiepNhanHoSoTable = forwardRef<any, HoSoSangKienTableProps>(({ searchData, selectedRowKeys, setSelectedRowKeys }, ref) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [actionConfig, setActionConfig] = React.useState<ActionModalConfig | null>(null);
  const [nhanXetRecord, setNhanXetRecord] = React.useState<IHoSoSangKien | null>(null);
  const [nhanXetVisible, setNhanXetVisible] = React.useState(false);
  const [trungLapRecord, setTrungLapRecord] = React.useState<IHoSoSangKien | null>(null);
  const [trungLapVisible, setTrungLapVisible] = React.useState(false);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useTiepNhanHoSoTable({ searchData });

  useImperativeHandle(ref, () => ({
    handleBulkAction: (type: 'approve' | 'reject' | 'requestInfo') => {
      if (type === 'approve') {
        setActionConfig({
          type: ActionModalType.Confirm,
          visible: true,
          title: 'Đồng ý tiếp nhận hồ sơ sáng kiến',
          apiEndpoint: 'HoSoSangKiens/trang-thai-multi',
          payload: { ids: selectedRowKeys, trangThai: TrangThaiHoSoSangKien.DaTiepNhan },
          message: `Bạn có chắc chắn đồng ý tiếp nhận các hồ sơ sáng kiến đã chọn không?`,
        });
      } else if (type === 'reject') {
        setActionConfig({
          type: ActionModalType.Reject,
          visible: true,
          title: 'Từ chối tiếp nhận hồ sơ sáng kiến',
          apiEndpoint: 'HoSoSangKiens/trang-thai-multi',
          payload: { ids: selectedRowKeys, trangThai: TrangThaiHoSoSangKien.TuChoiTiepNhan },
          fieldName: "ghiChu",
          fieldLabel: "Lý do từ chối",
        });
      } else if (type === 'requestInfo') {
        setActionConfig({
          type: ActionModalType.Reject,
          visible: true,
          title: 'Yêu cầu bổ sung hồ sơ',
          apiEndpoint: 'HoSoSangKiens/trang-thai-multi',
          payload: { ids: selectedRowKeys, trangThai: TrangThaiHoSoSangKien.YeuCauBoSung },
          fieldName: "ghiChu",
          fieldLabel: "Nội dung yêu cầu bổ sung",
        });
      }
    }
  }));

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: IHoSoSangKien) => ({
      disabled: record.trangThai !== TrangThaiHoSoSangKien.ChoTiepNhan,
      name: record.ten,
    }),
  };

  const handleAction = useCallback(
    async (type: string, record: IHoSoSangKien): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'edit':
            dispatch(actionsModal.setDataModal({ ...record, readOnly: false }));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`HoSoSangKiens/${record.id}`);
            if (response?.data?.succeeded) {
              toast.success('Xóa thành công!');
              dispatch(actionsGlobal.setRandom());
            } else {
              toast.error(response?.data?.message || 'Xóa thất bại, vui lòng thử lại!');
            }
            break;
          case 'comment':
            setNhanXetRecord(record);
            setNhanXetVisible(true);
            break;
          case 'duplicate':
            setTrungLapRecord(record);
            setTrungLapVisible(true);
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
      width: 160,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Nhận xét tính mới, nội dung giải pháp, kết quả, khả năng áp dụng, lợi ích"
              onClick={() => {
                handleAction('comment', record);
              }}
            >
              <i className="fa-regular fa-message-lines"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem danh sách các sáng kiến trùng lặp"
              onClick={() => {
                handleAction('duplicate', record);
              }}
            >
              <i className="fa-regular fa-copy"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Sửa hồ sơ sáng kiến"
              onClick={() => {
                handleAction('edit', record);
              }}
            >
              <i className="fa-regular fa-pen-to-square"></i>
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
      {modalVisible ? <TiepNhanHoSoDetailModal totalCount={totalCount} /> : <></>}
      <NhanXetHoSoModal
        record={nhanXetRecord}
        visible={nhanXetVisible}
        onClose={() => {
          setNhanXetVisible(false);
          setNhanXetRecord(null);
        }}
        onSuccess={() => {
          dispatch(actionsGlobal.setRandom());
          setNhanXetVisible(false);
          setNhanXetRecord(null);
        }}
      />
      <TrungLapHoSoModal
        record={trungLapRecord}
        visible={trungLapVisible}
        onClose={() => {
          setTrungLapVisible(false);
          setTrungLapRecord(null);
        }}
      />
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


