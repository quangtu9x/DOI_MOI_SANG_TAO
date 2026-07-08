import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Tag, Input, Space, Modal, message, Tooltip, Spin } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { searchIdeas, receiveIdea, returnIdea } from '@/app/services/ideaPortalApi';
import type { IIdea } from '@/models/idea-portal';

interface QuyTrinhDuyetPageProps {
  mode: 'cho-duyet' | 'da-duyet' | 'tu-choi';
}

// Trạng thái ý tưởng phía BE (IdeaStatus)
const STATUS = {
  choDuyet: 'Đã nộp',
  daDuyet: 'Đã tiếp nhận',
  tuChoi: 'Đã trả lại',
};

const MODE_CONFIG = {
  'cho-duyet': {
    title: 'Chờ phê duyệt',
    status: STATUS.choDuyet,
    color: 'warning',
    icon: 'fa-clock',
    emptyText: 'Không có ý tưởng nào đang chờ duyệt',
  },
  'da-duyet': {
    title: 'Đã phê duyệt',
    status: STATUS.daDuyet,
    color: 'success',
    icon: 'fa-circle-check',
    emptyText: 'Chưa có ý tưởng nào được phê duyệt',
  },
  'tu-choi': {
    title: 'Đã từ chối',
    status: STATUS.tuChoi,
    color: 'danger',
    icon: 'fa-circle-xmark',
    emptyText: 'Chưa có ý tưởng nào bị từ chối',
  },
};

const safeList = (res: any): IIdea[] => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.data)) return d.data.data;
  return [];
};

const formatDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString('vi-VN') : '—';

