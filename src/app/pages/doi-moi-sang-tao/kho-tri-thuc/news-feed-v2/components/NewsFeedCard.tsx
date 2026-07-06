import React from 'react';
import { Avatar } from 'antd';
import type { INewsFeedV2Item } from '../types';
import { NewsFeedInteractionBar } from './NewsFeedInteractionBar';

// ── Helpers (pattern từ CongDongPage) ────────────────────────────────────────

const AVATAR_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2'];
const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name ?? '').charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name?: string) => name?.charAt(0)?.toUpperCase() ?? '?';

const relativeTime = (date?: string): string => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(date).toLocaleDateString('vi-VN');
};

// ── Loại item config ─────────────────────────────────────────────────────────
// loaiItem 0 = TaiLieu (LoaiNewsFeedItem.TaiLieu trên BE)
// loaiItem 1 = BaiViet  (LoaiNewsFeedItem.BaiViet  trên BE)
const LOAI_CONFIG: Record<number, { label: string; badgeClass: string; borderColor: string; icon: string }> = {
  0: { label: 'Tài liệu', badgeClass: 'badge-light-primary', borderColor: '#1677ff', icon: 'fa-file-lines' },
  1: { label: 'Bài viết',  badgeClass: 'badge-light-success', borderColor: '#52c41a', icon: 'fa-pen-nib'   },
};
const DEFAULT_LOAI = LOAI_CONFIG[0];

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  item: INewsFeedV2Item;
  onLike: (item: INewsFeedV2Item) => void;
}

export const NewsFeedCard: React.FC<Props> = ({ item, onLike }) => {
  const loai = LOAI_CONFIG[item.loaiItem] ?? DEFAULT_LOAI;
  const authorName = item.tacGia?.hoTen;

  return (
    <div
      className="shadow-sm mb-3"
      style={{
        background: '#fff',
        borderRadius: 12,
        borderLeft: `4px solid ${loai.borderColor}`,
        transition: 'box-shadow 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
        (e.currentTarget as HTMLDivElement).style.transform = '';
      }}
    >
      <div className="p-4">
        {/* Header: avatar + author + time + loai badge */}
        <div className="d-flex align-items-center gap-3 mb-3">
          {authorName ? (
            <Avatar
              size={40}
              style={{ backgroundColor: getAvatarColor(authorName), flexShrink: 0, fontWeight: 600 }}
            >
              {getInitials(authorName)}
            </Avatar>
          ) : (
            <Avatar size={40} icon={<i className="fa-regular fa-user" />} style={{ flexShrink: 0 }} />
          )}

          <div className="flex-grow-1 min-w-0">
            <div className="fw-semibold fs-7 text-gray-800 text-truncate">
              {authorName ?? 'Ẩn danh'}
            </div>
            <div className="text-muted fs-8">
              <i className="fa-regular fa-clock me-1" />
              {relativeTime(item.createdOn)}
            </div>
          </div>

          <span
            className={`badge ${loai.badgeClass} d-flex align-items-center gap-1 flex-shrink-0`}
            style={{ borderRadius: 12, whiteSpace: 'nowrap' }}
          >
            <i className={`fa-regular ${loai.icon}`} />
            {loai.label}
          </span>
        </div>

        {/* Tiêu đề */}
        <div className="fw-bold fs-5 text-gray-900 mb-2" style={{ lineHeight: 1.4 }}>
          {item.tieuDe}
        </div>

        {/* Mô tả — 3-line clamp */}
        {item.moTa && (
          <div
            className="text-gray-600 fs-7 mb-3"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.7,
            }}
          >
            {item.moTa}
          </div>
        )}

        {/* TaiLieu-only: lượt xem + tags (loaiItem === 0) */}
        {item.loaiItem === 0 && (item.luotXem != null || (item.tags && item.tags.length > 0)) && (
          <div className="mb-2">
            {item.luotXem != null && (
              <span className="text-muted fs-8 me-3">
                <i className="fa-regular fa-eye me-1" />
                {item.luotXem.toLocaleString('vi-VN')} lượt xem
              </span>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mt-1">
                {item.tags.map(tag => (
                  <span key={tag} className="badge badge-light fs-9" style={{ fontWeight: 500 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Like + comment — pre-bind item để InteractionBar không cần biết về item */}
        <NewsFeedInteractionBar item={item} onLike={() => onLike(item)} />
      </div>
    </div>
  );
};
