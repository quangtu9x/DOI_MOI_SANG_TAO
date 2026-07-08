import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { Button, Checkbox, Empty, Modal, Tag, message } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { getIdeaDashboard, searchIdeas } from '@/app/services/ideaPortalApi';
import type { IIdea, IIdeaDashboard } from '@/models/idea-portal';

// ── constants ────────────────────────────────────────────────────────────────

const VNA_BLUE = '#003087';
const VNA_GOLD = '#C5A028';

const LV_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];

// ── Dashboard tiến độ CĐS/R&D/Sandbox (IV.12) ────────────────────────────────
// Mock — chờ module quản lý chương trình CĐS/R&D; số liệu đồng bộ với trang Báo cáo.
interface ICdsProgram {
  ten: string;
  loai: 'CĐS' | 'R&D' | 'Sandbox';
  trangThai: 'Đúng hạn' | 'Trễ tiến độ' | 'Rủi ro';
  tienDo: number;    // % hoàn thành
  nganSach: number;  // % ngân sách đã dùng
  batDau: string;
  ketThuc: string;
  mocHoanThanh: number;
  mocTong: number;
}

const CDS_DASHBOARD: ICdsProgram[] = [
  { ten: 'Nền tảng dữ liệu hành khách 360°', loai: 'CĐS', trangThai: 'Đúng hạn', tienDo: 72, nganSach: 65, batDau: '2026-01-15', ketThuc: '2026-10-30', mocHoanThanh: 6, mocTong: 8 },
  { ten: 'Sandbox AI dự báo bảo trì động cơ', loai: 'Sandbox', trangThai: 'Rủi ro', tienDo: 45, nganSach: 80, batDau: '2026-02-01', ketThuc: '2026-09-15', mocHoanThanh: 3, mocTong: 6 },
  { ten: 'Ứng dụng di động cho phi hành đoàn', loai: 'CĐS', trangThai: 'Trễ tiến độ', tienDo: 30, nganSach: 55, batDau: '2026-03-10', ketThuc: '2026-08-31', mocHoanThanh: 2, mocTong: 5 },
  { ten: 'Tự động hóa quy trình kế toán (RPA)', loai: 'CĐS', trangThai: 'Đúng hạn', tienDo: 90, nganSach: 88, batDau: '2025-11-01', ketThuc: '2026-07-31', mocHoanThanh: 4, mocTong: 4 },
  { ten: 'R&D vật liệu tiết kiệm nhiên liệu', loai: 'R&D', trangThai: 'Đúng hạn', tienDo: 55, nganSach: 40, batDau: '2026-01-01', ketThuc: '2026-12-31', mocHoanThanh: 4, mocTong: 7 },
];

const CDS_STATUS_HEX: Record<ICdsProgram['trangThai'], string> = {
  'Đúng hạn': '#22c55e',
  'Trễ tiến độ': '#ef4444',
  'Rủi ro': '#f59e0b',
};

/** Cảnh báo: trễ tiến độ / rủi ro / ngân sách vượt xa tiến độ (>15 điểm %) */
const CDS_ALERTS = CDS_DASHBOARD.flatMap(p => {
  const alerts: { ten: string; noiDung: string; mau: string; icon: string }[] = [];
  if (p.trangThai === 'Trễ tiến độ')
    alerts.push({ ten: p.ten, noiDung: `Trễ tiến độ — mới đạt ${p.tienDo}%, hoàn thành ${p.mocHoanThanh}/${p.mocTong} mốc`, mau: '#ef4444', icon: 'fa-clock-rotate-left' });
  if (p.trangThai === 'Rủi ro')
    alerts.push({ ten: p.ten, noiDung: `Có rủi ro — cần rà soát kế hoạch các mốc còn lại (${p.mocHoanThanh}/${p.mocTong})`, mau: '#f59e0b', icon: 'fa-triangle-exclamation' });
  if (p.nganSach - p.tienDo > 15)
    alerts.push({ ten: p.ten, noiDung: `Ngân sách đã dùng ${p.nganSach}% trong khi tiến độ mới ${p.tienDo}% — nguy cơ vượt ngân sách`, mau: '#b5179e', icon: 'fa-sack-dollar' });
  return alerts;
});

// ── Quỹ thưởng ĐMST (IV.13/IV.15) ────────────────────────────────────────────
// Mock — chờ module quản lý quỹ/ví điểm thưởng; số liệu đồng bộ với trang Báo cáo.
interface IQuyThuong {
  loaiQuy: string;
  nganSachDau: number; // tổng ngân sách quỹ (VND)
  daChi: number;       // đã chi (VND)
}

