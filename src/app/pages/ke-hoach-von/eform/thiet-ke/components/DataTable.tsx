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
import { IResult, IEform } from '@/models';
import { TDTable } from '@/app/components';
import { useDataTable } from './useDataTable';

import { formatNumber, toViewDate, toViewDateString } from '@/utils/utils';

interface DataTableProps {
  searchData?: SearchData;
  onSelectEform?: (eform: IEform) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ searchData, onSelectEform }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useDataTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IEform): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            if (onSelectEform) {
              onSelectEform(record);
            } else {
              dispatch(actionsModal.setDataModal(record));
              dispatch(actionsModal.setModalVisible(true));
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
    [dispatch, onSelectEform]
  );

  const columns: TableProps<any>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'tieuDe',
      key: 'tieuDe',
      render: (text, record) => {
        return (
          <a
            className="fw-bold"
            data-toggle="m-tooltip"
            title={`Bấm để xem chi tiết`}
            style={{ textAlign: 'center' }}
            onClick={() => {
              dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
              dispatch(actionsModal.setModalVisible(true));
            }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'thoiGianBatDau',
      key: 'thoiGianBatDau',
      width: '12%',
      className: 'text-center',
      render: data => (data ? toViewDateString(data) : ''),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'thoiGianKetThuc',
      key: 'thoiGianKetThuc',
      width: '12%',
      className: 'text-center',
      render: data => (data ? toViewDateString(data) : ''),
    },
    {
      title: 'Công khai',
      dataIndex: 'isCongKhai',
      key: 'isCongKhai',
      className: 'text-center',
      width: '8%',
      render: data => <span className={data ? 'badge badge-light-success' : 'badge badge-light-secondary'}>{data ? 'Có' : 'Không'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      className: 'text-center',
      width: '10%',
      render: data => (
        <span className={data ? 'badge badge-light-success' : 'badge badge-light-danger'}>{data ? 'Hoạt động' : 'Không hoạt động'}</span>
      ),
    },
    {
      title: 'Thao tác',
      dataIndex: '',
      key: '',
      className: 'text-center',
      width: 140,
      render: (text, record) => {
        return (
          <div>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Thiết kế form"
              onClick={() => {
                handleAction(`detail`, record);
              }}
            >
              <i className="fa-solid fa-gear"></i>
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
          <TDTable<IEform>
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
    </>
  );
};
