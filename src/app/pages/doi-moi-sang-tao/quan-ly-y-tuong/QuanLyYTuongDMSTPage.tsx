import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Button, Space, Tag, Input, Select, Empty, Tooltip, Spin, message } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { searchIdeas } from '@/app/services/ideaPortalApi';
import type { IIdea } from '@/models/idea-portal';
import { useAuth } from '@/app/modules/auth';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';
import { CauHinhXuLyYTuongModal } from './components/CauHinhXuLyYTuongModal';

const TRANG_THAI_DISPLAY: Record<string, { label: string; color: string }> = {
  'Bản nháp':       { label: 'Bản nháp', color: 'default' },
  'Đã nộp':         { label: 'Chờ phê duyệt', color: 'processing' },
  'Đã tiếp nhận':   { label: 'Đã phê duyệt', color: 'success' },
  'Đã trả lại':     { label: 'Từ chối', color: 'error' },
  'Đã hủy':         { label: 'Đã hủy', color: 'default' },
  'Được công nhận': { label: 'Được công nhận', color: 'purple' },
};

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  ...Object.entries(TRANG_THAI_DISPLAY).map(([k, v]) => ({ label: v.label, value: k })),
];

const isGuid = (v?: string) =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const fmtDate = (v?: string | null) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const safeList = (res: any): IIdea[] => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

const LINH_VUC_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Khai thác bay',        value: 'Khai thác bay' },
  { label: 'Kỹ thuật bảo dưỡng',  value: 'Kỹ thuật bảo dưỡng' },
  { label: 'Dịch vụ hành khách',  value: 'Dịch vụ hành khách' },
  { label: 'Dịch vụ mặt đất',     value: 'Dịch vụ mặt đất' },
  { label: 'Đào tạo nhân lực',    value: 'Đào tạo nhân lực' },
  { label: 'An toàn bay',         value: 'An toàn bay' },
  { label: 'Công nghệ thông tin', value: 'Công nghệ thông tin' },
];

interface QuanLyYTuongDMSTPageProps {
  myIdeasOnly?: boolean;
}

