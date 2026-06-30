import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Spin, Empty, Tag, Avatar, message, Divider } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { getNewsFeed, toggleThich } from '@/app/services/khoTriThucApi';
import type { INewsFeedItem } from '@/app/models/knowledge-hub';
import { LoaiDoiTuong } from '@/app/models/knowledge-hub';

export const NewsFeedPage: React.FC = () => {
  const [items, setItems]         = useState<INewsFeedItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const [likedIds, setLikedIds]   = useState<Set<string>>(new Set());

  const loadFeed = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const res = await getNewsFeed(p, 20);
      const d = (res as any)?.data ?? res;
      const data: INewsFeedItem[] = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
      const total: number = d?.totalCount ?? d?.data?.totalCount ?? 0;
      setItems(prev => {
        const next = reset ? data : [...prev, ...data];
        setHasMore(next.length < total);
        return next;
      });
    } catch { message.error('Không tải được news feed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFeed(1, true); }, []);

  const loadMore = () => { const next = page + 1; setPage(next); loadFeed(next, false); };

  const handleLike = async (id: string) => {
    try {
      const res = await toggleThich({ loaiDoiTuong: LoaiDoiTuong.TaiLieu, doiTuongId: id });
      const liked = (res as any)?.data ?? false;
      setLikedIds(prev => {
        const next = new Set(prev);
        liked ? next.add(id) : next.delete(id);
        return next;
      });
    } catch { message.error('Lỗi'); }
  };

  const getLoaiColor = (loai?: string) => {
    if (!loai) return 'default';
    if (loai.toLowerCase().includes('tailieu') || loai.toLowerCase().includes('tài liệu')) return 'blue';
    if (loai.toLowerCase().includes('baiviet') || loai.toLowerCase().includes('bài viết')) return 'green';
    return 'purple';
  };
  const getLoaiLabel = (loai?: string) => {
    if (!loai) return 'Khác';
    if (loai.toLowerCase().includes('tailieu') || loai.toLowerCase().includes('tài liệu')) return 'Tài liệu';
    if (loai.toLowerCase().includes('baiviet') || loai.toLowerCase().includes('bài viết')) return 'Bài viết';
    return loai;
  };

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>News Feed</PageTitle>

      <Content>
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h5 className="fw-bold mb-1">Dòng thời gian</h5>
                <p className="text-muted fs-7 mb-0">Nội dung mới nhất được cá nhân hóa theo đơn vị và lĩnh vực của bạn</p>
              </div>
              <Button icon={<i className="fa-regular fa-refresh me-1" />}
                onClick={() => { setPage(1); loadFeed(1, true); }}>
                Làm mới
              </Button>
            </div>

            <Spin spinning={loading && items.length === 0}>
              {items.length === 0 && !loading ? (
                <Empty description="Chưa có nội dung trong news feed của bạn" className="py-10">
                  <Button type="primary" onClick={() => loadFeed(1, true)}>Tải lại</Button>
                </Empty>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {items.map((item, idx) => (
                    <React.Fragment key={item.id}>
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          {/* Header */}
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <Avatar size={40} style={{ backgroundColor: '#1677ff', fontSize: 16 }}>
                              {item.tacGia?.hoTen?.charAt(0)?.toUpperCase() ?? '?'}
                            </Avatar>
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-gray-800">{item.tacGia?.hoTen ?? 'Ẩn danh'}</div>
                              <div className="text-muted fs-8">
                                {item.createdOn ? new Date(item.createdOn).toLocaleString('vi-VN') : ''}
                              </div>
                            </div>
                            <Tag color={getLoaiColor(item.loai)}>{getLoaiLabel(item.loai)}</Tag>
                          </div>

                          {/* Content */}
                          {item.tieuDe && <h6 className="fw-bold text-gray-900 mb-2">{item.tieuDe}</h6>}
                          {item.moTa && (
                            <p className="text-gray-600 fs-7 mb-3"
                              style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {item.moTa}
                            </p>
                          )}

                          {/* Tags */}
                          {(item.tags ?? []).length > 0 && (
                            <div className="mb-3 d-flex flex-wrap gap-1">
                              {(item.tags ?? []).slice(0, 4).map(t => <Tag key={t} color="blue" style={{ fontSize: 11 }}>{t}</Tag>)}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="d-flex gap-3 text-muted fs-8 border-top pt-3">
                            <Button type="text" size="small"
                              className={likedIds.has(item.id) ? 'text-danger' : 'text-muted'}
                              icon={<i className={`fa-${likedIds.has(item.id) ? 'solid' : 'regular'} fa-heart me-1`} />}
                              onClick={() => handleLike(item.id)}>
                              {item.luotThich ?? 0}
                            </Button>
                            <span className="align-self-center">
                              <i className="fa-regular fa-eye me-1" />{item.luotXem ?? 0} lượt xem
                            </span>
                          </div>
                        </div>
                      </div>
                      {idx < items.length - 1 && idx % 5 === 4 && (
                        <div className="text-center py-2">
                          <span className="badge badge-light-primary">Đã xem {idx + 1} mục</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Load more */}
                  <div className="text-center py-4">
                    {loading && items.length > 0 ? (
                      <Spin />
                    ) : hasMore ? (
                      <Button onClick={loadMore} loading={loading}>
                        Xem thêm
                      </Button>
                    ) : (
                      <span className="text-muted fs-7">Đã hiển thị tất cả nội dung</span>
                    )}
                  </div>
                </div>
              )}
            </Spin>
          </div>
        </div>
      </Content>
    </>
  );
};
