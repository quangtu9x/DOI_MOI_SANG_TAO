import React, { useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableProps } from 'antd/es/table';
import { toast } from 'react-toastify';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IHoSoSangKien } from '@/models';
import { TDTable } from '@/app/components';
import { useDanhGiaSangKienTable } from './useDanhGiaSangKienTable';
import { DanhGiaSangKienDetailModal } from './DanhGiaSangKienDetailModal';
import { useAuth } from '@/app/modules/auth';
import { requestDownloadFile } from '@/utils/baseAPI';
import { saveBlobAsFile } from '@/utils/utils';

interface DanhGiaSangKienTableProps {
  searchData?: SearchData;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
}

const isSameId = (first?: string | null, second?: string | null): boolean =>
  !!first && !!second && first.toLowerCase() === second.toLowerCase();

export interface DanhGiaSangKienTableRef {
  handleAction: (type: string, recordOrId: IHoSoSangKien | React.Key) => Promise<void>;
  handleExport: (fileType: 'word' | 'excel' | 'pdf') => Promise<void>;
}

export const DanhGiaSangKienTable = forwardRef<DanhGiaSangKienTableRef, DanhGiaSangKienTableProps>(({ searchData, selectedRowKeys, setSelectedRowKeys }, ref) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const { currentUser } = useAuth();

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useDanhGiaSangKienTable({ searchData });
  const isDaDanhGia = useCallback(
    (record: IHoSoSangKien) =>
      record?.phieuDanhGiaSangKiens?.some(p => isSameId(p.nguoiDanhGiaId, currentUser?.id)) ?? false,
    [currentUser?.id]
  );

  const handleAction = useCallback(
    async (type: string, recordOrId: IHoSoSangKien | React.Key): Promise<void> => {
      try {
        switch (type) {
          case 'evaluate': {
            let record: IHoSoSangKien | undefined;
            if (typeof recordOrId === 'string' || typeof recordOrId === 'number') {
              record = data.find(x => x.id === recordOrId);
            } else {
              record = recordOrId as IHoSoSangKien;
            }

            if (record) {
              dispatch(actionsModal.setDataModal({
                hoSoId: record.id,
                hoSoSangKienId: record.id,
                hoSoSangKienTen: record.ten
              }));
              dispatch(actionsModal.setModalVisible(true));
            }
            break;
          }
          default:
            break;
        }
      } catch (error) {
        console.error('Error handling action:', error);
      }
    },
    [dispatch, data]
  );

  useImperativeHandle(ref, () => ({
    handleAction,
    handleExport: async (fileType: 'word' | 'excel' | 'pdf') => {
      if (selectedRowKeys.length === 0) {
        toast.warning('Vui lòng chọn hồ sơ sáng kiến đã đánh giá để xuất phiếu!');
        return;
      }

      const selectedRecords = data.filter(item => selectedRowKeys.includes(item.id));
      const invalidRecords = selectedRecords.filter(item => !isDaDanhGia(item));
      if (invalidRecords.length > 0) {
        toast.warning('Chỉ được xuất phiếu các hồ sơ có trạng thái Đã đánh giá!');
        return;
      }

      const response = await requestDownloadFile('PhieuDanhGiaSangKiens/export', {
        hoSoSangKienIds: selectedRecords.map(item => item.id),
        fileType,
      });

      if (response?.status === 200) {
        saveBlobAsFile(response);
      } else {
        toast.error('Xuất phiếu đánh giá thất bại!');
      }
    }
  }));

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    type: 'checkbox' as const,
    getCheckboxProps: (record: IHoSoSangKien) => ({
      disabled: isDaDanhGia(record),
    }),
  };

  const columns: TableProps<IHoSoSangKien>['columns'] = useMemo(() => [
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
          title={`Bấm để xem chi tiết`}
          style={{ textAlign: "center" }}
          onClick={() => {
            const phieu = record.phieuDanhGiaSangKiens?.find(p => isSameId(p.nguoiDanhGiaId, currentUser?.id));
            dispatch(actionsModal.setDataModal({
              id: phieu?.id,
              hoSoId: record.id,
              hoSoSangKienId: record.id,
              hoSoSangKienTen: record.ten,
              nguoiDanhGiaId: currentUser?.id,
              readOnly: !!phieu,
            }));
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
      title: 'Tổng điểm',
      dataIndex: 'tongDiem',
      key: 'tongDiem',
      className: 'text-center',
      width: '10%',
      render: (_, record) => {
        const phieu = record.phieuDanhGiaSangKiens?.find(p => isSameId(p.nguoiDanhGiaId, currentUser?.id));
        return phieu?.tongDiem ?? '-';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'daDanhGia',
      key: 'daDanhGia',
      className: 'text-center',
      width: '12%',
      render: (_, record) => {
        const daDanhGia = isDaDanhGia(record);
        return (
          <span className={daDanhGia ? 'badge badge-light-success' : 'badge badge-light-warning'}>
            {daDanhGia ? 'Đã đánh giá' : 'Chưa đánh giá'}
          </span>
        );
      },
    },
  ], [currentPage, pageSize, currentUser?.id, dispatch, isDaDanhGia]);

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
      {modalVisible ? <DanhGiaSangKienDetailModal totalCount={totalCount} /> : <></>}
    </>
  );
});