const QUY_THUONG: IQuyThuong[] = [
  { loaiQuy: 'Quỹ phát triển KHCN Tổng công ty', nganSachDau: 20000000000, daChi: 8200000000 },
  { loaiQuy: 'Quỹ ĐMST cấp đơn vị', nganSachDau: 6000000000, daChi: 3450000000 },
  { loaiQuy: 'Quỹ khen thưởng sáng kiến', nganSachDau: 2500000000, daChi: 1780000000 },
];

const QUY_THUONG_TONG = QUY_THUONG.reduce((s, q) => s + q.nganSachDau, 0);
const QUY_THUONG_DA_CHI = QUY_THUONG.reduce((s, q) => s + q.daChi, 0);

// Số dư ví điểm thưởng hiện tại theo loại — đồng bộ với tab "Ví và giao dịch" trang Báo cáo.
const VI_DIEM_THUONG: { vi: 'Cánh sen' | 'Bông sen'; soDu: number; mau: string }[] = [
  { vi: 'Cánh sen', soDu: 2150, mau: '#EC4899' },
  { vi: 'Bông sen', soDu: 3400, mau: '#F59E0B' },
];

const STATUS_COLORS: Record<string, string> = {
  'Bản nháp': 'default',
  'Đã nộp': 'processing',
  'Đã tiếp nhận': 'success',
  'Đã trả lại': 'error',
  'Đã hủy': 'default',
  'Được công nhận': 'purple',
};

type DashboardWidgetKey = 'feed' | 'kpi' | 'sla' | 'cds' | 'quyThuong' | 'monthly' | 'status' | 'field';

const DASHBOARD_LAYOUT_STORAGE_KEY = 'dmst.dashboard.layout.v1';
const DEFAULT_DASHBOARD_WIDGET_ORDER: DashboardWidgetKey[] = ['feed', 'kpi', 'sla', 'cds', 'quyThuong', 'monthly', 'status', 'field'];

const DASHBOARD_WIDGET_LABELS: Record<DashboardWidgetKey, string> = {
  feed: 'Hoạt động mới nhất',
  kpi: 'KPI tổng quan',
  sla: 'SLA / quá hạn',
  cds: 'Tiến độ CĐS / R&D / Sandbox',
  quyThuong: 'Quỹ thưởng',
  monthly: 'Biểu đồ theo tháng',
  status: 'Phân bố theo trạng thái',
  field: 'Phân bổ theo lĩnh vực',
};

const DEFAULT_DASHBOARD_LAYOUT = () => ({
  order: DEFAULT_DASHBOARD_WIDGET_ORDER,
  visible: Object.fromEntries(DEFAULT_DASHBOARD_WIDGET_ORDER.map(k => [k, true])) as Record<DashboardWidgetKey, boolean>,
});

const readDashboardLayout = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_DASHBOARD_LAYOUT();
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_DASHBOARD_LAYOUT();
    }

    const parsed = JSON.parse(raw) as {
      order?: DashboardWidgetKey[];
      visible?: Partial<Record<DashboardWidgetKey, boolean>>;
    };

    const order = DEFAULT_DASHBOARD_WIDGET_ORDER.filter(key => parsed.order?.includes(key)).concat(
      DEFAULT_DASHBOARD_WIDGET_ORDER.filter(key => !parsed.order?.includes(key))
    );

    return {
      order,
      visible: DEFAULT_DASHBOARD_WIDGET_ORDER.reduce((acc, key) => {
        acc[key] = parsed.visible?.[key] ?? true;
        return acc;
      }, {} as Record<DashboardWidgetKey, boolean>),
    };
  } catch {
    return DEFAULT_DASHBOARD_LAYOUT();
  }
};

interface IFeedPost {
  id: string;
  ma: string;
  ten: string;
  moTa: string;
  nguoiGui: string;
  donVi: string;
  ngay: string;
  trangThai: string;
  linhVuc: string;
  initLikes: number;
  initComments: number;
}

const fmtDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

const toFeedPost = (idea: IIdea): IFeedPost => {
  const shortId = (idea.id ?? '').replace(/-/g, '').slice(-6).toUpperCase();
  return {
    id: idea.id,
    ma: idea.code ?? `YT-${shortId}`,
    ten: idea.title,
    moTa: idea.expectedBenefit || idea.problemDescription || idea.ideaContent || 'Không có mô tả',
    nguoiGui: idea.nguoiDeXuat || (idea.createdBy ? String(idea.createdBy) : 'Ẩn danh'),
    donVi: idea.donViCongTac || '—',
    ngay: fmtDate(idea.submittedOn || idea.submittedAt || idea.createdOn || idea.createdAt),
    trangThai: idea.status || 'Bản nháp',
    linhVuc: idea.linhVuc || 'Khác',
    initLikes: 0,
    initComments: 0,
  };
};

