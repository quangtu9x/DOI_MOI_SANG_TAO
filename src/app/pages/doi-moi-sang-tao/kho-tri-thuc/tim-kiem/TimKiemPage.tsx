import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Tag, Spin, Empty, Avatar, Tabs, message, Select, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { timKiem, searchChuyenGias, goiYTuKhoa, searchTaiLieus, searchTags } from '@/app/services/khoTriThucApi';
import { requestPOST } from '@/utils/baseAPI';
import type { ITaiLieuSearchResult, IChuyenGia, ITag } from '@/app/models/knowledge-hub';
import { LoaiTaiLieu, TrangThaiTaiLieu } from '@/app/models/knowledge-hub';

const { Option } = Select;

const TRANG_THAI_LABEL: Record<TrangThaiTaiLieu, string> = {
  [TrangThaiTaiLieu.NhapLieu]:    'Nháp',
  [TrangThaiTaiLieu.ChoXetDuyet]: 'Chờ duyệt',
  [TrangThaiTaiLieu.DaXuatBan]:   'Đã xuất bản',
  [TrangThaiTaiLieu.TuChoi]:      'Từ chối',
};

interface ISearchFilters {
  loaiTaiLieu?: LoaiTaiLieu | null;
  trangThai?: TrangThaiTaiLieu | null;
  tagIds: string[];
  linhVucKHCNId?: string | null;
  donViId?: string | null;
}

const EMPTY_FILTERS: ISearchFilters = { tagIds: [] };

const { TabPane } = Tabs;

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOAI_LABEL: Record<LoaiTaiLieu, string> = {
  [LoaiTaiLieu.HuongDan]:         'Hướng dẫn',
  [LoaiTaiLieu.Playbook]:         'Playbook',
  [LoaiTaiLieu.Template]:         'Mẫu biểu',
  [LoaiTaiLieu.NghienCuu]:        'Nghiên cứu',
  [LoaiTaiLieu.TinhHuong]:        'Tình huống',
  [LoaiTaiLieu.BaiHocKinhNghiem]: 'Bài học KN',
};
const LOAI_COLOR: Record<LoaiTaiLieu, string> = {
  [LoaiTaiLieu.HuongDan]:         'blue',
  [LoaiTaiLieu.Playbook]:         'purple',
  [LoaiTaiLieu.Template]:         'cyan',
  [LoaiTaiLieu.NghienCuu]:        'geekblue',
  [LoaiTaiLieu.TinhHuong]:        'orange',
  [LoaiTaiLieu.BaiHocKinhNghiem]: 'green',
};

const TRANG_THAI_COLOR: Record<TrangThaiTaiLieu, string> = {
  [TrangThaiTaiLieu.NhapLieu]:    '#d9d9d9',
  [TrangThaiTaiLieu.ChoXetDuyet]: '#1677ff',
  [TrangThaiTaiLieu.DaXuatBan]:   '#52c41a',
  [TrangThaiTaiLieu.TuChoi]:      '#ff4d4f',
};

const FALLBACK_SUGGESTIONS = ['đổi mới', 'quy trình', 'LEAN', 'chuyển đổi số', 'tiết kiệm', 'nâng cao chất lượng'];

const AVATAR_COLORS = ['#1677ff','#52c41a','#fa8c16','#eb2f96','#722ed1','#13c2c2'];
const getAvatarColor = (name: string) => AVATAR_COLORS[(name ?? '').charCodeAt(0) % AVATAR_COLORS.length];

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

