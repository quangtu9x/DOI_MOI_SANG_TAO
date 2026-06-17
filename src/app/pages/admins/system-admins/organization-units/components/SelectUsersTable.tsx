/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import { TableProps } from 'antd/es/table';

import { requestPOST } from '@/utils/baseAPI';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { SearchData } from '@/types';
import { IPaginationResponse, IUserDto } from '@/models';
import { TDTable, TDTableColumnFullName } from '@/app/components';
import { TableRowSelection } from 'antd/es/table/interface';
import dayjs from 'dayjs';

interface UsersTableProps {
  searchData?: SearchData;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
}

export const SelectUsersTable: React.FC<UsersTableProps> = (props) => {
  const { searchData, selectedRowKeys, setSelectedRowKeys } = props;
  const dispatch: AppDispatch = useDispatch();
  const random = useSelector((state: RootState) => state.global.random);

  const [dataTable, setDataTable] = useState<IUserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const currentOrganizationUnit = useSelector((state: RootState) => state.organizationUnit.selectedOrganizationUnit);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection: TableRowSelection<IUserDto> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await requestPOST<IPaginationResponse<IUserDto[]>>('users/search', {
        pageNumber: currentPage,
        pageSize,
        ...searchData,
        exceptedOrganizationUnitId: currentOrganizationUnit?.id ?? null,
      }, 'neutral');

      if (response.data) {
        const { data, totalCount } = response.data;
        setDataTable(data ?? []);
        setTotalCount(totalCount);
      } else {
        setDataTable([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      setDataTable([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isRefreshing) {
      fetchData();
      setIsRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefreshing]);

  useEffect(() => {
    if (!isRefreshing) {
      setIsRefreshing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, searchData, random]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchData]);


  const columns: TableProps<IUserDto>['columns'] = [
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
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record, index) => (
        <TDTableColumnFullName
          showMenu={false}
          dataUser={{ type: 1, fullName: record?.fullName ?? '', imageUrl: record?.imageUrl, userName: record?.userName }}
          index={index}
        />
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'organizationUnitName',
      key: 'organizationUnitName',
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      className: 'text-center',
      render: (_, record) => {
        const { phoneNumber, email } = record;

        if (!phoneNumber && !email) {
          return '-';
        }

        return (
          <div>
            {phoneNumber ? <div><strong>Điện thoại: </strong>{phoneNumber}</div> : null}
            {email ? <div><strong>Email: </strong>{email}</div> : null}
          </div>
        );
      },
    },
    {
      title: 'Chức vụ',
      dataIndex: 'positionName',
      key: 'positionName',
      className: 'text-center',
      render: (data) => {
        return (
          <div>
            {data ? data : '-'}
          </div>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdOn',
      key: 'createdOn',
      className: 'text-center',
      render: date => <div>{dayjs(date).local().format('DD/MM/YYYY HH:mm')}</div>,
    },
    {
      width: '10%',
      title: 'Trạng thái',
      className: 'text-center',
      render: (text, record, index) => {
        return (
          <>
            <div className={clsx('badge fw-bolder', `badge-light-${record.isActive ? 'success' : 'danger'}`)}>
              {record.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
            </div>
          </>
        );
      },
      key: 'isActive',
    },
  ];
  return (
    <>
      <div className="card-body card-dashboard px-3 py-3">
        <div className="card-dashboard-body table-responsive">
          <i className='text-danger'>Lưu ý: Đã ẩn đi các tài khoản thuộc đơn vị hiện tại</i>
          <TDTable<IUserDto>
            rowSelection={rowSelection}
            dataSource={dataTable}
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