import React, { useState, useEffect, useCallback } from 'react';
import {
  Input, Select, Button, Tag, Modal, Form, Upload, Spin, Empty,
  Tabs, Tooltip, Popconfirm, message, Badge, Divider, Progress,
} from 'antd';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';
import {
  searchTaiLieus,
  getTaiLieu,
  createTaiLieu,
  updateTaiLieu,
  deleteTaiLieu,
  nopKiemDuyetTaiLieu,
  pheDuyetTaiLieu,
  tuChoiTaiLieu,
  getTaiLieuDownloadUrl,
  getRankingTaiLieus,
  searchPhienBans,
  uploadTaiLieuFile,
} from '@/app/services/khoTriThucApi';
import type {
  ITaiLieu,
  ISearchTaiLieuRequest,
} from '@/app/models/knowledge-hub';
import { TrangThaiTaiLieu, LoaiTaiLieu } from '@/app/models/knowledge-hub';

const { Option } = Select;
const { TextArea } = Input;

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

const TRANG_THAI_LABEL: Record<TrangThaiTaiLieu, string> = {
  [TrangThaiTaiLieu.NhapLieu]:    'Nháp',
  [TrangThaiTaiLieu.ChoXetDuyet]: 'Chờ duyệt',
  [TrangThaiTaiLieu.DaXuatBan]:   'Đã xuất bản',
  [TrangThaiTaiLieu.TuChoi]:      'Từ chối',
};

const TRANG_THAI_COLOR: Record<TrangThaiTaiLieu, string> = {
  [TrangThaiTaiLieu.NhapLieu]:    'default',
  [TrangThaiTaiLieu.ChoXetDuyet]: 'processing',
  [TrangThaiTaiLieu.DaXuatBan]:   'success',
  [TrangThaiTaiLieu.TuChoi]:      'error',
};

const MIME_ICON: Record<string, string> = {
  'application/pdf':                                             'fa-file-pdf text-danger',
  'application/msword':                                          'fa-file-word text-primary',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word text-primary',
  'application/vnd.ms-excel':                                    'fa-file-excel text-success',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-file-excel text-success',
  'application/vnd.ms-powerpoint':                               'fa-file-powerpoint text-warning',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fa-file-powerpoint text-warning',
};

const getFileIcon = (mime?: string | null) =>
  mime ? (MIME_ICON[mime] ?? 'fa-file text-muted') : 'fa-file text-muted';

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Normalize raw API item → flat ITaiLieu expected by the UI */
const normalizeTL = (item: any): ITaiLieu => ({
  ...item,
  // Flatten thongTinFile into top-level fields
  duongDanLuuTru: item.thongTinFile?.duongDanLuuTru ?? item.duongDanLuuTru ?? null,
  tenGoc:         item.thongTinFile?.tenGoc         ?? item.tenGoc         ?? null,
  kichThuocBytes: item.thongTinFile?.kichThuocBytes  ?? item.kichThuocBytes  ?? null,
  mimeType:       item.thongTinFile?.mimeType        ?? item.mimeType        ?? null,
  // tags: BE gửi [{id, ten, soLanDung}] → cần string[]
  tags: (item.tags ?? []).map((t: any) =>
    typeof t === 'string' ? t : (t?.ten ?? '')
  ).filter(Boolean),
});

