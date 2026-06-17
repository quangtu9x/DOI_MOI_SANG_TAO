import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TableProps, Tag, Input } from 'antd';
import * as actionsModal from '@/redux/modal/Actions';
import { RootState } from '@/redux/RootReducer';
import { AppDispatch } from '@/redux/Store';
import { IDatHangNhiemVu } from '@/models';
import { TDTable } from '@/app/components';
import { useDatHangNhiemVuTable } from '@/app/pages/nhiem-vu/dang-ky-nhiem-vu/dat-hang-nhiem-vu/components/useDatHangNhiemVuTable';
import { TRANG_THAI_DAT_HANG } from '@/data';
import { useAuth } from '@/app/modules/auth';
import { DatHangNhiemVuDetailModal } from '@/app/pages/nhiem-vu/dang-ky-nhiem-vu/dat-hang-nhiem-vu/components/DatHangNhiemVuDetailModal';
import { ChevronRight, Search } from 'lucide-react';
import { formatNumber } from '@/utils/utils';

export const ResearchSection: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useAuth();
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const [keyword, setKeyword] = useState("");

  const searchParams = useMemo(() => ({
    nguoiTaoId: currentUser?.id,
    keyword: keyword || undefined,
  }), [currentUser?.id, keyword]);

  const { data, loading, totalCount, currentPage, pageSize, setCurrentPage, setPageSize } = useDatHangNhiemVuTable({
    searchData: searchParams,
    initialPageSize: 10
  });

  const columns: TableProps<IDatHangNhiemVu>['columns'] = useMemo(() => [
    {
      title: 'STT',
      width: 60,
      className: 'text-center',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Tên nhiệm vụ',
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
      title: 'Đợt đặt hàng',
      dataIndex: 'dotDangKyTen',
      key: 'dotDangKyTen',
      width: '25%',
    },
    {
      title: 'Kinh phí dự kiến (VNĐ)',
      dataIndex: 'kinhPhiDuKien',
      key: 'kinhPhiDuKien',
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
        const status = TRANG_THAI_DAT_HANG.find(i => i.id === val);
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
          Danh sách nhiệm vụ NCKH
        </h2>
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Tìm kiếm theo tên nhiệm vụ..."
            prefix={<Search size={18} className="text-gray-400" />}
            className="h-10 rounded-lg border-gray-200"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
        </div>
      </div>

      <div className="portal-table-container">
        <TDTable<IDatHangNhiemVu>
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
      {modalVisible && <DatHangNhiemVuDetailModal totalCount={totalCount} />}
    </div>
  );
};
