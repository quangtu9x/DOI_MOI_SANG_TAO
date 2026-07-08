/**
 * NewsFeedPage — News Feed cá nhân hóa (IV.2.4)
 *
 * BE tính Điểm phù hợp (Relevance Score) theo trọng số cấu hình được:
 * cùng đơn vị, đúng lĩnh vực quan tâm (đăng ký hoặc học từ hành vi), đã tương tác
 * nội dung/tác giả tương tự, vai trò người dùng, thịnh hành, mới đăng.
 * FE ghi nhận hành vi (hiển thị/xem/thích/tìm kiếm/đăng ký quan tâm) qua
 * NewsFeed/hanh-vi để hệ thống liên tục học sở thích.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar, Select, Spin, Empty, Tag, Tooltip, message } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import {
  getNewsFeed, toggleThich, ghiNhanHanhVi, searchChuyenGias, LoaiHanhVi,
} from '@/app/services/khoTriThucApi';
import { requestPOST } from '@/utils/baseAPI';
import { LoaiDoiTuong, LoaiNewsFeedItem } from '@/app/models/knowledge-hub';
import type { INewsFeedItem, IChuyenGia } from '@/app/models/knowledge-hub';
import { NguoiThichPopover } from '@/app/components/tuong-tac/NguoiThichPopover';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

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

// ── Các tab chế độ feed (đồng bộ tham số cheDo BE) ───────────────────────────
const FEED_TABS: { key: string; label: string; icon: string }[] = [
  { key: 'danh-cho-ban', label: 'Dành cho bạn', icon: 'fa-wand-magic-sparkles' },
  { key: 'noi-bat', label: 'Nổi bật', icon: 'fa-star' },
  { key: 'don-vi', label: 'Theo đơn vị', icon: 'fa-building' },
  { key: 'linh-vuc', label: 'Theo lĩnh vực', icon: 'fa-layer-group' },
  { key: 'trending', label: 'Thịnh hành', icon: 'fa-fire' },
  { key: 'moi-nhat', label: 'Mới nhất', icon: 'fa-clock' },
];

const LOAI_LABEL: Record<number, string> = {
  [LoaiNewsFeedItem.TaiLieu]: 'Tài liệu',
  [LoaiNewsFeedItem.BaiViet]: 'Bài viết cộng đồng',
  [LoaiNewsFeedItem.YTuong]: 'Ý tưởng/Sáng kiến',
};
const LOAI_ICON: Record<number, string> = {
  [LoaiNewsFeedItem.TaiLieu]: 'fa-file-lines',
  [LoaiNewsFeedItem.BaiViet]: 'fa-comments',
  [LoaiNewsFeedItem.YTuong]: 'fa-lightbulb',
};
const LOAI_COLOR: Record<number, string> = {
  [LoaiNewsFeedItem.TaiLieu]: '#1677ff',
  [LoaiNewsFeedItem.BaiViet]: '#52c41a',
  [LoaiNewsFeedItem.YTuong]: '#faad14',
};

const doiTuongCuaItem = (item: INewsFeedItem): LoaiDoiTuong =>
  item.loaiItem === LoaiNewsFeedItem.TaiLieu ? LoaiDoiTuong.TaiLieu
    : item.loaiItem === LoaiNewsFeedItem.BaiViet ? LoaiDoiTuong.BaiViet
    : LoaiDoiTuong.YTuong;

const duongDanChiTiet = (item: INewsFeedItem): string =>
  item.loaiItem === LoaiNewsFeedItem.TaiLieu
    ? `/doi-moi-sang-tao/kho-tri-thuc/thu-vien?taiLieuId=${item.id}`
    : item.loaiItem === LoaiNewsFeedItem.BaiViet
    ? `/doi-moi-sang-tao/kho-tri-thuc/cong-dong?postId=${item.id}`
    : `/doi-moi-sang-tao/quan-ly-y-tuong/chi-tiet/${item.id}`;

export const NewsFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useDMSTRole();

  const [cheDo, setCheDo]       = useState<string>('danh-cho-ban');
  const [items, setItems]       = useState<INewsFeedItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [hasMore, setHasMore]   = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // ── Danh mục lĩnh vực (bộ lọc + đăng ký quan tâm) ──────────────────────────
  const [linhVucs, setLinhVucs]           = useState<{ id: string; ten: string }[]>([]);
  const [linhVucFilter, setLinhVucFilter] = useState<string | undefined>(undefined);
  const [quanTamIds, setQuanTamIds]       = useState<string[]>([]);
  const [savingQuanTam, setSavingQuanTam] = useState(false);

  // ── Gợi ý: chuyên gia có thể quan tâm ──────────────────────────────────────
  const [goiYChuyenGia, setGoiYChuyenGia] = useState<IChuyenGia[]>([]);

  useEffect(() => {
    requestPOST<any>('LinhVucKHCNs/search', { pageNumber: 1, pageSize: 200 })
      .then(res => {
        const d = res?.data;
        const list = Array.isArray(d?.data) ? d.data : [];
        setLinhVucs(list.map((x: any) => ({ id: x.id, ten: x.ten ?? x.name ?? '' })));
      })
      .catch(() => { /* ignore */ });

    searchChuyenGias({ pageNumber: 1, pageSize: 5 } as any)
      .then(res => {
        const d = (res as any)?.data;
        setGoiYChuyenGia(Array.isArray(d?.data) ? d.data : []);
      })
      .catch(() => { /* ignore */ });
  }, []);

  // ── Tải bảng tin + ghi nhận hiển thị (impression cho CTR) ──────────────────
  const loadFeed = useCallback(async (p = 1, reset = false, mode = cheDo, lv = linhVucFilter) => {
    setLoading(true);
    try {
      const res = await getNewsFeed(p, PAGE_SIZE, undefined, lv, mode);
      const d = (res as any)?.data;
      const data: INewsFeedItem[] = d?.data ?? [];
      const tot: number = d?.totalCount ?? 0;
      setItems(prev => reset ? data : [...prev, ...data]);
      setTotal(tot);
      const loaded = reset ? data.length : items.length + data.length;
      setHasMore(loaded < tot);

      // Impression — 1 bản ghi mỗi lần tải trang đầu của feed
      if (p === 1) ghiNhanHanhVi({ loaiHanhVi: LoaiHanhVi.HienThi, tuKhoa: mode });
    } catch {
      message.error('Không tải được bảng tin');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheDo, linhVucFilter, items.length]);

  useEffect(() => {
    setPage(1);
    loadFeed(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheDo, linhVucFilter]);

  // ── Hành vi: nhấp xem chi tiết ─────────────────────────────────────────────
  const moChiTiet = (item: INewsFeedItem) => {
    ghiNhanHanhVi({
      loaiHanhVi: LoaiHanhVi.Xem,
      loaiDoiTuong: doiTuongCuaItem(item) as unknown as number,
      doiTuongId: item.id,
      linhVucKHCNId: item.linhVucKHCNId,
      donViId: item.donViId,
      tacGiaNoiDungId: item.tacGiaId,
      tuKhoa: cheDo,
    });
    navigate(duongDanChiTiet(item));
  };

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
      if (nowLiked) {
        ghiNhanHanhVi({
          loaiHanhVi: LoaiHanhVi.Thich,
          loaiDoiTuong: doiTuongCuaItem(item) as unknown as number,
          doiTuongId: item.id,
          linhVucKHCNId: item.linhVucKHCNId,
          tacGiaNoiDungId: item.tacGiaId,
        });
      }
    } catch {
      message.error('Lỗi khi thích');
    }
  };

  // ── Đăng ký lĩnh vực quan tâm (học sở thích chủ động) ──────────────────────
  const luuQuanTam = async () => {
    if (quanTamIds.length === 0) { message.info('Chọn ít nhất một lĩnh vực'); return; }
    setSavingQuanTam(true);
    try {
      await Promise.all(quanTamIds.map(id =>
        ghiNhanHanhVi({ loaiHanhVi: LoaiHanhVi.DangKyQuanTam, linhVucKHCNId: id })));
      message.success('Đã lưu lĩnh vực quan tâm — feed "Dành cho bạn" sẽ ưu tiên các lĩnh vực này');
      if (cheDo === 'danh-cho-ban' || cheDo === 'linh-vuc') loadFeed(1, true);
    } finally {
      setSavingQuanTam(false);
    }
  };

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Bảng tin</PageTitle>

      <Content>
        <div className="row g-4">
          {/* ── Cột chính: feed ── */}
          <div className="col-xl-8">
            <div className="shadow-sm" style={{ borderRadius: 12, background: '#fff', padding: '16px 20px 4px' }}>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div className="fw-bold fs-5 text-gray-800">
                  <i className="fa-solid fa-rss text-primary me-2" />Bảng tin của bạn
                </div>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <Select
                    allowClear
                    placeholder="Lọc theo lĩnh vực"
                    style={{ minWidth: 200 }}
                    value={linhVucFilter}
                    onChange={v => {
                      setLinhVucFilter(v);
                      if (v) {
                        const ten = linhVucs.find(x => x.id === v)?.ten;
                        ghiNhanHanhVi({ loaiHanhVi: LoaiHanhVi.TimKiem, linhVucKHCNId: v, tuKhoa: ten });
                      }
                    }}
                    options={linhVucs.map(lv => ({ value: lv.id, label: lv.ten }))}
                  />
                  {isAdmin && (
                    <Tooltip title="Cấu hình thuật toán & hiệu quả News Feed">
                      <Link to="/doi-moi-sang-tao/kho-tri-thuc/news-feed-admin" className="btn btn-sm btn-light">
                        <i className="fa-regular fa-sliders" />
                      </Link>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Pill tabs chế độ feed */}
              <div className="d-flex gap-2 flex-wrap mb-3">
                {FEED_TABS.map(t => (
                  <button
                    key={t.key}
                    className="btn btn-sm"
                    style={{
                      borderRadius: 20, padding: '5px 14px', fontWeight: 600, fontSize: '0.8rem',
                      border: cheDo === t.key ? '1px solid #003087' : '1px solid #e5e7eb',
                      background: cheDo === t.key ? '#003087' : '#fff',
                      color: cheDo === t.key ? '#fff' : '#555',
                    }}
                    onClick={() => setCheDo(t.key)}
                  >
                    <i className={`fa-regular ${t.icon} me-1`} />{t.label}
                  </button>
                ))}
              </div>

              <Spin spinning={loading && items.length === 0}>
                {items.length === 0 && !loading ? (
                  <Empty
                    description="Chưa có tin phù hợp — hãy đăng ký lĩnh vực quan tâm hoặc tham gia cộng đồng"
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
                              {LOAI_LABEL[item.loaiItem]}
                              {item.tenLinhVuc ? ` · ${item.tenLinhVuc}` : ''} · {relativeTime(item.createdOn)}
                            </div>
                          </div>
                          {cheDo === 'danh-cho-ban' && (item.diemPhuHop ?? 0) > 0 && (
                            <Tooltip title={`Điểm phù hợp: ${item.diemPhuHop}`}>
                              <Tag color="blue" style={{ margin: 0 }}>{Math.round(item.diemPhuHop!)}</Tag>
                            </Tooltip>
                          )}
                        </div>

                        {/* Lý do gợi ý */}
                        {(item.lyDoGoiY?.length ?? 0) > 0 && (
                          <div className="d-flex gap-1 flex-wrap mb-2">
                            {item.lyDoGoiY!.slice(0, 3).map((ly, i) => (
                              <Tag key={i} color="geekblue" style={{ fontSize: 11, margin: 0 }}>
                                <i className="fa-regular fa-sparkles me-1" />{ly}
                              </Tag>
                            ))}
                          </div>
                        )}

                        <div
                          className="fw-bold fs-5 text-gray-900 mb-1 cursor-pointer"
                          style={{ lineHeight: 1.4 }}
                          onClick={() => moChiTiet(item)}
                        >
                          {item.tieuDe}
                        </div>
                        {item.moTa && (
                          <div
                            className="text-gray-600 fs-7 mb-2 cursor-pointer"
                            style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.7 }}
                            onClick={() => moChiTiet(item)}
                          >
                            {item.moTa}
                          </div>
                        )}

                        <div className="d-flex gap-3 align-items-center border-top pt-2 mt-1">
                          <div className="d-flex align-items-center gap-1">
                            <button
                              className={`btn btn-sm btn-text d-flex align-items-center gap-1 p-0 ${likedIds.has(item.id) || item.daThich ? 'text-danger' : 'text-muted'}`}
                              onClick={() => handleLike(item)}
                            >
                              <i className={`fa-${likedIds.has(item.id) || item.daThich ? 'solid' : 'regular'} fa-heart me-1`} />
                            </button>
                            <NguoiThichPopover loaiDoiTuong={doiTuongCuaItem(item)} doiTuongId={item.id}>
                              <span
                                className={`fs-8 ${likedIds.has(item.id) || item.daThich ? 'text-danger' : 'text-muted'}`}
                                style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                              >
                                {Math.max(0, item.soLuotThich ?? 0)}
                              </span>
                            </NguoiThichPopover>
                          </div>
                          <button
                            className="btn btn-sm btn-text d-flex align-items-center gap-1 p-0 text-muted"
                            onClick={() => moChiTiet(item)}
                          >
                            <i className="fa-regular fa-comment me-1" />
                            <span className="fs-8">{item.soBinhLuan ?? 0}</span>
                          </button>
                          {(item.luotXem ?? 0) > 0 && (
                            <span className="fs-8 text-muted"><i className="fa-regular fa-eye me-1" />{item.luotXem}</span>
                          )}
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
          </div>

          {/* ── Cột phải: cá nhân hóa & gợi ý ── */}
          <div className="col-xl-4">
            {/* Lĩnh vực quan tâm */}
            <div className="shadow-sm mb-4" style={{ borderRadius: 12, background: '#fff', padding: '16px 20px' }}>
              <div className="fw-bold fs-6 text-gray-800 mb-1">
                <i className="fa-regular fa-heart-circle-check text-danger me-2" />Lĩnh vực bạn quan tâm
              </div>
              <div className="text-muted fs-8 mb-3">
                Đăng ký để feed "Dành cho bạn" ưu tiên đúng lĩnh vực. Hệ thống cũng tự học từ hành vi xem/thích của bạn.
              </div>
              <Select
                mode="multiple"
                allowClear
                className="w-100 mb-2"
                placeholder="Chọn lĩnh vực quan tâm"
                value={quanTamIds}
                onChange={setQuanTamIds}
                options={linhVucs.map(lv => ({ value: lv.id, label: lv.ten }))}
              />
              <button className="btn btn-sm btn-primary w-100" onClick={luuQuanTam} disabled={savingQuanTam}>
                {savingQuanTam ? <Spin size="small" /> : (<><i className="fa-regular fa-floppy-disk me-1" />Lưu lĩnh vực quan tâm</>)}
              </button>
            </div>

            {/* Gợi ý chuyên gia */}
            <div className="shadow-sm mb-4" style={{ borderRadius: 12, background: '#fff', padding: '16px 20px' }}>
              <div className="fw-bold fs-6 text-gray-800 mb-3">
                <i className="fa-regular fa-user-plus text-primary me-2" />Có thể bạn quan tâm
              </div>
              {goiYChuyenGia.length === 0 ? (
                <div className="text-muted fs-8">Chưa có gợi ý.</div>
              ) : goiYChuyenGia.map(cg => (
                <div key={cg.id} className="d-flex align-items-center gap-2 mb-3">
                  <Avatar size={36} style={{ backgroundColor: getAvatarColor(cg.hoTen ?? '?'), fontWeight: 600 }}>
                    {getInitials(cg.hoTen)}
                  </Avatar>
                  <div className="flex-grow-1 min-w-0">
                    <div className="fw-semibold fs-8 text-gray-800 text-truncate">{cg.hoTen}</div>
                    <div className="text-muted fs-9 text-truncate">{(cg as any).chuyenMon ?? (cg as any).donViCongTac ?? 'Chuyên gia ĐMST'}</div>
                  </div>
                  <button
                    className="btn btn-sm btn-light-primary"
                    onClick={() => {
                      ghiNhanHanhVi({ loaiHanhVi: LoaiHanhVi.TheoDoi, tuKhoa: cg.hoTen });
                      navigate('/doi-moi-sang-tao/kho-tri-thuc/chuyen-gia');
                    }}
                  >
                    Xem
                  </button>
                </div>
              ))}
              <Link to="/doi-moi-sang-tao/kho-tri-thuc/chuyen-gia" className="fs-8">
                Xem danh bạ chuyên gia <i className="fa-regular fa-arrow-right" />
              </Link>
            </div>

            {/* Chiến dịch — chờ module */}
            <div className="shadow-sm" style={{ borderRadius: 12, background: '#fff', padding: '16px 20px' }}>
              <div className="fw-bold fs-6 text-gray-800 mb-1">
                <i className="fa-regular fa-bullhorn text-warning me-2" />Chiến dịch ĐMST
              </div>
              <div className="text-muted fs-8">
                Gợi ý chiến dịch phù hợp sẽ xuất hiện tại đây khi module chiến dịch được triển khai —
                thuật toán đã dự phòng trọng số "Chiến dịch đã tham gia".
              </div>
            </div>
          </div>
        </div>
      </Content>
    </>
  );
};
