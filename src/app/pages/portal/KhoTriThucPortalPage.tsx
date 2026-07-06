import { useEffect, useState, useCallback, useRef } from 'react';
import { Input, Select, Button, Tag, Badge, Modal, Spin, Empty } from 'antd';
import { searchTaiLieus, getTaiLieu } from '@/app/services/khoTriThucApi';
import { TrangThaiTaiLieu, LoaiTaiLieu } from '@/app/models/knowledge-hub';
import type { ITaiLieu, ISearchTaiLieuRequest } from '@/app/models/knowledge-hub';

const { Option } = Select;

// ── Null-safe API helpers ─────────────────────────────────────────────────────
const safeList = <T,>(res: any): T[] => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};
const safeTotal = (res: any): number => {
  const d = res?.data ?? res;
  return d?.totalCount ?? d?.data?.totalCount ?? 0;
};
const safeItem = <T,>(res: any): T | null => {
  const d = res?.data ?? res;
  return (d?.data ?? d ?? null) as T | null;
};

// ── Màu theo lĩnh vực — hash ổn định ─────────────────────────────────────────
const PALETTE = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#0EA5E9', '#EC4899', '#14B8A6'];
const colorForLinhVuc = (ten?: string | null): string => {
  if (!ten) return '#6B7280';
  let hash = 0;
  for (let i = 0; i < ten.length; i++) hash = (hash * 31 + ten.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
};

// Tags từ API là [{id, ten, soLanDung}], cần map về string[]
const normalizeTags = (raw: any[]): string[] =>
  raw.map(t => (typeof t === 'string' ? t : (t?.ten ?? ''))).filter(Boolean);

const normalizeItem = (item: any): ITaiLieu => ({
  ...item,
  tags: Array.isArray(item.tags) ? normalizeTags(item.tags) : [],
});

// ── Error handling (theo pattern getApiError của ThuVienTaiLieuPage.tsx) ─────
// baseAPI không throw khi HTTP lỗi — resolve với {data, status}. Cần tự kiểm tra status.
type ApiErrorKind = 'unauthorized' | 'forbidden' | 'server' | null;

const getApiErrorKind = (res: any): ApiErrorKind => {
  const status = res?.status;
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (typeof status === 'number' && status >= 500) return 'server';
  return null;
};

/** Thông báo lỗi từ BE (Result.messages) hoặc null nếu thành công — sao chép từ ThuVienTaiLieuPage.tsx */
const getApiError = (res: any): string | null => {
  if (!res) return 'Không nhận được phản hồi từ máy chủ';
  if (typeof res.status === 'number' && res.status >= 400) {
    const d = res.data;
    const msgs: string[] = d?.messages ?? [];
    return msgs.length > 0 ? msgs.join('. ') : (d?.exception || `Lỗi ${res.status}`);
  }
  const d = res.data;
  if (d && d.succeeded === false) {
    const msgs: string[] = d.messages ?? [];
    return msgs.length > 0 ? msgs.join('. ') : 'Yêu cầu không thành công';
  }
  return null;
};

const ERROR_KIND_LABEL: Record<Exclude<ApiErrorKind, null>, { title: string; desc: string }> = {
  unauthorized: { title: 'Cần đăng nhập', desc: 'Bạn cần đăng nhập để xem nội dung này.' },
  forbidden:    { title: 'Không có quyền truy cập', desc: 'Bạn không có quyền xem nội dung này.' },
  server:       { title: 'Lỗi hệ thống', desc: 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.' },
};

const LOAI_LABEL: Record<LoaiTaiLieu, string> = {
  [LoaiTaiLieu.HuongDan]:         'Hướng dẫn',
  [LoaiTaiLieu.Playbook]:         'Playbook',
  [LoaiTaiLieu.Template]:         'Mẫu biểu',
  [LoaiTaiLieu.NghienCuu]:        'Nghiên cứu',
  [LoaiTaiLieu.TinhHuong]:        'Tình huống',
  [LoaiTaiLieu.BaiHocKinhNghiem]: 'Bài học KN',
};

const PAGE_SIZE = 9;
const SORT_OPTIONS: { label: string; orderBy: string[] }[] = [
  { label: 'Mới nhất',        orderBy: ['createdOn desc'] },
  { label: 'Xem nhiều nhất',  orderBy: ['luotXem desc']   },
  { label: 'Tên A-Z',         orderBy: ['tieuDe asc']     },
];

// Portal là màn hình công khai — chỉ hiển thị tài liệu đã xuất bản (DaXuatBan).
// Không set field này, BE sẽ áp dụng phạm vi nhìn thấy theo phiên đăng nhập hiện tại
// (bao gồm cả bản nháp/chờ duyệt của chính người dùng hoặc người có quyền duyệt),
// không phù hợp với một trang trưng bày công khai.
const DEFAULT_SEARCH: ISearchTaiLieuRequest = {
  pageNumber:   1,
  pageSize:     PAGE_SIZE,
  keyword:      '',
  loaiTaiLieu:  null,
  trangThai:    TrangThaiTaiLieu.DaXuatBan,
  orderBy:      SORT_OPTIONS[0].orderBy,
};

// ── Main component ────────────────────────────────────────────────────────────
export const KhoTriThucPortalPage = () => {
  const [kSearchInput, setKSearchInput] = useState('');
  const [searchReq, setSearchReq]       = useState<ISearchTaiLieuRequest>(DEFAULT_SEARCH);
  const [sortIndex, setSortIndex]       = useState(0);

  const [items, setItems]     = useState<ITaiLieu[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorKind, setErrorKind] = useState<ApiErrorKind>(null);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);

  const [detail, setDetail]               = useState<ITaiLieu | null>(null);
  const [detailOpen, setDetailOpen]       = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErrorKind, setDetailErrorKind] = useState<ApiErrorKind>(null);
  const [detailErrorMsg, setDetailErrorMsg]   = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadItems = useCallback(async (req: ISearchTaiLieuRequest) => {
    setLoading(true);
    setErrorKind(null);
    setErrorMsg(null);
    try {
      const res = await searchTaiLieus(req);
      const kind = getApiErrorKind(res);
      if (kind) {
        setErrorKind(kind);
        setErrorMsg(getApiError(res));
        setItems([]);
        setTotal(0);
        return;
      }
      setItems(safeList<any>(res).map(normalizeItem));
      setTotal(safeTotal(res));
    } catch {
      setErrorKind('server');
      setErrorMsg('Không thể kết nối tới máy chủ');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadItems(searchReq); }, [searchReq, loadItems]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onSearchInputChange = (value: string) => {
    setKSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchReq(prev => ({ ...prev, keyword: value, pageNumber: 1 }));
    }, 400);
  };

  const onLoaiChange = (v?: number) => {
    setSearchReq(prev => ({ ...prev, loaiTaiLieu: v ?? null, pageNumber: 1 }));
  };

  const onSortChange = (idx: number) => {
    setSortIndex(idx);
    setSearchReq(prev => ({ ...prev, orderBy: SORT_OPTIONS[idx].orderBy, pageNumber: 1 }));
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const onPageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setSearchReq(prev => ({ ...prev, pageNumber: page }));
  };

  const openDetail = async (item: ITaiLieu) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailErrorKind(null);
    setDetailErrorMsg(null);
    setDetail(null);
    try {
      const res = await getTaiLieu(item.id);
      const kind = getApiErrorKind(res);
      if (kind) {
        setDetailErrorKind(kind);
        setDetailErrorMsg(getApiError(res));
        return;
      }
      const fresh = safeItem<any>(res);
      if (fresh) {
        setDetail(normalizeItem(fresh));
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, luotXem: (it.luotXem ?? 0) + 1 } : it));
      } else {
        setDetail(item);
      }
    } catch {
      setDetailErrorKind('server');
      setDetailErrorMsg('Không thể kết nối tới máy chủ');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetail(null);
    setDetailErrorKind(null);
    setDetailErrorMsg(null);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto w-full px-6 pt-6 pb-8">

      {/* Hero */}
      <div
        className="mb-5 rounded-xl overflow-hidden shadow-sm"
        style={{ backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)' }}
      >
        <div className="flex items-center gap-4 px-6 py-6">
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <i className="fa-regular fa-books text-white text-2xl"></i>
          </div>
          <div>
            <h3 className="text-white font-bold text-xl mb-0.5">Kho tri thức đổi mới sáng tạo</h3>
            <p className="text-white/80 text-sm mb-0">
              Tổng hợp các ý tưởng sáng tạo được công nhận tại Vietnam Airlines
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
          {/* Thống kê */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              <i className="fa-regular fa-books mr-1.5 text-blue-500"></i>
              <strong className="text-gray-700">{total}</strong> tri thức công nhận
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              <i className="fa-regular fa-eye mr-1.5 text-green-500"></i>
              <strong className="text-gray-700">{items.reduce((s, k) => s + (k.luotXem ?? 0), 0)}</strong> lượt xem (trang này)
            </span>
          </div>
          {/* Bộ lọc */}
          <div className="flex flex-wrap gap-2">
            <Input.Search
              placeholder="Tìm theo tên, mã, tag..."
              value={kSearchInput}
              onChange={e => onSearchInputChange(e.target.value)}
              onSearch={v => onSearchInputChange(v)}
              allowClear
              style={{ width: 240 }}
            />
            <Select
              placeholder="Loại tài liệu"
              allowClear
              style={{ width: 180 }}
              value={searchReq.loaiTaiLieu ?? undefined}
              onChange={v => onLoaiChange(v)}
            >
              {Object.entries(LOAI_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
            </Select>
            <Select
              style={{ width: 155 }}
              value={sortIndex}
              onChange={v => onSortChange(Number(v))}
            >
              {SORT_OPTIONS.map((s, idx) => <Option key={s.label} value={idx}>{s.label}</Option>)}
            </Select>
          </div>
        </div>
      </div>

      {/* Danh sách card */}
      <Spin spinning={loading}>
          {!loading && errorKind ? (
            <div className="text-center py-16">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div className="text-gray-700 font-semibold mb-1">{ERROR_KIND_LABEL[errorKind].title}</div>
                    <span className="text-gray-500 text-sm">{errorMsg || ERROR_KIND_LABEL[errorKind].desc}</span>
                  </div>
                }
              />
            </div>
          ) : !loading && items.length === 0 ? (
            <div className="text-center py-16">
              <Empty description={<span className="text-gray-500">Không tìm thấy tri thức phù hợp</span>} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {items.map(item => {
                const color = colorForLinhVuc(item.tenLinhVuc);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full"
                    style={{ transition: 'box-shadow 0.2s, transform 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                      (e.currentTarget as HTMLDivElement).style.transform = '';
                    }}
                    onClick={() => openDetail(item)}
                  >
                    {/* Accent bar — lĩnh vực color */}
                    <div style={{ height: 4, borderRadius: '8px 8px 0 0', background: color }} />

                    <div className="p-4 flex flex-col flex-1">
                      {/* Header row: icon + lĩnh vực + mã số | trạng thái */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex items-center justify-center rounded-lg shrink-0"
                            style={{ width: 42, height: 42, backgroundColor: color + '1a', flexShrink: 0 }}
                          >
                            <i className="fa-regular fa-lightbulb text-lg" style={{ color }} />
                          </div>
                          <div className="flex flex-col gap-1">
                            {item.tenLinhVuc && (
                              <Tag style={{ margin: 0, width: 'fit-content', fontSize: 11, background: color + '1a', color, borderColor: color + '60' }}>
                                {item.tenLinhVuc}
                              </Tag>
                            )}
                            {item.soHieu && (
                              <span className="text-xs text-gray-400">#{item.soHieu}</span>
                            )}
                          </div>
                        </div>
                        <Badge status="success" text="Đã xuất bản" />
                      </div>

                      {/* Tiêu đề */}
                      <h6
                        className="font-bold text-gray-800 text-sm mb-2"
                        style={{ lineHeight: 1.4, cursor: 'pointer', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        onClick={e => { e.stopPropagation(); openDetail(item); }}
                      >
                        {item.tieuDe}
                      </h6>

                      {/* Mô tả */}
                      <p
                        className="text-gray-600 text-xs flex-1 mb-3"
                        style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 54 }}
                      >
                        {item.moTa ?? <span className="italic text-gray-400">Chưa có mô tả</span>}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3" style={{ minHeight: 22 }}>
                        {(item.tags ?? []).slice(0, 3).map(t => (
                          <Tag key={t} color="blue" style={{ fontSize: 11 }}>{t}</Tag>
                        ))}
                        {(item.tags ?? []).length > 3 && <Tag style={{ fontSize: 11 }}>+{(item.tags ?? []).length - 3}</Tag>}
                      </div>

                      {/* Tác giả + đơn vị */}
                      <div className="text-gray-400 text-xs mb-2 flex items-center gap-1.5">
                        <i className="fa-regular fa-user" />
                        <span>{item.tacGia?.hoTen ?? '—'}</span>
                        {item.tenDonVi && (
                          <>
                            <span>·</span>
                            <span className="truncate" style={{ maxWidth: 110 }}>{item.tenDonVi}</span>
                          </>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-auto">
                        <div className="text-gray-400 text-xs flex gap-3">
                          <span><i className="fa-regular fa-eye" style={{ marginRight: 3 }} />{item.luotXem ?? 0}</span>
                          {(() => {
                            const d = item.ngayXuatBan ?? item.createdOn;
                            return d ? (
                              <span>
                                <i className="fa-regular fa-calendar" style={{ marginRight: 3 }} />
                                {new Date(d).toLocaleDateString('vi-VN')}
                              </span>
                            ) : null;
                          })()}
                        </div>
                        <Button
                          size="small"
                          type="primary"
                          ghost
                          onClick={e => { e.stopPropagation(); openDetail(item); }}
                        >
                          <i className="fa-regular fa-eye" style={{ marginRight: 4 }} />Xem
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Spin>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <Button
              size="small"
              disabled={(searchReq.pageNumber ?? 1) <= 1}
              onClick={() => onPageChange((searchReq.pageNumber ?? 1) - 1)}
            >
              <i className="fa-regular fa-chevron-left"></i>
            </Button>
            <span className="text-sm text-gray-500">
              Trang <strong>{searchReq.pageNumber}</strong> / {totalPages}
            </span>
            <Button
              size="small"
              disabled={(searchReq.pageNumber ?? 1) >= totalPages}
              onClick={() => onPageChange((searchReq.pageNumber ?? 1) + 1)}
            >
              <i className="fa-regular fa-chevron-right"></i>
            </Button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onCancel={closeDetail}
        width={660}
        title={
          detail && !detailLoading ? (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 40, height: 40, background: colorForLinhVuc(detail.tenLinhVuc) + '20' }}
              >
                <i
                  className="fa-regular fa-lightbulb text-lg"
                  style={{ color: colorForLinhVuc(detail.tenLinhVuc) }}
                ></i>
              </div>
              <div>
                <div className="font-bold text-gray-800 text-base leading-snug">{detail.tieuDe}</div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: colorForLinhVuc(detail.tenLinhVuc) + '20', color: colorForLinhVuc(detail.tenLinhVuc) }}
                >
                  {detail.soHieu ?? '—'}
                </span>
              </div>
            </div>
          ) : null
        }
        footer={[
          <Button key="close" onClick={closeDetail}>Đóng</Button>,
        ]}
      >
        <Spin spinning={detailLoading}>
          {!detailLoading && detailErrorKind ? (
            <div className="text-center py-10">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div className="text-gray-700 font-semibold mb-1">{ERROR_KIND_LABEL[detailErrorKind].title}</div>
                    <span className="text-gray-500 text-sm">{detailErrorMsg || ERROR_KIND_LABEL[detailErrorKind].desc}</span>
                  </div>
                }
              />
            </div>
          ) : detail && (
            <>
              {/* Lĩnh vực + tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {detail.tenLinhVuc && (
                  <Tag
                    style={{
                      fontWeight: 600,
                      background: colorForLinhVuc(detail.tenLinhVuc) + '22',
                      color: colorForLinhVuc(detail.tenLinhVuc),
                      borderColor: colorForLinhVuc(detail.tenLinhVuc) + '80',
                    }}
                  >
                    {detail.tenLinhVuc}
                  </Tag>
                )}
                {(detail.tags ?? []).map(t => (
                  <Tag key={t} color="blue">{t}</Tag>
                ))}
              </div>

              {/* Tóm tắt */}
              {detail.moTa && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tóm tắt</div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-700 leading-relaxed">
                    {detail.moTa}
                  </div>
                </div>
              )}

              {/* Lợi ích */}
              {detail.loiIchGhiNhan && (
                <div className="mb-4 p-3 rounded-lg" style={{ border: '1px dashed #86efac', background: '#f0fdf4' }}>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lợi ích đã ghi nhận</div>
                  <div className="flex items-start gap-2">
                    <i className="fa-regular fa-circle-check text-green-500 mt-0.5 shrink-0"></i>
                    <span className="text-sm text-green-800 font-medium">{detail.loiIchGhiNhan}</span>
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Tác giả</div>
                  <div className="text-sm font-semibold text-gray-700">{detail.tacGia?.hoTen ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Đơn vị</div>
                  <div className="text-sm font-semibold text-gray-700">{detail.tenDonVi ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Ngày công nhận</div>
                  <div className="text-sm font-semibold text-gray-700">
                    {detail.ngayXuatBan
                      ? new Date(detail.ngayXuatBan).toLocaleDateString('vi-VN')
                      : detail.createdOn
                      ? new Date(detail.createdOn).toLocaleDateString('vi-VN')
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Lượt xem</div>
                  <div className="text-sm font-semibold text-gray-700">
                    <i className="fa-regular fa-eye mr-1 text-gray-400"></i>{detail.luotXem ?? 0}
                  </div>
                </div>
              </div>
            </>
          )}
        </Spin>
      </Modal>
    </div>
  );
};
