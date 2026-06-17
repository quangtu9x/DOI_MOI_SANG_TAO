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
import { IResult, IQuyetDinhTrienKhai } from '@/models';
import { TDTable } from '@/app/components';
import { useQuyetDinhTrienKhaiTable } from './useQuyetDinhTrienKhaiTable';
import { QuyetDinhTrienKhaiDetailModal } from './QuyetDinhTrienKhaiDetailModal';
import { toViewDateString } from '@/utils/utils';

interface QuyetDinhTrienKhaiTableProps {
  searchData?: SearchData;
}

export const QuyetDinhTrienKhaiTable: React.FC<QuyetDinhTrienKhaiTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useQuyetDinhTrienKhaiTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IQuyetDinhTrienKhai): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`QuyetDinhTrienKhais/${record.id}`);
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

  const columns: TableProps<IQuyetDinhTrienKhai>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Tên quyết định',
      dataIndex: 'ten',
      key: 'ten',
      render: (text, record) => {
        return <a
          className="fw-bold"
          data-toggle="m-tooltip"
          title={`Bấm để xem chi tiết`}
          style={{ textAlign: "center" }}
          onClick={() => {
            dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
            dispatch(actionsModal.setModalVisible(true));
          }}
        >
          {text}
        </a>
      }
    },
    {
      title: 'Số quyết định',
      dataIndex: 'soQuyetDinh',
      key: 'soQuyetDinh',
      className: 'text-center',
      width: '15%'
    },

    {
      title: 'Ngày ký',
      dataIndex: 'ngayKy',
      key: 'ngayKy',
      className: 'text-center',
      width: '15%',
      render: data => toViewDateString(data),
    },

    {
      title: 'Nhiệm vụ',
      dataIndex: 'nhiemVuTen',
      key: 'nhiemVuTen',
      className: 'text-left',
      width: '25%',
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
              className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Xem chi tiết"
              onClick={() => {
                handleAction(`detail`, { ...record, readOnly: true });
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>
            <a
              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Chỉnh sửa"
              onClick={() => {
                handleAction(`detail`, record);
              }}
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </a>
            <Popconfirm
              title="Xoá?"
              onConfirm={() => {
                handleAction(`delete`, record);
              }}
              okText="Xoá"
              cancelText="Huỷ"
            >
              <a className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1 mb-1" data-toggle="m-tooltip" title="Xoá">
                <i className="fa-regular fa-trash"></i>
              </a>
            </Popconfirm>
          </div >
        );
      },
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <TDTable<IQuyetDinhTrienKhai>
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
      {modalVisible ? <QuyetDinhTrienKhaiDetailModal totalCount={totalCount} /> : <></>}
    </>
  );
};