const DEFAULT_SEARCH: ISearchTaiLieuRequest = {
  pageNumber: 1, pageSize: 12,
  keyword: '', trangThai: null, loaiTaiLieu: null, tacGiaId: null,
  linhVucKHCNId: null, donViId: null, tagIds: [],
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ThuVienTaiLieuPage: React.FC = () => {
  const { isReviewer, isAdmin } = useDMSTRole();
  const canApprove = isReviewer || isAdmin;

  // ── State
  const [activeTab, setActiveTab]       = useState('danh-sach');
  const [loading, setLoading]           = useState(false);
  const [items, setItems]               = useState<ITaiLieu[]>([]);
  const [total, setTotal]               = useState(0);
  const [searchReq, setSearchReq]       = useState<ISearchTaiLieuRequest>(DEFAULT_SEARCH);
  const [ranking, setRanking]           = useState<ITaiLieu[]>([]);
  const [rankLoading, setRankLoading]   = useState(false);

  // detail
  const [detail, setDetail]             = useState<ITaiLieu | null>(null);
  const [detailOpen, setDetailOpen]     = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [versions, setVersions]         = useState<any[]>([]);

  // form
  const [formOpen, setFormOpen]         = useState(false);
  const [formMode, setFormMode]         = useState<'create' | 'edit'>('create');
  const [formLoading, setFormLoading]   = useState(false);
  const [form] = Form.useForm();

  // file upload
  const [uploadFile, setUploadFile]     = useState<RcFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]       = useState(false);

  // từ chối
  const [tuChoiOpen, setTuChoiOpen]     = useState(false);
  const [tuChoiId, setTuChoiId]         = useState('');
  const [tuChoiForm] = Form.useForm();

  // ── Load
  const loadItems = useCallback(async (req = searchReq) => {
    setLoading(true);
    try {
      const res = await searchTaiLieus(req);
      setItems(safeList<any>(res).map(normalizeTL));
      setTotal(safeTotal(res));
    } catch { message.error('Không tải được danh sách tài liệu'); }
    finally { setLoading(false); }
  }, [searchReq]);

  const loadRanking = useCallback(async () => {
    setRankLoading(true);
    try {
      const res = await getRankingTaiLieus(1, 10);
      setRanking(safeList<ITaiLieu>(res));
    } catch {}
    finally { setRankLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, []);
  useEffect(() => { if (activeTab === 'ranking') loadRanking(); }, [activeTab]);

  // ── Search helpers
  const onSearch = (kw: string) => {
    const req = { ...searchReq, keyword: kw, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onLoaiChange = (v: any) => {
    const req = { ...searchReq, loaiTaiLieu: v ?? null, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onTrangThaiChange = (v: any) => {
    const req = { ...searchReq, trangThai: v ?? null, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onPageChange = (pg: number) => {
    const req = { ...searchReq, pageNumber: pg };
    setSearchReq(req); loadItems(req);
  };

  // ── Detail
  const openDetail = async (id: string) => {
    setDetailOpen(true); setDetailLoading(true);
    try {
      const res = await getTaiLieu(id);
      setDetail(safeItem<ITaiLieu>(res));
      const vRes = await searchPhienBans({ taiLieuId: id, pageNumber: 1, pageSize: 20, orderBy: ['soPhienBan desc'] });
      setVersions(safeList<any>(vRes));
    } catch { message.error('Không tải được chi tiết tài liệu'); }
    finally { setDetailLoading(false); }
  };

  // ── Form
  const openCreate = () => {
    setFormMode('create'); form.resetFields();
    setUploadFile(null); setUploadProgress(0);
    form.setFieldsValue({ loaiTaiLieu: LoaiTaiLieu.HuongDan });
    setFormOpen(true);
  };
  const openEdit = (item: ITaiLieu) => {
    setFormMode('edit'); form.resetFields();
    setUploadFile(null); setUploadProgress(0);
    form.setFieldsValue({
      ...item,
      tags: item.tags?.join(', '),
    });
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormLoading(true);

      // Upload file nếu có
      let duongDanLuuTru = values.duongDanLuuTru;
      let tenGoc = values.tenGoc;
      let kichThuocBytes = values.kichThuocBytes;
      let mimeType = values.mimeType;

      if (uploadFile) {
        setUploading(true);
        setUploadProgress(0);
        try {
          const uploaded = await uploadTaiLieuFile(uploadFile, (pct) => setUploadProgress(pct));
          if (uploaded) {
            duongDanLuuTru = uploaded.filePath;
            tenGoc = uploaded.originalName ?? uploaded.fileName;
            kichThuocBytes = uploaded.fileSize;
            mimeType = uploadFile.type;
          }
        } catch {
          message.error('Upload file thất bại');
          setUploading(false);
          setFormLoading(false);
          return;
        }
        setUploading(false);
      }

      const tags = (values.tags as string ?? '').split(',').map((t: string) => t.trim()).filter(Boolean);
      const payload = {
        tieuDe: values.tieuDe,
        moTa: values.moTa,
        loaiTaiLieu: values.loaiTaiLieu,
        urlNgoai: values.urlNgoai || null,
        tags,
        duongDanLuuTru: duongDanLuuTru || null,
        tenGoc: tenGoc || null,
        kichThuocBytes: kichThuocBytes || null,
        mimeType: mimeType || null,
      };

      if (formMode === 'create') {
        await createTaiLieu(payload);
        message.success('Tạo tài liệu thành công');
      } else {
        const editId = form.getFieldValue('id');
        await updateTaiLieu(editId, { ...payload, id: editId });
        message.success('Cập nhật thành công');
      }
      setFormOpen(false); loadItems();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error('Có lỗi xảy ra');
    } finally { setFormLoading(false); setUploading(false); }
  };

  // ── Workflow actions
  const handleNop = async (id: string) => {
    try { await nopKiemDuyetTaiLieu(id); message.success('Đã nộp kiểm duyệt'); loadItems(); }
    catch { message.error('Không nộp được'); }
  };
  const handlePheDuyet = async (id: string) => {
    try { await pheDuyetTaiLieu(id); message.success('Đã phê duyệt & xuất bản'); loadItems(); if (detail?.id === id) openDetail(id); }
    catch { message.error('Không phê duyệt được'); }
  };
  const openTuChoi = (id: string) => { setTuChoiId(id); tuChoiForm.resetFields(); setTuChoiOpen(true); };
  const handleTuChoi = async () => {
    try {
      const { lyDo } = await tuChoiForm.validateFields();
      await tuChoiTaiLieu({ id: tuChoiId, lyDo });
      message.success('Đã từ chối tài liệu'); setTuChoiOpen(false);
      loadItems(); if (detail?.id === tuChoiId) openDetail(tuChoiId);
    } catch {}
  };
  const handleDelete = async (id: string) => {
    try { await deleteTaiLieu(id); message.success('Đã xóa'); loadItems(); }
    catch { message.error('Không xóa được'); }
  };

  // ── Download
  const handleDownload = (id: string, tenGocFile?: string) => {
    const url = getTaiLieuDownloadUrl(id);
    const a = document.createElement('a'); a.href = url;
    a.download = tenGocFile ?? 'tai-lieu'; a.click();
  };

  // ── Render card
  const renderCard = (item: ITaiLieu) => (
    <div key={item.id} className="col-md-6 col-xl-4 mb-4">
      <div className="card border-0 shadow-sm h-100"
        style={{ transition: 'box-shadow 0.2s, transform 0.15s', cursor: 'pointer' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
      >
        {/* Top accent bar by status */}
        <div style={{
          height: 4, borderRadius: '8px 8px 0 0',
          background: item.trangThai === TrangThaiTaiLieu.DaXuatBan ? '#52c41a'
            : item.trangThai === TrangThaiTaiLieu.ChoXetDuyet ? '#1677ff'
            : item.trangThai === TrangThaiTaiLieu.TuChoi ? '#ff4d4f'
            : '#d9d9d9',
        }} />
        <div className="card-body d-flex flex-column p-4">
          {/* Header row */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="d-flex align-items-center gap-2">
              {item.duongDanLuuTru || item.tenGoc
                ? <i className={`fa-regular ${getFileIcon(item.mimeType)} fs-3`} />
                : item.urlNgoai
                ? <i className="fa-regular fa-link text-info fs-3" />
                : <i className="fa-regular fa-file-lines text-muted fs-3" />
              }
              <Tag color={LOAI_COLOR[item.loaiTaiLieu]} style={{ margin: 0 }}>
                {LOAI_LABEL[item.loaiTaiLieu]}
              </Tag>
            </div>
            <Badge status={TRANG_THAI_COLOR[item.trangThai] as any} text={TRANG_THAI_LABEL[item.trangThai]} />
          </div>

          {/* Title */}
          <h6 className="fw-bold text-gray-800 mb-2 fs-6"
            style={{ lineHeight: 1.4, cursor: 'pointer' }}
            onClick={() => openDetail(item.id)}>
            {item.tieuDe}
          </h6>

          {/* Description */}
          <p className="text-gray-600 fs-7 flex-grow-1 mb-3"
            style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 54 }}>
            {item.moTa ?? <span className="text-muted fst-italic">Chưa có mô tả</span>}
          </p>

          {/* Tags */}
          <div className="mb-3 d-flex flex-wrap gap-1" style={{ minHeight: 22 }}>
            {(item.tags ?? []).slice(0, 3).map(t => <Tag key={t} color="blue" style={{ fontSize: 11 }}>{t}</Tag>)}
            {(item.tags ?? []).length > 3 && <Tag style={{ fontSize: 11 }}>+{(item.tags ?? []).length - 3}</Tag>}
          </div>

          {/* Footer */}
          <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
            <div className="text-muted fs-8 d-flex gap-3">
              <span><i className="fa-regular fa-eye me-1" />{item.luotXem ?? 0}</span>
              {item.kichThuocBytes && <span><i className="fa-regular fa-file me-1" />{formatBytes(item.kichThuocBytes)}</span>}
            </div>
            <div className="d-flex gap-1">
              <Tooltip title="Xem chi tiết">
                <Button size="small" type="primary" ghost onClick={() => openDetail(item.id)}>
                  <i className="fa-regular fa-eye" />
                </Button>
              </Tooltip>
              {isAdmin && (
                <Tooltip title="Chỉnh sửa">
                  <Button size="small" onClick={() => openEdit(item)}>
                    <i className="fa-regular fa-pen" />
                  </Button>
                </Tooltip>
              )}
              {canApprove && item.trangThai === TrangThaiTaiLieu.ChoXetDuyet && (
                <>
                  <Button size="small" type="primary" onClick={() => handlePheDuyet(item.id)}>Duyệt</Button>
                  <Button size="small" danger onClick={() => openTuChoi(item.id)}>Từ chối</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const totalPages = Math.ceil(total / searchReq.pageSize);

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Thư viện tài liệu</PageTitle>

      <Content>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'danh-sach',
              label: <span><i className="fa-regular fa-folder-open me-2" />Danh sách</span>,
              children: (
                <>
                  {/* Toolbar */}
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
                    <div className="d-flex gap-2 flex-wrap">
                      <Input.Search placeholder="Tìm kiếm tài liệu..." onSearch={onSearch} style={{ width: 240 }} allowClear />
                      <Select placeholder="Loại tài liệu" allowClear onChange={onLoaiChange} style={{ width: 170 }}>
                        {Object.entries(LOAI_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                      </Select>
                      <Select placeholder="Trạng thái" allowClear onChange={onTrangThaiChange} style={{ width: 150 }}>
                        {Object.entries(TRANG_THAI_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                      </Select>
                    </div>
                    {isAdmin && (
                      <Button type="primary" icon={<i className="fa-regular fa-plus me-1" />} onClick={openCreate}>
                        Thêm tài liệu
                      </Button>
                    )}
                  </div>

                  {/* Stats bar */}
                  <div className="d-flex gap-3 mb-4 text-muted fs-8">
                    <span>{total} tài liệu</span>
                    <span>·</span>
                    <span>Trang {searchReq.pageNumber}/{Math.max(1, totalPages)}</span>
                  </div>

                  {/* Grid */}
                  <Spin spinning={loading}>
                    {items.length === 0 && !loading ? (
                      <Empty description="Không có tài liệu phù hợp" className="py-10" />
                    ) : (
                      <div className="row g-0">{items.map(renderCard)}</div>
                    )}
                  </Spin>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-5 gap-2">
                      <Button size="small" disabled={searchReq.pageNumber <= 1} onClick={() => onPageChange(searchReq.pageNumber - 1)}>
                        <i className="fa-regular fa-chevron-left" />
                      </Button>
                      <span className="align-self-center fs-7">Trang {searchReq.pageNumber} / {totalPages}</span>
                      <Button size="small" disabled={searchReq.pageNumber >= totalPages} onClick={() => onPageChange(searchReq.pageNumber + 1)}>
                        <i className="fa-regular fa-chevron-right" />
                      </Button>
                    </div>
                  )}
                </>
              ),
            },
            {
              key: 'ranking',
              label: <span><i className="fa-regular fa-trophy me-2 mx-2" />Xếp hạng</span>,
              children: (
                <Spin spinning={rankLoading}>
                  {ranking.length === 0 && !rankLoading ? (
                    <Empty description="Chưa có dữ liệu xếp hạng" className="py-10" />
                  ) : (
                    <div className="card">
                      <div className="card-body p-0">
                        <table className="table table-row-dashed table-row-gray-300 align-middle mb-0">
                          <thead>
                            <tr className="text-muted fw-semibold fs-7 text-uppercase">
                              <th className="ps-4" style={{ width: 50 }}>#</th>
                              <th>Tài liệu</th>
                              <th>Loại</th>
                              <th>Tác giả</th>
                              <th className="text-end pe-4">Lượt xem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ranking.map((item, idx) => (
                              <tr key={item.id} className="cursor-pointer" onClick={() => openDetail(item.id)}>
                                <td className="ps-4">
                                  {idx === 0 ? <i className="fa-solid fa-trophy text-warning fs-5" />
                                   : idx === 1 ? <i className="fa-solid fa-trophy text-secondary fs-5" />
                                   : idx === 2 ? <i className="fa-solid fa-trophy" style={{ color: '#cd7f32' }} />
                                   : <span className="text-muted fw-semibold">{idx + 1}</span>}
                                </td>
                                <td>
                                  <div className="fw-semibold text-gray-800">{item.tieuDe}</div>
                                  <div className="text-muted fs-8">{(item.tags ?? []).slice(0, 2).join(' · ')}</div>
                                </td>
                                <td><Tag color={LOAI_COLOR[item.loaiTaiLieu]}>{LOAI_LABEL[item.loaiTaiLieu]}</Tag></td>
                                <td className="text-muted fs-7">{item.tacGia?.hoTen ?? '—'}</td>
                                <td className="text-end pe-4">
                                  <span className="badge badge-light-primary fw-bold">
                                    <i className="fa-regular fa-eye me-1" />{item.luotXem ?? 0}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </Spin>
              ),
            },
          ]}
        />
      </Content>

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={detailOpen} onCancel={() => setDetailOpen(false)} width={860}
        title={
          detail && (
            <div className="d-flex align-items-center gap-3">
              <i className={`fa-regular ${getFileIcon(detail.mimeType)} fs-2x`} />
              <div>
                <div className="fw-bold fs-5">{detail.tieuDe}</div>
                <div className="d-flex gap-2 mt-1 align-items-center">
                  <Tag color={LOAI_COLOR[detail.loaiTaiLieu]}>{LOAI_LABEL[detail.loaiTaiLieu]}</Tag>
                  <Badge status={TRANG_THAI_COLOR[detail.trangThai] as any} text={TRANG_THAI_LABEL[detail.trangThai]} />
                </div>
              </div>
            </div>
          )
        }
        footer={[
          detail?.duongDanLuuTru && (
            <Button key="dl" icon={<i className="fa-regular fa-download me-1" />}
              onClick={() => handleDownload(detail.id, detail.tenGoc)}>
              Tải xuống
            </Button>
          ),
          isAdmin && detail && (
            <Button key="edit" onClick={() => { setDetailOpen(false); openEdit(detail); }}>
              <i className="fa-regular fa-pen me-1" />Chỉnh sửa
            </Button>
          ),
          canApprove && detail?.trangThai === TrangThaiTaiLieu.NhapLieu && (
            <Button key="nop" onClick={() => handleNop(detail.id)}>
              <i className="fa-regular fa-paper-plane me-1" />Nộp kiểm duyệt
            </Button>
          ),
          canApprove && detail?.trangThai === TrangThaiTaiLieu.ChoXetDuyet && (
            <Button key="duyet" type="primary" onClick={() => handlePheDuyet(detail.id)}>
              <i className="fa-regular fa-check me-1" />Phê duyệt
            </Button>
          ),
          canApprove && detail?.trangThai === TrangThaiTaiLieu.ChoXetDuyet && (
            <Button key="tuchoi" danger onClick={() => openTuChoi(detail.id)}>Từ chối</Button>
          ),
          <Button key="close" onClick={() => setDetailOpen(false)}>Đóng</Button>,
        ].filter(Boolean)}
      >
        <Spin spinning={detailLoading}>
          {detail && (
            <Tabs
              defaultActiveKey="info"
              items={[
                {
                  key: 'info',
                  label: 'Thông tin',
                  children: (
                    <>
                      {detail.moTa && (
                        <div className="mb-4">
                          <div className="fw-semibold text-gray-700 mb-2">Mô tả</div>
                          <div className="bg-light p-3 rounded text-gray-600 fs-7" style={{ lineHeight: 1.7 }}>{detail.moTa}</div>
                        </div>
                      )}

                      {/* File info block */}
                      {(detail.tenGoc || detail.duongDanLuuTru) && (
                        <div className="mb-4 p-3 rounded border border-dashed border-gray-300 bg-light-primary">
                          <div className="d-flex align-items-center gap-3">
                            <i className={`fa-regular ${getFileIcon(detail.mimeType)} fs-2x`} />
                            <div>
                              <div className="fw-semibold text-gray-800">{detail.tenGoc ?? '—'}</div>
                              <div className="text-muted fs-8">
                                {detail.mimeType && <span className="me-3">{detail.mimeType}</span>}
                                {detail.kichThuocBytes && <span>{formatBytes(detail.kichThuocBytes)}</span>}
                              </div>
                            </div>
                            <div className="ms-auto">
                              <Button size="small" type="primary"
                                icon={<i className="fa-regular fa-download me-1" />}
                                onClick={() => handleDownload(detail.id, detail.tenGoc)}>
                                Tải xuống
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {detail.urlNgoai && (
                        <div className="mb-4 p-3 rounded border border-dashed border-gray-300">
                          <div className="d-flex align-items-center gap-2">
                            <i className="fa-regular fa-link text-info" />
                            <a href={detail.urlNgoai} target="_blank" rel="noopener noreferrer" className="text-truncate">
                              {detail.urlNgoai}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="row g-4 mb-4">
                        <div className="col-6">
                          <div className="text-muted fs-8 mb-1">Tác giả</div>
                          <div className="fw-semibold">{detail.tacGia?.hoTen ?? '—'}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted fs-8 mb-1">Ngày tạo</div>
                          <div className="fw-semibold">{detail.createdOn ? new Date(detail.createdOn).toLocaleDateString('vi-VN') : '—'}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted fs-8 mb-1">Lượt xem</div>
                          <div className="fw-semibold">{detail.luotXem ?? 0}</div>
                        </div>
                        {detail.nguoiDuyet && (
                          <div className="col-6">
                            <div className="text-muted fs-8 mb-1">Người duyệt</div>
                            <div className="fw-semibold">{detail.nguoiDuyet?.hoTen ?? '—'}</div>
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <div className="text-muted fs-8 mb-1">Tags</div>
                        <div>{(detail.tags ?? []).map(t => <Tag key={t} color="blue">{t}</Tag>)}</div>
                      </div>
                    </>
                  ),
                },
                {
                  key: 'versions',
                  label: <span>Phiên bản <span className="badge badge-light-primary ms-1">{versions.length}</span></span>,
                  children: (
                    versions.length === 0 ? <Empty description="Chưa có phiên bản" className="py-6" /> : (
                      <table className="table table-sm table-row-dashed align-middle mb-0">
                        <thead>
                          <tr className="text-muted fw-semibold fs-8">
                            <th>Phiên bản</th><th>Tên file</th><th>Kích thước</th><th>Ghi chú</th><th>Ngày tạo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {versions.map((v: any) => (
                            <tr key={v.id}>
                              <td><Tag color="blue">v{v.soPhienBan}</Tag></td>
                              <td className="fs-7">
                                <i className={`fa-regular ${getFileIcon(v.mimeType)} me-1`} />
                                {v.tenGoc ?? '—'}
                              </td>
                              <td className="text-muted fs-8">{formatBytes(v.kichThuocBytes)}</td>
                              <td className="text-muted fs-7">{v.ghiChu ?? '—'}</td>
                              <td className="text-muted fs-8">{v.createdOn ? new Date(v.createdOn).toLocaleDateString('vi-VN') : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  ),
                },
              ]}
            />
          )}
        </Spin>
      </Modal>

      {/* ── Create / Edit Form Modal ────────────────────────────────────────── */}
      <Modal
        open={formOpen} onCancel={() => setFormOpen(false)}
        title={
          <span>
            <i className={`fa-regular ${formMode === 'create' ? 'fa-plus-circle' : 'fa-pen'} me-2 text-primary`} />
            {formMode === 'create' ? 'Thêm tài liệu mới' : 'Chỉnh sửa tài liệu'}
          </span>
        }
        onOk={handleFormSubmit}
        okText={formMode === 'create' ? 'Tạo tài liệu' : 'Lưu thay đổi'}
        confirmLoading={formLoading || uploading}
        width={680}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item name="duongDanLuuTru" hidden><Input /></Form.Item>
          <Form.Item name="tenGoc" hidden><Input /></Form.Item>
          <Form.Item name="kichThuocBytes" hidden><Input /></Form.Item>
          <Form.Item name="mimeType" hidden><Input /></Form.Item>

          <Form.Item name="tieuDe" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
            <Input placeholder="Tiêu đề tài liệu" size="large" />
          </Form.Item>

          <div className="row">
            <div className="col-6">
              <Form.Item name="loaiTaiLieu" label="Loại tài liệu" rules={[{ required: true }]}>
                <Select size="large">
                  {Object.entries(LOAI_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                </Select>
              </Form.Item>
            </div>
            <div className="col-6">
              <Form.Item name="tags" label="Tags (cách nhau bởi dấu phẩy)">
                <Input placeholder="doi-moi, sang-tao, quy-trinh" />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả nội dung tài liệu..." />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 13, color: '#888' }}>Tệp đính kèm</Divider>

          {/* File upload */}
          <div className="mb-4">
            <Upload.Dragger
              beforeUpload={(file) => {
                setUploadFile(file);
                return false; // prevent auto-upload
              }}
              onRemove={() => { setUploadFile(null); setUploadProgress(0); }}
              maxCount={1}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              fileList={uploadFile ? [{
                uid: '-1',
                name: uploadFile.name,
                status: uploading ? 'uploading' : 'done',
                percent: uploadProgress,
                size: uploadFile.size,
                type: uploadFile.type,
              } as UploadFile] : []}
            >
              <p className="ant-upload-drag-icon">
                <i className="fa-regular fa-cloud-upload-alt fs-1 text-primary" />
              </p>
              <p className="ant-upload-text">Kéo thả hoặc click để chọn file</p>
              <p className="ant-upload-hint text-muted fs-8">
                Hỗ trợ PDF, Word, Excel, PowerPoint, TXT, ZIP · Tối đa 50MB
              </p>
            </Upload.Dragger>
            {uploading && (
              <div className="mt-2">
                <Progress percent={uploadProgress} size="small" status="active" />
                <div className="text-muted fs-8 text-center mt-1">Đang upload...</div>
              </div>
            )}
            {/* Show existing file in edit mode */}
            {formMode === 'edit' && !uploadFile && form.getFieldValue('tenGoc') && (
              <div className="mt-2 p-2 border rounded d-flex align-items-center gap-2 bg-light">
                <i className={`fa-regular ${getFileIcon(form.getFieldValue('mimeType'))} text-primary`} />
                <span className="fs-7 flex-grow-1">{form.getFieldValue('tenGoc')}</span>
                <span className="text-muted fs-8">{formatBytes(form.getFieldValue('kichThuocBytes'))}</span>
                <Tag color="green" style={{ fontSize: 11 }}>File hiện tại</Tag>
              </div>
            )}
          </div>

          <Form.Item name="urlNgoai" label="Liên kết ngoài (tuỳ chọn)">
            <Input placeholder="https://..." prefix={<i className="fa-regular fa-link text-muted" />} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Từ chối Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={tuChoiOpen} onCancel={() => setTuChoiOpen(false)}
        title="Từ chối tài liệu" onOk={handleTuChoi} okText="Xác nhận từ chối" okButtonProps={{ danger: true }}
      >
        <Form form={tuChoiForm} layout="vertical">
          <Form.Item name="lyDo" label="Lý do từ chối" rules={[{ required: true, message: 'Nhập lý do' }]}>
            <TextArea rows={3} placeholder="Vui lòng nêu rõ lý do từ chối..." maxLength={1024} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
