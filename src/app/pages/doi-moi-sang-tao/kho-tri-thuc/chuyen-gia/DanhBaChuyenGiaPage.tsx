import React, { useState, useEffect, useCallback } from 'react';
import {
  Input, Button, Tag, Modal, Form, Spin, Empty, Rate,
  Avatar, Tabs, message, Tooltip, Divider, Card, Switch, Popconfirm, Select,
} from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import {
  searchChuyenGias,
  getChuyenGia,
  getTaiLieuChuyenGia,
  searchTuVans,
  createTuVan,
  xacNhanTuVan,
  tuChoiTuVan,
  hoanTatTuVan,
  searchNhanXets,
  createNhanXet,
  deleteNhanXet,
  createChuyenGia,
  updateChuyenGia,
  deleteChuyenGia,
} from '@/app/services/khoTriThucApi';
import type {
  IChuyenGia,
  ITaiLieu,
  INhanXetChuyenGia,
  IYeuCauTuVan,
  ISearchChuyenGiaRequest,
  ICreateChuyenGiaRequest,
} from '@/app/models/knowledge-hub';
import { TrangThaiTuVan, LoaiTaiLieu } from '@/app/models/knowledge-hub';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

const { TextArea } = Input;

const TU_VAN_LABEL: Record<TrangThaiTuVan, string> = {
  [TrangThaiTuVan.ChoXacNhan]: 'Chờ xác nhận',
  [TrangThaiTuVan.DaXacNhan]:  'Đã xác nhận',
  [TrangThaiTuVan.HoanTat]:    'Hoàn tất',
  [TrangThaiTuVan.DaHuy]:      'Đã hủy',
};
const TU_VAN_COLOR: Record<TrangThaiTuVan, string> = {
  [TrangThaiTuVan.ChoXacNhan]: 'processing',
  [TrangThaiTuVan.DaXacNhan]:  'warning',
  [TrangThaiTuVan.HoanTat]:    'success',
  [TrangThaiTuVan.DaHuy]:      'default',
};

const LOAI_TL_LABEL: Record<LoaiTaiLieu, string> = {
  [LoaiTaiLieu.HuongDan]: 'Hướng dẫn', [LoaiTaiLieu.Playbook]: 'Playbook',
  [LoaiTaiLieu.Template]: 'Mẫu biểu', [LoaiTaiLieu.NghienCuu]: 'Nghiên cứu',
  [LoaiTaiLieu.TinhHuong]: 'Tình huống', [LoaiTaiLieu.BaiHocKinhNghiem]: 'Bài học KN',
};

const AVATAR_COLORS = ['#1677ff','#52c41a','#fa8c16','#722ed1','#eb2f96','#13c2c2'];
const getAvatarColor = (name: string) => AVATAR_COLORS[(name ?? '').charCodeAt(0) % AVATAR_COLORS.length];
const getAvatarChar  = (name: string) => name?.charAt(0)?.toUpperCase() ?? '?';

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

// ── LĨNH VỰC options (có thể mở rộng)
const LINH_VUC_OPTIONS = [
  'Công nghệ thông tin', 'Tài chính', 'Vận hành khai thác', 'An toàn hàng không',
  'Thương mại', 'Nhân sự', 'Pháp lý', 'Kỹ thuật', 'Khác',
];

