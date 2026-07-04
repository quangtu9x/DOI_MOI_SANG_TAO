import React, { useState, useEffect, useCallback } from 'react';
import {
  Input, Button, Tag, Modal, Form, Spin, Empty,
  Avatar, Divider, message, Tooltip, Badge, Popconfirm,
} from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import {
  searchCongDongs, getCongDong, createCongDong, updateCongDong, deleteCongDong,
  thamGiaCongDong, roiCongDong,
  searchBaiViets, getBaiViet, createBaiViet, updateBaiViet, deleteBaiViet,
  searchBinhLuans, createBinhLuan, updateBinhLuan, deleteBinhLuan,
  toggleThich,
} from '@/app/services/khoTriThucApi';
import type {
  ICongDong, IBaiViet, IBinhLuan,
  ISearchCongDongRequest,
} from '@/app/models/knowledge-hub';
import { LoaiBaiViet, LoaiDoiTuong } from '@/app/models/knowledge-hub';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

const { TextArea } = Input;

const LOAI_BV_LABEL: Record<LoaiBaiViet, string> = {
  [LoaiBaiViet.ThaoCuan]: 'Thảo luận',
  [LoaiBaiViet.HoiDap]:   'Hỏi đáp',
  [LoaiBaiViet.ChiaSe]:   'Chia sẻ',
};
const LOAI_BV_COLOR: Record<LoaiBaiViet, string> = {
  [LoaiBaiViet.ThaoCuan]: 'blue',
  [LoaiBaiViet.HoiDap]:   'orange',
  [LoaiBaiViet.ChiaSe]:   'green',
};
const LOAI_BV_BG: Record<LoaiBaiViet, string> = {
  [LoaiBaiViet.ThaoCuan]: '#e6f4ff',
  [LoaiBaiViet.HoiDap]:   '#fff7e6',
  [LoaiBaiViet.ChiaSe]:   '#f6ffed',
};

const AVATAR_COLORS = ['#1677ff','#52c41a','#fa8c16','#eb2f96','#722ed1','#13c2c2'];
const getAvatarColor = (name: string) => AVATAR_COLORS[(name ?? '').charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name?: string) => name?.charAt(0)?.toUpperCase() ?? '?';

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

