import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { Tag, message } from 'antd';

// ── constants ────────────────────────────────────────────────────────────────

const VNA_BLUE = '#003087';
const VNA_GOLD = '#C5A028';

const STATS = [
  { label: 'Tổng ý tưởng',    value: 214, icon: 'fa-lightbulb',      color: 'primary', sub: '+18 trong tháng này' },
  { label: 'Chờ phê duyệt',   value: 31,  icon: 'fa-clock',           color: 'warning', sub: '5 quá hạn xử lý' },
  { label: 'Đã phê duyệt',    value: 127, icon: 'fa-circle-check',    color: 'success', sub: '59.3% tỷ lệ duyệt' },
  { label: 'Đang triển khai', value: 43,  icon: 'fa-plane-departure', color: 'info',    sub: 'Trên mạng bay nội địa' },
];

const MONTHLY = [
  { thang: 'T1', count: 18 },
  { thang: 'T2', count: 22 },
  { thang: 'T3', count: 29 },
  { thang: 'T4', count: 25 },
  { thang: 'T5', count: 33 },
  { thang: 'T6', count: 31 },
];
const maxMonthly = Math.max(...MONTHLY.map(m => m.count));

const LINH_VUC_DATA = [
  { name: 'Khai thác bay',       count: 52, pct: 24, color: '#3B82F6' },
  { name: 'Kỹ thuật bảo dưỡng', count: 45, pct: 21, color: '#10B981' },
  { name: 'Dịch vụ hành khách', count: 38, pct: 18, color: '#F59E0B' },
  { name: 'Dịch vụ mặt đất',    count: 32, pct: 15, color: '#EF4444' },
  { name: 'Công nghệ thông tin', count: 27, pct: 13, color: '#8B5CF6' },
];

const STATUS_COLORS: Record<string, string> = {
  'Đang soạn thảo': 'default',
  'Chờ duyệt':      'processing',
  'Đã duyệt':       'success',
  'Từ chối':        'error',
  'Được công nhận': 'purple',
};

interface IFeedPost {
  id:          string;
  ma:          string;
  ten:         string;
  moTa:        string;
  nguoiGui:    string;
  donVi:       string;
  ngay:        string;
  trangThai:   string;
  linhVuc:     string;
  initLikes:   number;
  initComments: number;
}

const FEED_POSTS: IFeedPost[] = [
  {
    id: '1', ma: 'YT-2026061501',
    ten:  'Số hóa check-in nội địa — tăng tốc phục vụ hành khách',
    moTa: 'Đề xuất triển khai hệ thống self check-in kiosk tại 8 sân bay nội địa trọng điểm, tích hợp nhận dạng khuôn mặt và mã QR, rút ngắn thời gian check-in xuống còn 90 giây/khách.',
    nguoiGui: 'Nguyễn Minh Tuấn', donVi: 'Ban Dịch vụ Mặt đất',
    ngay: '25/06/2026', trangThai: 'Chờ duyệt', linhVuc: 'Dịch vụ mặt đất',
    initLikes: 24, initComments: 7,
  },
  {
    id: '2', ma: 'YT-2026061502',
    ten:  'AI dự báo bảo trì động cơ phòng ngừa',
    moTa: 'Ứng dụng mô hình Machine Learning phân tích dữ liệu cảm biến động cơ theo thời gian thực, dự báo nguy cơ hỏng hóc trước 200 giờ bay để chủ động lên lịch bảo trì, giảm AOG.',
    nguoiGui: 'Trần Quang Hùng', donVi: 'Trung tâm Kỹ thuật A76',
    ngay: '24/06/2026', trangThai: 'Đã duyệt', linhVuc: 'Kỹ thuật bảo dưỡng',
    initLikes: 41, initComments: 12,
  },
  {
    id: '3', ma: 'YT-2026061503',
    ten:  'Tối ưu lịch trình bay — giảm tiêu hao nhiên liệu',
    moTa: 'Xây dựng thuật toán tối ưu hóa hành trình bay dựa trên dữ liệu thời tiết, luồng gió và mật độ không phận. Thí điểm trên 18 đường bay quốc tế, tiết kiệm 12 tỷ đồng/năm.',
    nguoiGui: 'Phạm Thị Lan', donVi: 'Ban Khai thác Bay',
    ngay: '23/06/2026', trangThai: 'Được công nhận', linhVuc: 'Khai thác bay',
    initLikes: 88, initComments: 21,
  },
  {
    id: '4', ma: 'YT-2026061504',
    ten:  'Hệ thống phản hồi hành khách thời gian thực qua QR',
    moTa: 'Lắp đặt màn hình QR tại các điểm tiếp xúc dịch vụ (cổng lên máy bay, khoang khách, phòng chờ), thu thập phản hồi tức thì và tổng hợp dashboard cho quản lý ca.',
    nguoiGui: 'Lê Thị Hương', donVi: 'Ban Dịch vụ Hành khách',
    ngay: '22/06/2026', trangThai: 'Đã duyệt', linhVuc: 'Dịch vụ hành khách',
    initLikes: 35, initComments: 9,
  },
  {
    id: '5', ma: 'YT-2026061505',
    ten:  'Blended Learning cho đào tạo phi công & tiếp viên',
    moTa: 'Xây dựng nền tảng e-learning kết hợp với buổi thực hành tại chỗ (70% online / 30% offline). Mô phỏng tình huống khẩn nguy bằng VR, giảm 30% thời gian đào tạo chứng chỉ định kỳ.',
    nguoiGui: 'Nguyễn Thành Nam', donVi: 'Trung tâm Đào tạo Bay',
    ngay: '21/06/2026', trangThai: 'Chờ duyệt', linhVuc: 'Đào tạo nhân lực',
    initLikes: 19, initComments: 4,
  },
];

