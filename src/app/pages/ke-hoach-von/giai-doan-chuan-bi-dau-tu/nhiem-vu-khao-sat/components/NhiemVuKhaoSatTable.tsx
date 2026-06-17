import React from 'react';
import { useDispatch } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectProcessStepExecution, WorkItemStatus } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import { 
  deleteProjectProcessStepExecution,
  updateProjectProcessStepExecution,
} from '@/services/projectProcessStepExecution.service';
import { useNhiemVuKhaoSatTable } from './useNhiemVuKhaoSatTable';

interface NhiemVuKhaoSatTableProps {
  searchData?: SearchData;
  projectProcessExecutionId?: string;
}

const getStatusLabel = (status?: WorkItemStatus): string => {
  switch (status) {
    case WorkItemStatus.Pending:
      return 'Chờ xử lý';
    case WorkItemStatus.InProgress:
      return 'Đang xử lý';
    case WorkItemStatus.Completed:
      return 'Hoàn thành';
    case WorkItemStatus.Cancelled:
      return 'Hủy bỏ';
    default:
      return 'Không xác định';
  }
};

const getStatusBadgeClass = (status?: WorkItemStatus): string => {
  switch (status) {
    case WorkItemStatus.Pending:
      return 'badge-light-secondary';
    case WorkItemStatus.InProgress:
      return 'badge-light-warning';
    case WorkItemStatus.Completed:
      return 'badge-light-success';
    case WorkItemStatus.Cancelled:
      return 'badge-light-danger';
    default:
      return 'badge-light-secondary';
  }
};

export const NhiemVuKhaoSatTable: React.FC<NhiemVuKhaoSatTableProps> = ({
  searchData,
  projectProcessExecutionId,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useNhiemVuKhaoSatTable({ searchData, projectProcessExecutionId });
  const handleAction = async (
    type: string,
    record: IProjectProcessStepExecution
  ): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModalCapBa(record));
          dispatch(actionsModal.setModalVisibleCapBa(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModalCapBa({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisibleCapBa(true));
          break;
        case 'delete':
          await deleteProjectProcessStepExecution(record.id!);
          toast.success('Xóa thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        // case 'viewForDepartment':
        //   dispatch(actionsModal.setDataModalCapBa({ ...record, readOnly: true }));
        //   dispatch(actionsModal.setModalVisibleCapBa(true));
        //   break;
        case 'complete':
          // Cán bộ phụ trách (Chủ đầu tư) - cập nhật hoàn thành
          if (record.id) {
            await updateProjectProcessStepExecution(record.id, {
              id: record.id,
              status: WorkItemStatus.Completed,
            });
            toast.success('Đã cập nhật hoàn thành bước thực hiện!');
            dispatch(actionsGlobal.setRandom());
          }
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const columns: TableProps<IProjectProcessStepExecution>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Bước quy trình',
      dataIndex: 'projectProcessStepName',
      key: 'projectProcessStepName',
      width: 200,
      render: (text, record) => {
        // Ưu tiên: projectProcessStepName, sau đó stepName, cuối cùng là code
        const stepName = record.projectProcessStepName || record.stepName || record.projectProcessStepCode || record.stepCode || '-';
        return stepName;
      },
    },
    {
      title: 'Người được phân công',
      dataIndex: 'assignedUserFullName',
      key: 'assignedUserFullName',
      width: 200,
      render: (text, record) => {
        // Ưu tiên: assignedUserFullName, sau đó assignedUserName
        return record.assignedUserFullName || record.assignedUserName || '-';
      },
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Ngày kết thúc dự kiến',
      dataIndex: 'expectedEndDate',
      key: 'expectedEndDate',
      width: 150,
      render: (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '-'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      className: 'text-center',
      render: (status) => {
        return (
          <div className={clsx('badge fw-bolder', getStatusBadgeClass(status))}>
            {getStatusLabel(status)}
          </div>
        );
      },
    },
    // {
    //   title: 'Hoàn thành',
    //   dataIndex: 'isCompleted',
    //   key: 'isCompleted',
    //   width: 100,
    //   className: 'text-center',
    //   render: (isCompleted) => {
    //     return (
    //       <div
    //         className={clsx(
    //           'badge fw-bolder',
    //           isCompleted ? 'badge-light-success' : 'badge-light-warning'
    //         )}
    //       >
    //         {isCompleted ? 'Có' : 'Chưa'}
    //       </div>
    //     );
    //   },
    // },
    {
      width: 250,
      title: 'Thao tác',
      key: 'actions',
      className: 'text-center',
      render: (text, record) => {
        return (
          <div className="d-flex justify-content-center gap-2 flex-wrap">
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
            {/* <a
              className="btn btn-icon btn-bg-light btn-active-color-info btn-sm"
              onClick={() => handleAction('viewForDepartment', record)}
              title="Sở KHCN/Sở, ban, ngành phụ trách - Xem thông tin"
            >
              <i className="fa-regular fa-building"></i>
            </a> */}
            <Popconfirm
              title="Xác nhận hoàn thành"
              description="Bạn có chắc chắn muốn đánh dấu bước thực hiện này là hoàn thành?"
              onConfirm={() => handleAction('complete', record)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <a 
                className="btn btn-icon btn-bg-light btn-active-color-success btn-sm" 
                title="Cán bộ phụ trách (Chủ đầu tư) - Cập nhật hoàn thành"
              >
                <i className="fa-regular fa-check-circle"></i>
              </a>
            </Popconfirm>
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa thực hiện bước này?"
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
    <div className="card-body card-dashboard px-3 py-3">
      <div className="card-dashboard-body table-responsive">
        <TDTable<IProjectProcessStepExecution>
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
  );
};
