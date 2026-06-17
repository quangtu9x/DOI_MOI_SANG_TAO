import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Popconfirm, Tag } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IEformField, IResult } from '@/models';
import { TDTable } from '@/app/components';
import { useDataTableEformField } from './useDataTableEformField';
import { requestDELETE } from '@/utils/baseAPI';
import * as actionsGlobal from '@/redux/global/Actions';
interface FieldsDataTableProps {
  eformId: string;
  searchData?: SearchData;
  setFieldFormVisible: (visible: boolean) => void;
  setEditFieldData: (data: any) => void;
}

export const FieldsDataTable: React.FC<FieldsDataTableProps> = ({ eformId, searchData, setFieldFormVisible, setEditFieldData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useDataTableEformField({ searchData, eformId });

  // Handle actions
  const handleAction = useCallback(
    async (type: string, record: IEformField): Promise<void> => {
      try {
        switch (type) {
          case 'detail':
            setEditFieldData(record);
            setFieldFormVisible(true);

            break;
          case 'delete':
            const response = await requestDELETE<IResult<boolean>>(`eformfields/${record.id}`);
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

  const getFieldTypeLabel = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      text: { label: 'Ký tự', color: 'blue' },
      number: { label: 'Số', color: 'green' },
      date: { label: 'Ngày tháng', color: 'purple' },
      checkbox: { label: 'Checkbox', color: 'orange' },
      select: { label: 'Select', color: 'cyan' },
      combobox: { label: 'Combobox', color: 'magenta' },
      listbox: { label: 'Listbox', color: 'geekblue' },
      textarea: { label: 'Văn bản dài', color: 'volcano' },
    };
    return typeMap[type] || { label: type, color: 'default' };
  };

  const columns: TableProps<IEformField>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      className: 'text-center',
      render: text => <div className="fw-bold">{text}</div>,
    },
    {
      title: 'Nhãn',
      dataIndex: 'label',
      key: 'label',
      width: '25%',
      render: (text, record) => (
        <div>
          <div className="fw-bold">{text}</div>
          {record.required && (
            <Tag color="red" className="mt-1">
              Bắt buộc
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Loại trường',
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      className: 'text-center',
      render: type => {
        const typeInfo = getFieldTypeLabel(type);
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
    },
    {
      title: 'Placeholder',
      dataIndex: 'placeholder',
      key: 'placeholder',
      width: '20%',
      render: text => <span className="text-muted">{text || '—'}</span>,
    },
    {
      title: 'Giá trị mặc định',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: '15%',
      render: text => <span>{text || '—'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      className: 'text-center',
      width: '10%',
      render: data => <span className={data ? 'badge badge-light-success' : 'badge badge-light-danger'}>{data ? 'Hoạt động' : 'Vô hiệu'}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      className: 'text-center',
      width: 180,
      render: (text, record) => {
        return (
          <div>
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
          </div>
        );
      },
    },
  ];

  return (
    <div className="card-body card-dashboard px-3 py-3">
      <div className="card-dashboard-body table-responsive">
        <TDTable<IEformField>
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
