import React, { useState } from 'react';
import { Popover, Avatar, Spin, Empty } from 'antd';
import { getNguoiThich, INguoiThich } from '@/app/services/khoTriThucApi';

const AVATAR_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2'];
const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name ?? '?').charCodeAt(0) % AVATAR_COLORS.length];

const relativeTime = (date?: string | null) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(date).toLocaleDateString('vi-VN');
};

interface Props {
  /** LoaiNoiDung: 1=Tài liệu, 2=Bài viết, 3=Bình luận */
  loaiDoiTuong: number;
  doiTuongId: string;
  /** Phần tử trigger — thường là số lượt thích */
  children: React.ReactNode;
}

/**
 * Bọc quanh số lượt thích — hover/bấm để xem danh sách người đã thích.
 * Chỉ tải dữ liệu khi popover mở lần đầu.
 */
export const NguoiThichPopover: React.FC<Props> = ({ loaiDoiTuong, doiTuongId, children }) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [users, setUsers] = useState<INguoiThich[]>([]);

  const load = async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const res = await getNguoiThich(loaiDoiTuong, doiTuongId);
      const d = (res as any)?.data;
      setUsers(d?.data ?? d ?? []);
      setLoaded(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const content = (
    <div style={{ minWidth: 220, maxWidth: 280 }}>
      <Spin spinning={loading}>
        {loaded && users.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có ai thích" />
        ) : (
          <div className="d-flex flex-column gap-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
            {users.map(u => (
              <div key={u.nguoiDungId + (u.thoiGian ?? '')} className="d-flex align-items-center gap-2">
                <Avatar size={28} src={u.hinhDaiDien || undefined}
                  style={{ backgroundColor: getAvatarColor(u.hoTen ?? '?'), flexShrink: 0, fontSize: 12 }}>
                  {(u.hoTen ?? '?').charAt(0).toUpperCase()}
                </Avatar>
                <div className="flex-grow-1 min-w-0">
                  <div className="fs-8 fw-semibold text-gray-800 text-truncate">{u.hoTen ?? 'Ẩn danh'}</div>
                </div>
                <span className="text-muted" style={{ fontSize: 11, flexShrink: 0 }}>{relativeTime(u.thoiGian)}</span>
              </div>
            ))}
          </div>
        )}
      </Spin>
    </div>
  );

  return (
    <Popover
      title={<span><i className="fa-solid fa-heart text-danger me-2" />Người đã thích</span>}
      content={content}
      trigger={['hover', 'click']}
      onOpenChange={open => { if (open) load(); }}
      placement="top"
    >
      <span style={{ cursor: 'pointer' }}>{children}</span>
    </Popover>
  );
};
