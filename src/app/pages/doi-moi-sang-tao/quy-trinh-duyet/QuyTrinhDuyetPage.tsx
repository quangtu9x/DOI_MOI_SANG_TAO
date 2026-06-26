import React, { useState, useMemo } from 'react';
import { Table, Button, Tag, Input, Space, Modal, message, Tooltip } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { MOCK_Y_TUONG_DATA, TRANG_THAI_DISPLAY, TrangThaiYTuong } from '../quan-ly-y-tuong/QuanLyYTuongDMSTPage';

interface QuyTrinhDuyetPageProps {
  mode: 'cho-duyet' | 'da-duyet' | 'tu-choi';
}

const MODE_CONFIG = {
  'cho-duyet': {
    title: 'Chờ phê duyệt',
    trangThai: TrangThaiYTuong.ChoDuyet,
    color: 'warning',
    icon: 'fa-clock',
    emptyText: 'Không có ý tưởng nào đang chờ duyệt',
  },
  'da-duyet': {
    title: 'Đã phê duyệt',
    trangThai: TrangThaiYTuong.DaDuyet,
    color: 'success',
    icon: 'fa-circle-check',
    emptyText: 'Chưa có ý tưởng nào được phê duyệt',
  },
  'tu-choi': {
    title: 'Đã từ chối',
    trangThai: TrangThaiYTuong.TuChoi,
    color: 'danger',
    icon: 'fa-circle-xmark',
    emptyText: 'Chưa có ý tưởng nào bị từ chối',
  },
};

export const QuyTrinhDuyetPage: React.FC<QuyTrinhDuyetPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const cfg = MODE_CONFIG[mode];
  const [search, setSearch] = useState('');
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [localData, setLocalData] = useState(() => [...MOCK_Y_TUONG_DATA]);

  const data = useMemo(() => {
    return localData
      .filter(r => r.trangThai === cfg.trangThai)
      .filter(r => !search || r.tenYTuong.toLowerCase().includes(search.toLowerCase()) || r.ma.toLowerCase().includes(search.toLowerCase()));
  }, [search, cfg.trangThai, localData]);

  const countByStatus = (st: TrangThaiYTuong) => localData.filter(r => r.trangThai === st).length;

  const handleApprove = () => {
    setLocalData(prev => prev.map(r =>
      r.id === approveId ? { ...r, trangThai: TrangThaiYTuong.DaDuyet } : r
    ));
    setApproveId(null);
    message.success('Đã phê duyệt ý tưởng thành công!');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) { message.error('Vui lòng nhập lý do từ chối'); return; }
    setLocalData(prev => prev.map(r =>
      r.id === rejectId ? { ...r, trangThai: TrangThaiYTuong.TuChoi, lyDoTuChoi: rejectReason } : r
    ));
    setRejectId(null);
    setRejectReason('');
    message.success('Đã từ chối ý tưởng.');
  };

  const baseColumns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'ma',
      key: 'ma',
      width: 140,
      render: (t: string) => <span className="fw-bold text-primary">{t}</span>,
    },
    {
      title: 'Tên ý tưởng',
      dataIndex: 'tenYTuong',
      key: 'tenYTuong',
      render: (text: string, record: any) => (
        <div>
          <div className="fw-semibold">{text}</div>
          <span className="badge badge-light-info fs-8 mt-1">{record.linhVuc}</span>
        </div>
      ),
    },
    {
      title: 'Người gửi',
      dataIndex: 'nguoiGuiTen',
      key: 'nguoiGuiTen',
      width: 140,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'ngayNop',
      key: 'ngayNop',
      width: 110,
      render: (v: string) => v || '—',
    },
  ];

  const actionColumn = {
    title: 'Thao tác',
    key: 'action',
    width: mode === 'cho-duyet' ? 160 : 100,
    render: (_: unknown, record: any) => (
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
            <Tooltip title="Phê duyệt">
              <Button
                size="small"
                type="primary"
                icon={<i className="fa-regular fa-check" />}
                onClick={() => setApproveId(record.id)}
              />
            </Tooltip>
            <Tooltip title="Từ chối">
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

  const rejectReasonColumn = mode === 'tu-choi' ? [{
    title: 'Lý do từ chối',
    dataIndex: 'lyDoTuChoi',
    key: 'lyDoTuChoi',
    render: (v: string) => v ? <span className="text-danger fs-7">{v}</span> : '—',
  }] : [];

  const columns = [...baseColumns, ...rejectReasonColumn, actionColumn];

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
            const count = countByStatus(mc.trangThai);
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
            </h3>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<i className="fa-regular fa-search text-muted" />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 250 }}
            />
          </div>
          <div className="card-body py-3">
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              bordered
              size="small"
              locale={{ emptyText: cfg.emptyText }}
            />
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
        >
          <p>Bạn có chắc chắn muốn phê duyệt ý tưởng này?</p>
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
        >
          <p>Lý do từ chối:</p>
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
