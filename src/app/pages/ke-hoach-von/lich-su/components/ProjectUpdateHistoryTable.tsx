import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectUpdateHistory, ProjectUpdateHistoryType } from '@/models';
import { TDTable } from '@/app/components';
import { useProjectUpdateHistoryTable } from './useProjectUpdateHistoryTable';
import { ProjectUpdateHistoryModal } from './ProjectUpdateHistoryModal';
import dayjs from 'dayjs';

interface ProjectUpdateHistoryTableProps {
  searchData?: SearchData;
}

const getUpdateTypeLabel = (updateType?: ProjectUpdateHistoryType): string => {
  switch (updateType) {
    case ProjectUpdateHistoryType.ProjectInfo:
      return 'Thông tin dự án';
    case ProjectUpdateHistoryType.StepInfo:
      return 'Thông tin bước tiến trình';
    default:
      return '-';
  }
};

const getUpdateTypeBadge = (updateType?: ProjectUpdateHistoryType): string => {
  switch (updateType) {
    case ProjectUpdateHistoryType.ProjectInfo:
      return 'badge-light-primary';
    case ProjectUpdateHistoryType.StepInfo:
      return 'badge-light-info';
    default:
      return 'badge-light-secondary';
  }
};

export const ProjectUpdateHistoryTable: React.FC<ProjectUpdateHistoryTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useProjectUpdateHistoryTable({ 
    searchData
  });

  const handleAction = useCallback(
    async (type: string, record: IProjectUpdateHistory): Promise<void> => {
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

  const columns: TableProps<IProjectUpdateHistory>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Loại cập nhật',
      dataIndex: 'updateType',
      key: 'updateType',
      width: 150,
      className: 'text-center',
      render: (updateType: ProjectUpdateHistoryType) => (
        <span className={`badge ${getUpdateTypeBadge(updateType)}`}>
          {getUpdateTypeLabel(updateType)}
        </span>
      ),
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text, record) => (
        <div>
          <div className="fw-bold">{record.projectName || '-'}</div>
          {record.projectCode && (
            <div className="text-muted fs-7">{record.projectCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Bước tiến trình',
      dataIndex: 'projectProcessStepExecutionName',
      key: 'projectProcessStepExecutionName',
      render: (text) => text || '-',
    },
    {
      title: 'Trường thay đổi',
      dataIndex: 'fieldDisplayName',
      key: 'fieldDisplayName',
      render: (text) => text || '-',
    },
    {
      title: 'Giá trị cũ',
      dataIndex: 'oldValue',
      key: 'oldValue',
      render: (text) => (
        <div className="text-wrap text-muted" style={{ maxWidth: 200 }}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Giá trị mới',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (text) => (
        <div className="text-wrap fw-bold" style={{ maxWidth: 200 }}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'updatedByUserFullName',
      key: 'updatedByUserFullName',
      render: (text, record) => (
        <div>
          <div>{record.updatedByUserFullName || record.updatedByUserName || '-'}</div>
          {record.updatedByUserName && (
            <div className="text-muted fs-7">{record.updatedByUserName}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'updateDate',
      key: 'updateDate',
      className: 'text-center',
      width: 150,
      render: (text, record) => (
        <div>{record.updateDate ? dayjs(record.updateDate).format('DD/MM/YYYY HH:mm') : '-'}</div>
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
          <TDTable<IProjectUpdateHistory>
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
      {modalVisible ? <ProjectUpdateHistoryModal /> : <></>}
    </>
  );
};