export const CongDongPage: React.FC = () => {
  const { isAdmin } = useDMSTRole();

  // ── Communities list
  const [loading, setLoading]         = useState(false);
  const [communities, setCommunities] = useState<ICongDong[]>([]);
  const [total, setTotal]             = useState(0);
  const [keyword, setKeyword]         = useState('');
  const [page, setPage]               = useState(1);

  // ── Selected community (left panel)
  const [selected, setSelected]       = useState<ICongDong | null>(null);
  const [selLoading, setSelLoading]   = useState(false);

  // ── Posts (right panel)
  const [posts, setPosts]             = useState<IBaiViet[]>([]);
  const [postLoading, setPostLoading] = useState(false);

  // ── Post detail drawer
  const [postDetail, setPostDetail]   = useState<IBaiViet | null>(null);
  const [postDetailOpen, setPostDetailOpen] = useState(false);
  const [comments, setComments]       = useState<IBinhLuan[]>([]);
  const [commLoading, setCommLoading] = useState(false);
  const [likedIds, setLikedIds]       = useState<Set<string>>(new Set());
  const [cmtText, setCmtText]         = useState('');
  const [editingCmt, setEditingCmt]   = useState<IBinhLuan | null>(null);
  const [editCmtText, setEditCmtText] = useState('');

  // ── Card-level comment preview & quick input
  const [previewComments, setPreviewComments] = useState<Record<string, IBinhLuan[]>>({});
  const [quickCmtText, setQuickCmtText]       = useState<Record<string, string>>({});
  const [quickCmtLoading, setQuickCmtLoading] = useState<Record<string, boolean>>({});

  // ── Community form
  const [cdFormOpen, setCdFormOpen]   = useState(false);
  const [cdFormMode, setCdFormMode]   = useState<'create' | 'edit'>('create');
  const [cdFormLoading, setCdFormLoading] = useState(false);
  const [cdForm] = Form.useForm();

  // ── Post create/edit form
  const [bvFormOpen, setBvFormOpen]   = useState(false);
  const [bvFormMode, setBvFormMode]   = useState<'create' | 'edit'>('create');
  const [bvFormLoading, setBvFormLoading] = useState(false);
  const [bvForm] = Form.useForm();
  const [bvLoaiBaiViet, setBvLoaiBaiViet] = useState<LoaiBaiViet>(LoaiBaiViet.ThaoCuan);

  // ── Load communities
  const loadCommunities = useCallback(async (kw = keyword, p = page) => {
    setLoading(true);
    try {
      const req: ISearchCongDongRequest = { pageNumber: p, pageSize: 20, keyword: kw };
      const res = await searchCongDongs(req);
      setCommunities(safeList<ICongDong>(res));
      setTotal(safeTotal(res));
    } catch { message.error('Không tải được danh sách cộng đồng'); }
    finally { setLoading(false); }
  }, [keyword, page]);

  useEffect(() => { loadCommunities(); }, []);

  // ── Open community (select + load posts)
  const openCommunity = async (cd: ICongDong) => {
    setSelected(cd); setSelLoading(true);
    try {
      const detail = await getCongDong(cd.id);
      setSelected(safeItem<ICongDong>(detail) ?? cd);
      await loadPosts(cd.id);
    } catch { message.error('Không tải được cộng đồng'); }
    finally { setSelLoading(false); }
  };

  const loadPosts = async (congDongId: string) => {
    setPostLoading(true);
    try {
      const res = await searchBaiViets({ congDongId, pageNumber: 1, pageSize: 30 });
      const list = safeList<IBaiViet>(res);
      setPosts(list);
      // Khởi tạo likedIds từ daTuThich để giữ trạng thái sau refresh
      setLikedIds(prev => {
        const next = new Set(prev);
        list.forEach(p => { if (p.daTuThich) next.add(p.id); else next.delete(p.id); });
        return next;
      });
      // Load 3 preview comments per post (fire & forget)
      Promise.allSettled(
        list.map(p =>
          searchBinhLuans({ loaiDoiTuong: LoaiDoiTuong.BaiViet, doiTuongId: p.id, pageNumber: 1, pageSize: 3 })
            .then(r => ({ id: p.id, cmts: safeList<IBinhLuan>(r) }))
        )
      ).then(results => {
        const map: Record<string, IBinhLuan[]> = {};
        results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value.cmts; });
        setPreviewComments(map);
      });
    } catch {}
    finally { setPostLoading(false); }
  };

  const submitQuickComment = async (postId: string) => {
    const text = quickCmtText[postId]?.trim();
    if (!text) return;
    setQuickCmtLoading(prev => ({ ...prev, [postId]: true }));
    try {
      await createBinhLuan({ loaiDoiTuong: LoaiDoiTuong.BaiViet, doiTuongId: postId, noiDung: text });
      setQuickCmtText(prev => ({ ...prev, [postId]: '' }));
      const r = await searchBinhLuans({ loaiDoiTuong: LoaiDoiTuong.BaiViet, doiTuongId: postId, pageNumber: 1, pageSize: 3 });
      setPreviewComments(prev => ({ ...prev, [postId]: safeList<IBinhLuan>(r) }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, soBinhLuan: (p.soBinhLuan ?? 0) + 1 } : p));
    } catch { message.error('Lỗi'); }
    finally { setQuickCmtLoading(prev => ({ ...prev, [postId]: false })); }
  };

  // ── Open post detail
  const openPost = async (id: string) => {
    setPostDetailOpen(true); setCommLoading(true);
    try {
      const bvRes = await getBaiViet(id);
      setPostDetail(safeItem<IBaiViet>(bvRes));
      const cmtRes = await searchBinhLuans({ loaiDoiTuong: LoaiDoiTuong.BaiViet, doiTuongId: id, pageNumber: 1, pageSize: 50 });
      setComments(safeList<IBinhLuan>(cmtRes));
    } catch { message.error('Không tải được bài viết'); }
    finally { setCommLoading(false); }
  };

  // ── Tham gia / rời
  const handleThamGia = async (id: string) => {
    try { await thamGiaCongDong(id); message.success('Đã tham gia cộng đồng'); if (selected) openCommunity(selected); }
    catch { message.error('Lỗi'); }
  };
  const handleRoi = async (id: string) => {
    try { await roiCongDong(id); message.success('Đã rời cộng đồng'); if (selected) openCommunity(selected); }
    catch { message.error('Lỗi'); }
  };

  // ── Community form
  const openCdCreate = () => { setCdFormMode('create'); cdForm.resetFields(); setCdFormOpen(true); };
  const openCdEdit = () => { setCdFormMode('edit'); cdForm.setFieldsValue(selected); setCdFormOpen(true); };
  const submitCd = async () => {
    try {
      const values = await cdForm.validateFields();
      setCdFormLoading(true);
      if (cdFormMode === 'create') {
        await createCongDong(values);
        message.success('Đã tạo cộng đồng');
      } else {
        await updateCongDong(selected!.id, { ...values, id: selected!.id });
        message.success('Đã cập nhật');
        if (selected) openCommunity({ ...selected, ...values });
      }
      setCdFormOpen(false); loadCommunities();
    } catch (e: any) { if (!e?.errorFields) message.error('Lỗi'); }
    finally { setCdFormLoading(false); }
  };
  const handleDeleteCd = async (id: string) => {
    try {
      await deleteCongDong(id);
      message.success('Đã xóa');
      setSelected(null); setPosts([]);
      loadCommunities();
    } catch { message.error('Lỗi'); }
  };

  // ── Post form
  const openBvCreate = () => {
    setBvFormMode('create');
    bvForm.resetFields();
    setBvLoaiBaiViet(LoaiBaiViet.ThaoCuan);
    bvForm.setFieldsValue({ congDongId: selected?.id, loaiBaiViet: LoaiBaiViet.ThaoCuan });
    setBvFormOpen(true);
  };
  const openBvEdit = (post: IBaiViet) => {
    setBvFormMode('edit');
    bvForm.resetFields();
    setBvLoaiBaiViet(post.loaiBaiViet);
    bvForm.setFieldsValue({ ...post });
    setBvFormOpen(true);
  };
  const submitBv = async () => {
    try {
      const values = await bvForm.validateFields();
      setBvFormLoading(true);
      if (bvFormMode === 'create') {
        await createBaiViet({ ...values, loaiBaiViet: bvLoaiBaiViet });
        message.success('Đã đăng bài viết');
      } else {
        const editId = bvForm.getFieldValue('id');
        await updateBaiViet(editId, { ...values, loaiBaiViet: bvLoaiBaiViet, id: editId });
        message.success('Đã cập nhật bài viết');
        // refresh detail if open
        if (postDetail?.id === editId) openPost(editId);
      }
      setBvFormOpen(false);
      if (selected) loadPosts(selected.id);
    } catch (e: any) { if (!e?.errorFields) message.error('Lỗi'); }
    finally { setBvFormLoading(false); }
  };
  const handleDeleteBv = async (id: string) => {
    try {
      await deleteBaiViet(id);
      message.success('Đã xóa bài viết');
      if (postDetailOpen && postDetail?.id === id) setPostDetailOpen(false);
      if (selected) loadPosts(selected.id);
    } catch { message.error('Lỗi'); }
  };

  // ── Comment
  const submitComment = async () => {
    if (!cmtText.trim() || !postDetail) return;
    try {
      await createBinhLuan({ loaiDoiTuong: LoaiDoiTuong.BaiViet, doiTuongId: postDetail.id, noiDung: cmtText });
      setCmtText(''); openPost(postDetail.id);
    } catch { message.error('Lỗi'); }
  };
  const handleSaveEditCmt = async () => {
    if (!editingCmt || !editCmtText.trim()) return;
    try {
      await updateBinhLuan(editingCmt.id, { id: editingCmt.id, noiDung: editCmtText });
      message.success('Đã cập nhật bình luận');
      setEditingCmt(null); setEditCmtText('');
      if (postDetail) openPost(postDetail.id);
    } catch { message.error('Lỗi'); }
  };
  const handleDeleteCmt = async (id: string) => {
    try { await deleteBinhLuan(id); if (postDetail) openPost(postDetail.id); }
    catch { message.error('Lỗi'); }
  };

  // ── Like
  const handleLike = async (type: LoaiDoiTuong, id: string) => {
    try {
      const res = await toggleThich({ loaiDoiTuong: type, doiTuongId: id });
      const result = (res as any)?.data;          // IResult<boolean>
      if (result?.succeeded === false) { message.warning('Thao tác không thành công'); return; }
      // data: true → vừa thích, data: false → vừa bỏ thích
      const liked: boolean = Boolean(result?.data);
      setLikedIds(prev => {
        const next = new Set(prev);
        liked ? next.add(id) : next.delete(id);
        return next;
      });
      if (type === LoaiDoiTuong.BaiViet) {
        setPosts(prev => prev.map(p => p.id === id
          ? { ...p, soLuotThich: Math.max(0, (p.soLuotThich ?? 0) + (liked ? 1 : -1)), daTuThich: liked }
          : p
        ));
        if (postDetailOpen && postDetail?.id === id) openPost(id);
      }
    } catch { message.error('Lỗi'); }
  };

  const totalPages = Math.ceil(total / 20);

  // ── Render community sidebar item
  const renderSidebarItem = (cd: ICongDong) => {
    const isActive = selected?.id === cd.id;
    return (
      <div
        key={cd.id}
        className={`d-flex align-items-center gap-3 p-3 rounded-2 cursor-pointer mb-1 ${isActive ? 'bg-light-primary' : 'hover-bg-light'}`}
        style={{ transition: 'background 0.15s', border: isActive ? '1px solid #d6e4ff' : '1px solid transparent' }}
        onClick={() => openCommunity(cd)}
      >
        <Avatar size={40} style={{ backgroundColor: getAvatarColor(cd.ten), flexShrink: 0 }}>
          {getInitials(cd.ten)}
        </Avatar>
        <div className="flex-grow-1 min-w-0">
          <div className={`fw-semibold fs-7 text-truncate ${isActive ? 'text-primary' : 'text-gray-800'}`}>{cd.ten}</div>
          <div className="text-muted fs-8 d-flex gap-2">
            <span><i className="fa-regular fa-users me-1" />{cd.soThanhVien ?? 0}</span>
            <span><i className="fa-regular fa-comment me-1" />{cd.soThaoCuan ?? 0}</span>
          </div>
        </div>
        {cd.daThamGia && <i className="fa-solid fa-check-circle text-success fs-8" title="Đã tham gia" />}
      </div>
    );
  };

  // ── Render post card
  const renderPostCard = (bv: IBaiViet) => (
    <div key={bv.id} className="card border-0 shadow-sm mb-3"
      style={{ transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '')}
    >
      <div className="card-body p-4">
        {/* Author + type */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <Avatar size={36} style={{ backgroundColor: getAvatarColor(bv.tacGia?.hoTen ?? '?'), flexShrink: 0 }}>
            {getInitials(bv.tacGia?.hoTen)}
          </Avatar>
          <div className="flex-grow-1">
            <div className="fw-semibold fs-7 text-gray-800">{bv.tacGia?.hoTen ?? 'Ẩn danh'}</div>
            <div className="text-muted fs-8">{relativeTime(bv.createdOn)}</div>
          </div>
          <Tag color={LOAI_BV_COLOR[bv.loaiBaiViet]} style={{ margin: 0 }}>
            {LOAI_BV_LABEL[bv.loaiBaiViet]}
          </Tag>
          {isAdmin && (
            <div className="d-flex gap-1" onClick={e => e.stopPropagation()}>
              <Tooltip title="Chỉnh sửa">
                <Button type="text" size="small" icon={<i className="fa-regular fa-pen text-muted" />}
                  onClick={() => openBvEdit(bv)} />
              </Tooltip>
              <Popconfirm title="Xóa bài viết này?" onConfirm={() => handleDeleteBv(bv.id)} okText="Xóa" cancelText="Hủy">
                <Button type="text" size="small" danger icon={<i className="fa-regular fa-trash" />} />
              </Popconfirm>
            </div>
          )}
        </div>

        {/* Title & content */}
        <div className="fw-bold fs-6 text-gray-800 mb-2 cursor-pointer"
          onClick={() => openPost(bv.id)}>{bv.tieuDe}</div>
        <div className="text-muted fs-7 mb-3 cursor-pointer"
          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}
          onClick={() => openPost(bv.id)}>
          {bv.noiDung}
        </div>

        {/* Footer stats */}
        <div className="d-flex gap-3 align-items-center border-top pt-2 mt-1">
          <button
            className={`btn btn-sm btn-text d-flex align-items-center gap-1 p-0 ${likedIds.has(bv.id) || bv.daTuThich ? 'text-danger' : 'text-muted'}`}
            onClick={() => handleLike(LoaiDoiTuong.BaiViet, bv.id)}
          >
            <i className={`fa-${likedIds.has(bv.id) || bv.daTuThich ? 'solid' : 'regular'} fa-heart me-1`} />
            <span className="fs-8">{Math.max(0, bv.soLuotThich ?? 0)}</span>
          </button>
          <button className="btn btn-sm btn-text d-flex align-items-center gap-1 p-0 text-muted"
            onClick={() => openPost(bv.id)}>
            <i className="fa-regular fa-comment me-1" />
            <span className="fs-8">{bv.soBinhLuan ?? 0}</span>
          </button>
          <Button type="link" size="small" className="ms-auto p-0 fs-8"
            onClick={() => openPost(bv.id)}>
            Xem chi tiết →
          </Button>
        </div>

        {/* Quick comment input */}
        <div className="d-flex gap-2 align-items-end mt-3">
          <Avatar size={28} style={{ backgroundColor: '#1677ff', flexShrink: 0, fontSize: 12 }}>
            <i className="fa-regular fa-user" />
          </Avatar>
          <Input.TextArea
            value={quickCmtText[bv.id] ?? ''}
            onChange={e => setQuickCmtText(prev => ({ ...prev, [bv.id]: e.target.value }))}
            placeholder="Viết bình luận..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); submitQuickComment(bv.id); } }}
            style={{ borderRadius: 16, fontSize: 13 }}
          />
          <Button type="primary" size="small" shape="circle"
            icon={<i className="fa-regular fa-paper-plane" />}
            disabled={!quickCmtText[bv.id]?.trim()}
            loading={quickCmtLoading[bv.id]}
            onClick={() => submitQuickComment(bv.id)}
          />
        </div>

        {/* 3 most recent comments */}
        {(previewComments[bv.id]?.length ?? 0) > 0 && (
          <div className="d-flex flex-column gap-2 mt-2">
            {previewComments[bv.id].map(cmt => (
              <div key={cmt.id} className="d-flex gap-2 align-items-start">
                <Avatar size={24} style={{ backgroundColor: getAvatarColor(cmt.tacGia?.hoTen ?? '?'), flexShrink: 0, fontSize: 11 }}>
                  {getInitials(cmt.tacGia?.hoTen)}
                </Avatar>
                <div className="bg-gray-100 rounded px-2 py-1 flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="fw-semibold fs-8 me-1">{cmt.tacGia?.hoTen ?? 'Ẩn danh'}</span>
                  <span className="fs-8 text-gray-700">{cmt.noiDung}</span>
                  <div className="text-muted fs-8 mt-0.5">{relativeTime(cmt.createdOn)}</div>
                </div>
              </div>
            ))}
            {(bv.soBinhLuan ?? 0) > 3 && (
              <button className="btn btn-text btn-sm p-0 text-primary fs-8 text-start"
                onClick={() => openPost(bv.id)}>
                Xem tất cả {bv.soBinhLuan} bình luận →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Cộng đồng thực hành</PageTitle>

      <Content>
        <div className="d-flex gap-4" style={{ alignItems: 'flex-start' }}>

          {/* ── Left: Community sidebar ────────────────────────────────── */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                {/* Search + create */}
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Input.Search
                    placeholder="Tìm cộng đồng..."
                    onSearch={kw => { setKeyword(kw); setPage(1); loadCommunities(kw, 1); }}
                    allowClear
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  {isAdmin && (
                    <Tooltip title="Tạo cộng đồng mới">
                      <Button type="primary" icon={<i className="fa-regular fa-plus" />}
                        onClick={openCdCreate} />
                    </Tooltip>
                  )}
                </div>

                <div className="fw-semibold text-muted fs-8 text-uppercase mb-2 px-1">
                  {total} Cộng đồng
                </div>

                <Spin spinning={loading}>
                  {communities.length === 0 && !loading
                    ? <Empty description="Chưa có cộng đồng nào" className="py-4" />
                    : <div>{communities.map(renderSidebarItem)}</div>
                  }
                </Spin>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3 gap-1">
                    <Button size="small" disabled={page <= 1}
                      onClick={() => { setPage(p => p - 1); loadCommunities(keyword, page - 1); }}>
                      <i className="fa-regular fa-chevron-left" />
                    </Button>
                    <span className="align-self-center fs-8">{page}/{totalPages}</span>
                    <Button size="small" disabled={page >= totalPages}
                      onClick={() => { setPage(p => p + 1); loadCommunities(keyword, page + 1); }}>
                      <i className="fa-regular fa-chevron-right" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Post feed ───────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!selected ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body py-16 text-center">
                  <i className="fa-regular fa-users fs-3x text-muted mb-4 d-block" />
                  <div className="fw-semibold text-gray-700 mb-2">Chọn một cộng đồng</div>
                  <div className="text-muted fs-7">Nhấn vào cộng đồng ở bên trái để xem các bài thảo luận</div>
                </div>
              </div>
            ) : (
              <Spin spinning={selLoading}>
                {/* Community header */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start gap-3">
                      <Avatar size={52} style={{ backgroundColor: getAvatarColor(selected.ten) }}>
                        {getInitials(selected.ten)}
                      </Avatar>
                      <div className="flex-grow-1">
                        <div className="fw-bold fs-5 text-gray-800">{selected.ten}</div>
                        {selected.moTa && <div className="text-muted fs-7 mt-1">{selected.moTa}</div>}
                        <div className="d-flex gap-4 text-muted fs-8 mt-2">
                          <span><i className="fa-regular fa-users me-1" />{selected.soThanhVien ?? 0} thành viên</span>
                          <span><i className="fa-regular fa-comment me-1" />{selected.soThaoCuan ?? 0} bài viết</span>
                        </div>
                      </div>
                      <div className="d-flex gap-2 align-items-center">
                        {selected.daThamGia
                          ? <Button size="small" onClick={() => handleRoi(selected.id)}>Rời cộng đồng</Button>
                          : <Button size="small" type="primary" onClick={() => handleThamGia(selected.id)}>Tham gia</Button>
                        }
                        {isAdmin && (
                          <>
                            <Tooltip title="Chỉnh sửa cộng đồng">
                              <Button size="small" icon={<i className="fa-regular fa-pen" />} onClick={openCdEdit} />
                            </Tooltip>
                            <Popconfirm title="Xóa cộng đồng này?" onConfirm={() => handleDeleteCd(selected.id)} okText="Xóa" cancelText="Hủy">
                              <Button size="small" danger icon={<i className="fa-regular fa-trash" />} />
                            </Popconfirm>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post area header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="fw-semibold text-gray-700">
                    <i className="fa-regular fa-comment-dots me-2" />
                    Bài viết ({posts.length})
                  </div>
                  <Button type="primary" size="small"
                    icon={<i className="fa-regular fa-pen me-1" />}
                    onClick={openBvCreate}>
                    Đăng bài
                  </Button>
                </div>

                <Spin spinning={postLoading}>
                  {posts.length === 0 && !postLoading ? (
                    <div className="card border-0 shadow-sm">
                      <Empty description="Chưa có bài viết nào" className="py-8">
                        <Button type="primary" ghost onClick={openBvCreate}>
                          <i className="fa-regular fa-pen me-1" />Đăng bài đầu tiên
                        </Button>
                      </Empty>
                    </div>
                  ) : (
                    <div>{posts.map(renderPostCard)}</div>
                  )}
                </Spin>
              </Spin>
            )}
          </div>
        </div>
      </Content>

      {/* ── Post detail modal ─────────────────────────────────────────────── */}
      <Modal
        open={postDetailOpen}
        onCancel={() => setPostDetailOpen(false)}
        width={720}
        footer={null}
        title={postDetail && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Tag color={LOAI_BV_COLOR[postDetail.loaiBaiViet]}>{LOAI_BV_LABEL[postDetail.loaiBaiViet]}</Tag>
              <span className="text-muted fs-8">{postDetail.tacGia?.hoTen ?? ''} · {relativeTime(postDetail.createdOn)}</span>
            </div>
            <div className="fw-bold fs-5 text-gray-800">{postDetail.tieuDe}</div>
          </div>
        )}
      >
        <Spin spinning={commLoading}>
          {postDetail && (
            <div>
              {/* Content */}
              <div className="p-4 rounded-2 mb-4 fs-7 text-gray-700"
                style={{ background: LOAI_BV_BG[postDetail.loaiBaiViet], lineHeight: 1.8 }}>
                {postDetail.noiDung}
              </div>

              {/* Actions */}
              <div className="d-flex gap-3 mb-4">
                <button
                  className={`btn btn-sm d-flex align-items-center gap-2 ${likedIds.has(postDetail.id) || postDetail.daTuThich ? 'btn-danger' : 'btn-light-danger'}`}
                  onClick={() => handleLike(LoaiDoiTuong.BaiViet, postDetail.id)}
                >
                  <i className={`fa-${likedIds.has(postDetail.id) || postDetail.daTuThich ? 'solid' : 'regular'} fa-heart`} />
                  {Math.max(0, postDetail.soLuotThich ?? 0)} Thích
                </button>
                {isAdmin && (
                  <Button size="small" onClick={() => { setPostDetailOpen(false); openBvEdit(postDetail); }}>
                    <i className="fa-regular fa-pen me-1" />Chỉnh sửa
                  </Button>
                )}
              </div>

              <Divider orientation="left" style={{ fontSize: 13 }}>
                Bình luận ({comments.length})
              </Divider>

              {/* Comments */}
              <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: 320, overflowY: 'auto' }}>
                {comments.length === 0
                  ? <p className="text-muted fs-7 text-center py-4">Chưa có bình luận — hãy là người đầu tiên!</p>
                  : comments.map(cmt => (
                    <div key={cmt.id} className="d-flex gap-2">
                      <Avatar size={32} style={{ backgroundColor: getAvatarColor(cmt.tacGia?.hoTen ?? '?'), flexShrink: 0 }}>
                        {getInitials(cmt.tacGia?.hoTen)}
                      </Avatar>
                      <div className="flex-grow-1">
                        {editingCmt?.id === cmt.id ? (
                          <div className="d-flex gap-2">
                            <Input.TextArea value={editCmtText} onChange={e => setEditCmtText(e.target.value)}
                              rows={2} autoFocus />
                            <div className="d-flex flex-column gap-1">
                              <Button size="small" type="primary" onClick={handleSaveEditCmt}>Lưu</Button>
                              <Button size="small" onClick={() => setEditingCmt(null)}>Hủy</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded p-2">
                            <div className="fw-semibold fs-8 mb-1">{cmt.tacGia?.hoTen ?? 'Ẩn danh'}</div>
                            <div className="fs-7 text-gray-700">{cmt.noiDung}</div>
                          </div>
                        )}
                        {editingCmt?.id !== cmt.id && (
                          <div className="d-flex gap-2 mt-1">
                            <button
                              className={`btn btn-text btn-sm p-0 fs-8 ${likedIds.has(cmt.id) ? 'text-danger' : 'text-muted'}`}
                              onClick={() => handleLike(LoaiDoiTuong.BinhLuan, cmt.id)}>
                              <i className={`fa-${likedIds.has(cmt.id) ? 'solid' : 'regular'} fa-thumbs-up me-1`} />
                              Thích {cmt.luotThich ? `(${cmt.luotThich})` : ''}
                            </button>
                            <button className="btn btn-text btn-sm p-0 text-muted fs-8"
                              onClick={() => { setEditingCmt(cmt); setEditCmtText(cmt.noiDung); }}>
                              <i className="fa-regular fa-pen me-1" />Sửa
                            </button>
                            <Popconfirm title="Xóa bình luận?" onConfirm={() => handleDeleteCmt(cmt.id)} okText="Xóa" cancelText="Hủy">
                              <button className="btn btn-text btn-sm p-0 text-danger fs-8">
                                <i className="fa-regular fa-trash me-1" />Xóa
                              </button>
                            </Popconfirm>
                            <span className="text-muted fs-8 ms-auto">{relativeTime(cmt.createdOn)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Comment input */}
              <div className="d-flex gap-2 align-items-end">
                <Avatar size={32} style={{ backgroundColor: '#1677ff', flexShrink: 0 }}>
                  <i className="fa-regular fa-user" />
                </Avatar>
                <div className="flex-grow-1">
                  <Input.TextArea
                    value={cmtText}
                    onChange={e => setCmtText(e.target.value)}
                    rows={2}
                    placeholder="Viết bình luận... (Shift+Enter để xuống dòng)"
                    maxLength={2000}
                    onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); submitComment(); } }}
                    style={{ borderRadius: 12 }}
                  />
                </div>
                <Button type="primary" shape="circle"
                  icon={<i className="fa-regular fa-paper-plane" />}
                  disabled={!cmtText.trim()} onClick={submitComment} />
              </div>
            </div>
          )}
        </Spin>
      </Modal>

      {/* ── Community create/edit form ─────────────────────────────────────── */}
      <Modal open={cdFormOpen} onCancel={() => setCdFormOpen(false)}
        title={cdFormMode === 'create' ? 'Tạo cộng đồng mới' : 'Chỉnh sửa cộng đồng'}
        onOk={submitCd} okText={cdFormMode === 'create' ? 'Tạo' : 'Lưu'} confirmLoading={cdFormLoading}>
        <Form form={cdForm} layout="vertical">
          <Form.Item name="ten" label="Tên cộng đồng" rules={[{ required: true }]}>
            <Input placeholder="Tên cộng đồng..." />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả mục đích, phạm vi của cộng đồng..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Post create/edit form ──────────────────────────────────────────── */}
      <Modal open={bvFormOpen} onCancel={() => setBvFormOpen(false)}
        title={bvFormMode === 'create' ? 'Đăng bài viết mới' : 'Chỉnh sửa bài viết'}
        onOk={submitBv}
        okText={bvFormMode === 'create' ? 'Đăng bài' : 'Lưu thay đổi'}
        confirmLoading={bvFormLoading}
        width={620}
      >
        <Form form={bvForm} layout="vertical">
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item name="congDongId" hidden><Input /></Form.Item>

          <Form.Item label="Loại bài viết" required>
            <div className="d-flex gap-2">
              {(Object.entries(LOAI_BV_LABEL) as [string, string][]).map(([k, v]) => (
                <Button key={k}
                  type={bvLoaiBaiViet === Number(k) ? 'primary' : 'default'}
                  size="small"
                  onClick={() => {
                    const loai = Number(k) as LoaiBaiViet;
                    setBvLoaiBaiViet(loai);
                    bvForm.setFieldValue('loaiBaiViet', loai);
                  }}>
                  {v}
                </Button>
              ))}
            </div>
          </Form.Item>

          <Form.Item name="tieuDe" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}>
            <Input placeholder="Tiêu đề bài viết..." size="large" />
          </Form.Item>
          <Form.Item name="noiDung" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}>
            <Input.TextArea rows={6} placeholder="Nội dung bài viết..." showCount maxLength={10000} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
