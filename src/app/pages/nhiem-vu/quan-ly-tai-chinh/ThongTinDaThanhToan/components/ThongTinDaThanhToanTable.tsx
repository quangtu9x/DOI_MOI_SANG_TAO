import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IThongTinDaThanhToan, IResult } from '@/models';
import { TDTable } from '@/app/components';
import { useThongTinDaThanhToanTable } from './useThongTinDaThanhToanTable';
import { formatNumber, toViewDateString } from '@/utils/utils';

interface ThongTinDaThanhToanTableProps {
  searchData?: SearchData;
}

export const ThongTinDaThanhToanTable: React.FC<ThongTinDaThanhToanTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useThongTinDaThanhToanTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IThongTinDaThanhToan): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModalCapMot(record));
            dispatch(actionsModal.setModalVisibleCapMot(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`ThongTinDaThanhToans/${record.id}`);
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

  const columns: TableProps<IThongTinDaThanhToan>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'ngayThanhToan',
      key: 'ngayThanhToan',
      className: 'text-center',
      render: (data, record) => {
        return (
          <a
            className="fw-bold"
            onClick={() => {
              dispatch(actionsModal.setDataModalCapMot({ ...record, readOnly: true } as any));
              dispatch(actionsModal.setModalVisibleCapMot(true));
            }}
          >
            {toViewDateString(data)}
          </a>
        );
      },
    },
    {
      title: 'Số tiền thanh toán',
      dataIndex: 'soTienThanhToan',
      key: 'soTienThanhToan',
      className: 'text-center',
      render: data => formatNumber(data),
    },
    {
      title: 'Số tiền tạm ứng đã khấu trừ',
      dataIndex: 'soTienTamUngDaKhauTru',
      key: 'soTienTamUngDaKhauTru',
      className: 'text-center',
      render: data => formatNumber(data),
    },
    {
      title: 'Số tiền thực nhận',
      dataIndex: 'soTienThucNhan',
      key: 'soTienThucNhan',
      className: 'text-center',
      render: data => formatNumber(data),
    },
    {
      title: 'Số chứng từ',
      dataIndex: 'soChungTu',
      key: 'soChungTu',
      className: 'text-center',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
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
                handleAction(`detail`, { ...record, readOnly: true } as any);
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
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
          </div>
        );
      },
    },
  ];
  return (
    <div className="card-body card-dashboard px-3 py-3">
      <div className="card-dashboard-body table-responsive">
        <TDTable<IThongTinDaThanhToan>
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
