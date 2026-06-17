import React, { useCallback } from 'react';
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
import { IResult, IGiayChungNhanSangKien } from '@/models';
import { TDTable } from '@/app/components';
import { useGiayChungNhanSangKienTable } from './useGiayChungNhanSangKienTable';
import { GiayChungNhanSangKienDetailModal } from './GiayChungNhanSangKienDetailModal';
import { toViewDateString } from '@/utils/utils';

interface GiayChungNhanSangKienTableProps {
  searchData?: SearchData;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
  setSelectedRows: (rows: IGiayChungNhanSangKien[]) => void;
}

export const GiayChungNhanSangKienTable: React.FC<GiayChungNhanSangKienTableProps> = ({
  searchData,
  selectedRowKeys,
  setSelectedRowKeys,
  setSelectedRows,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useGiayChungNhanSangKienTable({ searchData });

  const rowSelection = {
    selectedRowKeys,
    type: 'radio' as const,
    onChange: (keys: React.Key[], rows: IGiayChungNhanSangKien[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  const handleAction = useCallback(
    async (type: string, record: IGiayChungNhanSangKien): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`GiayChungNhanSangKiens/${record.id}`);
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

  const columns: TableProps<IGiayChungNhanSangKien>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Hồ sơ sáng kiến',
      dataIndex: 'hoSoSangKienTen',
      key: 'hoSoSangKienTen',
      render: (text, record) => {
        const hoSos = record.hoSoSangKiens?.length ? record.hoSoSangKiens : text ? [{ id: record.hoSoSangKienId ?? 'legacy', ten: text }] : [];
        const visibleHoSos = hoSos.slice(0, 3);
        const remainCount = hoSos.length - visibleHoSos.length;

        return (
          <div className="d-flex flex-column gap-1">
            {visibleHoSos.map(item => (
              <div key={item.id} className="text-truncate" title={item.ten ?? ''}>
                {item.ten}
              </div>
            ))}
            {remainCount > 0 && <div className="text-muted">... (+{remainCount} hồ sơ còn lại)</div>}
          </div>
        );
      },
    },

    {
      title: "Số giấy chứng nhận",
      dataIndex: "soGCN",
      key: "soGCN",
      className: "text-center",
      width: '20%',
    },
    {
      title: 'Ngày công nhận',
      dataIndex: 'ngayCongNhan',
      key: 'ngayCongNhan',
      className: 'text-center',
      width: '20%',
      render: data => toViewDateString(data),
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
              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1"
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
          <TDTable<IGiayChungNhanSangKien>
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
      {modalVisible ? <GiayChungNhanSangKienDetailModal /> : <></>}
    </>
  );
};

