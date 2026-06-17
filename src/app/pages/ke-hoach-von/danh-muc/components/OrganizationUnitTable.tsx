/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import { TableProps } from 'antd/es/table';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { OrganizationUnitType } from '@/models/catalogs';
import { TDTable } from '@/app/components';
import { deleteOrganizationUnit } from '@/services/organizationUnit.service';
import { useOrganizationUnitTable } from '../hooks/useOrganizationUnitTable';
import { IOrganizationUnit } from '@/models';

interface OrganizationUnitTableProps {
  searchData?: SearchData;
}

const getOrganizationUnitTypeLabel = (type?: OrganizationUnitType): string => {
  if (type === undefined || type === null) return '-';
  switch (type) {
    case OrganizationUnitType.organization:
      return 'Tổ chức';
    case OrganizationUnitType.department:
      return 'Phòng ban';
    case OrganizationUnitType.team:
      return 'Đội nhóm';
    default:
      return '-';
  }
};

export const OrganizationUnitTable: React.FC<OrganizationUnitTableProps> = ({ searchData }) => {
  const dispatch: AppDispatch = useDispatch();
  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } =
    useOrganizationUnitTable({ searchData });
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);

  const handleAction = async (type: string, record: IOrganizationUnit): Promise<void> => {
    try {
      switch (type) {
        case 'edit':
          dispatch(actionsModal.setDataModal(record));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'view':
          dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
          dispatch(actionsModal.setModalVisible(true));
          break;
        case 'delete':
          await deleteOrganizationUnit(record.id!);
          toast.success('Xóa thành công!');
          dispatch(actionsGlobal.setRandom());
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const columns: TableProps<IOrganizationUnit>['columns'] = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      className: 'text-center',
      render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string) => text || '-',
    },
    {
      title: 'Mã đầy đủ',
      dataIndex: 'fullCode',
      key: 'fullCode',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: 'Đơn vị cha',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: 'Loại đơn vị',
      dataIndex: 'organizationUnitType',
      key: 'organizationUnitType',
      width: 150,
      className: 'text-center',
      render: (type: OrganizationUnitType) => getOrganizationUnitTypeLabel(type),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      className: 'text-center',
      render: (value: number) => value ?? '-',
    },
    {
      width: 150,
      title: 'Thao tác',
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
              description="Bạn có chắc chắn muốn xóa cơ quan đơn vị này?"
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
          <TDTable<IOrganizationUnit>
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