export const QuanLyYTuongDMSTPage: React.FC<QuanLyYTuongDMSTPageProps> = ({ myIdeasOnly = false }) => {
  const { currentUser } = useAuth();
  const { isReviewer } = useDMSTRole();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IIdea[]>([]);
  const [search, setSearch] = useState('');
  const [linhVuc, setLinhVuc] = useState('');
  // Khởi tạo trạng thái lọc từ query param ?status=... (deep-link từ Dashboard, ví dụ "Được công nhận")
  const [trangThai, setTrangThai] = useState(() => searchParams.get('status') ?? '');
  const [donVi, setDonVi] = useState('');
  const [nguoiDeXuat, setNguoiDeXuat] = useState('');
  const [cauHinhOpen, setCauHinhOpen] = useState(false);

  // Đồng bộ lại nếu query param thay đổi (VD: bấm lại link khác từ Dashboard trong khi trang đang mở)
  useEffect(() => {
    const statusParam = searchParams.get('status') ?? '';
    if (statusParam !== trangThai) setTrangThai(statusParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onTrangThaiChange = (v: string) => {
    setTrangThai(v);
    setSearchParams(v ? { status: v } : {}, { replace: true });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchIdeas({
        pageNumber: 1,
        pageSize: 500,
        submittedById: myIdeasOnly ? currentUser?.id : undefined,
      });
      setData(safeList(res));
    } catch {
      message.error('Không tải được danh sách ý tưởng');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [myIdeasOnly, currentUser?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Danh sách đơn vị / cá nhân đề xuất — lấy động từ dữ liệu đã tải (không hard-code)
  const donViOptions = useMemo(() => {
    const set = new Set(data.map(r => r.donViCongTac).filter(Boolean) as string[]);
    return [
      { label: 'Tất cả đơn vị', value: '' },
      ...Array.from(set).sort((a, b) => a.localeCompare(b)).map(v => ({ label: v, value: v })),
    ];
  }, [data]);

  const nguoiDeXuatOptions = useMemo(() => {
    const set = new Set(data.map(r => r.nguoiDeXuat).filter(Boolean) as string[]);
    return [
      { label: 'Tất cả cá nhân đề xuất', value: '' },
      ...Array.from(set).sort((a, b) => a.localeCompare(b)).map(v => ({ label: v, value: v })),
    ];
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter(r => {
      const code = r.code || '';
      const title = r.title || '';
      const nguoiDeXuatVal = r.nguoiDeXuat || '';

      const matchSearch = !search ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        code.toLowerCase().includes(search.toLowerCase()) ||
        nguoiDeXuatVal.toLowerCase().includes(search.toLowerCase());
      const matchLinhVuc = !linhVuc || (r.linhVuc || '') === linhVuc;
      const matchStatus = !trangThai || (r.status || '') === trangThai;
      const matchDonVi = !donVi || (r.donViCongTac || '') === donVi;
      const matchNguoiDeXuat = !nguoiDeXuat || (r.nguoiDeXuat || '') === nguoiDeXuat;
      return matchSearch && matchLinhVuc && matchStatus && matchDonVi && matchNguoiDeXuat;
    });
  }, [search, linhVuc, trangThai, donVi, nguoiDeXuat, data]);

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'code',
      key: 'ma',
      width: 140,
      render: (text: string) => <span className="fw-bold text-primary">{text || '—'}</span>,
    },
    {
      title: 'Tên ý tưởng',
      dataIndex: 'title',
      key: 'tenYTuong',
      render: (text: string, record: IIdea) => (
        <div>
          <div className="fw-semibold">{text}</div>
          <div className="text-muted fs-8 mt-1">{record.linhVuc || '—'}</div>
        </div>
      ),
    },
    {
      title: 'Người gửi',
      dataIndex: 'nguoiDeXuat',
      key: 'nguoiGuiTen',
      width: 140,
      render: (v: string) => v || '—',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donViCongTac',
      key: 'donVi',
      width: 160,
      render: (v: string) => v || '—',
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submittedOn',
      key: 'ngayNop',
      width: 110,
      render: (v: string, record: IIdea) => fmtDate(v || record.submittedAt || record.createdOn || record.createdAt),
    },
    {
      title: 'Đính kèm',
      dataIndex: 'attachments',
      key: 'fileCount',
      width: 90,
      render: (attachments: IIdea['attachments']) => {
        const count = attachments?.length ?? 0;
        return count > 0
          ? <span className="badge badge-light-primary"><i className="fa-regular fa-paperclip me-1" />{count}</span>
          : <span className="text-muted">—</span>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'trangThai',
      width: 150,
      render: (status: string) => {
        const d = TRANG_THAI_DISPLAY[status] || { label: status || 'Không rõ', color: 'default' };
        return <Tag color={d.color}>{d.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: unknown, record: IIdea) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<i className="fa-regular fa-eye" />}
              onClick={() => {
                if (!isGuid(record.id)) {
                  message.error('Dữ liệu hồ sơ không hợp lệ, không thể mở chi tiết.');
                  return;
                }
                navigate(`/doi-moi-sang-tao/quan-ly-y-tuong/chi-tiet/${record.id}`);
              }}
            />
          </Tooltip>
          {record.status === 'Bản nháp' && isGuid(record.id) && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="link"
                size="small"
                icon={<i className="fa-regular fa-pen" />}
                onClick={() => navigate(`/doi-moi-sang-tao/quan-ly-y-tuong/chinh-sua/${record.id}`)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageTitle breadcrumbs={[{ title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false }]}>
        {myIdeasOnly ? 'Ý tưởng của tôi' : 'Quản lý ý tưởng'}
      </PageTitle>
      <Content>
        <div className="card">
          <div className="card-header border-0 pt-5 d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-gray-800">
              {myIdeasOnly ? (
                <><i className="fa-regular fa-user-pen me-2 text-primary" />Ý tưởng của tôi</>
              ) : 'Danh sách ý tưởng'}
            </h3>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Input
                placeholder="Tìm kiếm mã, tên ý tưởng..."
                prefix={<i className="fa-regular fa-search text-muted" />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 240 }}
              />
              <Select
                options={LINH_VUC_OPTIONS}
                value={linhVuc}
                onChange={setLinhVuc}
                style={{ width: 180 }}
              />
              <Select
                options={STATUS_OPTIONS}
                value={trangThai}
                onChange={onTrangThaiChange}
                style={{ width: 180 }}
              />
              <Select
                options={donViOptions}
                value={donVi}
                onChange={setDonVi}
                showSearch
                optionFilterProp="label"
                style={{ width: 200 }}
              />
              <Select
                options={nguoiDeXuatOptions}
                value={nguoiDeXuat}
                onChange={setNguoiDeXuat}
                showSearch
                optionFilterProp="label"
                style={{ width: 200 }}
              />
              <Tooltip title="Làm mới">
                <Button onClick={loadData} icon={<i className="fa-regular fa-refresh" />} />
              </Tooltip>
              {!myIdeasOnly && isReviewer && (
                <Button onClick={() => setCauHinhOpen(true)} icon={<i className="fa-regular fa-sliders me-1" />}>
                  Cấu hình xử lý
                </Button>
              )}
              <Link
                to="/doi-moi-sang-tao/quan-ly-y-tuong/tao-moi"
                className="btn btn-primary btn-sm"
              >
                <i className="fa-regular fa-plus me-1" />
                Tạo ý tưởng mới
              </Link>
            </div>
          </div>
          <div className="card-body py-3">
            <Spin spinning={loading}>
              {filtered.length === 0
                ? <Empty description="Không có ý tưởng phù hợp" />
                : (
                  <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    bordered
                    size="small"
                  />
                )}
            </Spin>
          </div>
        </div>
      </Content>
      {!myIdeasOnly && isReviewer && (
        <CauHinhXuLyYTuongModal visible={cauHinhOpen} onClose={() => setCauHinhOpen(false)} />
      )}
    </>
  );
};
