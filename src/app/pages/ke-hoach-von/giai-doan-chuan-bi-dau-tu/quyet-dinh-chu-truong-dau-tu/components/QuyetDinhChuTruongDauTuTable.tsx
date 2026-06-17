import React from 'react';
import { useDispatch } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { TableProps } from 'antd/es/table';
import dayjs from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IProjectDecision, DecisionType } from '@/models';
import { TDTable } from '@/app/components';
import { deleteProjectDecision } from '@/services/projectDecision.service';
import { useQuyetDinhChuTruongDauTuTable } from './useQuyetDinhChuTruongDauTuTable';

interface QuyetDinhChuTruongDauTuTableProps {
  searchData?: SearchData;
}

const getDecisionTypeLabel = (type?: DecisionType): string => {
  switch (type) {
    case DecisionType.InvestmentPolicy:
      return 'Quyết định chủ trương đầu tư';
    case DecisionType.InvestmentDecision:
      return 'Quyết định đầu tư';
    default:
      return 'Không xác định';
  }
};

export const QuyetDinhChuTruongDauTuTable: React.FC<QuyetDinhChuTruongDauTuTableProps> = ({
  searchData,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useQuyetDinhChuTruongDauTuTable({ searchData });

  const handleAction = async (type: string, record: IProjectDecision): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModalCapBon(record));
          dispatch(actionsModal.setModalVisibleCapBon(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModalCapBon({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisibleCapBon(true));
          break;
        case 'delete':
          await deleteProjectDecision(record.id!);
          toast.success('Xóa thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const columns: TableProps<IProjectDecision>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Dự án',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      render: (text: string, record: IProjectDecision) => {
        const code = record.projectCode || '';
        const name = record.projectName || '';
        if (code && name) {
          return `${code} - ${name}`;
        }
        if (name) return name;
        if (code) return code;
        return '-';
      },
    },
    {
      title: 'Số quyết định',
      dataIndex: 'decisionNumber',
      key: 'decisionNumber',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: 'Ngày quyết định',
      dataIndex: 'decisionDate',
      key: 'decisionDate',
      width: 120,
      className: 'text-center',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Người/Đơn vị ra quyết định',
      dataIndex: 'decisionMaker',
      key: 'decisionMaker',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Đã phê duyệt',
      dataIndex: 'isApproved',
      key: 'isApproved',
      width: 120,
      className: 'text-center',
      render: (isApproved: boolean) => {
        return (
          <div
            className={clsx(
              'badge fw-bolder',
              isApproved ? 'badge-light-success' : 'badge-light-warning'
            )}
          >
            {isApproved ? 'Có' : 'Chưa'}
          </div>
        );
      },
    },
    {
      title: 'Ngày phê duyệt',
      dataIndex: 'approvedDate',
      key: 'approvedDate',
      width: 120,
      className: 'text-center',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      width: 150,
      title: 'Thao tác',
      key: 'actions',
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
              description="Bạn có chắc chắn muốn xóa quyết định này?"
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
          <TDTable<IProjectDecision>
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
