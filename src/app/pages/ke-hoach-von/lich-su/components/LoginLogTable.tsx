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
import { IResult, ILoginLog } from '@/models';
import { TDTable } from '@/app/components';
import { useLoginLogTable } from './useLoginLogTable';
import { LoginLogModal } from './LoginLogModal';
import dayjs from 'dayjs';

interface LoginLogProps {
  searchData?: SearchData;
}

export const LoginLogTable: React.FC<LoginLogProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useLoginLogTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: ILoginLog): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`loginlogs/${record.id}`);
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

  const columns: TableProps<ILoginLog>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tài khoản',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Tên hiển thị',
      dataIndex: 'fullName',
      key: 'fullName',
      className: 'text-center',
    },

    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
      className: 'text-center',
      render: ip => <code className="text-primary">{ip}</code>
    },
    {
      title: 'Thông tin',
      dataIndex: 'userAgent',
      key: 'userAgent',
      width: '40%',
      render: (text, record) => (
        <div>
          <div className="me-2 badge badge-light-primary">{record?.operatingSystem}</div>
          <div className="me-2 badge badge-light-danger">{record?.browserName}</div>
          <span>{record?.userAgent}</span>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdOn',
      key: 'createdOn',
      className: 'text-center',
      render: (text, record) => <div>{record.createdOn ? dayjs(record.createdOn).format('DD/MM/YYYY HH:mm') : ''}</div>,
    },

    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 150,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết"
              onClick={() => {
                handleAction(`detail`, record);
              }}
            >
              <i className="fa-regular fa-eye"></i>
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
          </div>
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<ILoginLog>
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
      {modalVisible ? <LoginLogModal /> : <></>}
    </>
  );
};
