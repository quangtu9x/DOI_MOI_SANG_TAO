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
import { IResult, IThuyetMinhKHCN } from '@/models';
import { TDTable } from '@/app/components';
import { useThuyetMinhKHCNTable } from './useThuyetMinhKHCNTable';
import { ThuyetMinhKHCNDetailModal } from './ThuyetMinhKHCNDetailModal';
import { formatNumber, toViewDateString } from '@/utils/utils';
import { PHUONG_THUC_KHOAN, TRANG_THAI_DE_XUAT } from '@/data';

interface ThuyetMinhKHCNTableProps {
  searchData?: SearchData;
}

export const ThuyetMinhKHCNTable: React.FC<ThuyetMinhKHCNTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useThuyetMinhKHCNTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IThuyetMinhKHCN): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`ThuyetMinhKHCNs/${record.id}`);
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

  const columns: TableProps<IThuyetMinhKHCN>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tên nhiệm vụ',
      dataIndex: 'nhiemVuTen',
      key: 'nhiemVuTen',
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
      title: 'Cấp quản lý',
      dataIndex: 'capQuanLyTen',
      key: 'capQuanLyTen',
      width: '15%',
      className: 'text-center',
    },

    {
      title: 'Tình trạng nhiệm vụ',
      dataIndex: 'tinhTrangNhiemVuTen',
      key: 'tinhTrangNhiemVuTen',
      className: 'text-center',
      width: '15%',
    },
    {
      title: "Thời gian",
      dataIndex: "thoiGian",
      key: "thoiGian",
      className: "text-center",
      render: (data, record) => (
        <i className="">
          <span className='fw-semibold me-2'>Từ:</span><span className=''>{toViewDateString(record.ngayBatDau)}</span>
          <br></br>
          <span className='fw-semibold me-2'>đến:</span><span className=''>{toViewDateString(record.ngayKetThuc)}</span>
        </i>
      )
    },
    {
      title: 'Phương thức khoán chi',
      dataIndex: 'phuongThucKhoan',
      key: 'phuongThucKhoan',
      className: 'text-center',
      width: '15%',
      render: data => PHUONG_THUC_KHOAN.find(p => p.id === data)?.name || '',
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
          <TDTable<IThuyetMinhKHCN>
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
      {modalVisible ? <ThuyetMinhKHCNDetailModal totalCount={totalCount} /> : <></>}
    </>
  );
};

