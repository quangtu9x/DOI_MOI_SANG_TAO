import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult, IAuditTrail } from '@/models';
import { TDTable } from '@/app/components';
import { useAuditTable } from './useAuditTable';
import { AuditDetailModal } from './AuditDetailModal';
import dayjs from 'dayjs';

interface AuditTableProps {
  searchData?: SearchData;
}

export const AuditTable: React.FC<AuditTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useAuditTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IAuditTrail): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            // eslint-disable-next-line no-case-declarations
            const response = await requestDELETE<IResult<boolean>>(`audits/${record.id}`);
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

  const columns: TableProps<IAuditTrail>['columns'] = [
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
      title: 'Hành động',
      dataIndex: 'type',
      key: 'type',
      className: 'text-center',
    },
    {
      title: 'Dữ liệu',
      dataIndex: 'tableName',
      key: 'tableName',
      className: 'text-center',
    },
    {
      title: 'Thời gian',
      dataIndex: 'dateTime',
      key: 'dateTime',
      className: 'text-center',
      render: (_: unknown, record: IAuditTrail) => <div>{record.dateTime ? dayjs(record.dateTime).format('DD/MM/YYYY HH:mm') : ''}</div>,
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
              className="btn btn-icon btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Chi tiết"
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
              <a className="btn btn-icon btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
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
          <TDTable<IAuditTrail>
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
      {modalVisible ? <AuditDetailModal /> : <></>}
    </>
  );
};

