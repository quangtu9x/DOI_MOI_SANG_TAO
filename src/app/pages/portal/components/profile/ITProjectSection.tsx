import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableProps, Tag, Input } from 'antd';
import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { IKeHoach } from '@/models';
import { TDTable } from '@/app/components';
import { useKeHoachTable } from '@/app/pages/ke-hoach-von/giai-doan-xin-von/ke-hoach/components/useKeHoachTable';
import { TRANG_THAIS } from '@/data';
import { useAuth } from '@/app/modules/auth';
import { KeHoachDetailModal } from '@/app/pages/ke-hoach-von/giai-doan-xin-von/ke-hoach/components/KeHoachDetailModal';
import { ChevronRight, Search } from 'lucide-react';
import { formatNumber } from '@/utils/utils';

export const ITProjectSection: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useAuth();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [keyword, setKeyword] = useState("");

  const searchParams = useMemo(() => ({
    donViId: currentUser?.organizationUnitId,
    keyword: keyword || undefined,
  }), [currentUser?.organizationUnitId, keyword]);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useKeHoachTable({
    searchData: searchParams,
    initialPageSize: 10
  });

  const columns: TableProps<IKeHoach>['columns'] = useMemo(() => [
    {
      title: 'STT',
      width: 60,
      className: 'text-center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tên kế hoạch',
      dataIndex: 'ten',
      key: 'ten',
      className: 'font-bold text-gray-900',
      render: (text, record) => (
        <a
          className="hover:underline cursor-pointer"
          onClick={() => {
            dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
            dispatch(actionsModal.setModalVisible(true));
          }}
        >
          {text}
        </a>
      )
    },
    {
      title: 'Thời gian thực hiện',
      dataIndex: 'thoiGianThucHien',
      key: 'thoiGianThucHien',
      width: 150,
    },
    {
      title: 'Nhu cầu kinh phí (VNĐ)',
      dataIndex: 'nhuCauKinhPhi',
      key: 'nhuCauKinhPhi',
      width: 180,
      className: 'text-right',
      render: data => <span className="font-medium">{formatNumber(data)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (val) => {
        const status = TRANG_THAIS.find(i => i.id === val);
        return <Tag className={status ? status.className : 'badge badge-light-secondary'}>{status?.name || 'Chưa xác định'}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      width: 120,
      className: 'text-center',
      render: (_, record) => (
        <button
          onClick={() => {
            dispatch(actionsModal.setDataModal({ ...record, readOnly: true }));
            dispatch(actionsModal.setModalVisible(true));
          }}
          className="flex items-center gap-1 text-[#0A65CC] font-semibold hover:underline mx-auto"
        >
          Chi tiết <ChevronRight size={14} />
        </button>
      ),
    },
  ], [currentPage, pageSize, dispatch]);

  return (
    <div className="rounded-xl shadow-2xs border border-gray-100 bg-white overflow-hidden">
      {/* Header section with border-bottom */}
      <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 m-0">
          Danh sách dự án CNTT
        </h2>
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Tìm kiếm theo tên kế hoạch..."
            prefix={<Search size={18} className="text-gray-400" />}
            className="h-10 rounded-lg border-gray-200"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
        </div>
      </div>

      <div className="portal-table-container">
        <TDTable<IKeHoach>
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
      {modalVisible && <KeHoachDetailModal totalCount={totalCount} />}
    </div>
  );
};
