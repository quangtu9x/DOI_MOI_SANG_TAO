import { useEffect, useState } from 'react';
import type { Key } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Input, Popconfirm, TableProps, Modal as ModalAntd } from 'antd';
const { confirm } = ModalAntd;
import { toast } from 'react-toastify';

import { AppDispatch, RootState } from '@/redux/Store';
import { TDTable, TDTableColumnFullName } from '@/app/components';
import { requestPOST, requestPUT } from '@/utils/baseAPI';
import { IResult, IUserOrganizationPositionDto } from '@/models';
import * as actionsModal from '@/redux/organization-unit/Actions';
import * as actionsModalUser from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { useOrganizationUsers } from '@/hooks/useOrganizationUsers';
import { SelectUsersModal } from './SelectUsersModal';
import { UserDetailModal } from './UserDetailModal';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { checkPermissions, hasAll } from '@/utils/utils';
import { DEFAULT_USER_PASSWORD, P, R } from '@/data';
import { useAuth } from '@/app/modules/auth';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { PermissionModal } from './PermissionModal';
import { GroupPermissionModal } from './GroupPermissionModal';

export const UserTable = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useAuth();
  const currentPermissions = new Set(currentUser?.permissions ?? []);
  const currentOrganizationUnit = useSelector((state: RootState) => state.organizationUnit.selectedOrganizationUnit);
  const isSelectUsersModalVisible = useSelector((state: RootState) => state.organizationUnit.selectUsersModalVisible);
  const isAddUserModalVisible = useSelector((state: RootState) => state.organizationUnit.addUserModalVisible);
  const random = useSelector((state: RootState) => state.global.random);
  const [permissionModalVisible, setPermissionModalVisible] = useState<boolean>(false);
  const [groupPermissionModalVisible, setGroupPermissionModalVisible] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const { data, totalCount, loading, currentPage, pageSize, searchKeyword, setCurrentPage, setPageSize, setSearchKeyword, refresh } =
    useOrganizationUsers({
      organizationUnitId: currentOrganizationUnit?.id ?? null,
    });

  useEffect(() => {
    if (random) {
      refresh();
    }
  }, [random, refresh]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [currentOrganizationUnit?.id]);

  const handleAction = async (type: string, record: IUserOrganizationPositionDto): Promise<void> => {
    try {
      switch (type) {
        case 'edit-user':
          dispatch(actionsModal.setUserDataModal(record));
          dispatch(actionsModal.setAddUserModalVisible(true));
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
          dispatch(actionsModalUser.setDataModal(record));
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
          // eslint-disable-next-line no-case-declarations
          const response = await requestPUT<IResult<string>>(`users/${record.id}`, { ...record, organizationUnitId: null }, 'neutral');
          if (response?.status === 200) {
            toast.success('Thực hiện thành công!');
            dispatch(actionsGlobal.setRandom());
          } else {
            toast.error(response?.data?.message || 'Thực hiện không thành công, vui lòng thử lại!');
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };
  const showDeleteConfirm = (record) => {
    confirm({
      title: 'Xóa người dùng khỏi đơn vị',
      icon: <ExclamationCircleFilled />,
      content: (
        <>
          Bạn có chắc chắn muốn xóa người dùng{' '}
          <strong>{record.fullName}</strong> khỏi đơn vị này?
        </>
      ),
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleAction(`delete`, record);
      },
      onCancel() {
      },
    });
  };

  const handleOpenGroupPermissionModal = () => {
    if (selectedRowKeys.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một người dùng!');
      return;
    }

    setGroupPermissionModalVisible(true);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns: TableProps<IUserOrganizationPositionDto>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record, index) => (
        <TDTableColumnFullName
          showMenu={false}
          dataUser={{ type: 1, fullName: record?.fullName ?? '', imageUrl: record?.imageUrl ?? '', userName: record?.userName ?? '' }}
          index={index}
        />
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      className: 'text-center',
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
      render: (data) => {
        return (
          <div>
            {data ? data : '-'}
          </div>
        );
      },
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
      width: 100,
      className: 'text-center',
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết/Sửa"
              onClick={() => {
                handleAction(`edit-user`, record);
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>

            {hasAll(currentPermissions, [P.of(R.Users, 'Update')]) && (
              <>
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
                              <i className="fa-solid fa-rotate me-2"></i>
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
                            <i className={clsx(`fa me-2`, record?.isActive ? 'fa-user-lock ' : 'fa-lock-open')} />
                            {record?.isActive ? 'Dừng kích hoạt tài khoản' : 'Kích hoạt tài khoản'}
                          </a>
                        ),
                      },
                      {
                        key: 'set-permission',
                        disabled: false,
                        label: (
                          <a
                            className="e-1 p-2 text-dark"
                            onClick={() => {
                              handleAction(`set-permission`, record);
                            }}
                          >
                            <i className={`fa fa-user-shield me-2`} />
                            Cấp quyền
                          </a>
                        ),
                      },
                      {
                        key: 'delete',
                        disabled: false,
                        label: (
                          <a
                            className="e-1 p-2 text-dark"
                            onClick={() => {
                              showDeleteConfirm(record)
                            }}
                          >
                            <i className="fa fa-trash me-2" />
                            Xóa người dùng khỏi đơn vị
                          </a>
                        ),
                      }
                    ],
                  }}
                >
                  <a className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1" title="Thao tác nhanh">
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
      <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
        <h3 className="card-title fw-bold text-header-td fs-4 mb-0">
          Danh sách người dùng

        </h3>
      </div>
      <div className="d-flex flex-column">
        <div className='d-flex flex-row'>
          <div className="d-flex align-items-center" style={{ flex: 3 }}>
            <button
              className="btn btn-primary btn-sm m-btn m-btn--icon py-2 me-2"
              onClick={() => {
                dispatch(actionsModal.setUserDataModal(null));
                dispatch(actionsModal.setAddUserModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm mới</span>
              </span>
            </button>
            <button
              className="btn btn-success btn-sm m-btn m-btn--icon py-2 me-2"
              onClick={() => {
                dispatch(actionsModal.setSelectUsersModalVisible(true));
              }}
            >
              <span>
                <i className="fas fa-plus me-2"></i>
                <span className="">Thêm có sẵn</span>
              </span>
            </button>
            {hasAll(currentPermissions, [P.of(R.Users, 'Update')]) && (
              <button
                className="btn btn-info btn-sm m-btn m-btn--icon py-2 me-2"
                disabled={selectedRowKeys.length === 0}
                onClick={handleOpenGroupPermissionModal}
              >
                <span>
                  <i className="fa fa-users-gear me-2"></i>
                  <span>Gán/Hủy quyền nhóm</span>
                </span>
              </button>
            )}
          </div>
          <Input
            style={{ flex: 1 }}
            placeholder="Tìm kiếm người dùng"
            className="my-3"
            value={searchKeyword}
            onChange={e => {
              setSearchKeyword(e.target.value);
            }}
          />
        </div>

        <TDTable<IUserOrganizationPositionDto>
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
      {isSelectUsersModalVisible ? <SelectUsersModal /> : <></>}
      {isAddUserModalVisible ? <UserDetailModal /> : <></>}
      {permissionModalVisible ? <PermissionModal visible={permissionModalVisible} setVisible={setPermissionModalVisible} /> : <></>}
      {groupPermissionModalVisible ? (
        <GroupPermissionModal
          visible={groupPermissionModalVisible}
          setVisible={setGroupPermissionModalVisible}
          userIds={selectedRowKeys.map(String)}
          onSuccess={() => {
            setSelectedRowKeys([]);
            refresh();
          }}
        />
      ) : <></>}
    </>
  );
};

