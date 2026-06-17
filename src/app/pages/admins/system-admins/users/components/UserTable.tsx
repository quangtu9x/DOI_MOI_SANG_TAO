/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestPOST, requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult, IUserDto } from '@/models';
import { TDTable, TDTableColumnFullName } from '@/app/components';
import { useAuth } from '@/app/modules/auth';
import { hasAll } from '@/utils/utils';

import { UserDetailModal } from './UserDetailModal';
import { PermissionModal } from './PermissionModal';
import { DEFAULT_USER_PASSWORD, P, R } from '@/data';
import { useUserTable } from './useUserTable';

interface UsersTableProps {
  searchData?: SearchData;
}

export const UserTable: React.FC<UsersTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useUserTable({ searchData });
  const { currentUser } = useAuth();
  const currentPermissions = new Set(currentUser?.permissions ?? []);
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);

  const handleAction = async (type: string, record: IUserDto): Promise<void> => {
    try {
      switch (type) {
        case 'edit-user':
          dispatch(actionsModal.setDataModal(record));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'reset-password':
          try {
            const response = await requestPOST<IResult<string>>(`users/admin-reset-password`, {
              userName: record.userName,
              password: DEFAULT_USER_PASSWORD,
            }, 'neutral');
            if (response?.status == 200) {
              toast.success('Thực hiện thành công!');
              dispatch(actionsGlobal.setRandom());
            } else {
              toast.error(response?.data?.message || 'Thực hiện không thành công!');
            }
          } catch (errorInfo) {
            console.log('Failed:', errorInfo);
            toast.error('Thực hiện không thành công!');
          }
          break;
        case 'set-permission':
          dispatch(actionsModal.setDataModal(record));
          setPermissionModalVisible(true);
          break;
        case 'toggle-status':
          await requestPOST(`users/${record.id}/toggle-status`, {
            activateUser: !record.isActive,
            userId: record.id,
          }, 'neutral');
          toast.success('Thao tác thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        case 'delete':
          const response = await requestDELETE<IResult<boolean>>(`users/${record.id}`, 'neutral');
          if (response?.status == 200) {
            toast.success('Xóa thành công!');
            dispatch(actionsGlobal.setRandom());
          } else {
            toast.error(response?.data?.message || 'Xóa thất bại, vui lòng thử lại!');
          }
          break;
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const columns: TableProps<IUserDto>['columns'] = [
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
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record, index) => (
        <TDTableColumnFullName
          showMenu={false}
          dataUser={{ type: 1, fullName: record?.fullName ?? '', imageUrl: record?.imageUrl, userName: record?.userName }}
          index={index}
        />
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'organizationUnitName',
      key: 'organizationUnitName',
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => {
        const { phoneNumber, email } = record;
        if (!phoneNumber && !email) {
          return '-';
        }
        return (
          <div>
            {phoneNumber ? <div><strong>Điện thoại: </strong>{phoneNumber}</div> : null}
            {email ? <div><strong>Email: </strong>{email}</div> : null}
          </div>
        );
      },
    },

    {
      title: 'Chức vụ',
      dataIndex: 'positionName',
      key: 'positionName',
      className: 'text-center',
    },
    {
      width: '10%',
      title: 'Trạng thái',
      className: 'text-center',
      render: (text, record, index) => {
        return (
          <>
            <div className={clsx('badge fw-bolder', `badge-light-${record.isActive ? 'success' : 'danger'}`)}>
              {record.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
            </div>
          </>
        );
      },
      key: 'isActive',
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      width: 150,
      className: 'text-center',
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Chi tiết"
              onClick={() => {
                handleAction(`edit-user`, record);
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
            {hasAll(currentPermissions, [P.of(R.Users, 'Delete')]) && (
              <>
                <Popconfirm
                  title="Xoá?"
                  onConfirm={() => {
                    handleAction(`delete`, record);
                  }}
                  okText="Xoá"
                  cancelText="Huỷ"
                >
                  <a className="btn btn-icon btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
                    <i className="fa-regular fa-trash" />
                  </a>
                </Popconfirm>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: 'reset-password',
                        disabled: false,
                        label: (
                          <Popconfirm
                            title="Khôi phục mật khẩu, bạn chắc chắn?"
                            onConfirm={() => {
                              handleAction(`reset-password`, record);
                            }}
                            okText="Đồng ý"
                            cancelText="Huỷ"
                          >
                            <a className="e-1 p-2 text-dark"
                              data-toggle="m-tooltip"
                              title="Khôi phục mật khẩu">
                              <i className="fa-regular fa-rotate me-2"></i>
                              Khôi phục mật khẩu
                            </a>
                          </Popconfirm>

                        ),
                      },
                      {
                        key: 'verifi-user',
                        disabled: false,
                        label: (
                          <a
                            className="e-1 p-2 text-dark"
                            onClick={() => {
                              handleAction(`toggle-status`, record);
                            }}
                          >
                            <i className={clsx(`fa me-2`, record?.isActive ? 'fa-regular fa-user-lock ' : 'fa-regular fa-lock-open')} />
                            {record?.isActive ? 'Dừng kích hoạt tài khoản' : 'Kích hoạt tài khoản'}
                          </a>
                        ),
                      },
                      hasAll(currentPermissions, [P.of(R.Users, 'Update')])
                        ? {
                          key: 'set-permission',
                          disabled: false,
                          label: (
                            <a
                              className="e-1 p-2 text-dark"
                              onClick={() => {
                                handleAction(`set-permission`, record);
                              }}
                            >
                              <i className={`fa-regular fa-user-shield me-2`} />
                              Cấp quyền
                            </a>
                          ),
                        }
                        : null,
                    ],
                  }}
                >
                  <a className="btn btn-icon btn-active-color-primary btn-sm me-1 mb-1" title="Thao tác nhanh">
                    <i className="fa fa-ellipsis-h" />
                  </a>
                </Dropdown>
              </>
            )}

          </div>
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IUserDto>
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
      {modalVisible ? <UserDetailModal /> : <></>}
      {permissionModalVisible ? <PermissionModal visible={permissionModalVisible} setVisible={setPermissionModalVisible} /> : <></>}
    </>
  );
};