// ── sub: PostCard ────────────────────────────────────────────────────────────

interface PostCardProps {
  post:          IFeedPost;
  liked:         boolean;
  likeCount:     number;
  onLike:        () => void;
  commentOpen:   boolean;
  onToggleComment: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post, liked, likeCount, onLike, commentOpen, onToggleComment,
}) => {
  const navigate = useNavigate();
  const [cmtText, setCmtText]   = useState('');
  const [comments, setComments] = useState<{ text: string; time: string }[]>([]);
  const cmtRef = useRef<HTMLTextAreaElement>(null);

  const handleShare = () => {
    const url = `${window.location.origin}/doi-moi-sang-tao/quan-ly-y-tuong/chi-tiet/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      message.success('Đã sao chép đường dẫn!');
    });
  };

  const handleSubmitComment = () => {
    const t = cmtText.trim();
    if (!t) return;
    setComments(prev => [{ text: t, time: 'Vừa xong' }, ...prev]);
    setCmtText('');
  };

  const initials = (name: string) =>
    name.split(' ').map(p => p[0]).slice(-2).join('').toUpperCase();

  return (
    <div style={{
      background: '#fff', borderRadius: 12, marginBottom: 16,
      border: '1px solid #f0f0f0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,48,135,0.09)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
    >
      {/* Gold top stripe for "Được công nhận" */}
      {post.trangThai === 'Được công nhận' && (
        <div style={{ height: 3, background: `linear-gradient(90deg, ${VNA_BLUE}, ${VNA_GOLD})` }} />
      )}

      <div style={{ padding: '16px 20px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
            background: VNA_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            {initials(post.nguoiGui)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>{post.nguoiGui}</span>
              <span style={{ fontSize: '0.75rem', color: '#999' }}>·</span>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{post.donVi}</span>
              <span style={{ fontSize: '0.75rem', color: '#999' }}>·</span>
              <span style={{ fontSize: '0.75rem', color: '#bbb' }}>{post.ngay}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <Tag color={STATUS_COLORS[post.trangThai] ?? 'default'} style={{ fontSize: 11, margin: 0 }}>
                {post.trangThai}
              </Tag>
              <Tag color='blue' style={{ fontSize: 11, margin: 0 }}>{post.linhVuc}</Tag>
              <span style={{ fontSize: '0.72rem', color: '#bbb', alignSelf: 'center' }}>{post.ma}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          onClick={() => navigate(`/doi-moi-sang-tao/quan-ly-y-tuong/chi-tiet/${post.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: VNA_BLUE, marginBottom: 6, lineHeight: 1.4 }}>
            {post.ten}
          </h3>
          <p style={{
            fontSize: '0.85rem', color: '#555', lineHeight: 1.6, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.moTa}
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '8px 0', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5',
          fontSize: '0.78rem', color: '#aaa',
        }}>
          {likeCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: '#e0443a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className='fa-solid fa-heart' style={{ fontSize: 8, color: '#fff' }} />
              </span>
              {likeCount}
            </span>
          )}
          {(post.initComments + comments.length) > 0 && (
            <span style={{ marginLeft: 'auto' }}>
              {post.initComments + comments.length} bình luận
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 4, padding: '4px 0 12px' }}>
          {/* Like */}
          <ActionBtn
            icon={liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
            label='Thích'
            active={liked}
            activeColor='#e0443a'
            onClick={onLike}
          />
          {/* Comment */}
          <ActionBtn
            icon='fa-regular fa-comment'
            label='Bình luận'
            active={commentOpen}
            activeColor={VNA_BLUE}
            onClick={() => {
              onToggleComment();
              if (!commentOpen) setTimeout(() => cmtRef.current?.focus(), 80);
            }}
          />
          {/* Share */}
          <ActionBtn
            icon='fa-regular fa-share-nodes'
            label='Chia sẻ'
            active={false}
            activeColor={VNA_BLUE}
            onClick={handleShare}
          />
          {/* View detail */}
          <div style={{ marginLeft: 'auto' }}>
            <Link
              to={`/doi-moi-sang-tao/quan-ly-y-tuong/chi-tiet/${post.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                borderRadius: 8, border: `1px solid ${VNA_BLUE}30`,
                color: VNA_BLUE, fontSize: '0.8rem', fontWeight: 600,
                textDecoration: 'none', background: '#f0f5ff',
                transition: 'background 0.15s',
              }}
            >
              <i className='fa-regular fa-arrow-up-right-from-square' style={{ fontSize: 12 }} />
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>

      {/* Comment panel */}
      {commentOpen && (
        <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #f0f0f0', background: '#fafbff' }}>
          {/* Recent comments */}
          {comments.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {comments.slice(0, 3).map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: VNA_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 11,
                  }}>
                    Me
                  </div>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '6px 12px', border: '1px solid #eee', flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: VNA_BLUE }}>Bạn</span>
                    <span style={{ fontSize: '0.75rem', color: '#bbb', marginLeft: 8 }}>{c.time}</span>
                    <p style={{ margin: '2px 0 0', fontSize: '0.83rem', color: '#444' }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: VNA_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 11, marginTop: 2,
            }}>
              Me
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={cmtRef}
                value={cmtText}
                onChange={e => setCmtText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(); }
                }}
                placeholder='Viết bình luận... (Enter để gửi)'
                rows={2}
                style={{
                  width: '100%', resize: 'none', borderRadius: 10, border: '1px solid #ddd',
                  padding: '9px 46px 9px 14px', fontSize: '0.85rem', lineHeight: 1.5, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = VNA_BLUE; }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; }}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!cmtText.trim()}
                style={{
                  position: 'absolute', right: 8, bottom: 8,
                  border: 'none', borderRadius: 8,
                  background: cmtText.trim() ? VNA_BLUE : '#e0e0e0',
                  color: '#fff', width: 30, height: 30,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: cmtText.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                <i className='fa-solid fa-paper-plane-top' style={{ fontSize: 12 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── sub: ActionBtn ───────────────────────────────────────────────────────────

const ActionBtn: React.FC<{
  icon: string; label: string; active: boolean; activeColor: string; onClick: () => void;
}> = ({ icon, label, active, activeColor, onClick }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, border: 'none', background: 'none', borderRadius: 8, padding: '7px 4px',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 6, fontSize: '0.82rem', fontWeight: 600,
      color: active ? activeColor : '#777',
      transition: 'background 0.12s, color 0.12s',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
  >
    <i className={icon} style={{ fontSize: 15 }} />
    <span>{label}</span>
  </button>
);

// ── main page ────────────────────────────────────────────────────────────────

export const DashboardDoiMoiPage: React.FC = () => {
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    Object.fromEntries(FEED_POSTS.map(p => [p.id, p.initLikes]))
  );
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());

  const handleLike = (id: string) => {
    const wasLiked = likes[id] ?? false;
    setLikes(prev => ({ ...prev, [id]: !wasLiked }));
    setLikeCounts(prev => ({ ...prev, [id]: (prev[id] ?? 0) + (wasLiked ? -1 : 1) }));
  };

  const toggleComment = (id: string) => {
    setOpenComments(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <PageTitle breadcrumbs={[]}>Tổng quan Đổi mới sáng tạo</PageTitle>
      <Content>

        {/* Stats row */}
        <div className='row g-5 mb-6'>
          {STATS.map((s, i) => (
            <div key={i} className='col-sm-6 col-xl-3'>
              <div className={`card card-flush border-${s.color} border-start border-4 h-100`}>
                <div className='card-body d-flex align-items-center py-5 px-6'>
                  <div className='symbol symbol-50px me-4'>
                    <div className={`symbol-label bg-light-${s.color}`}>
                      <i className={`fa-regular ${s.icon} fs-2x text-${s.color}`} />
                    </div>
                  </div>
                  <div>
                    <div className={`fs-2 fw-bold text-${s.color}`}>{s.value}</div>
                    <div className='fs-6 fw-semibold text-gray-700'>{s.label}</div>
                    <div className='fs-8 text-muted mt-1'>{s.sub}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main two-column layout */}
        <div className='row g-5'>

          {/* ── Left: Social Feed ── */}
          <div className='col-xl-8'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#333' }}>
                <i className='fa-regular fa-rectangle-history me-2' style={{ color: VNA_BLUE }} />
                Hoạt động mới nhất
              </h3>
              <Link
                to='/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach'
                style={{
                  fontSize: '0.82rem', color: VNA_BLUE, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
                }}
              >
                Xem tất cả <i className='fa-regular fa-arrow-right' />
              </Link>
            </div>

            {/* Post cards */}
            {FEED_POSTS.map(post => (
              <PostCard
                key={post.id}
                post={post}
                liked={likes[post.id] ?? false}
                likeCount={likeCounts[post.id] ?? post.initLikes}
                onLike={() => handleLike(post.id)}
                commentOpen={openComments.has(post.id)}
                onToggleComment={() => toggleComment(post.id)}
              />
            ))}

            {/* Load more */}
            <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 8 }}>
              <Link
                to='/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach'
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 28px', borderRadius: 20,
                  border: `1px solid ${VNA_BLUE}30`, color: VNA_BLUE,
                  fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                  background: '#f5f8ff', transition: 'background 0.15s',
                }}
              >
                <i className='fa-regular fa-ellipsis' />
                Xem thêm ý tưởng
              </Link>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div className='col-xl-4'>

            {/* Quick actions */}
            <div style={{
              background: `linear-gradient(135deg, ${VNA_BLUE} 0%, #0046A6 100%)`,
              borderRadius: 12, padding: '20px 20px', marginBottom: 16, color: '#fff',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 14 }}>
                <i className='fa-regular fa-plus-circle me-2' style={{ color: VNA_GOLD }} />
                Hành động nhanh
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: 'fa-lightbulb', label: 'Đăng ý tưởng mới', to: '/doi-moi-sang-tao/quan-ly-y-tuong/tao-moi' },
                  { icon: 'fa-books', label: 'Kho tri thức', to: '/doi-moi-sang-tao/kho-tri-thuc' },
                  { icon: 'fa-users', label: 'Cộng đồng', to: '/doi-moi-sang-tao/kho-tri-thuc/cong-dong' },
                  { icon: 'fa-newspaper', label: 'News Feed', to: '/doi-moi-sang-tao/kho-tri-thuc/news-feed' },
                ].map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 14px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.1)'; }}
                  >
                    <i className={`fa-regular ${item.icon}`} style={{ fontSize: 14, color: VNA_GOLD, width: 18 }} />
                    {item.label}
                    <i className='fa-regular fa-chevron-right' style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.6 }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Monthly mini chart */}
            <div className='card mb-4'>
              <div className='card-header border-0 pt-4 pb-2'>
                <h4 className='card-title fw-semibold text-gray-700 fs-7'>
                  <i className='fa-regular fa-chart-bar me-2' />Ý tưởng theo tháng (2026)
                </h4>
              </div>
              <div className='card-body pt-2 pb-4'>
                <div className='d-flex align-items-end gap-2' style={{ height: 100 }}>
                  {MONTHLY.map((m, i) => (
                    <div key={i} className='d-flex flex-column align-items-center flex-1'>
                      <div className='fw-bold text-gray-600 mb-1' style={{ fontSize: 10 }}>{m.count}</div>
                      <div
                        className='rounded-top w-100'
                        style={{
                          height: `${(m.count / maxMonthly) * 72}px`,
                          background: `linear-gradient(180deg, ${VNA_BLUE} 0%, #60A5FA 100%)`,
                          minHeight: 4,
                        }}
                      />
                      <div className='text-muted mt-1' style={{ fontSize: 10 }}>{m.thang}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lĩnh vực breakdown */}
            <div className='card'>
              <div className='card-header border-0 pt-4 pb-2'>
                <h4 className='card-title fw-semibold text-gray-700 fs-7'>
                  <i className='fa-regular fa-chart-pie me-2' />Phân bổ theo lĩnh vực
                </h4>
              </div>
              <div className='card-body pt-2 pb-3'>
                {LINH_VUC_DATA.map((lv, i) => (
                  <div key={i} className='d-flex align-items-center mb-3'>
                    <div
                      className='rounded-circle me-3 flex-shrink-0'
                      style={{ width: 8, height: 8, background: lv.color }}
                    />
                    <div className='flex-grow-1'>
                      <div className='d-flex justify-content-between mb-1'>
                        <span className='fs-8 fw-semibold text-gray-700'>{lv.name}</span>
                        <span className='fs-8 text-muted'>{lv.count}</span>
                      </div>
                      <div className='bg-light rounded' style={{ height: 5 }}>
                        <div
                          className='rounded'
                          style={{ height: 5, width: `${lv.pct}%`, background: lv.color, transition: 'width 0.6s ease' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </Content>
    </>
  );
};
