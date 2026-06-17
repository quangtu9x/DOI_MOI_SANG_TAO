/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useDispatch } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectPostInvestmentReport, ReportType } from '@/models/ke-hoach-von';
import { TDTable } from '@/app/components';
import {
  useProjectPostInvestmentReportTable,
} from './useProjectPostInvestmentReportTable';
import { deleteProjectPostInvestmentReport } from '@/services/projectPostInvestmentReport.service';

interface ProjectPostInvestmentReportTableProps {
  searchData?: SearchData;
}

const getReportTypeLabel = (type?: ReportType): string => {
  // comment: nhãn loại báo cáo sau đầu tư
  switch (type) {
    case ReportType.Monitoring:
      return 'Giám sát';
    case ReportType.Evaluation:
      return 'Đánh giá';
    default:
      return 'Không xác định';
  }
};

export const ProjectPostInvestmentReportTable: React.FC<
  ProjectPostInvestmentReportTableProps
> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useProjectPostInvestmentReportTable({ searchData });

  const handleAction = async (
    type: 'view' | 'edit' | 'delete',
    record: IProjectPostInvestmentReport
  ): Promise<void> => {
    // comment: xử lý xem, sửa, xóa báo cáo sau đầu tư
    try {
      switch (type) {
        case 'view':
          dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'edit':
          dispatch(actionsModal.setDataModal({ ...record, readOnly: false }));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'delete':
          if (!record.id) {
            return;
          }
          await deleteProjectPostInvestmentReport(record.id);
          toast.success('Xóa báo cáo sau đầu tư thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling post investment report action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const columns: TableProps<IProjectPostInvestmentReport>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (text, record, index) => (
        <div>{(currentPage - 1) * pageSize + index + 1}</div>
      ),
    },
    {
      title: 'Số báo cáo',
      dataIndex: 'reportNumber',
      key: 'reportNumber',
      width: 140,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 260,
      render: value =>
        value ? (
          <div
            style={{
              maxWidth: 260,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={value}
          >
            {value}
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Loại báo cáo',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: value => getReportTypeLabel(value),
    },
    {
      title: 'Ngày báo cáo',
      dataIndex: 'reportDate',
      key: 'reportDate',
      width: 140,
      render: value =>
        value ? new Date(value).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      className: 'text-center',
      render: (text, record) => (
        <div className="d-flex justify-content-center gap-2">
          <a
            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
            onClick={() => handleAction('view', record)}
            title="Xem chi tiết"
          >
            <i className="fa-regular fa-eye" />
          </a>
          <a
            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
            onClick={() => handleAction('edit', record)}
            title="Chỉnh sửa"
          >
            <i className="fa-regular fa-pen-to-square" />
          </a>
          <Popconfirm
            title="Xác nhận xóa"
            onConfirm={() => handleAction('delete', record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <a
              className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
              title="Xóa"
            >
              <i className="fa-regular fa-trash" />
            </a>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="card-body card-dashboard px-3 py-3">
      <div className="card-dashboard-body table-responsive">
        <TDTable<IProjectPostInvestmentReport>
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