export const QuyTrinhDuyetPage: React.FC<QuyTrinhDuyetPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const cfg = MODE_CONFIG[mode];
  const [searchParams] = useSearchParams();

  // Lọc "quá hạn" — dùng đúng ngưỡng đang hiển thị ở Dashboard (slaGio: giờ, nguongNgay: ngày)
  const quaHanOnly = searchParams.get('quaHan') === '1';
  const slaGioParam = Number(searchParams.get('slaGio')) || null;
  const nguongNgayParam = Number(searchParams.get('nguongNgay')) || null;

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [ideas, setIdeas] = useState<IIdea[]>([]);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Tải toàn bộ ý tưởng trong quy trình (3 trạng thái) để hiển thị số đếm + danh sách
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchIdeas({ pageNumber: 1, pageSize: 500 });
      const list = safeList(res).filter(i =>
        [STATUS.choDuyet, STATUS.daDuyet, STATUS.tuChoi].includes(i.status ?? ''));
      setIdeas(list);
    } catch (e) {
      console.error('[QuyTrinhDuyet] load error:', e);
      message.error('Không tải được danh sách ý tưởng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Cùng logic tính "quá hạn" như IdeaReportsController.GetDashboardAsync:
  // - Đã nộp (cho-duyet): quá hạn theo SubmittedOn + slaGio (giờ) hoặc + nguongNgay (ngày)
  // - Đã tiếp nhận (da-duyet): quá hạn kiểm duyệt theo mốc tiếp nhận (xấp xỉ bằng lastModifiedOn) + nguongNgay (ngày)
  const isQuaHan = useCallback((r: IIdea) => {
    if (!quaHanOnly) return true;
    const now = Date.now();

    if (mode === 'cho-duyet') {
      const submitted = r.submittedOn ?? r.submittedAt ?? r.createdOn;
      if (!submitted) return false;
      const elapsedMs = now - new Date(submitted).getTime();
      if (slaGioParam) return elapsedMs > slaGioParam * 3600 * 1000;
      if (nguongNgayParam) return elapsedMs > nguongNgayParam * 24 * 3600 * 1000;
      return false;
    }

    if (mode === 'da-duyet' && nguongNgayParam) {
      const tiepNhanRef = r.lastModifiedOn ?? r.submittedOn ?? r.createdOn;
      if (!tiepNhanRef) return false;
      return (now - new Date(tiepNhanRef).getTime()) > nguongNgayParam * 24 * 3600 * 1000;
    }

    return true;
  }, [quaHanOnly, slaGioParam, nguongNgayParam, mode]);

  const data = useMemo(() => {
    return ideas
      .filter(r => r.status === cfg.status)
      .filter(isQuaHan)
      .filter(r => !search
        || (r.title ?? '').toLowerCase().includes(search.toLowerCase())
        || (r.code ?? '').toLowerCase().includes(search.toLowerCase())
        || (r.nguoiDeXuat ?? '').toLowerCase().includes(search.toLowerCase()));
  }, [ideas, search, cfg.status, isQuaHan]);

  const countByStatus = (st: string) => ideas.filter(r => r.status === st).length;

  const handleApprove = async () => {
    if (!approveId) return;
    setActionLoading(true);
    try {
      const res = await receiveIdea(approveId, 'Phê duyệt qua quy trình duyệt');
      const ok = (res as any)?.data?.succeeded ?? (res as any)?.status < 400;
      if (!ok) {
        message.error((res as any)?.data?.messages?.join(', ') || 'Không phê duyệt được');
        return;
      }
      message.success('Đã phê duyệt ý tưởng thành công!');
      setApproveId(null);
      load();
    } catch {
      message.error('Lỗi khi phê duyệt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { message.error('Vui lòng nhập lý do từ chối'); return; }
    if (!rejectId) return;
    setActionLoading(true);
    try {
      const res = await returnIdea(rejectId, rejectReason.trim());
      const ok = (res as any)?.data?.succeeded ?? (res as any)?.status < 400;
      if (!ok) {
        message.error((res as any)?.data?.messages?.join(', ') || 'Không từ chối được');
        return;
      }
      message.success('Đã từ chối (trả lại) ý tưởng.');
      setRejectId(null);
      setRejectReason('');
      load();
    } catch {
      message.error('Lỗi khi từ chối');
    } finally {
      setActionLoading(false);
    }
  };

  const baseColumns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'code',
      key: 'code',
      width: 160,
      render: (t: string) => <span className="fw-bold text-primary">{t}</span>,
    },
    {
      title: 'Tên ý tưởng',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: IIdea) => (
        <div>
          <div className="fw-semibold">{text}</div>
          {record.linhVuc && <span className="badge badge-light-info fs-8 mt-1">{record.linhVuc}</span>}
        </div>
      ),
    },
    {
      title: 'Người đề xuất',
      dataIndex: 'nguoiDeXuat',
      key: 'nguoiDeXuat',
      width: 160,
      render: (v: string, record: IIdea) => (
        <div>
          <div>{v || '—'}</div>
          {record.donViCongTac && <div className="text-muted fs-8">{record.donViCongTac}</div>}
        </div>
      ),
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submittedOn',
      key: 'submittedOn',
      width: 110,
      render: (v: string, record: IIdea) => formatDate(v ?? record.submittedAt ?? record.createdOn),
    },
  ];

  const actionColumn = {
    title: 'Thao tác',
    key: 'action',
    width: mode === 'cho-duyet' ? 160 : 100,
    render: (_: unknown, record: IIdea) => (
      <Space>
        <Tooltip title="Xem chi tiết">
          <Button
            size="small"
            icon={<i className="fa-regular fa-eye" />}
            onClick={() => navigate(`/doi-moi-sang-tao/quan-ly-y-tuong/chi-tiet/${record.id}`)}
          />
        </Tooltip>
        {mode === 'cho-duyet' && (
          <>
            <Tooltip title="Phê duyệt (tiếp nhận)">
              <Button
                size="small"
                type="primary"
                icon={<i className="fa-regular fa-check" />}
                onClick={() => setApproveId(record.id)}
              />
            </Tooltip>
            <Tooltip title="Từ chối (trả lại)">
              <Button
                size="small"
                danger
                icon={<i className="fa-regular fa-times" />}
                onClick={() => setRejectId(record.id)}
              />
            </Tooltip>
          </>
        )}
      </Space>
    ),
  };

  const columns = [...baseColumns, actionColumn];

  const breadcrumbs = [
    { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
    { title: 'Quy trình phê duyệt', path: '#', isActive: false, isSeparator: false },
  ];

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>{cfg.title}</PageTitle>
      <Content>
        {/* Summary tabs */}
        <div className="d-flex gap-3 mb-5">
          {Object.entries(MODE_CONFIG).map(([key, mc]) => {
            const count = countByStatus(mc.status);
            return (
              <Link
                key={key}
                to={`/doi-moi-sang-tao/quy-trinh-duyet/${key}`}
                className={`card flex-1 text-decoration-none border-2 ${key === mode ? `border-${mc.color}` : 'border-light'}`}
                style={{ minWidth: 150 }}
              >
                <div className="card-body py-4 px-5 d-flex align-items-center">
                  <div className={`symbol symbol-40px me-3`}>
                    <div className={`symbol-label bg-light-${mc.color}`}>
                      <i className={`fa-regular ${mc.icon} text-${mc.color}`} />
                    </div>
                  </div>
                  <div>
                    <div className={`fs-3 fw-bold text-${mc.color}`}>{count}</div>
                    <div className="fs-7 text-muted">{mc.title}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="card">
          <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center">
            <h3 className="card-title fw-bold text-gray-800">
              <Tag color={cfg.color} className="me-2 fs-6">{data.length}</Tag>
              {cfg.title}
              {quaHanOnly && (
                <>
                  <Tag color="error" className="ms-2 fs-8">
                    <i className="fa-regular fa-triangle-exclamation me-1" />Chỉ hiển thị hồ sơ quá hạn
                  </Tag>
                  <Link to={`/doi-moi-sang-tao/quy-trinh-duyet/${mode}`} className="fs-8 ms-2">
                    Xóa lọc
                  </Link>
                </>
              )}
            </h3>
            <div className="d-flex gap-2 align-items-center">
              <Input
                placeholder="Tìm theo mã, tên, người đề xuất..."
                prefix={<i className="fa-regular fa-search text-muted" />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 280 }}
                allowClear
              />
              <Tooltip title="Làm mới">
                <Button icon={<i className="fa-regular fa-refresh" />} onClick={load} />
              </Tooltip>
            </div>
          </div>
          <div className="card-body py-3">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                bordered
                size="small"
                locale={{ emptyText: cfg.emptyText }}
              />
            </Spin>
          </div>
        </div>

        {/* Approve Modal */}
        <Modal
          title={<><i className="fa-regular fa-circle-check text-success me-2" />Xác nhận phê duyệt</>}
          open={!!approveId}
          onOk={handleApprove}
          onCancel={() => setApproveId(null)}
          okText="Phê duyệt"
          cancelText="Hủy"
          confirmLoading={actionLoading}
        >
          <p>Bạn có chắc chắn muốn phê duyệt (tiếp nhận) ý tưởng này?</p>
        </Modal>

        {/* Reject Modal */}
        <Modal
          title={<><i className="fa-regular fa-circle-xmark text-danger me-2" />Từ chối ý tưởng</>}
          open={!!rejectId}
          onOk={handleReject}
          onCancel={() => { setRejectId(null); setRejectReason(''); }}
          okText="Xác nhận từ chối"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          confirmLoading={actionLoading}
        >
          <p>Lý do từ chối (ý tưởng sẽ được trả lại cho người gửi chỉnh sửa):</p>
          <Input.TextArea
            rows={3}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối để người gửi cải thiện ý tưởng..."
          />
        </Modal>
      </Content>
    </>
  );
};
