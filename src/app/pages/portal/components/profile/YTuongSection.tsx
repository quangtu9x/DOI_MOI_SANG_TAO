import React, { useEffect, useMemo, useState } from 'react';
import { Input, Tag } from 'antd';
import type { TableProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/modules/auth';
import { requestGET } from '@/utils/baseAPI';
import { TDTable } from '@/app/components';
import { ChevronRight, Search } from 'lucide-react';
import dayjs from 'dayjs';

interface IYTuong {
  id: string;
  code: string;
  title: string;
  linhVuc: string;
  createdAt: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
}

const STATUS_TAG: Record<string, { color: string; label: string }> = {
  DRAFT:     { color: 'default',    label: 'Nháp' },
  SUBMITTED: { color: 'processing', label: 'Đã nộp/Chờ xét duyệt' },
  PENDING:   { color: 'processing', label: 'Đã nộp/Chờ xét duyệt' },
  APPROVED:  { color: 'success',    label: 'Đã duyệt' },
  REJECTED:  { color: 'error',      label: 'Từ chối' },
  RETURNED:  { color: 'warning',    label: 'Trả về' },
};

export const YTuongSection: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<IYTuong[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await requestGET(`ideas?userId=${currentUser.id}`);
        if (response?.status === 200) {
          const rd = response.data as any;
          const items: IYTuong[] = rd?.data ?? rd ?? [];
          setData(items);
          setTotalCount(rd?.totalCount ?? items.length);
        } else {
          setData([]);
          setTotalCount(0);
        }
      } catch {
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return data;
    const kw = keyword.toLowerCase();
    return data.filter(
      (item) =>
        item.title?.toLowerCase().includes(kw) ||
        item.code?.toLowerCase().includes(kw),
    );
  }, [data, keyword]);

  const columns: TableProps<IYTuong>['columns'] = useMemo(
    () => [
      {
        title: 'STT',
        width: 60,
        className: 'text-center',
        render: (_: any, __: any, index: number) =>
          (currentPage - 1) * pageSize + index + 1,
      },
      {
        title: 'Mã ý tưởng',
        dataIndex: 'code',
        key: 'code',
        width: 150,
        render: (code: string) => (
          <span className="text-gray-600 font-medium">{code ?? '-'}</span>
        ),
      },
      {
        title: 'Tên ý tưởng',
        dataIndex: 'title',
        key: 'title',
        className: 'font-bold text-gray-900',
      },
      {
        title: 'Lĩnh vực',
        dataIndex: 'linhVuc',
        key: 'linhVuc',
        width: 180,
        render: (val: string) => val ?? '-',
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format('DD/MM/YYYY') : '-',
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (status: string) => {
          const cfg = STATUS_TAG[status] ?? { color: 'default', label: status };
          return <Tag color={cfg.color}>{cfg.label}</Tag>;
        },
      },
      {
        title: 'Thao tác',
        width: 140,
        className: 'text-center',
        render: (_: any, record: IYTuong) => (
          <button
            onClick={() =>
              navigate(`/doi-moi/y-tuong?id=${record.id}&mode=view`)
            }
            className="flex items-center gap-1 text-[#0A65CC] font-semibold hover:underline mx-auto"
          >
            Xem chi tiết <ChevronRight size={14} />
          </button>
        ),
      },
    ],
    [currentPage, pageSize, navigate],
  );

  return (
    <div className="rounded-xl shadow-2xs border border-gray-100 bg-white overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 m-0">Danh sách ý tưởng</h2>
        <div className="relative w-full md:w-80">
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã ý tưởng..."
            prefix={<Search size={18} className="text-gray-400" />}
            className="h-10 rounded-lg border-gray-200"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
        </div>
      </div>
      <div className="portal-table-container">
        <TDTable<IYTuong>
          dataSource={filtered}
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
  );
};