export const DanhBaChuyenGiaPage: React.FC = () => {
  const { isReviewer, isAdmin } = useDMSTRole();

  // ── List
  const [loading, setLoading]     = useState(false);
  const [experts, setExperts]     = useState<IChuyenGia[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [keyword, setKeyword]     = useState('');

  // ── Profile modal
  const [profile, setProfile]     = useState<IChuyenGia | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profLoading, setProfLoading] = useState(false);
  const [profDocs, setProfDocs]   = useState<ITaiLieu[]>([]);
  const [profReviews, setProfReviews] = useState<INhanXetChuyenGia[]>([]);
  const [tuVans, setTuVans]       = useState<IYeuCauTuVan[]>([]);

  // ── CRUD form (Admin)
  const [crudOpen, setCrudOpen]       = useState(false);
  const [crudMode, setCrudMode]       = useState<'create' | 'edit'>('create');
  const [crudLoading, setCrudLoading] = useState(false);
  const [crudForm] = Form.useForm();

  // ── Tư vấn form
  const [tuVanOpen, setTuVanOpen] = useState(false);
  const [tuVanTarget, setTuVanTarget] = useState<IChuyenGia | null>(null);
  const [tuVanLoading, setTuVanLoading] = useState(false);
  const [tuVanForm] = Form.useForm();

  // ── Nhận xét form
  const [nxOpen, setNxOpen]       = useState(false);
  const [nxLoading, setNxLoading] = useState(false);
  const [nxForm] = Form.useForm();

  // ── Từ chối tư vấn (modal nhập lý do)
  const [tuChoiModalOpen, setTuChoiModalOpen] = useState(false);
  const [tuChoiTargetId, setTuChoiTargetId]   = useState<string | null>(null);
  const [tuChoiLoading, setTuChoiLoading]     = useState(false);
  const [tuChoiForm] = Form.useForm();

  // ── Load list
  const load = useCallback(async (kw = keyword, pg = page) => {
    setLoading(true);
    try {
      const req: ISearchChuyenGiaRequest = { pageNumber: pg, pageSize: 12, keyword: kw };
      const res = await searchChuyenGias(req);
      setExperts(safeList<IChuyenGia>(res));
      setTotal(safeTotal(res));
    } catch (err) {
      console.error('[DanhBaChuyenGia] search error:', err);
      message.error('Không tải được danh sách chuyên gia');
    }
    finally { setLoading(false); }
  }, [keyword, page]);

  useEffect(() => { load(); }, []);

  const onSearch = (kw: string) => { setKeyword(kw); setPage(1); load(kw, 1); };

  // ── Open profile
  const openProfile = async (id: string) => {
    setProfileOpen(true); setProfLoading(true);
    try {
      // getChuyenGia: BE returns Result<ChuyenGiaDto> → res.data = { data: ChuyenGiaDto, succeeded }
      const cgRes = await getChuyenGia(id);
      setProfile(safeItem<IChuyenGia>(cgRes));

      const [tl, nx, tv] = await Promise.all([
        getTaiLieuChuyenGia(id, 1, 10),
        searchNhanXets({ chuyenGiaId: id, pageNumber: 1, pageSize: 20 }),
        searchTuVans({ chuyenGiaId: id, pageNumber: 1, pageSize: 20 }),
      ]);
      setProfDocs(safeList<ITaiLieu>(tl));
      setProfReviews(safeList<INhanXetChuyenGia>(nx));
      setTuVans(safeList<IYeuCauTuVan>(tv));
    } catch { message.error('Không tải được hồ sơ chuyên gia'); }
    finally { setProfLoading(false); }
  };

  // ── CRUD handlers (Admin)
  const openCreate = () => {
    setCrudMode('create');
    crudForm.resetFields();
    crudForm.setFieldsValue({ laChuyenGiaNgoai: false });
    setCrudOpen(true);
  };

  const openEdit = (cg: IChuyenGia) => {
    setCrudMode('edit');
    crudForm.setFieldsValue({
      _id:              cg.id,
      maSoVienChuc:     cg.maSoVienChuc ?? '',
      hoTen:            cg.hoTen,
      email:            cg.email ?? '',
      donViCongTac:     cg.donViCongTac ?? '',
      chucVu:           cg.chucVu ?? '',
      linhVuc:          cg.linhVuc ?? '',
      chuyenNganh:      cg.chuyenNganh ?? '',
      chuyenMon:        cg.chuyenMon ?? '',
      huongNghienCuu:   cg.huongNghienCuu ?? '',
      laChuyenGiaNgoai: cg.laChuyenGiaNgoai ?? false,
    });
    setCrudOpen(true);
  };

  const submitCrud = async () => {
    try {
      const values = await crudForm.validateFields();
      setCrudLoading(true);
      const { _id, ...payload } = values as ICreateChuyenGiaRequest & { _id?: string };

      if (crudMode === 'create') {
        await createChuyenGia(payload);
        message.success('Đã tạo hồ sơ chuyên gia');
      } else {
        await updateChuyenGia(_id!, { ...payload, id: _id! });
        message.success('Đã cập nhật hồ sơ chuyên gia');
        // Refresh profile modal if open
        if (profile?.id === _id) openProfile(_id!);
      }
      setCrudOpen(false);
      load();
    } catch (e: any) {
      if (!e?.errorFields) message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally { setCrudLoading(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteChuyenGia(id);
      message.success('Đã xóa hồ sơ chuyên gia');
      if (profile?.id === id) setProfileOpen(false);
      load();
    } catch { message.error('Không xóa được'); }
  };

  // ── Tư vấn
  const submitTuVan = async () => {
    try {
      const { noiDung } = await tuVanForm.validateFields();
      setTuVanLoading(true);
      await createTuVan({ chuyenGiaId: tuVanTarget!.id, noiDung });
      message.success('Đã gửi yêu cầu tư vấn');
      setTuVanOpen(false);
      if (profile?.id === tuVanTarget?.id) openProfile(profile!.id);
    } catch (e: any) { if (!e?.errorFields) message.error('Không gửi được yêu cầu'); }
    finally { setTuVanLoading(false); }
  };

  const handleXacNhan = async (id: string) => {
    try { await xacNhanTuVan(id); message.success('Đã xác nhận'); openProfile(profile!.id); }
    catch { message.error('Lỗi'); }
  };
  const handleTuChoiTV = (id: string) => {
    setTuChoiTargetId(id);
    tuChoiForm.resetFields();
    setTuChoiModalOpen(true);
  };
  const submitTuChoi = async () => {
    try {
      const { lyDo } = await tuChoiForm.validateFields();
      setTuChoiLoading(true);
      await tuChoiTuVan({ id: tuChoiTargetId!, lyDo });
      message.success('Đã từ chối yêu cầu tư vấn');
      setTuChoiModalOpen(false);
      openProfile(profile!.id);
    } catch (e: any) {
      if (!e?.errorFields) message.error('Lỗi khi từ chối');
    } finally {
      setTuChoiLoading(false);
    }
  };
  const handleHoanTat = async (id: string) => {
    try { await hoanTatTuVan(id); message.success('Đã hoàn tất'); openProfile(profile!.id); }
    catch { message.error('Lỗi'); }
  };

  // ── Nhận xét
  const submitNhanXet = async () => {
    try {
      const { noiDung, diemDanhGia } = await nxForm.validateFields();
      setNxLoading(true);
      await createNhanXet({ chuyenGiaId: profile!.id, noiDung, diemDanhGia });
      message.success('Đã gửi nhận xét');
      setNxOpen(false);
      openProfile(profile!.id);
    } catch (e: any) { if (!e?.errorFields) message.error('Không gửi được nhận xét'); }
    finally { setNxLoading(false); }
  };
  const handleDeleteNx = async (id: string) => {
    try { await deleteNhanXet(id); message.success('Đã xóa nhận xét'); openProfile(profile!.id); }
    catch { message.error('Lỗi'); }
  };

  const totalPages = Math.ceil(total / 12);

  // ── Render expert card
  const renderCard = (cg: IChuyenGia) => (
    <div key={cg.id} className="col-md-6 col-xl-4 mb-4">
      <div className="card border-0 shadow-sm h-100" style={{ transition: 'box-shadow 0.2s, transform 0.15s' }}>
        <div className="card-body">
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            {(cg as any).hinhDaiDien ? (
              <img src={(cg as any).hinhDaiDien} alt={cg.hoTen} className="rounded-circle"
                style={{ width: 56, height: 56, objectFit: 'cover' }} />
            ) : (
              <Avatar size={56} style={{ backgroundColor: getAvatarColor(cg.hoTen), fontSize: 22, flexShrink: 0 }}>
                {getAvatarChar(cg.hoTen)}
              </Avatar>
            )}
            <div className="ms-3 min-w-0">
              <div className="fw-bold text-gray-800 fs-6">{cg.hoTen}</div>
              {cg.laChuyenGiaNgoai && <Tag color="orange" style={{ fontSize: 11 }}>Chuyên gia ngoài</Tag>}
              {cg.email && <div className="text-muted fs-8 text-truncate">{cg.email}</div>}
            </div>
          </div>

          {/* Chuyên môn & lĩnh vực */}
          {cg.donViCongTac && (
            <div className="text-gray-700 fs-7 mb-1 d-flex align-items-center gap-1 text-truncate">
              <i className="fa-regular fa-building text-primary flex-shrink-0" />{cg.donViCongTac}
            </div>
          )}
          {cg.chuyenMon && (
            <div className="text-gray-700 fs-7 mb-1 d-flex align-items-center gap-1">
              <i className="fa-regular fa-graduation-cap text-primary" />{cg.chuyenMon}
            </div>
          )}
          {cg.linhVuc && (
            <div className="text-muted fs-7 mb-3 d-flex align-items-center gap-1">
              <i className="fa-regular fa-tag" />{cg.linhVuc}
            </div>
          )}

          <Divider className="my-3" />

          {/* Stats */}
          <div className="d-flex justify-content-between mb-4">
            <div className="text-center">
              <div className="fw-bold text-primary fs-5">{cg.soTaiLieu ?? 0}</div>
              <div className="text-muted fs-8">Tài liệu</div>
            </div>
            <div className="text-center">
              <div className="fw-bold text-warning fs-5">{cg.diemDanhGia?.toFixed(1) ?? '—'}</div>
              <div className="text-muted fs-8">Đánh giá</div>
            </div>
            <div className="text-center">
              <div className="fw-bold text-success fs-5">{cg.soNhanXet ?? 0}</div>
              <div className="text-muted fs-8">Nhận xét</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex gap-2">
            <Button type="primary" ghost size="small" className="flex-grow-1"
              onClick={() => openProfile(cg.id)}>
              <i className="fa-regular fa-user me-1" />Xem hồ sơ
            </Button>
            {isAdmin && (
              <>
                <Tooltip title="Chỉnh sửa hồ sơ">
                  <Button size="small" icon={<i className="fa-regular fa-pen-to-square" />}
                    onClick={() => openEdit(cg)} />
                </Tooltip>
                <Tooltip title="Xóa chuyên gia">
                  <Popconfirm
                    title="Xóa chuyên gia này?"
                    description="Thao tác không thể hoàn tác. Xác nhận tiếp tục?"
                    onConfirm={() => handleDelete(cg.id)}
                    okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
                  >
                    <Button size="small" danger icon={<i className="fa-regular fa-trash-can" />} />
                  </Popconfirm>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Danh bạ chuyên gia</PageTitle>

      <Content>
        {/* Toolbar */}
        <div className="d-flex justify-content-between align-items-center mb-5 gap-3 flex-wrap">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <Input.Search placeholder="Tìm theo tên, chuyên môn, lĩnh vực..."
              onSearch={onSearch} style={{ width: 320 }} allowClear enterButton />
            <span className="text-muted fs-7 align-self-center">
              Tổng: <b>{total}</b> chuyên gia
            </span>
          </div>
          {isAdmin && (
            <Button type="primary" icon={<i className="fa-regular fa-plus me-1" />}
              onClick={openCreate}>
              Thêm chuyên gia
            </Button>
          )}
        </div>

        {/* Grid */}
        <Spin spinning={loading}>
          {experts.length === 0 && !loading
            ? <Empty description="Không tìm thấy chuyên gia phù hợp" className="py-10" />
            : <div className="row g-0">{experts.map(renderCard)}</div>
          }
        </Spin>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5 gap-2">
            <Button size="small" disabled={page <= 1}
              onClick={() => { setPage(p => p - 1); load(keyword, page - 1); }}>
              <i className="fa-regular fa-chevron-left" />
            </Button>
            <span className="align-self-center fs-7">Trang {page} / {totalPages}</span>
            <Button size="small" disabled={page >= totalPages}
              onClick={() => { setPage(p => p + 1); load(keyword, page + 1); }}>
              <i className="fa-regular fa-chevron-right" />
            </Button>
          </div>
        )}
      </Content>

      {/* ── Profile Modal ──────────────────────────────────────────────────────── */}
      <Modal open={profileOpen} onCancel={() => setProfileOpen(false)} width={800} footer={null}
        title={profile && (
          <div className="d-flex align-items-center justify-content-between pe-8">
            <div className="d-flex align-items-center gap-3">
              {(profile as any).hinhDaiDien ? (
                <img src={(profile as any).hinhDaiDien} alt={profile.hoTen} className="rounded-circle"
                  style={{ width: 48, height: 48, objectFit: 'cover' }} />
              ) : (
                <Avatar size={48} style={{ backgroundColor: getAvatarColor(profile.hoTen ?? ''), fontSize: 20 }}>
                  {getAvatarChar(profile.hoTen)}
                </Avatar>
              )}
              <div>
                <div className="fw-bold fs-5">{profile.hoTen}</div>
                <div className="text-muted fs-7">{profile.email ?? ''}</div>
              </div>
            </div>
            {isAdmin && (
              <div className="d-flex gap-2">
                <Button size="small" icon={<i className="fa-regular fa-pen-to-square me-1" />}
                  onClick={() => openEdit(profile)}>
                  Chỉnh sửa
                </Button>
                <Popconfirm title="Xóa chuyên gia này?" onConfirm={() => handleDelete(profile.id)}
                  okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                  <Button size="small" danger icon={<i className="fa-regular fa-trash-can" />} />
                </Popconfirm>
              </div>
            )}
          </div>
        )}
      >
        <Spin spinning={profLoading}>
          {profile && (
            <Tabs
              defaultActiveKey="profile"
              items={[
                {
                  key: 'profile',
                  label: <span><i className="fa-regular fa-user me-1" />Hồ sơ</span>,
                  children: (
                    <>
                      {profile.huongNghienCuu && (
                        <div className="bg-light rounded p-3 mb-4 text-gray-600 fs-7">{profile.huongNghienCuu}</div>
                      )}
                      <div className="row mb-4">
                        <div className="col-6">
                          <div className="text-muted fs-8 mb-1">Đơn vị công tác</div>
                          <div className="fw-semibold">{profile.donViCongTac ?? '—'}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-muted fs-8 mb-1">Chức vụ</div>
                          <div className="fw-semibold">{profile.chucVu ?? '—'}</div>
                        </div>
                        <div className="col-6 mt-3">
                          <div className="text-muted fs-8 mb-1">Chuyên môn</div>
                          <div className="fw-semibold">{profile.chuyenMon ?? '—'}</div>
                        </div>
                        <div className="col-6 mt-3">
                          <div className="text-muted fs-8 mb-1">Lĩnh vực</div>
                          <div className="fw-semibold">{profile.linhVuc ?? '—'}</div>
                        </div>
                        <div className="col-6 mt-3">
                          <div className="text-muted fs-8 mb-1">Chuyên ngành</div>
                          <div className="fw-semibold">{profile.chuyenNganh ?? '—'}</div>
                        </div>
                        <div className="col-6 mt-3">
                          <div className="text-muted fs-8 mb-1">Loại chuyên gia</div>
                          <Tag color={profile.laChuyenGiaNgoai ? 'orange' : 'blue'}>
                            {profile.laChuyenGiaNgoai ? 'Chuyên gia ngoài' : 'Chuyên gia nội bộ'}
                          </Tag>
                        </div>
                        {(profile.hocViTen || profile.hocHamTen) && (
                          <div className="col-12 mt-3">
                            <div className="text-muted fs-8 mb-1">Học vị / Học hàm</div>
                            <div className="fw-semibold">
                              {[profile.hocViTen, profile.hocHamTen].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <Button type="primary" icon={<i className="fa-regular fa-comments me-1" />}
                          onClick={() => { setTuVanTarget(profile); tuVanForm.resetFields(); setTuVanOpen(true); }}>
                          Gửi yêu cầu tư vấn
                        </Button>
                        <Button icon={<i className="fa-regular fa-star me-1" />}
                          onClick={() => { nxForm.resetFields(); setNxOpen(true); }}>
                          Viết nhận xét
                        </Button>
                      </div>
                    </>
                  ),
                },
                {
                  key: 'docs',
                  label: <span><i className="fa-regular fa-folder-open me-1" />Tài liệu ({profDocs.length})</span>,
                  children: (
                    profDocs.length === 0 ? <Empty description="Chuyên gia chưa có tài liệu nào" /> : (
                      <div className="row g-3">
                        {profDocs.map(doc => (
                          <div key={doc.id} className="col-6">
                            <Card size="small" className="h-100">
                              <Tag color="blue" style={{ fontSize: 11 }}>{LOAI_TL_LABEL[doc.loaiTaiLieu]}</Tag>
                              <div className="fw-semibold fs-7 mt-1">{doc.tieuDe}</div>
                              <div className="text-muted fs-8 mt-1">
                                <i className="fa-regular fa-eye me-1" />{doc.luotXem ?? 0} lượt xem
                              </div>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )
                  ),
                },
                {
                  key: 'reviews',
                  label: <span><i className="fa-regular fa-star me-1" />Nhận xét ({profReviews.length})</span>,
                  children: (
                    profReviews.length === 0
                      ? <Empty description="Chưa có nhận xét nào" />
                      : (
                        <div className="d-flex flex-column gap-3">
                          {profReviews.map(nx => (
                            <div key={nx.id} className="border rounded p-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <Rate disabled value={nx.diemDanhGia} />
                                  <div className="fw-semibold fs-7 mt-1">{nx.nguoiNhanXet?.hoTen ?? 'Ẩn danh'}</div>
                                </div>
                                <div className="d-flex gap-2 align-items-center">
                                  <span className="text-muted fs-8">
                                    {nx.createdOn ? new Date(nx.createdOn).toLocaleDateString('vi-VN') : ''}
                                  </span>
                                  {isAdmin && (
                                    <Button size="small" danger type="text" icon={<i className="fa-regular fa-trash" />}
                                      onClick={() => handleDeleteNx(nx.id)} />
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 fs-7 mb-0 mt-2">{nx.noiDung}</p>
                            </div>
                          ))}
                        </div>
                      )
                  ),
                },
                {
                  key: 'tuvan',
                  label: <span><i className="fa-regular fa-comments me-1" />Tư vấn ({tuVans.length})</span>,
                  children: (
                    tuVans.length === 0 ? <Empty description="Chưa có yêu cầu tư vấn nào" /> : (
                      <div className="d-flex flex-column gap-3">
                        {tuVans.map(tv => (
                          <div key={tv.id} className="border rounded p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <Tag color={TU_VAN_COLOR[tv.trangThai] as any}>{TU_VAN_LABEL[tv.trangThai]}</Tag>
                              <span className="text-muted fs-8">
                                {tv.createdOn ? new Date(tv.createdOn).toLocaleDateString('vi-VN') : ''}
                              </span>
                            </div>
                            <p className="text-gray-600 fs-7 mb-2">{tv.noiDung}</p>
                            {tv.trangThai === TrangThaiTuVan.ChoXacNhan && isReviewer && (
                              <div className="d-flex gap-2">
                                <Button size="small" type="primary" onClick={() => handleXacNhan(tv.id)}>Xác nhận</Button>
                                <Button size="small" danger onClick={() => handleTuChoiTV(tv.id)}>Từ chối</Button>
                              </div>
                            )}
                            {tv.trangThai === TrangThaiTuVan.DaXacNhan && (
                              <Button size="small" onClick={() => handleHoanTat(tv.id)}>Đánh dấu hoàn tất</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  ),
                },
              ]}
            />
          )}
        </Spin>
      </Modal>

      {/* ── CRUD Form Modal (Admin) ────────────────────────────────────────────── */}
      <Modal
        open={crudOpen}
        onCancel={() => setCrudOpen(false)}
        title={
          <span>
            <i className={`fa-regular ${crudMode === 'create' ? 'fa-user-plus' : 'fa-pen-to-square'} me-2`} />
            {crudMode === 'create' ? 'Thêm chuyên gia mới' : 'Chỉnh sửa hồ sơ chuyên gia'}
          </span>
        }
        onOk={submitCrud}
        okText={crudMode === 'create' ? 'Tạo hồ sơ' : 'Lưu thay đổi'}
        cancelText="Hủy"
        confirmLoading={crudLoading}
        width={600}
      >
        <Form form={crudForm} layout="vertical" className="mt-4">
          <Form.Item name="_id" hidden><Input /></Form.Item>

          <div className="row">
            <div className="col-8">
              <Form.Item name="hoTen" label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </div>
            <div className="col-4">
              <Form.Item name="laChuyenGiaNgoai" label="Loại" valuePropName="checked">
                <Switch checkedChildren="Ngoài" unCheckedChildren="Nội bộ" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-6">
              <Form.Item name="maSoVienChuc" label="Mã số viên chức">
                <Input placeholder="MSV001" />
              </Form.Item>
            </div>
            <div className="col-6">
              <Form.Item name="email" label="Email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                <Input placeholder="example@vna.com.vn" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-6">
              <Form.Item name="donViCongTac" label="Đơn vị công tác">
                <Input placeholder="Ban Kỹ thuật, Xí nghiệp A320..." />
              </Form.Item>
            </div>
            <div className="col-6">
              <Form.Item name="chucVu" label="Chức vụ">
                <Input placeholder="Trưởng ban, Kỹ sư trưởng..." />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-6">
              <Form.Item name="linhVuc" label="Lĩnh vực">
                <Select placeholder="Chọn lĩnh vực" allowClear showSearch>
                  {LINH_VUC_OPTIONS.map(v => (
                    <Select.Option key={v} value={v}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div className="col-6">
              <Form.Item name="chuyenNganh" label="Chuyên ngành">
                <Input placeholder="Kỹ thuật hàng không, CNTT..." />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="chuyenMon" label="Chuyên môn / Học vị">
            <Input placeholder="TS. Quản trị kinh doanh, Kỹ sư hàng không..." />
          </Form.Item>

          <Form.Item name="huongNghienCuu" label="Hướng nghiên cứu / Mô tả">
            <TextArea rows={3} placeholder="Hướng nghiên cứu chính, kinh nghiệm nổi bật..." maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Tư vấn Modal ──────────────────────────────────────────────────────── */}
      <Modal open={tuVanOpen} onCancel={() => setTuVanOpen(false)}
        title={`Gửi yêu cầu tư vấn — ${tuVanTarget?.hoTen ?? ''}`}
        onOk={submitTuVan} okText="Gửi yêu cầu" confirmLoading={tuVanLoading}>
        <Form form={tuVanForm} layout="vertical">
          <Form.Item name="noiDung" label="Nội dung yêu cầu"
            rules={[{ required: true, message: 'Nhập nội dung yêu cầu' }]}>
            <TextArea rows={5} placeholder="Mô tả vấn đề cần tư vấn..." maxLength={4000} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Nhận xét Modal ────────────────────────────────────────────────────── */}
      <Modal open={nxOpen} onCancel={() => setNxOpen(false)}
        title={`Viết nhận xét — ${profile?.hoTen ?? ''}`}
        onOk={submitNhanXet} okText="Gửi nhận xét" confirmLoading={nxLoading}>
        <Form form={nxForm} layout="vertical" initialValues={{ diemDanhGia: 5 }}>
          <Form.Item name="diemDanhGia" label="Điểm đánh giá" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="noiDung" label="Nhận xét"
            rules={[{ required: true, message: 'Nhập nội dung nhận xét' }]}>
            <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn..." maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Từ chối tư vấn Modal ──────────────────────────────────────────────── */}
      <Modal
        open={tuChoiModalOpen}
        onCancel={() => setTuChoiModalOpen(false)}
        title={<span><i className="fa-regular fa-circle-xmark me-2 text-danger" />Từ chối yêu cầu tư vấn</span>}
        onOk={submitTuChoi}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        confirmLoading={tuChoiLoading}
        okButtonProps={{ danger: true }}
        width={480}
      >
        <Form form={tuChoiForm} layout="vertical" className="mt-4">
          <Form.Item
            name="lyDo"
            label="Lý do từ chối"
            rules={[
              { required: true, message: 'Vui lòng nhập lý do từ chối' },
              { max: 1024, message: 'Tối đa 1024 ký tự' },
            ]}
          >
            <TextArea rows={4} placeholder="Nhập lý do từ chối..." maxLength={1024} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
