/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IInvestor } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { deleteInvestor } from '@/services/investor.service';
import { useInvestorTable } from '../hooks/useInvestorTable';

interface InvestorTableProps {
  searchData?: SearchData;
}

export const InvestorTable: React.FC<InvestorTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useInvestorTable({ searchData });
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const handleAction = async (type: string, record: IInvestor): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModal(record));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'delete':
          await deleteInvestor(record.id!);
          toast.success('Xóa thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const columns: TableProps<IInvestor>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Người đại diện',
      dataIndex: 'representative',
      key: 'representative',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      width: 150,
      title: 'Thao tác',
      className: 'text-center',
      fixed: 'right',
      render: (text, record) => {
        return (
          <div className="d-flex justify-content-center gap-2">
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('view', record)}
              title="Xem chi tiết"
            >
              <i className="fa-regular fa-eye"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
              onClick={() => handleAction('edit', record)}
              title="Sửa"
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </a>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa chủ đầu tư này?"
              onConfirm={() => handleAction('delete', record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm" title="Xóa">
                <i className="fa-regular fa-trash"></i>
              </a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IInvestor>
            dataSource={data}
            columns={columns}
            isPagination={true}
            pageSize={pageSize}
            count={totalCount}
            offset={currentPage}
            setOffset={setCurrentPage}
            setPageSize={setPageSize}
            loading={loading}
            rowKey="id"
          />
        </div>
      </div>
    </>
  );
};