const extractIdeas = (res: any): IIdea[] => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.result)) return d.result;
  return [];
};

// ── sub: PostCard ────────────────────────────────────────────────────────────

interface PostCardProps {
  post: IFeedPost;
  liked: boolean;
  likeCount: number;
  onLike: () => void;
  commentOpen: boolean;
  onToggleComment: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post, liked, likeCount, onLike, commentOpen, onToggleComment,
}) => {
  const navigate = useNavigate();
  const [cmtText, setCmtText] = useState('');
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
  const [feedPosts, setFeedPosts] = useState<IFeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [dashboardLayout, setDashboardLayout] = useState(readDashboardLayout);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [draggingWidget, setDraggingWidget] = useState<DashboardWidgetKey | null>(null);

  // ── Số liệu thật từ API báo cáo ──────────────────────────────────────────
  const [dash, setDash] = useState<IIdeaDashboard | null>(null);

  useEffect(() => {
    getIdeaDashboard()
      .then(res => {
        const d = (res as any)?.data;
        setDash(d?.data ?? d ?? null);
      })
      .catch(() => { /* giữ giá trị 0 */ });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(dashboardLayout));
    } catch {
      // ignore localStorage failures
    }
  }, [dashboardLayout]);

  const reorderWidgetLayout = (fromWidget: DashboardWidgetKey, toWidget: DashboardWidgetKey) => {
    if (fromWidget === toWidget) return;

    setDashboardLayout(prev => {
      const nextOrder = [...prev.order];
      const fromIndex = nextOrder.indexOf(fromWidget);
      const toIndex = nextOrder.indexOf(toWidget);
      if (fromIndex < 0 || toIndex < 0) return prev;

      nextOrder.splice(fromIndex, 1);
      nextOrder.splice(toIndex, 0, fromWidget);
      return { ...prev, order: nextOrder };
    });
  };

  const toggleWidgetVisibility = (widget: DashboardWidgetKey, visible: boolean) => {
    setDashboardLayout(prev => ({
      ...prev,
      visible: { ...prev.visible, [widget]: visible },
    }));
  };

  const handleWidgetDragEnd = () => {
    setDraggingWidget(null);
  };

  const handleVisibleChange = (checkedWidgets: DashboardWidgetKey[]) => {
    if (checkedWidgets.length === 0) {
      return;
    }

    setDashboardLayout(prev => ({
      ...prev,
      visible: DEFAULT_DASHBOARD_WIDGET_ORDER.reduce((acc, widget) => {
        acc[widget] = checkedWidgets.includes(widget);
        return acc;
      }, {} as Record<DashboardWidgetKey, boolean>),
    }));
  };

  useEffect(() => {
    let active = true;

    const loadFeed = async () => {
      try {
        const [recognizedRes, latestRes] = await Promise.allSettled([
          searchIdeas({ pageNumber: 1, pageSize: 8, status: 'Được công nhận' }),
          searchIdeas({ pageNumber: 1, pageSize: 24 }),
        ]);

        const recognized = recognizedRes.status === 'fulfilled' ? extractIdeas(recognizedRes.value) : [];
        const latest = latestRes.status === 'fulfilled' ? extractIdeas(latestRes.value) : [];

        const postMap = new Map<string, IFeedPost>();
        [...recognized, ...latest].forEach(x => {
          if (!x?.id || postMap.has(x.id)) return;
          postMap.set(x.id, toFeedPost(x));
        });

        const merged = Array.from(postMap.values()).slice(0, 8);
        if (!active) return;

        setFeedPosts(merged);
        setLikeCounts(prev => {
          const next: Record<string, number> = {};
          merged.forEach(p => {
            next[p.id] = prev[p.id] ?? p.initLikes;
          });
          return next;
        });
      } catch {
        if (!active) return;
        setFeedPosts([]);
      } finally {
        if (active) setFeedLoading(false);
      }
    };

    loadFeed();
    return () => { active = false; };
  }, []);

  const STATS = [
    {
      label: 'Tổng ý tưởng', value: dash?.tongYTuong ?? 0, icon: 'fa-lightbulb', color: VNA_BLUE,
      sub: `${dash?.soNguoiThamGia ?? 0} người tham gia`,
      to: '/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach',
    },
    {
      label: 'Đã nộp/Chờ xét duyệt', value: dash?.soDaNop ?? 0, icon: 'fa-clock', color: '#F59F00',
      sub: dash?.soTonDong ? `${dash.soTonDong} quá hạn xử lý` : 'Không có tồn đọng',
      to: '/doi-moi-sang-tao/quy-trinh-duyet/cho-duyet',
    },
    {
      label: 'Đã tiếp nhận', value: dash?.soDaTiepNhan ?? 0, icon: 'fa-circle-check', color: '#17C653',
      sub: dash && dash.tongYTuong > 0
        ? `${Math.round(((dash.soDaTiepNhan + dash.soDuocCongNhan) / dash.tongYTuong) * 100)}% tỷ lệ duyệt`
        : '—',
      to: '/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach',
    },
    {
      label: 'Được công nhận', value: dash?.soDuocCongNhan ?? 0, icon: 'fa-medal', color: '#7239EA',
      sub: `${dash?.soDonViThamGia ?? 0} đơn vị tham gia`,
      to: `/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach?status=${encodeURIComponent('Được công nhận')}`,
    },
  ];

  const MONTHLY = (dash?.nopTheoThang ?? Array(12).fill(0))
    .map((count, i) => ({ thang: `T${i + 1}`, count }));
  const maxMonthly = Math.max(...MONTHLY.map(m => m.count), 1);

  const totalLv = (dash?.theoLinhVuc ?? []).reduce((s, x) => s + x.soLuong, 0);
  const LINH_VUC_DATA = (dash?.theoLinhVuc ?? []).slice(0, 6).map((x, i) => ({
    name: x.ten,
    count: x.soLuong,
    pct: totalLv > 0 ? Math.round((x.soLuong / totalLv) * 100) : 0,
    color: LV_COLORS[i % LV_COLORS.length],
  }));

  const monthlyOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors: [VNA_BLUE],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: Array.from({ length: 12 }, (_, i) => `T${i + 1}`) },
    yaxis: { labels: { formatter: (v: number) => `${Math.round(v)}` } },
    grid: { strokeDashArray: 4 },
  };

  const chartMonthlySeries = dash?.nopTheoThang ?? Array(12).fill(0);
  const statusSeries = dash
    ? [dash.soBanNhap, dash.soDaNop, dash.soDaTiepNhan, dash.soTraLai, dash.soDuocCongNhan]
    : [];
  const statusOptions: ApexOptions = {
    labels: ['Bản nháp', 'Đã nộp/Chờ xét duyệt', 'Đã tiếp nhận', 'Đã trả lại', 'Được công nhận'],
    colors: ['#94a3b8', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
  };

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

  const visibleSidebarWidgets = dashboardLayout.order.filter(widget =>
    ['monthly', 'status', 'field'].includes(widget) && dashboardLayout.visible[widget]
  ) as DashboardWidgetKey[];

  const feedVisible = dashboardLayout.visible.feed !== false;

  const renderSidebarWidget = (widget: DashboardWidgetKey) => {
    switch (widget) {
      case 'monthly':
        return (
          <div className='card mb-4'>
            <div className='card-header border-0 pt-4 pb-2'>
              <h4 className='card-title fw-semibold text-gray-700 fs-7'>
                <i className='fa-regular fa-chart-bar me-2' />Ý tưởng theo tháng{dash?.nam ? ` (${dash.nam})` : ''}
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
        );

      case 'status':
        return (
          <div className='card mb-4'>
            <div className='card-header border-0 pt-4 pb-2'>
              <h4 className='card-title fw-semibold text-gray-700 fs-7'>
                <i className='fa-regular fa-chart-pie me-2' />Phân bố theo trạng thái
              </h4>
            </div>
            <div className='card-body pt-2 pb-4'>
              {statusSeries.every(v => v === 0)
                ? <Empty description='Chưa có dữ liệu' style={{ padding: 24 }} />
                : <ReactApexChart type='donut' height={220} series={statusSeries} options={statusOptions} />}
            </div>
          </div>
        );

      case 'field':
        return (
          <div className='card mb-4'>
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
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PageTitle breadcrumbs={[]}>Tổng quan Đổi mới sáng tạo</PageTitle>
      <Content>
        {/* ── Hero header: tiêu đề + hành động nhanh ── */}
        <div
          className='mb-5'
          style={{
            backgroundImage: `linear-gradient(120deg, ${VNA_BLUE} 0%, #0046A6 65%, #0a5bc4 100%)`,
            backgroundColor: VNA_BLUE,
            borderRadius: 14, padding: '20px 24px', color: '#fff',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
          }}
        >
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1.12rem', lineHeight: 1.3 }}>
              <i className='fa-regular fa-lightbulb-on me-2' style={{ color: VNA_GOLD }} />
              Tổng quan Đổi mới sáng tạo
            </div>
            <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: 4 }}>
              Theo dõi ý tưởng, tiến độ xử lý hồ sơ và các chương trình CĐS / R&D / Sandbox
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <Link
              to='/doi-moi-sang-tao/quan-ly-y-tuong/tao-moi'
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px',
                borderRadius: 8, background: VNA_GOLD, color: '#1a1a1a',
                fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
              }}
            >
              <i className='fa-solid fa-plus' style={{ fontSize: 12 }} />
              Đăng ý tưởng mới
            </Link>
            {[
              { icon: 'fa-books', label: 'Kho tri thức', to: '/doi-moi-sang-tao/kho-tri-thuc' },
              { icon: 'fa-users', label: 'Cộng đồng', to: '/doi-moi-sang-tao/kho-tri-thuc/cong-dong' },
              { icon: 'fa-newspaper', label: 'Bảng tin', to: '/doi-moi-sang-tao/kho-tri-thuc/news-feed' },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.to}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px',
                  borderRadius: 8, background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#fff', fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.22)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.12)'; }}
              >
                <i className={`fa-regular ${item.icon}`} style={{ fontSize: 13, color: VNA_GOLD }} />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => setLayoutModalOpen(true)}
              title='Tùy biến giao diện'
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 8,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
                color: '#fff', cursor: 'pointer',
              }}
            >
              <i className='fa-regular fa-sliders' />
            </button>
          </div>
        </div>

        {/* Stats row */}
        {dashboardLayout.visible.kpi !== false && (
        <div className='row g-2 mb-5'>
          {STATS.map((s, i) => (
            <div key={i} className='col-sm-6 col-xl-3'>
              <Link
                to={s.to}
                className='card card-flush h-100 text-decoration-none'
                style={{ borderLeft: `3px solid ${s.color}`, transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}
              >
                <div className='card-body d-flex align-items-center py-2 px-3'>
                  <div className='symbol symbol-30px me-2' style={{ flexShrink: 0 }}>
                    <div className='symbol-label' style={{ background: `${s.color}1a` }}>
                      <i className={`fa-regular ${s.icon} fs-5`} style={{ color: s.color }} />
                    </div>
                  </div>
                  <div className='min-w-0'>
                    <div className='fs-4 fw-bold' style={{ color: s.color }}>{s.value}</div>
                    <div className='fs-8 fw-semibold text-gray-700 text-truncate'>{s.label}</div>
                    <div className='fs-9 text-muted text-truncate'>{s.sub}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        )}

        {/* SLA / quá hạn — gộp 1 hàng 6 thẻ compact */}
        {dash && dashboardLayout.visible.sla !== false && (
          <div className='row g-2 mb-5'>
            {[
              { label: 'Xử lý trung bình', color: VNA_BLUE, value: dash.gioXuLyTrungBinh != null ? `${dash.gioXuLyTrungBinh} giờ` : '—', sub: `SLA ${dash.slaGio} giờ`, to: '/doi-moi-sang-tao/bao-cao' },
              { label: 'Tỷ lệ đúng hạn', color: '#17C653', value: dash.tyLeDungHan != null ? `${dash.tyLeDungHan}%` : '—', sub: 'Đạt SLA xử lý', to: '/doi-moi-sang-tao/bao-cao' },
              { label: 'Đang chờ xử lý', color: '#F59F00', value: dash.soChoXuLy ?? 0, sub: 'Chưa chuyển bước', to: '/doi-moi-sang-tao/quy-trinh-duyet/cho-duyet' },
              { label: 'Tồn đọng quá hạn', color: '#F1416C', value: dash.soTonDong ?? 0, sub: dash.soTonDong > 0 ? 'Cần xử lý ngay' : 'Không tồn đọng', to: `/doi-moi-sang-tao/quy-trinh-duyet/cho-duyet?quaHan=1&slaGio=${dash.slaGio}` },
              { label: 'Quá hạn tiếp nhận', color: '#F1416C', value: dash.soQuaHanTiepNhan ?? 0, sub: dash.soQuaHanTiepNhan > 0 ? `>${dash.thoiHanTiepNhanNgay} ngày` : 'Không quá hạn', to: `/doi-moi-sang-tao/quy-trinh-duyet/cho-duyet?quaHan=1&nguongNgay=${dash.thoiHanTiepNhanNgay}` },
              { label: 'Quá hạn kiểm duyệt', color: '#B5179E', value: dash.soQuaHanKiemDuyet ?? 0, sub: dash.soQuaHanKiemDuyet > 0 ? `>${dash.thoiHanKiemDuyetCongNhanNgay} ngày` : 'Không quá hạn', to: `/doi-moi-sang-tao/quy-trinh-duyet/da-duyet?quaHan=1&nguongNgay=${dash.thoiHanKiemDuyetCongNhanNgay}` },
              { label: 'Chương trình/dự án CĐS', color: VNA_GOLD, value: CDS_DASHBOARD.length, sub: `${CDS_ALERTS.length} cảnh báo triển khai`, to: '/doi-moi-sang-tao/bao-cao?template=chuong-trinh' },
            ].map((k, i) => (
              <div key={i} className='col-6 col-md-4 col-xl-2'>
                <Link
                  to={k.to}
                  className='card card-flush h-100 text-decoration-none'
                  style={{ borderLeft: `3px solid ${k.color}`, transition: 'box-shadow 0.15s, transform 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}
                >
                  <div className='card-body py-2 px-3'>
                    <div className='fs-9 fw-semibold text-gray-600 mb-1 text-truncate'>{k.label}</div>
                    <div className='fs-4 fw-bold' style={{ color: k.color }}>{k.value}</div>
                    <div className='fs-9 text-muted text-truncate'>{k.sub}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── Dashboard tiến độ CĐS / R&D / Sandbox (IV.12) ─────────────────── */}
        {dashboardLayout.visible.cds !== false && (
        <div className='row g-2 mb-5'>
          {/* Gantt */}
          <div className='col-xl-7'>
            <div className='card h-100'>
              <div className='card-header border-0 pt-4 pb-2 d-flex justify-content-between align-items-center'>
                <h4 className='card-title fw-semibold text-gray-700 fs-7 mb-0'>
                  <i className='fa-regular fa-chart-gantt me-2' />
                  Tiến độ chương trình CĐS / R&D / Sandbox (Gantt)
                </h4>
                <span className='badge badge-light fs-9'>Dữ liệu minh họa — chờ module chương trình</span>
              </div>
              <div className='card-body pt-0 pb-2'>
                <ReactApexChart
                  type='rangeBar'
                  height={260}
                  series={[{
                    data: CDS_DASHBOARD.map(p => ({
                      x: p.ten,
                      y: [new Date(p.batDau).getTime(), new Date(p.ketThuc).getTime()],
                      fillColor: CDS_STATUS_HEX[p.trangThai],
                    })),
                  }]}
                  options={{
                    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
                    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 4 } },
                    xaxis: { type: 'datetime', labels: { datetimeUTC: false, format: 'MM/yyyy' } },
                    yaxis: { labels: { maxWidth: 260, style: { fontSize: '11px' } } },
                    grid: { strokeDashArray: 4 },
                    dataLabels: {
                      enabled: true,
                      formatter: (_v: unknown, opts: any) => `${CDS_DASHBOARD[opts.dataPointIndex]?.tienDo ?? 0}%`,
                      style: { fontSize: '10px' },
                    },
                    tooltip: {
                      custom: ({ dataPointIndex }: any) => {
                        const p = CDS_DASHBOARD[dataPointIndex];
                        return `<div style="padding:8px 12px;font-size:12px">
                          <b>${p.ten}</b><br/>Loại: ${p.loai} · ${p.trangThai}<br/>
                          Tiến độ: ${p.tienDo}% · Ngân sách: ${p.nganSach}%<br/>
                          Mốc: ${p.mocHoanThanh}/${p.mocTong}</div>`;
                      },
                    },
                    annotations: {
                      xaxis: [{
                        x: Date.now(),
                        borderColor: VNA_GOLD,
                        strokeDashArray: 4,
                        label: {
                          text: 'Hôm nay',
                          orientation: 'horizontal',
                          style: { background: VNA_GOLD, color: '#fff', fontSize: '10px' },
                        },
                      }],
                    },
                  }}
                />
                <div className='d-flex gap-4 justify-content-center fs-9 text-muted pb-1'>
                  {(Object.keys(CDS_STATUS_HEX) as Array<keyof typeof CDS_STATUS_HEX>).map(k => (
                    <span key={k}>
                      <span className='d-inline-block rounded-circle me-1' style={{ width: 8, height: 8, background: CDS_STATUS_HEX[k] }} />
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tiến độ vs ngân sách + cảnh báo */}
          <div className='col-xl-5'>
            <div className='card mb-2'>
              <div className='card-header border-0 pt-4 pb-2'>
                <h4 className='card-title fw-semibold text-gray-700 fs-7 mb-0'>
                  <i className='fa-regular fa-bars-progress me-2' />Tiến độ & ngân sách từng chương trình
                </h4>
              </div>
              <div className='card-body pt-1 pb-3'>
                {CDS_DASHBOARD.map((p, i) => (
                  <div key={i} className='mb-3'>
                    <div className='d-flex justify-content-between align-items-center mb-1'>
                      <span className='fs-8 fw-semibold text-gray-700 text-truncate' style={{ maxWidth: '70%' }}>
                        {p.ten}
                      </span>
                      <span className='fs-9 fw-semibold' style={{ color: CDS_STATUS_HEX[p.trangThai] }}>
                        {p.trangThai}
                      </span>
                    </div>
                    {/* Tiến độ */}
                    <div className='d-flex align-items-center gap-2 mb-1'>
                      <span className='fs-9 text-muted' style={{ width: 62, flexShrink: 0 }}>Tiến độ</span>
                      <div className='bg-light rounded flex-grow-1' style={{ height: 6 }}>
                        <div className='rounded' style={{ height: 6, width: `${p.tienDo}%`, background: CDS_STATUS_HEX[p.trangThai] }} />
                      </div>
                      <span className='fs-9 fw-semibold' style={{ width: 34, textAlign: 'right' }}>{p.tienDo}%</span>
                    </div>
                    {/* Ngân sách */}
                    <div className='d-flex align-items-center gap-2'>
                      <span className='fs-9 text-muted' style={{ width: 62, flexShrink: 0 }}>Ngân sách</span>
                      <div className='bg-light rounded flex-grow-1' style={{ height: 6 }}>
                        <div className='rounded' style={{
                          height: 6, width: `${Math.min(p.nganSach, 100)}%`,
                          background: p.nganSach - p.tienDo > 15 ? '#b5179e' : '#94a3b8',
                        }} />
                      </div>
                      <span className='fs-9 fw-semibold' style={{ width: 34, textAlign: 'right' }}>{p.nganSach}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cảnh báo mốc chậm / vượt ngân sách */}
            <div className='card'>
              <div className='card-header border-0 pt-4 pb-2'>
                <h4 className='card-title fw-semibold text-gray-700 fs-7 mb-0'>
                  <i className='fa-regular fa-bell-exclamation me-2 text-danger' />
                  Cảnh báo triển khai <span className='badge badge-light-danger ms-2'>{CDS_ALERTS.length}</span>
                </h4>
              </div>
              <div className='card-body pt-1 pb-3'>
                {CDS_ALERTS.length === 0 ? (
                  <div className='text-muted fs-8'>Không có cảnh báo — các chương trình đang đúng tiến độ.</div>
                ) : CDS_ALERTS.map((a, i) => (
                  <div key={i} className='d-flex gap-2 align-items-start mb-2 p-2 rounded'
                    style={{ background: `${a.mau}12`, borderLeft: `3px solid ${a.mau}` }}>
                    <i className={`fa-regular ${a.icon} mt-1`} style={{ color: a.mau, flexShrink: 0 }} />
                    <div className='min-w-0'>
                      <div className='fs-8 fw-semibold text-gray-800 text-truncate'>{a.ten}</div>
                      <div className='fs-9 text-muted'>{a.noiDung}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ── Quỹ thưởng ĐMST (IV.13/IV.15) ─────────────────────────────────── */}
        {dashboardLayout.visible.quyThuong !== false && (
        <div className='row g-2 mb-5'>
          <div className='col-xl-8'>
            <div className='card h-100'>
              <div className='card-header border-0 pt-4 pb-2 d-flex justify-content-between align-items-center'>
                <h4 className='card-title fw-semibold text-gray-700 fs-7 mb-0'>
                  <i className='fa-regular fa-sack-dollar me-2' />Quỹ thưởng
                </h4>
                <Link to='/doi-moi-sang-tao/bao-cao?template=quy' className='fs-9'>Xem chi tiết</Link>
              </div>
              <div className='card-body pt-0 pb-3'>
                <div className='row g-2 mb-3'>
                  <div className='col-4'>
                    <div className='p-3 rounded-3 bg-light-primary h-100'>
                      <div className='fs-9 fw-semibold text-primary mb-1'>Tổng quỹ</div>
                      <div className='fs-5 fw-bold'>{(QUY_THUONG_TONG / 1_000_000_000).toFixed(1)} tỷ</div>
                    </div>
                  </div>
                  <div className='col-4'>
                    <div className='p-3 rounded-3 bg-light-danger h-100'>
                      <div className='fs-9 fw-semibold text-danger mb-1'>Đã chi</div>
                      <div className='fs-5 fw-bold'>{(QUY_THUONG_DA_CHI / 1_000_000_000).toFixed(1)} tỷ</div>
                    </div>
                  </div>
                  <div className='col-4'>
                    <div className='p-3 rounded-3 bg-light-success h-100'>
                      <div className='fs-9 fw-semibold text-success mb-1'>Còn lại</div>
                      <div className='fs-5 fw-bold'>{((QUY_THUONG_TONG - QUY_THUONG_DA_CHI) / 1_000_000_000).toFixed(1)} tỷ</div>
                    </div>
                  </div>
                </div>
                {QUY_THUONG.map((q, i) => (
                  <div key={i} className='mb-2'>
                    <div className='d-flex justify-content-between align-items-center mb-1'>
                      <span className='fs-8 fw-semibold text-gray-700 text-truncate' style={{ maxWidth: '70%' }}>{q.loaiQuy}</span>
                      <span className='fs-9 text-muted'>{Math.round((q.daChi / q.nganSachDau) * 100)}% đã chi</span>
                    </div>
                    <div className='bg-light rounded' style={{ height: 6 }}>
                      <div className='rounded' style={{ height: 6, width: `${Math.min((q.daChi / q.nganSachDau) * 100, 100)}%`, background: VNA_BLUE }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ví điểm thưởng theo loại: Cánh sen / Bông sen */}
          <div className='col-xl-4'>
            <div className='card h-100'>
              <div className='card-header border-0 pt-4 pb-2'>
                <h4 className='card-title fw-semibold text-gray-700 fs-7 mb-0'>
                  <i className='fa-regular fa-wallet me-2' />Điểm thưởng theo ví
                </h4>
              </div>
              <div className='card-body pt-0 pb-3 d-flex flex-column gap-3'>
                {VI_DIEM_THUONG.map((v, i) => (
                  <div key={i} className='d-flex align-items-center p-3 rounded-3' style={{ background: `${v.mau}14` }}>
                    <div className='symbol symbol-35px me-3'>
                      <div className='symbol-label' style={{ background: `${v.mau}26` }}>
                        <i className='fa-regular fa-seedling' style={{ color: v.mau }} />
                      </div>
                    </div>
                    <div>
                      <div className='fs-4 fw-bold' style={{ color: v.mau }}>{v.soDu.toLocaleString('vi-VN')}</div>
                      <div className='fs-9 fw-semibold text-gray-600'>{v.vi}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Main two-column layout: feed trái, biểu đồ phải */}
        <div className='row g-5'>

          {/* ── Left: Social Feed ── */}
          {feedVisible && (
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
              {feedLoading && (
                <div className='card border-0 shadow-sm mb-4'>
                  <div className='card-body py-10 text-center text-muted'>Đang tải hoạt động mới nhất...</div>
                </div>
              )}

              {!feedLoading && feedPosts.length === 0 && (
                <div className='card border-0 shadow-sm mb-4'>
                  <div className='card-body py-10 text-center text-muted'>Chưa có hoạt động nào để hiển thị.</div>
                </div>
              )}

              {feedPosts.map(post => (
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
          )}

          {/* ── Right: biểu đồ thống kê (kéo thả đổi vị trí) ── */}
          {visibleSidebarWidgets.length > 0 && (
            <div className={feedVisible ? 'col-xl-4' : 'col-12'}>
              <div className={feedVisible ? '' : 'row g-4'}>
                {visibleSidebarWidgets.map(widget => (
                  <div
                    key={widget}
                    className={feedVisible ? '' : 'col-xl-4'}
                    draggable
                    onDragStart={() => setDraggingWidget(widget)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (draggingWidget) {
                        reorderWidgetLayout(draggingWidget, widget);
                      }
                      handleWidgetDragEnd();
                    }}
                    onDragEnd={handleWidgetDragEnd}
                    style={{ cursor: 'move' }}
                  >
                    {renderSidebarWidget(widget)}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <Modal
          title={(
            <span>
              <i className='fa-regular fa-sliders me-2 text-primary' />Tùy biến giao diện
            </span>
          )}
          open={layoutModalOpen}
          onCancel={() => setLayoutModalOpen(false)}
          footer={null}
          width={760}
          destroyOnClose={false}
        >
          <div className='d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4'>
            <div className='text-muted fs-7'>Chọn các ô cần hiển thị. Bạn có thể kéo thả trực tiếp các card trên dashboard để đổi vị trí.</div>
            <Button size='small' onClick={() => setDashboardLayout(DEFAULT_DASHBOARD_LAYOUT())}>
              Khôi phục mặc định
            </Button>
          </div>
          <Checkbox.Group
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            value={DEFAULT_DASHBOARD_WIDGET_ORDER.filter(widget => dashboardLayout.visible[widget])}
            onChange={values => handleVisibleChange(values as DashboardWidgetKey[])}
          >
            {DEFAULT_DASHBOARD_WIDGET_ORDER.map(widget => (
              <Checkbox key={widget} value={widget}>
                {DASHBOARD_WIDGET_LABELS[widget]}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Modal>

      </Content>
    </>
  );
};
