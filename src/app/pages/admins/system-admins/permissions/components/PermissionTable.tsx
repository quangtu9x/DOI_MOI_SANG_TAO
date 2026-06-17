import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popconfirm } from 'antd';
import { TableProps } from 'antd/es/table';
import { toast } from 'react-toastify';

import { TDTable } from '@/app/components';
import { IPermissionItem, IResult } from '@/models';
import * as actionsGlobal from '@/redux/global/Actions';
import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { requestDELETE } from '@/utils/baseAPI';
import { PermissionDetailModal } from './PermissionDetailModal';
import { usePermissionTable } from './usePermissionTable';

interface PermissionProps {
  searchData?: SearchData;
}

export const PermissionTable: React.FC<PermissionProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = usePermissionTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IPermissionItem): Promise<void> => {
      try {
        switch (type) {
          case 'detail': {
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          }
          case 'delete': {
            const response = await requestDELETE<IResult<string>>(`Permissions/${record.id}`);
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

  const columns: TableProps<IPermissionItem>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Mã quyền',
      dataIndex: 'code',
      key: 'code',
      width: 260,
    },
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      key: 'name',
      width: 260,
    },
    {
      title: 'Phân hệ',
      dataIndex: 'subSystemCode',
      key: 'subSystemCode',
      width: 160,
      render: (value, record) => record.subSystemName || value,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      className: 'text-center',
      width: 110,
      render: (text, record) => (
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
          <Popconfirm
            title="Xoá?"
            onConfirm={() => {
              handleAction('delete', record);
            }}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
              <i className="fa-regular fa-trash"></i>
            </a>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IPermissionItem>
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
      {modalVisible ? <PermissionDetailModal totalCount={totalCount} /> : null}
    </>
  );
};
