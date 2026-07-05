import React, { useState, useEffect, useCallback } from 'react';
import {
  Input, Button, Tag, Modal, Form, Spin, Empty,
  Avatar, Divider, message, Tooltip, Popconfirm,
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
import { NguoiThichPopover } from '@/app/components/tuong-tac/NguoiThichPopover';

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
      // Khởi tạo likedIds từ daThich để giữ trạng thái sau refresh
      setLikedIds(prev => {
        const next = new Set(prev);
        list.forEach(p => { if (p.daThich) next.add(p.id); else next.delete(p.id); });
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
          ? { ...p, soLuotThich: Math.max(0, (p.soLuotThich ?? 0) + (liked ? 1 : -1)), daThich: liked }
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
        className={`d-flex align-items-center gap-3 p-3 cursor-pointer mb-1 ${isActive ? 'bg-light-success' : 'hover-bg-light'}`}
        style={{
          transition: 'all 0.15s',
          borderRadius: 10,
          borderLeft: isActive ? '3px solid #059669' : '3px solid transparent',
        }}
        onClick={() => openCommunity(cd)}
      >
        <Avatar size={42} shape="square" style={{ backgroundColor: getAvatarColor(cd.ten), flexShrink: 0, borderRadius: 10, fontWeight: 700 }}>
          {getInitials(cd.ten)}
        </Avatar>
        <div className="flex-grow-1 min-w-0">
          <div className={`fw-semibold fs-7 text-truncate ${isActive ? 'text-success' : 'text-gray-800'}`}>{cd.ten}</div>
          <div className="text-muted fs-8 d-flex gap-3 mt-1">
            <span><i className="fa-regular fa-users me-1" />{cd.soThanhVien ?? 0}</span>
            <span><i className="fa-regular fa-comment me-1" />{cd.soThaoCuan ?? 0}</span>
          </div>
        </div>
        {cd.daThamGia && (
          <Tooltip title="Đã tham gia">
            <i className="fa-solid fa-circle-check text-success" />
          </Tooltip>
        )}
      </div>
    );
  };

  // ── Render post card
  const renderPostCard = (bv: IBaiViet) => {
    const typeHex: Record<LoaiBaiViet, string> = {
      [LoaiBaiViet.ThaoCuan]: '#1677ff',
      [LoaiBaiViet.HoiDap]:   '#fa8c16',
      [LoaiBaiViet.ChiaSe]:   '#52c41a',
    };
    return (
      <div key={bv.id} className="shadow-sm mb-3"
        style={{
          background: '#fff',
          borderRadius: 12,
          borderLeft: `4px solid ${typeHex[bv.loaiBaiViet]}`,
          transition: 'box-shadow 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '';
          (e.currentTarget as HTMLDivElement).style.transform = '';
        }}
      >
        <div className="p-4">
          {/* Author + type */}
          <div className="d-flex align-items-center gap-3 mb-3">
            <Avatar size={40} style={{ backgroundColor: getAvatarColor(bv.tacGia?.hoTen ?? '?'), flexShrink: 0, fontWeight: 600 }}>
              {getInitials(bv.tacGia?.hoTen)}
            </Avatar>
            <div className="flex-grow-1">
              <div className="fw-semibold fs-7 text-gray-800">{bv.tacGia?.hoTen ?? 'Ẩn danh'}</div>
              <div className="text-muted fs-8">
                <i className="fa-regular fa-clock me-1" />{relativeTime(bv.createdOn)}
              </div>
            </div>
            <Tag color={LOAI_BV_COLOR[bv.loaiBaiViet]} style={{ margin: 0, borderRadius: 12 }}>
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
          <div className="fw-bold fs-5 text-gray-900 mb-2 cursor-pointer"
            style={{ lineHeight: 1.4 }}
            onClick={() => openPost(bv.id)}>{bv.tieuDe}</div>
          <div className="text-gray-600 fs-7 mb-3 cursor-pointer"
            style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.7 }}
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
  };

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Cộng đồng thực hành</PageTitle>

      <Content>
        {/* Hero header */}
        <div className="mb-5 overflow-hidden shadow-sm"
          style={{
            backgroundImage: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)',
            backgroundColor: '#065f46',
            borderRadius: 12,
          }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-6 py-6">
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center justify-content-center rounded-3"
                style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <i className="fa-regular fa-users fs-2" style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#fff' }}>Cộng đồng thực hành</h3>
                <span className="fs-7" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Trao đổi, hỏi đáp và chia sẻ kinh nghiệm đổi mới sáng tạo giữa các đơn vị
                </span>
              </div>
            </div>
            {isAdmin && (
              <Button size="large" onClick={openCdCreate}
                style={{ background: '#fff', color: '#065f46', fontWeight: 600, border: 'none' }}
                icon={<i className="fa-regular fa-plus me-1" />}>
                Tạo cộng đồng
              </Button>
            )}
          </div>
        </div>

        <div className="d-flex gap-4" style={{ alignItems: 'flex-start' }}>

          {/* ── Left: Community sidebar ────────────────────────────────── */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-body p-4">
                <Input.Search
                  placeholder="Tìm cộng đồng..."
                  onSearch={kw => { setKeyword(kw); setPage(1); loadCommunities(kw, 1); }}
                  allowClear
                  className="mb-4"
                />

                <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                  <span className="fw-bold text-gray-600 fs-8 text-uppercase" style={{ letterSpacing: '0.06em' }}>
                    Cộng đồng
                  </span>
                  <span className="badge badge-light-success">{total}</span>
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
              <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <div className="card-body py-16 text-center">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                    style={{ width: 88, height: 88, background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>
                    <i className="fa-regular fa-users fs-2x" style={{ color: '#059669' }} />
                  </div>
                  <div className="fw-bold fs-4 text-gray-800 mb-2">Chọn một cộng đồng để bắt đầu</div>
                  <div className="text-muted fs-7 mb-4">
                    Tham gia thảo luận, đặt câu hỏi và chia sẻ kinh nghiệm cùng đồng nghiệp
                  </div>
                  {communities.length > 0 && (
                    <Button type="primary" ghost onClick={() => openCommunity(communities[0])}>
                      Xem cộng đồng đầu tiên <i className="fa-regular fa-arrow-right ms-1" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Spin spinning={selLoading}>
                {/* Community header — banner */}
                <div className="shadow-sm mb-4 overflow-hidden" style={{ borderRadius: 12, background: '#fff' }}>
                  {/* Cover strip */}
                  <div style={{
                    height: 64,
                    backgroundImage: `linear-gradient(120deg, ${getAvatarColor(selected.ten)} 0%, ${getAvatarColor(selected.ten)}99 100%)`,
                  }} />
                  <div className="px-5 pb-4">
                    <div className="d-flex align-items-end gap-3" style={{ marginTop: -26 }}>
                      <Avatar size={64} shape="square"
                        style={{
                          backgroundColor: getAvatarColor(selected.ten),
                          borderRadius: 14, fontWeight: 700, fontSize: 24,
                          border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        }}>
                        {getInitials(selected.ten)}
                      </Avatar>
                      <div className="flex-grow-1 pt-6">
                        <div className="fw-bold fs-4 text-gray-800">{selected.ten}</div>
                      </div>
                      <div className="d-flex gap-2 align-items-center pt-6">
                        {selected.daThamGia
                          ? <Button onClick={() => handleRoi(selected.id)}
                              icon={<i className="fa-regular fa-right-from-bracket me-1" />}>Rời cộng đồng</Button>
                          : <Button type="primary" onClick={() => handleThamGia(selected.id)}
                              icon={<i className="fa-regular fa-user-plus me-1" />}>Tham gia</Button>
                        }
                        {isAdmin && (
                          <>
                            <Tooltip title="Chỉnh sửa cộng đồng">
                              <Button icon={<i className="fa-regular fa-pen" />} onClick={openCdEdit} />
                            </Tooltip>
                            <Popconfirm title="Xóa cộng đồng này?" onConfirm={() => handleDeleteCd(selected.id)} okText="Xóa" cancelText="Hủy">
                              <Button danger icon={<i className="fa-regular fa-trash" />} />
                            </Popconfirm>
                          </>
                        )}
                      </div>
                    </div>
                    {selected.moTa && <div className="text-muted fs-7 mt-3">{selected.moTa}</div>}
                    <div className="d-flex gap-2 mt-3">
                      <span className="badge badge-light-primary">
                        <i className="fa-regular fa-users me-1" />{selected.soThanhVien ?? 0} thành viên
                      </span>
                      <span className="badge badge-light-info">
                        <i className="fa-regular fa-comment me-1" />{selected.soThaoCuan ?? 0} bài viết
                      </span>
                    </div>
                  </div>
                </div>

                {/* Composer — khung đăng bài nhanh */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                  <div className="card-body py-3 px-4 d-flex align-items-center gap-3">
                    <Avatar size={38} style={{ backgroundColor: '#1677ff', flexShrink: 0 }}>
                      <i className="fa-regular fa-user" />
                    </Avatar>
                    <div
                      className="flex-grow-1 text-muted fs-7 px-4 py-2 cursor-pointer hover-bg-light"
                      style={{ background: '#f5f6f8', borderRadius: 20, transition: 'background 0.15s' }}
                      onClick={openBvCreate}
                    >
                      Chia sẻ thảo luận, câu hỏi hoặc kinh nghiệm của bạn...
                    </div>
                    <Button type="primary" icon={<i className="fa-regular fa-pen me-1" />} onClick={openBvCreate}>
                      Đăng bài
                    </Button>
                  </div>
                </div>

                {/* Post area header */}
                <div className="d-flex align-items-center mb-3 px-1">
                  <span className="fw-bold text-gray-600 fs-8 text-uppercase" style={{ letterSpacing: '0.06em' }}>
                    <i className="fa-regular fa-comment-dots me-2" />Bài viết
                  </span>
                  <span className="badge badge-light-success ms-2">{posts.length}</span>
                </div>

                <Spin spinning={postLoading}>
                  {posts.length === 0 && !postLoading ? (
                    <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
                      <Empty
                        className="py-8"
                        description={
                          <div>
                            <div className="fw-semibold text-gray-700 mb-1">Chưa có bài viết nào</div>
                            <div className="text-muted fs-8">Hãy mở đầu cuộc thảo luận trong cộng đồng này</div>
                          </div>
                        }>
                        <Button type="primary" onClick={openBvCreate}>
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
              <div className="d-flex gap-3 mb-4 align-items-center">
                <button
                  className={`btn btn-sm d-flex align-items-center gap-2 ${likedIds.has(postDetail.id) || postDetail.daThich ? 'btn-danger' : 'btn-light-danger'}`}
                  onClick={() => handleLike(LoaiDoiTuong.BaiViet, postDetail.id)}
                >
                  <i className={`fa-${likedIds.has(postDetail.id) || postDetail.daTuThich ? 'solid' : 'regular'} fa-heart`} />
                  {Math.max(0, postDetail.soLuotThich ?? 0)} Thích
                </button>
                <NguoiThichPopover loaiDoiTuong={LoaiDoiTuong.BaiViet} doiTuongId={postDetail.id}>
                  <span className="text-muted fs-8 fw-semibold" style={{ textDecoration: 'underline dotted' }}>
                    {postDetail.soLuotThich ?? 0} người đã thích
                  </span>
                </NguoiThichPopover>
                <Button size="small" onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/doi-moi-sang-tao/kho-tri-thuc/cong-dong');
                  message.success('Đã sao chép liên kết!');
                }}>
                  <i className="fa-regular fa-link me-1" />Chia sẻ
                </Button>
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
