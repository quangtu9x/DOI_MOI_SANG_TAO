import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Popconfirm, Tag } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IPhieuDeNghiThanhToan, IResult, TrangThaiPhieu } from '@/models';
import { TDTable } from '@/app/components';
import { usePhieuDeNghiThanhToanTable } from './usePhieuDeNghiThanhToanTable';
import { formatNumber, toViewDateString } from '@/utils/utils';

interface PhieuDeNghiThanhToanTableProps {
  searchData?: SearchData;
  readOnly?: boolean;
}

export const PhieuDeNghiThanhToanTable: React.FC<PhieuDeNghiThanhToanTableProps> = ({ searchData, readOnly }) => {
  const dispatch: AppDispatch = useDispatch();

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    usePhieuDeNghiThanhToanTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IPhieuDeNghiThanhToan): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'payment':
            dispatch(actionsModal.setDataModalCapMot({ phieuDeNghiThanhToanId: record.id }));
            dispatch(actionsModal.setModalVisibleCapMot(true));
            break;
          case 'delete': {
            const response = await requestDELETE<IResult<boolean>>(`PhieuDeNghiThanhToans/${record.id}`);
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

  const columns: TableProps<IPhieuDeNghiThanhToan>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Mã phiếu',
      dataIndex: 'maPhieu',
      key: 'maPhieu',
      className: 'text-center',
      render: (text, record) => {
        return (
          <a
            className="fw-bold"
            onClick={() => {
              dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
              dispatch(actionsModal.setModalVisible(true));
            }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: 'Ngày lập',
      dataIndex: 'ngayLap',
      key: 'ngayLap',
      className: 'text-center',
      width: 120,
      render: data => toViewDateString(data),
    },
    {
      title: 'Số tiền đề nghị',
      dataIndex: 'soTienDeNghi',
      key: 'soTienDeNghi',
      className: 'text-end',
      render: data => formatNumber(data),
    },
    {
      title: 'Đợt',
      dataIndex: 'dotThanhToan',
      key: 'dotThanhToan',
      className: 'text-center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      className: 'text-center',
      render: (trangThai: TrangThaiPhieu) => {
        switch (trangThai) {
          case TrangThaiPhieu.ChoDuyet:
            return <Tag color="warning">Chờ duyệt</Tag>;
          case TrangThaiPhieu.DaDuyet:
            return <Tag color="success">Đã duyệt</Tag>;
          case TrangThaiPhieu.TuChoi:
            return <Tag color="error">Từ chối</Tag>;
          default:
            return null;
        }
      },
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      className: 'text-center',
      width: 150,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              title="Xem chi tiết"
              onClick={() => {
                handleAction(`detail`, { ...record, readOnly: true });
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
            {!readOnly && (
              <>
                <a
                  className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1"
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
                  <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" title="Xoá">
                    <i className="fa-regular fa-trash"></i>
                  </a>
                </Popconfirm>
              </>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <div className="card-body card-dashboard px-3 py-3">
      <div className="card-dashboard-body table-responsive">
        <TDTable<IPhieuDeNghiThanhToan>
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
  );
};
