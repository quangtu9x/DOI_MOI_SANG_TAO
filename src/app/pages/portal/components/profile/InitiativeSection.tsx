import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableProps, Tag, Input } from 'antd';
import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { IHoSoSangKien } from '@/models';
import { TDTable } from '@/app/components';
import { useDangKySangKienTable } from '@/app/pages/sang-kien/dang-ky-sang-kien/dang-ky-sang-kien/components/useDangKySangKienTable';
import { TRANG_THAI_HO_SO_SANG_KIEN } from '@/data/sang-kien';
import { useAuth } from '@/app/modules/auth';
import { DangKySangKienDetailModal } from '@/app/pages/sang-kien/dang-ky-sang-kien/dang-ky-sang-kien/components/DangKySangKienDetailModal';
import { ChevronRight, Search } from 'lucide-react';

export const InitiativeSection: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useAuth();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [keyword, setKeyword] = useState("");

  // SỬA LỖI: Sử dụng useMemo cho searchData để tránh re-fetch liên tục
  const searchParams = useMemo(() => ({
    nguoiNopHoSoId: currentUser?.id,
    keyword: keyword || undefined,
  }), [currentUser?.id, keyword]);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useDangKySangKienTable({
    searchData: searchParams,
    initialPageSize: 10
  });

  const columns: TableProps<IHoSoSangKien>['columns'] = useMemo(() => [
    {
      title: 'STT',
      width: 60,
      className: 'text-center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Mã hồ sơ',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id) => <span className="text-gray-600 font-medium">#{id?.slice(-12).toUpperCase()}</span>
    },
    {
      title: 'Tên sáng kiến',
      dataIndex: 'ten',
      key: 'ten',
      className: 'font-bold text-gray-900',
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'ngayNopHoSo',
      key: 'ngayNopHoSo',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (val) => {
        const status = TRANG_THAI_HO_SO_SANG_KIEN.find(i => i.id === val);
        return <Tag className={status?.className}>{status?.name || 'N/A'}</Tag>;
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
          Danh sách sáng kiến
        </h2>
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Tìm kiếm theo tên sáng kiến..."
            prefix={<Search size={18} className="text-gray-400" />}
            className="h-10 rounded-lg border-gray-200"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
        </div>
      </div>

      <div className="portal-table-container">
        <TDTable<IHoSoSangKien>
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
      {modalVisible && <DangKySangKienDetailModal totalCount={totalCount} />}
    </div>
  );
};
