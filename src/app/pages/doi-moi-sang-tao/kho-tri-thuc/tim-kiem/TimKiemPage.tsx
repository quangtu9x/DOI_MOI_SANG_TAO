import React, { useState, useCallback, useRef } from 'react';
import { Input, Button, Tag, Spin, Empty, Avatar, Tabs, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { timKiem, searchChuyenGias } from '@/app/services/khoTriThucApi';
import type { ITaiLieuSearchResult, IChuyenGia } from '@/app/models/knowledge-hub';
import { LoaiTaiLieu, TrangThaiTaiLieu } from '@/app/models/knowledge-hub';

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
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState('tai-lieu');

  // Results
  const [tailieux, setTailieux]       = useState<ITaiLieuSearchResult[]>([]);
  const [tailieuxTotal, setTailieuxTotal] = useState(0);
  const [chuyenGias, setChuyenGias]   = useState<IChuyenGia[]>([]);
  const [chuyenGiasTotal, setChuyenGiasTotal] = useState(0);

  const inputRef = useRef<any>(null);

  const handleSearch = useCallback(async (kw: string) => {
    const q = kw.trim();
    if (!q) return;
    setActiveQuery(q);
    setLoading(true);
    try {
      const [tlRes, cgRes] = await Promise.allSettled([
        timKiem(q, 1, 20),
        searchChuyenGias({ keyword: q, pageNumber: 1, pageSize: 12 }),
      ]);

      if (tlRes.status === 'fulfilled') {
        setTailieux(safeList<ITaiLieuSearchResult>(tlRes.value));
        setTailieuxTotal(safeTotal(tlRes.value));
      }

      if (cgRes.status === 'fulfilled') {
        setChuyenGias(safeList<IChuyenGia>(cgRes.value));
        setChuyenGiasTotal(safeTotal(cgRes.value));
      }
    } catch {
      message.error('Tìm kiếm thất bại');
    } finally {
      setLoading(false);
    }
  }, []);

  const totalResults = tailieuxTotal + chuyenGiasTotal;
  const hasSearched = activeQuery.length > 0;

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
              onChange={e => setQuery(e.target.value)}
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
          </div>

          {/* Suggested tags */}
          {!hasSearched && (
            <div className="mt-4 d-flex flex-wrap gap-2 justify-content-center">
              {['đổi mới', 'quy trình', 'LEAN', 'chuyển đổi số', 'tiết kiệm', 'nâng cao chất lượng'].map(t => (
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
                Kết quả cho <strong className="text-gray-800">"{activeQuery}"</strong>
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
