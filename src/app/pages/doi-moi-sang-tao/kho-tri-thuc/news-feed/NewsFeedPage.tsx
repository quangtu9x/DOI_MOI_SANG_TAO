/**
 * NewsFeedPage — IV.2.4 Bảng tin cá nhân hóa
 *
 * Cá nhân hóa theo: đơn vị công tác + lĩnh vực quan tâm (server tự suy ra
 * đơn vị từ người dùng hiện tại, xem GetNewsFeedRequestHandler), lịch sử
 * tương tác (tài liệu đã thích được giữ lại dù quá hạn 7 ngày) và vai trò
 * người dùng (Admin/Specialist thấy thêm nội dung chờ duyệt).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Select, Spin, Empty, message } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { getNewsFeed, toggleThich } from '@/app/services/khoTriThucApi';
import { requestPOST } from '@/utils/baseAPI';
import { LoaiDoiTuong, LoaiNewsFeedItem } from '@/app/models/knowledge-hub';
import type { INewsFeedItem } from '@/app/models/knowledge-hub';
import { NguoiThichPopover } from '@/app/components/tuong-tac/NguoiThichPopover';

const PAGE_SIZE = 20;

const AVATAR_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1', '#13c2c2'];
const getAvatarColor = (name: string) => AVATAR_COLORS[(name ?? '?').charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name?: string) => name?.charAt(0)?.toUpperCase() ?? '?';

const relativeTime = (date?: string) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(date).toLocaleDateString('vi-VN');
};

const LOAI_LABEL: Record<LoaiNewsFeedItem, string> = {
  [LoaiNewsFeedItem.TaiLieu]: 'Tài liệu',
  [LoaiNewsFeedItem.BaiViet]: 'Bài viết cộng đồng',
};
const LOAI_ICON: Record<LoaiNewsFeedItem, string> = {
  [LoaiNewsFeedItem.TaiLieu]: 'fa-file-lines',
  [LoaiNewsFeedItem.BaiViet]: 'fa-comments',
};
const LOAI_COLOR: Record<LoaiNewsFeedItem, string> = {
  [LoaiNewsFeedItem.TaiLieu]: '#1677ff',
  [LoaiNewsFeedItem.BaiViet]: '#52c41a',
};

const doiTuongCuaItem = (item: INewsFeedItem): LoaiDoiTuong =>
  item.loaiItem === LoaiNewsFeedItem.TaiLieu ? LoaiDoiTuong.TaiLieu : LoaiDoiTuong.BaiViet;

const duongDanChiTiet = (item: INewsFeedItem): string =>
  item.loaiItem === LoaiNewsFeedItem.TaiLieu
    ? `/doi-moi-sang-tao/kho-tri-thuc/thu-vien?taiLieuId=${item.id}`
    : `/doi-moi-sang-tao/kho-tri-thuc/cong-dong?postId=${item.id}`;

export const NewsFeedPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems]       = useState<INewsFeedItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [hasMore, setHasMore]   = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // ── Danh mục lĩnh vực (bộ lọc cá nhân hóa)
  const [linhVucs, setLinhVucs]           = useState<{ id: string; ten: string }[]>([]);
  const [linhVucFilter, setLinhVucFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    requestPOST<any>('LinhVucKHCNs/search', { pageNumber: 1, pageSize: 200 })
      .then(res => {
        const d = res?.data;
        const list = Array.isArray(d?.data) ? d.data : [];
        setLinhVucs(list.map((x: any) => ({ id: x.id, ten: x.ten ?? x.name ?? '' })));
      })
      .catch(() => { /* ignore */ });
  }, []);

  // ── Tải bảng tin
  const loadFeed = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const res = await getNewsFeed(p, PAGE_SIZE, undefined, linhVucFilter);
      const d = (res as any)?.data;
      const data: INewsFeedItem[] = d?.data ?? [];
      const tot: number = d?.totalCount ?? 0;
      setItems(prev => reset ? data : [...prev, ...data]);
      setTotal(tot);
      const loaded = reset ? data.length : items.length + data.length;
      setHasMore(loaded < tot);
    } catch {
      message.error('Không tải được bảng tin');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linhVucFilter, items.length]);

  useEffect(() => {
    setPage(1);
    loadFeed(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linhVucFilter]);

  const handleLike = async (item: INewsFeedItem) => {
    try {
      const res = await toggleThich({ loaiDoiTuong: doiTuongCuaItem(item), doiTuongId: item.id });
      const nowLiked: boolean = (res as any)?.data?.data ?? (res as any)?.data ?? false;
      setLikedIds(prev => {
        const next = new Set(prev);
        if (nowLiked) next.add(item.id); else next.delete(item.id);
        return next;
      });
      setItems(prev => prev.map(i => i.id === item.id
        ? { ...i, soLuotThich: Math.max(0, (i.soLuotThich ?? 0) + (nowLiked ? 1 : -1)) }
        : i));
    } catch {
      message.error('Lỗi khi thích');
    }
  };

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Bảng tin</PageTitle>

      <Content>
        <div className="shadow-sm" style={{ borderRadius: 12, background: '#fff', padding: '16px 20px 4px' }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="fw-bold fs-5 text-gray-800">
              <i className="fa-solid fa-rss text-primary me-2" />Bảng tin của bạn
            </div>
            <Select
              allowClear
              placeholder="Lọc theo lĩnh vực quan tâm"
              style={{ minWidth: 240 }}
              value={linhVucFilter}
              onChange={v => setLinhVucFilter(v)}
              options={linhVucs.map(lv => ({ value: lv.id, label: lv.ten }))}
            />
          </div>

          <Spin spinning={loading && items.length === 0}>
            {items.length === 0 && !loading ? (
              <Empty
                description="Chưa có tin mới phù hợp — hãy tham gia cộng đồng hoặc theo dõi thêm lĩnh vực"
                style={{ padding: '48px 0' }}
              />
            ) : (
              <div className="d-flex flex-column gap-3 pb-3">
                {items.map(item => (
                  <div
                    key={`${item.loaiItem}-${item.id}`}
                    className="border rounded-3 p-3"
                    style={{ transition: 'box-shadow .15s' }}
                  >
                    <div className="d-flex align-items-start gap-2 mb-2">
                      <Avatar size={40} src={item.tacGia?.hinhDaiDien || undefined}
                        style={{ backgroundColor: getAvatarColor(item.tacGia?.hoTen ?? '?'), flexShrink: 0, fontWeight: 600 }}>
                        {getInitials(item.tacGia?.hoTen)}
                      </Avatar>
                      <div className="flex-grow-1 min-w-0">
                        <div className="fw-semibold fs-7 text-gray-800">{item.tacGia?.hoTen ?? 'Ẩn danh'}</div>
                        <div className="text-muted fs-8">
                          <i className={`fa-solid ${LOAI_ICON[item.loaiItem]} me-1`} style={{ color: LOAI_COLOR[item.loaiItem] }} />
                          {LOAI_LABEL[item.loaiItem]} · {relativeTime(item.createdOn)}
                        </div>
                      </div>
                    </div>

                    <div
                      className="fw-bold fs-5 text-gray-900 mb-1 cursor-pointer"
                      style={{ lineHeight: 1.4 }}
                      onClick={() => navigate(duongDanChiTiet(item))}
                    >
                      {item.tieuDe}
                    </div>
                    {item.moTa && (
                      <div
                        className="text-gray-600 fs-7 mb-2 cursor-pointer"
                        style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.7 }}
                        onClick={() => navigate(duongDanChiTiet(item))}
                      >
                        {item.moTa}
                      </div>
                    )}

                    <div className="d-flex gap-3 align-items-center border-top pt-2 mt-1">
                      <div className="d-flex align-items-center gap-1">
                        <button
                          className={`btn btn-sm btn-text d-flex align-items-center gap-1 p-0 ${likedIds.has(item.id) ? 'text-danger' : 'text-muted'}`}
                          onClick={() => handleLike(item)}
                        >
                          <i className={`fa-${likedIds.has(item.id) ? 'solid' : 'regular'} fa-heart me-1`} />
                        </button>
                        <NguoiThichPopover loaiDoiTuong={doiTuongCuaItem(item)} doiTuongId={item.id}>
                          <span
                            className={`fs-8 ${likedIds.has(item.id) ? 'text-danger' : 'text-muted'}`}
                            style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                          >
                            {Math.max(0, item.soLuotThich ?? 0)}
                          </span>
                        </NguoiThichPopover>
                      </div>
                      <button
                        className="btn btn-sm btn-text d-flex align-items-center gap-1 p-0 text-muted"
                        onClick={() => navigate(duongDanChiTiet(item))}
                      >
                        <i className="fa-regular fa-comment me-1" />
                        <span className="fs-8">{item.soBinhLuan ?? 0}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <div className="text-center pt-1">
                    <button
                      className="btn btn-sm"
                      style={{ border: '1px solid #e0e0e0', borderRadius: 20, padding: '6px 20px', background: '#fafafa', color: '#555' }}
                      onClick={() => { const next = page + 1; setPage(next); loadFeed(next, false); }}
                    >
                      {loading ? <Spin size="small" /> : `Xem thêm (${total - items.length} còn lại)`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </Spin>
        </div>
      </Content>
    </>
  );
};