/** Highlight keywords in text */
const Highlight: React.FC<{ text?: string; keyword: string }> = ({ text, keyword }) => {
  if (!text || !keyword.trim()) return <>{text ?? ''}</>;
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase()
          ? <mark key={i} style={{ background: '#fff3b0', padding: '0 2px', borderRadius: 2 }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

export const TimKiemPage: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery]             = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState('tai-lieu');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Bộ lọc nâng cao (metadata)
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters]         = useState<ISearchFilters>(EMPTY_FILTERS);
  const [tagOptions, setTagOptions]   = useState<ITag[]>([]);
  const [linhVucOptions, setLinhVucOptions] = useState<{ id: string; ten: string }[]>([]);
  const [donViOptions, setDonViOptions]     = useState<{ id: string; name: string }[]>([]);

  // Results
  const [tailieux, setTailieux]       = useState<ITaiLieuSearchResult[]>([]);
  const [tailieuxTotal, setTailieuxTotal] = useState(0);
  const [chuyenGias, setChuyenGias]   = useState<IChuyenGia[]>([]);
  const [chuyenGiasTotal, setChuyenGiasTotal] = useState(0);

  const inputRef      = useRef<any>(null);
  const suggestTimer  = useRef<ReturnType<typeof setTimeout>>();

  const activeFilterCount =
    (filters.loaiTaiLieu != null ? 1 : 0) +
    (filters.trangThai != null ? 1 : 0) +
    (filters.tagIds.length > 0 ? 1 : 0) +
    (filters.linhVucKHCNId ? 1 : 0) +
    (filters.donViId ? 1 : 0);

  // Tải dữ liệu cho các bộ lọc (tag, lĩnh vực, đơn vị) — 1 lần
  useEffect(() => {
    (async () => {
      const [tagRes, lvRes, dvRes] = await Promise.allSettled([
        searchTags({ pageNumber: 1, pageSize: 100 }),
        requestPOST<any>('LinhVucKHCNs/search', { pageNumber: 1, pageSize: 200 }),
        requestPOST<any>('OrganizationUnits/search', { pageNumber: 1, pageSize: 200 }),
      ]);
      if (tagRes.status === 'fulfilled') setTagOptions(safeList<ITag>(tagRes.value));
      if (lvRes.status === 'fulfilled') {
        setLinhVucOptions(safeList<any>(lvRes.value).map((x: any) => ({ id: x.id, ten: x.ten ?? x.name ?? '' })));
      }
      if (dvRes.status === 'fulfilled') {
        setDonViOptions(safeList<any>(dvRes.value).map((x: any) => ({ id: x.id, name: x.name ?? x.ten ?? '' })));
      }
    })();
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(suggestTimer.current);
    if (val.trim().length >= 1) {
      suggestTimer.current = setTimeout(async () => {
        try {
          const res = await goiYTuKhoa(val.trim());
          const list: string[] = Array.isArray(res) ? res : ((res as any)?.data ?? []);
          setSuggestions(list.slice(0, 6));
        } catch { /* ignore */ }
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  /** Chuẩn hóa ITaiLieu (TaiLieus/search) → shape hiển thị chung */
  const normalizeTL = (item: any): ITaiLieuSearchResult => ({
    id: item.id,
    tieuDe: item.tieuDe,
    moTa: item.moTa,
    loaiTaiLieu: item.loaiTaiLieu,
    trangThai: item.trangThai,
    tags: (item.tags ?? []).map((t: any) => (typeof t === 'string' ? t : (t?.ten ?? ''))).filter(Boolean),
    luotXem: item.luotXem ?? 0,
    tacGia: item.tacGia,
    createdOn: item.createdOn,
  });

  const handleSearch = useCallback(async (kw: string, f: ISearchFilters = filters) => {
    const q = kw.trim();
    const hasFilters =
      f.loaiTaiLieu != null || f.trangThai != null || f.tagIds.length > 0 || !!f.linhVucKHCNId || !!f.donViId;
    if (!q && !hasFilters) return;

    setActiveQuery(q);
    setHasSearched(true);
    setLoading(true);
    try {
      // Có bộ lọc metadata → tìm qua TaiLieus/search (keyword + tag + lĩnh vực + trạng thái + đơn vị)
      // Chỉ có keyword → full-text search (Elasticsearch, tự fallback DB)
      const tlPromise = hasFilters
        ? searchTaiLieus({
            pageNumber: 1,
            pageSize: 20,
            keyword: q || '',
            loaiTaiLieu: f.loaiTaiLieu ?? null,
            trangThai: f.trangThai ?? null,
            linhVucKHCNId: f.linhVucKHCNId ?? null,
            donViId: f.donViId ?? null,
            tagIds: f.tagIds,
          })
        : timKiem(q, 1, 20);

      const [tlRes, cgRes] = await Promise.allSettled([
        tlPromise,
        q ? searchChuyenGias({ keyword: q, pageNumber: 1, pageSize: 12 })
          : Promise.resolve(null),
      ]);

      if (tlRes.status === 'fulfilled') {
        const rawList = safeList<any>(tlRes.value);
        setTailieux(hasFilters ? rawList.map(normalizeTL) : rawList);
        setTailieuxTotal(safeTotal(tlRes.value));
      }

      if (cgRes.status === 'fulfilled' && cgRes.value) {
        setChuyenGias(safeList<IChuyenGia>(cgRes.value));
        setChuyenGiasTotal(safeTotal(cgRes.value));
      } else if (!q) {
        setChuyenGias([]);
        setChuyenGiasTotal(0);
      }
    } catch {
      message.error('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilter = (patch: Partial<ISearchFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (hasSearched) handleSearch(query, next);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    if (hasSearched) handleSearch(query, EMPTY_FILTERS);
  };

  const totalResults = tailieuxTotal + chuyenGiasTotal;

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Tìm kiếm</PageTitle>

      <Content>
        {/* ── Hero Search Bar */}
        <div className="text-center mb-8" style={{ maxWidth: 700, margin: '0 auto 2.5rem' }}>
          <div className="mb-3">
            <i className="fa-regular fa-magnifying-glass fs-2x text-primary mb-2 d-block" />
            <h4 className="fw-bold text-gray-900 mb-1">Tìm kiếm Kho tri thức</h4>
            <p className="text-muted fs-7">Tìm tài liệu, chuyên gia, bài viết theo từ khóa</p>
          </div>
          <div className="d-flex gap-2" style={{ maxWidth: 600, margin: '0 auto' }}>
            <Input
              ref={inputRef}
              size="large"
              value={query}
              onChange={handleQueryChange}
              placeholder="Nhập từ khóa tìm kiếm..."
              prefix={<i className="fa-regular fa-search text-muted me-1" />}
              onPressEnter={() => handleSearch(query)}
              style={{ borderRadius: 12 }}
              allowClear
            />
            <Button
              type="primary"
              size="large"
              style={{ borderRadius: 12, minWidth: 96 }}
              loading={loading}
              onClick={() => handleSearch(query)}
            >
              Tìm kiếm
            </Button>
            <Badge count={activeFilterCount} size="small">
              <Button
                size="large"
                style={{ borderRadius: 12 }}
                type={showFilters ? 'primary' : 'default'}
                ghost={showFilters}
                icon={<i className="fa-regular fa-sliders" />}
                onClick={() => setShowFilters(v => !v)}
              />
            </Badge>
          </div>

          {/* Bộ lọc nâng cao: tag + metadata (lĩnh vực, trạng thái, đơn vị, loại) */}
          {showFilters && (
            <div className="card border-0 shadow-sm mt-4 text-start">
              <div className="card-body py-4 d-flex flex-wrap gap-3 align-items-end">
                <div>
                  <div className="fs-8 text-muted mb-1">Loại tài liệu</div>
                  <Select allowClear placeholder="Tất cả" style={{ width: 160 }}
                    value={filters.loaiTaiLieu ?? undefined}
                    onChange={v => updateFilter({ loaiTaiLieu: v ?? null })}>
                    {Object.entries(LOAI_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                  </Select>
                </div>
                <div>
                  <div className="fs-8 text-muted mb-1">Trạng thái</div>
                  <Select allowClear placeholder="Tất cả" style={{ width: 150 }}
                    value={filters.trangThai ?? undefined}
                    onChange={v => updateFilter({ trangThai: v ?? null })}>
                    {Object.entries(TRANG_THAI_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                  </Select>
                </div>
                <div>
                  <div className="fs-8 text-muted mb-1">Tag</div>
                  <Select mode="multiple" allowClear placeholder="Chọn tag" style={{ minWidth: 200 }}
                    value={filters.tagIds}
                    maxTagCount={2}
                    optionFilterProp="children"
                    onChange={v => updateFilter({ tagIds: v })}>
                    {tagOptions.map(t => <Option key={t.id} value={t.id}>{t.ten}</Option>)}
                  </Select>
                </div>
                <div>
                  <div className="fs-8 text-muted mb-1">Lĩnh vực</div>
                  <Select allowClear showSearch placeholder="Tất cả" style={{ width: 200 }}
                    value={filters.linhVucKHCNId ?? undefined}
                    optionFilterProp="children"
                    onChange={v => updateFilter({ linhVucKHCNId: v ?? null })}>
                    {linhVucOptions.map(lv => <Option key={lv.id} value={lv.id}>{lv.ten}</Option>)}
                  </Select>
                </div>
                <div>
                  <div className="fs-8 text-muted mb-1">Đơn vị</div>
                  <Select allowClear showSearch placeholder="Tất cả" style={{ width: 220 }}
                    value={filters.donViId ?? undefined}
                    optionFilterProp="children"
                    onChange={v => updateFilter({ donViId: v ?? null })}>
                    {donViOptions.map(dv => <Option key={dv.id} value={dv.id}>{dv.name}</Option>)}
                  </Select>
                </div>
                {activeFilterCount > 0 && (
                  <Button type="link" danger onClick={clearFilters}>
                    <i className="fa-regular fa-filter-circle-xmark me-1" />Xóa lọc
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Suggested tags */}
          {!hasSearched && (
            <div className="mt-4 d-flex flex-wrap gap-2 justify-content-center">
              {(query.trim() && suggestions.length > 0 ? suggestions : FALLBACK_SUGGESTIONS).map(t => (
                <Button key={t} size="small" type="default" style={{ borderRadius: 20 }}
                  onClick={() => { setQuery(t); handleSearch(t); }}>
                  {t}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* ── Results */}
        <Spin spinning={loading}>
          {hasSearched && !loading && (
            <div className="mb-4 d-flex align-items-center gap-2">
              <span className="text-muted fs-7">
                {activeQuery
                  ? <>Kết quả cho <strong className="text-gray-800">"{activeQuery}"</strong></>
                  : <>Kết quả theo bộ lọc</>}
                {activeFilterCount > 0 && <span> ({activeFilterCount} bộ lọc)</span>}
                {totalResults > 0 && <span> — {totalResults} kết quả</span>}
              </span>
            </div>
          )}

          {hasSearched && !loading && totalResults === 0 && (
            <Empty
              description={
                <div>
                  <div className="fw-semibold text-gray-700 mb-1">Không tìm thấy kết quả</div>
                  <div className="text-muted fs-7">Thử từ khóa khác hoặc kiểm tra lại chính tả</div>
                </div>
              }
              className="py-10"
            />
          )}

          {hasSearched && totalResults > 0 && (
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {/* ── Tài liệu */}
              <TabPane
                tab={<span><i className="fa-regular fa-books me-2" />Tài liệu <span className="badge badge-light-primary ms-1">{tailieuxTotal}</span></span>}
                key="tai-lieu"
              >
                {tailieux.length === 0 ? (
                  <Empty description="Không tìm thấy tài liệu" className="py-8" />
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {tailieux.map(item => (
                      <div key={item.id} className="card border-0 shadow-sm"
                        style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '')}
                        onClick={() => navigate(`/doi-moi-sang-tao/kho-tri-thuc/thu-vien`)}>
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start gap-3">
                            {/* Status dot */}
                            <div style={{
                              width: 4, minHeight: 60, borderRadius: 2, flexShrink: 0,
                              background: TRANG_THAI_COLOR[item.trangThai],
                            }} />
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <Tag color={LOAI_COLOR[item.loaiTaiLieu]} style={{ margin: 0 }}>
                                  {LOAI_LABEL[item.loaiTaiLieu]}
                                </Tag>
                                {(item.tags ?? []).slice(0, 3).map(t => (
                                  <Tag key={t} style={{ fontSize: 11, margin: 0 }}>{t}</Tag>
                                ))}
                              </div>
                              <h6 className="fw-bold text-gray-800 mb-1 fs-6">
                                <Highlight text={item.tieuDe} keyword={activeQuery} />
                              </h6>
                              {item.moTa && (
                                <p className="text-muted fs-7 mb-2"
                                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  <Highlight text={item.moTa} keyword={activeQuery} />
                                </p>
                              )}
                              <div className="d-flex gap-3 text-muted fs-8">
                                <span><i className="fa-regular fa-user me-1" />{item.tacGia?.hoTen ?? '—'}</span>
                                <span><i className="fa-regular fa-eye me-1" />{item.luotXem ?? 0} lượt xem</span>
                                <span><i className="fa-regular fa-calendar me-1" />
                                  {item.createdOn ? new Date(item.createdOn).toLocaleDateString('vi-VN') : '—'}
                                </span>
                              </div>
                            </div>
                            <Button type="link" size="small" style={{ flexShrink: 0 }}
                              onClick={e => { e.stopPropagation(); navigate('/doi-moi-sang-tao/kho-tri-thuc/thu-vien'); }}>
                              Xem →
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {tailieuxTotal > tailieux.length && (
                      <div className="text-center py-2">
                        <Button type="link" onClick={() => navigate('/doi-moi-sang-tao/kho-tri-thuc/thu-vien')}>
                          Xem thêm {tailieuxTotal - tailieux.length} tài liệu trong Thư viện →
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabPane>

              {/* ── Chuyên gia */}
              <TabPane
                tab={<span><i className="fa-regular fa-user-tie me-2" />Chuyên gia <span className="badge badge-light-success ms-1">{chuyenGiasTotal}</span></span>}
                key="chuyen-gia"
              >
                {chuyenGias.length === 0 ? (
                  <Empty description="Không tìm thấy chuyên gia" className="py-8" />
                ) : (
                  <div className="row g-4">
                    {chuyenGias.map(cg => (
                      <div key={cg.id} className="col-md-6 col-xl-4">
                        <div className="card border-0 shadow-sm h-100 cursor-pointer"
                          style={{ transition: 'box-shadow 0.2s' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '')}
                          onClick={() => navigate('/doi-moi-sang-tao/kho-tri-thuc/chuyen-gia')}>
                          <div className="card-body p-4">
                            <div className="d-flex gap-3 mb-3">
                              <Avatar size={52} style={{ backgroundColor: getAvatarColor(cg.hoTen), flexShrink: 0 }}>
                                {cg.hoTen?.charAt(0)?.toUpperCase() ?? '?'}
                              </Avatar>
                              <div>
                                <div className="fw-bold text-gray-800 fs-6">
                                  <Highlight text={cg.hoTen} keyword={activeQuery} />
                                </div>
                                {(cg.hocViVietTat || cg.hocHamVietTat) && (
                                  <Tag color="gold" style={{ fontSize: 11, marginTop: 2 }}>
                                    {cg.hocViVietTat ?? cg.hocHamVietTat}
                                  </Tag>
                                )}
                                {cg.laChuyenGiaNgoai && (
                                  <Tag color="purple" style={{ fontSize: 11, marginTop: 2 }}>Ngoài VNA</Tag>
                                )}
                              </div>
                            </div>
                            <div className="d-flex flex-column gap-1 text-muted fs-8">
                              {cg.donViCongTac && (
                                <div><i className="fa-regular fa-building me-2" />
                                  <Highlight text={cg.donViCongTac} keyword={activeQuery} />
                                </div>
                              )}
                              {cg.chucVu && (
                                <div><i className="fa-regular fa-briefcase me-2" />
                                  <Highlight text={cg.chucVu} keyword={activeQuery} />
                                </div>
                              )}
                              {cg.linhVuc && (
                                <div><i className="fa-regular fa-tag me-2" />
                                  <Highlight text={cg.linhVuc} keyword={activeQuery} />
                                </div>
                              )}
                              {cg.chuyenMon && (
                                <div className="text-gray-600">
                                  <i className="fa-regular fa-graduation-cap me-2" />
                                  <Highlight text={cg.chuyenMon} keyword={activeQuery} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {chuyenGiasTotal > chuyenGias.length && (
                      <div className="col-12 text-center">
                        <Button type="link" onClick={() => navigate('/doi-moi-sang-tao/kho-tri-thuc/chuyen-gia')}>
                          Xem thêm trong Danh bạ chuyên gia →
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabPane>
            </Tabs>
          )}
        </Spin>
      </Content>
    </>
  );
};
