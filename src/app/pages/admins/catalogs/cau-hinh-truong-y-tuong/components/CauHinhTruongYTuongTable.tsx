import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox, Popconfirm, Tag } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { requestDELETE } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IResult } from '@/models';
import { IIdeaFieldConfig } from '@/models/cau-hinh-truong-y-tuong';
import { TDTable } from '@/app/components';
import { CauHinhTruongYTuongDetailModal } from './CauHinhTruongYTuongDetailModal';
import { useCauHinhTruongYTuongTable } from './useCauHinhTruongYTuongTable';

interface CauHinhTruongYTuongTableProps {
  searchData?: SearchData;
}

const DATA_TYPE_COLORS: Record<string, string> = {
  text: 'blue',
  textarea: 'geekblue',
  select: 'purple',
  file: 'cyan',
};

const DATA_TYPE_LABELS: Record<string, string> = {
  text: 'Văn bản',
  textarea: 'Văn bản dài',
  select: 'Danh sách',
  file: 'Tệp tin',
};

export const CauHinhTruongYTuongTable: React.FC<CauHinhTruongYTuongTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useCauHinhTruongYTuongTable({ searchData });

  const handleAction = useCallback(
    async (type: string, record: IIdeaFieldConfig): Promise<void> => {
      try {
        switch (type) {
          case 'detail': {
            dispatch(actionsModal.setDataModal(record));
            dispatch(actionsModal.setModalVisible(true));
            break;
          }
          case 'delete': {
            const response = await requestDELETE<IResult<boolean>>(`ideafieldconfigs/${record.id}`);
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

  const columns: TableProps<IIdeaFieldConfig>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 50,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Mã trường',
      dataIndex: 'fieldCode',
      key: 'fieldCode',
      width: 140,
      render: (text: string) => <code className="fw-bold">{text}</code>,
    },
    {
      title: 'Tên trường hiển thị',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: '25%',
      render: (text: string, record: IIdeaFieldConfig) => (
        <span>
          {text}
          {record.isDefault && <Tag color="gold" className="ms-2" style={{ fontSize: 11 }}>Mặc định</Tag>}
        </span>
      ),
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 120,
      className: 'text-center',
      render: (type: string) => (
        <Tag color={DATA_TYPE_COLORS[type] || 'default'}>
          {DATA_TYPE_LABELS[type] || type}
        </Tag>
      ),
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      className: 'text-center',
      render: (value: boolean) => (
        value
          ? <span className="badge badge-danger">Bắt buộc</span>
          : <span className="text-muted">Không</span>
      ),
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      className: 'text-center',
      render: (value: boolean) => <Checkbox checked={value} disabled />,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 70,
      className: 'text-center',
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
                handleAction('detail', { ...record, readOnly: true });
              }}
            >
              <i className="fa-regular fa-eye"></i>
            </a>

            <a
              className="btn btn-icon btn-bg-light btn-active-color-success btn-sm me-1 mb-1"
              data-toggle="m-tooltip"
              title="Chỉnh sửa"
              onClick={() => {
                handleAction('detail', record);
              }}
            >
              <i className="fa-regular fa-pen-to-square"></i>
            </a>

            {!record.isDefault && (
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
          <TDTable<IIdeaFieldConfig>
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
      {modalVisible ? <CauHinhTruongYTuongDetailModal /> : <></>}
    </>
  );
};