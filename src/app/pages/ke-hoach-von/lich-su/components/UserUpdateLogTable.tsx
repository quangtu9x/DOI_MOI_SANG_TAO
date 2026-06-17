import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IUserUpdateLog, UserUpdateActionType } from '@/models';
import { TDTable } from '@/app/components';
import { useUserUpdateLogTable } from './useUserUpdateLogTable';
import { UserUpdateLogModal } from './UserUpdateLogModal';
import dayjs from 'dayjs';

interface UserUpdateLogTableProps {
  searchData?: SearchData;
  userId?: string;
}

const getActionTypeLabel = (actionType: string): string => {
  switch (actionType) {
    case UserUpdateActionType.ProfileUpdated:
      return 'Cập nhật profile';
    case UserUpdateActionType.PasswordChanged:
      return 'Đổi mật khẩu';
    case UserUpdateActionType.PermissionsUpdated:
      return 'Cập nhật quyền';
    case UserUpdateActionType.RolesUpdated:
      return 'Cập nhật vai trò';
    default:
      return actionType;
  }
};

const getActionTypeBadge = (actionType: string): string => {
  switch (actionType) {
    case UserUpdateActionType.ProfileUpdated:
      return 'badge-light-primary';
    case UserUpdateActionType.PasswordChanged:
      return 'badge-light-warning';
    case UserUpdateActionType.PermissionsUpdated:
      return 'badge-light-info';
    case UserUpdateActionType.RolesUpdated:
      return 'badge-light-success';
    default:
      return 'badge-light-secondary';
  }
};

export const UserUpdateLogTable: React.FC<UserUpdateLogTableProps> = ({ searchData, userId }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useUserUpdateLogTable({
    searchData,
    userId
  });

  const handleAction = useCallback(
    async (type: string, record: IUserUpdateLog): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
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

  const columns: TableProps<IUserUpdateLog>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div className="d-flex align-items-center">
          {record.imageUrl && (
            <div className="symbol symbol-35px symbol-circle me-2">
              <img src={record.imageUrl} alt={record.fullName || ''} />
            </div>
          )}
          <div>
            <div className="fw-bold">{record.fullName || record.userName || '-'}</div>
            <div className="text-muted fs-7">{record.userName || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại hành động',
      dataIndex: 'newValues',
      key: 'newValues',
      className: 'text-center',
      render: (newValues: string) => {
        var object = JSON.parse(newValues);
        return (
          <span className={`badge ${getActionTypeBadge(object?.action)}`}>
            {getActionTypeLabel(object?.action)}
          </span>
        )
      }
    },
    {
      title: 'Mô tả',
      dataIndex: 'affectedColumns',
      key: 'affectedColumns',
      className: 'text-center',
      render: (text) => <div className="text-wrap">{JSON.parse(text) || '-'}</div>,
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'createdByName',
      key: 'createdByName',
      className: 'text-center',
      render: (text) => text || '-',
    },
    {
      title: 'Thời gian',
      dataIndex: 'dateTime',
      key: 'dateTime',
      className: 'text-center',
      render: (text) => (
        <div>{text ? dayjs(text).format('DD/MM/YYYY HH:mm') : ''}</div>
      ),
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 100,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết"
              onClick={() => {
                handleAction('detail', record);
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
          </div>
        );
      },
    },
  ];


  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IUserUpdateLog>
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
      {modalVisible ? <UserUpdateLogModal /> : <></>}
    </>
  );
};
