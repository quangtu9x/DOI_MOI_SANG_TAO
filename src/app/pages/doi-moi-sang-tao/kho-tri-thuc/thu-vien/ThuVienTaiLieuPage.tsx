import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Input, Select, Button, Tag, Modal, Form, Upload, Spin, Empty,
  Tabs, Tooltip, Popconfirm, message, Badge, Divider, Progress, InputNumber,
  Tree, TreeSelect, Checkbox,
} from 'antd';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import type { DataNode } from 'antd/es/tree';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { searchIdeas } from '@/app/services/ideaPortalApi';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { useAuth } from '@/app/modules/auth';
import { hasAll } from '@/utils/utils';
import { P, R } from '@/data/permission-constant';
import {
  searchTaiLieus,
  getTaiLieu,
  createTaiLieu,
  updateTaiLieu,
  deleteTaiLieu,
  getKhoTriThucWorkflowConfig,
  nopKiemDuyetTaiLieu,
  pheDuyetTaiLieu,
  saveKhoTriThucWorkflowConfig,
  tuChoiTaiLieu,
  getTaiLieuDownloadUrl,
  getRankingTaiLieus,
  searchPhienBans,
  uploadTaiLieuFile,
  searchTaiLieuDinhKems,
  createTaiLieuDinhKem,
  deleteTaiLieuDinhKem,
  getTaiLieuDinhKemDownloadUrl,
  getThuMucTree,
  createThuMuc,
  updateThuMuc,
  deleteThuMuc,
  chiaSeTaiLieu,
  getTaiLieuShareLink,
  searchTags,
} from '@/app/services/khoTriThucApi';
import { UserSelect } from '@/app/components/UserSelect';
import { searchOrganizationUnits } from '@/services/organizationUnit.service';
import type {
  ITaiLieu,
  IKhoTriThucWorkflowConfig,
  ISearchTaiLieuRequest,
  ITaiLieuDinhKem,
  IThuMucTaiLieu,
  ITag,
} from '@/app/models/knowledge-hub';
import { TrangThaiTaiLieu, LoaiTaiLieu, LoaiNguonThamChieu } from '@/app/models/knowledge-hub';
import { requestPOST } from '@/utils/baseAPI';
import { IPaginationResponse, IUserDetails } from '@/models';

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

/**
 * baseAPI không throw khi HTTP lỗi (trả {data, status}).
 * Trả về thông báo lỗi từ BE (ErrorResult.messages / Result.messages) hoặc null nếu thành công.
 */
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

const NGUON_LABEL: Record<LoaiNguonThamChieu, string> = {
  [LoaiNguonThamChieu.DuAn]:     'Dự án',
  [LoaiNguonThamChieu.SangKien]: 'Sáng kiến',
  [LoaiNguonThamChieu.YTuong]:   'Ý tưởng',
  [LoaiNguonThamChieu.NhiemVu]:  'Nhiệm vụ',
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

const normalizeDinhKem = (item: any): ITaiLieuDinhKem => {
  const thongTinFile = item.thongTinFile ?? (
    item.filePath || item.fileName || item.originalName || item.fileSize
      ? {
          duongDanLuuTru: item.filePath ?? item.duongDanLuuTru ?? '',
          tenGoc: item.fileName ?? item.originalName ?? item.tenGoc ?? '',
          kichThuocBytes: item.fileSize ?? item.kichThuocBytes ?? 0,
          mimeType: item.mimeType ?? item.fileExt ?? 'application/octet-stream',
        }
      : null
  );

  return {
    ...item,
    fileName: item.fileName ?? item.thongTinFile?.tenGoc ?? item.tenGoc ?? null,
    originalName: item.originalName ?? item.fileName ?? item.thongTinFile?.tenGoc ?? item.tenGoc ?? null,
    filePath: item.filePath ?? item.thongTinFile?.duongDanLuuTru ?? item.duongDanLuuTru ?? null,
    fileExt: item.fileExt ?? null,
    fileSize: item.fileSize ?? item.thongTinFile?.kichThuocBytes ?? item.kichThuocBytes ?? 0,
    externalUrl: item.externalUrl ?? item.urlNgoai ?? null,
    description: item.description ?? item.moTa ?? null,
    urlNgoai: item.urlNgoai ?? item.externalUrl ?? null,
    moTa: item.moTa ?? item.description ?? null,
    thongTinFile,
  };
};

const DEFAULT_SEARCH: ISearchTaiLieuRequest = {
  pageNumber: 1, pageSize: 12,
  keyword: '', trangThai: null, loaiTaiLieu: null, tacGiaId: null,
  linhVucKHCNId: null, donViId: null, tagIds: [],
};

const DEFAULT_WORKFLOW_CONFIG: IKhoTriThucWorkflowConfig = {
  nguoiKiemDuyetMacDinhUserIds: [],
  batBuocChiDinhNguoiKiemDuyet: false,
  batBuocHanXuLy: false,
  macDinhHanXuLyGio: 24,
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ThuVienTaiLieuPage: React.FC = () => {
  const { currentUser } = useAuth();
  const currentPermissions = new Set(currentUser?.permissions ?? []);
  const canApprove = hasAll(currentPermissions, [P.of(R.QuanLyTriThuc, 'Approve')]);
  // Quyền quản trị nội dung (sửa/xóa tài liệu của người khác) — dùng chung quyền Approve
  // vì FE chưa có cờ vai trò Admin riêng cho module Quản lý tri thức.
  const isAdmin = canApprove;

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
  const [dinhKems, setDinhKems]         = useState<ITaiLieuDinhKem[]>([]);

  // form
  const [formOpen, setFormOpen]         = useState(false);
  const [formMode, setFormMode]         = useState<'create' | 'edit'>('create');
  const [formLoading, setFormLoading]   = useState(false);
  const [form] = Form.useForm();

  // trường "Thuộc ý tưởng nào" — tìm kiếm bất đồng bộ, không bắt buộc
  const [ideaOptions, setIdeaOptions]   = useState<{ value: string; label: string }[]>([]);
  const [ideaSearching, setIdeaSearching] = useState(false);
  const searchIdeaOptions = useMemo(
    () => debounce((keyword: string) => {
      setIdeaSearching(true);
      searchIdeas({ pageNumber: 1, pageSize: 20, keyword })
        .then(res => {
          const list = (res?.data as any)?.data ?? [];
          setIdeaOptions(list.map((it: any) => ({
            value: it.id,
            label: it.code ? `${it.code} - ${it.title}` : it.title,
          })));
        })
        .catch(() => {})
        .finally(() => setIdeaSearching(false));
    }, 500),
    []
  );

  // file upload
  const [uploadFile, setUploadFile]     = useState<RcFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]       = useState(false);
  const [extraFiles, setExtraFiles]     = useState<RcFile[]>([]);

  // từ chối
  const [tuChoiOpen, setTuChoiOpen]     = useState(false);
  const [tuChoiId, setTuChoiId]         = useState('');
  const [tuChoiForm] = Form.useForm();

  // nộp kiểm duyệt
  const [nopOpen, setNopOpen]           = useState(false);
  const [nopId, setNopId]               = useState('');
  const [nopForm] = Form.useForm();

  // cấu hình quy trình kiểm duyệt/phê duyệt
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowSaving, setWorkflowSaving] = useState(false);
  const [workflowReviewerLoading, setWorkflowReviewerLoading] = useState(false);
  const [workflowConfig, setWorkflowConfig] = useState<IKhoTriThucWorkflowConfig>(DEFAULT_WORKFLOW_CONFIG);
  const [workflowReviewerOptions, setWorkflowReviewerOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [workflowForm] = Form.useForm();

  // chia sẻ
  const [shareOpen, setShareOpen]       = useState(false);
  const [shareTarget, setShareTarget]   = useState<ITaiLieu | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareForm] = Form.useForm();

  // deep-link: ?taiLieuId=xxx → mở thẳng chi tiết tài liệu được chia sẻ
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const sharedId = searchParams.get('taiLieuId');
    if (sharedId) {
      openDetail(sharedId);
      // Xóa param để tránh mở lại khi refresh state
      searchParams.delete('taiLieuId');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openShare = (item: ITaiLieu) => {
    setShareTarget(item);
    shareForm.resetFields();
    setShareOpen(true);
  };

  const handleCopyLink = () => {
    if (!shareTarget) return;
    navigator.clipboard.writeText(getTaiLieuShareLink(shareTarget.id))
      .then(() => message.success('Đã sao chép liên kết!'));
  };

  const handleShare = async () => {
    if (!shareTarget) return;
    try {
      const values = await shareForm.validateFields();
      const ids: string[] = (values.nguoiNhanIds ?? [])
        .map((v: any) => v?.value ?? v)
        .filter(Boolean);
      if (ids.length === 0) { message.error('Chọn ít nhất một người nhận'); return; }
      setShareLoading(true);
      const res = await chiaSeTaiLieu(shareTarget.id, { nguoiNhanIds: ids, loiNhan: values.loiNhan });
      const err = getApiError(res);
      if (err) { message.error(err); return; }
      message.success('Đã chia sẻ — người nhận sẽ nhận được thông báo');
      setShareOpen(false);
    } catch (e: any) { if (!e?.errorFields) message.error('Lỗi khi chia sẻ'); }
    finally { setShareLoading(false); }
  };

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

  const loadWorkflowConfig = useCallback(async () => {
    try {
      setWorkflowLoading(true);
      const res = await getKhoTriThucWorkflowConfig();
      const err = getApiError(res);
      if (err) {
        message.error(err);
        setWorkflowConfig(DEFAULT_WORKFLOW_CONFIG);
        return;
      }

      const data = safeItem<IKhoTriThucWorkflowConfig>(res);
      setWorkflowConfig({
        nguoiKiemDuyetMacDinhUserIds: data?.nguoiKiemDuyetMacDinhUserIds ?? [],
        batBuocChiDinhNguoiKiemDuyet: !!data?.batBuocChiDinhNguoiKiemDuyet,
        batBuocHanXuLy: !!data?.batBuocHanXuLy,
        macDinhHanXuLyGio: data?.macDinhHanXuLyGio ?? DEFAULT_WORKFLOW_CONFIG.macDinhHanXuLyGio,
      });
    } catch {
      setWorkflowConfig(DEFAULT_WORKFLOW_CONFIG);
    } finally {
      setWorkflowLoading(false);
    }
  }, []);

  const loadWorkflowReviewerOptions = useCallback(async () => {
    try {
      setWorkflowReviewerLoading(true);
      const res = await requestPOST<IPaginationResponse<IUserDetails[]>>('users/search', {
        pageNumber: 1,
        pageSize: 1000,
        keyword: null,
      }, 'neutral');

      const options = (res.data?.data ?? []).map(u => ({
        value: u.id,
        label: `${u.fullName || u.userName || u.id}${u.userName ? ` (${u.userName})` : ''}`,
      }));
      setWorkflowReviewerOptions(options);
    } catch {
      setWorkflowReviewerOptions([]);
    } finally {
      setWorkflowReviewerLoading(false);
    }
  }, []);

  const openWorkflowConfig = async () => {
    setWorkflowOpen(true);
    await Promise.all([loadWorkflowConfig(), loadWorkflowReviewerOptions()]);
  };

  const handleSaveWorkflowConfig = async () => {
    try {
      const values = await workflowForm.validateFields();
      const nextConfig: IKhoTriThucWorkflowConfig = {
        nguoiKiemDuyetMacDinhUserIds: values.nguoiKiemDuyetMacDinhUserIds ?? [],
        batBuocChiDinhNguoiKiemDuyet: !!values.batBuocChiDinhNguoiKiemDuyet,
        batBuocHanXuLy: !!values.batBuocHanXuLy,
        macDinhHanXuLyGio: values.macDinhHanXuLyGio ?? null,
      };

      setWorkflowSaving(true);
      const res = await saveKhoTriThucWorkflowConfig(nextConfig);
      const err = getApiError(res);
      if (err) {
        message.error(err);
        return;
      }

      setWorkflowConfig(nextConfig);
      message.success('Đã lưu cấu hình quy trình kiểm duyệt.');
      setWorkflowOpen(false);
    } catch (e: any) {
      if (!e?.errorFields) {
        message.error('Không lưu được cấu hình quy trình.');
      }
    } finally {
      setWorkflowSaving(false);
    }
  };

  // ── Dữ liệu cho các ô lọc bổ sung (Lĩnh vực KHCN, Đơn vị, Tags) ─────────────
  const [linhVucOptions, setLinhVucOptions] = useState<{ id: string; ten: string }[]>([]);
  const [donViOptions, setDonViOptions] = useState<{ id: string; name: string }[]>([]);
  const [tagOptions, setTagOptions] = useState<ITag[]>([]);

  useEffect(() => {
    requestPOST<any>('LinhVucKHCNs/search', { pageNumber: 1, pageSize: 200 })
      .then(res => setLinhVucOptions(safeList<any>(res).map((x: any) => ({ id: x.id, ten: x.ten ?? x.name ?? '' }))))
      .catch(() => {});
    searchOrganizationUnits({ pageNumber: 1, pageSize: 200 } as any)
      .then(res => setDonViOptions(safeList<any>(res).map((x: any) => ({ id: x.id, name: x.name ?? x.ten ?? '' }))))
      .catch(() => {});
    searchTags({ pageNumber: 1, pageSize: 200 })
      .then(res => setTagOptions(safeList<ITag>(res)))
      .catch(() => {});
  }, []);

  // ── Cây thư mục tri thức ────────────────────────────────────────────────────
  const [folders, setFolders] = useState<IThuMucTaiLieu[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all'); // 'all' | 'none' | folderId
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<'create' | 'edit'>('create');
  const [folderForm] = Form.useForm();

  const loadFolders = useCallback(async () => {
    try {
      const res = await getThuMucTree();
      setFolders(safeList<IThuMucTaiLieu>(res));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadFolders(); }, [loadFolders]);

  /** Dựng cây antd từ danh sách phẳng */
  const buildTreeNodes = (parentId: string | null): DataNode[] =>
    folders
      .filter(f => (f.thuMucChaId ?? null) === parentId)
      .map(f => ({
        key: f.id,
        title: (
          <span>
            {f.ten}
            {f.soTaiLieu > 0 && <span className="text-muted fs-9 ms-1">({f.soTaiLieu})</span>}
          </span>
        ),
        icon: <i className="fa-regular fa-folder text-warning" />,
        children: buildTreeNodes(f.id),
      }));

  const treeData: DataNode[] = [
    {
      key: 'all',
      title: <span className="fw-semibold">Tất cả tài liệu</span>,
      icon: <i className="fa-regular fa-books text-primary" />,
    },
    ...buildTreeNodes(null),
    {
      key: 'none',
      title: <span className="text-muted">Chưa phân loại</span>,
      icon: <i className="fa-regular fa-folder-open text-muted" />,
    },
  ];

  /** TreeSelect data cho form chọn thư mục */
  const buildSelectNodes = (parentId: string | null): any[] =>
    folders
      .filter(f => (f.thuMucChaId ?? null) === parentId)
      .map(f => ({ title: f.ten, value: f.id, children: buildSelectNodes(f.id) }));

  const onSelectFolder = (keys: React.Key[]) => {
    const key = (keys[0] as string) ?? 'all';
    setSelectedFolder(key);
    const req: ISearchTaiLieuRequest = {
      ...searchReq,
      pageNumber: 1,
      thuMucId: key !== 'all' && key !== 'none' ? key : null,
      chuaPhanLoai: key === 'none' ? true : null,
    };
    setSearchReq(req);
    loadItems(req);
  };

  const openFolderCreate = () => {
    setFolderModalMode('create');
    folderForm.resetFields();
    // Nếu đang chọn 1 thư mục → mặc định tạo thư mục con bên trong
    if (selectedFolder !== 'all' && selectedFolder !== 'none') {
      folderForm.setFieldsValue({ thuMucChaId: selectedFolder });
    }
    setFolderModalOpen(true);
  };

  const openFolderEdit = () => {
    const f = folders.find(x => x.id === selectedFolder);
    if (!f) return;
    setFolderModalMode('edit');
    folderForm.setFieldsValue({ id: f.id, ten: f.ten, moTa: f.moTa, thuMucChaId: f.thuMucChaId ?? undefined });
    setFolderModalOpen(true);
  };

  const submitFolder = async () => {
    try {
      const values = await folderForm.validateFields();
      if (folderModalMode === 'create') {
        const res = await createThuMuc({ ten: values.ten, moTa: values.moTa, thuMucChaId: values.thuMucChaId ?? null });
        const err = getApiError(res);
        if (err) { message.error(err); return; }
        message.success('Đã tạo thư mục');
      } else {
        const res = await updateThuMuc(values.id, { ...values, thuMucChaId: values.thuMucChaId ?? null });
        const err = getApiError(res);
        if (err) { message.error(err); return; }
        message.success('Đã cập nhật thư mục');
      }
      setFolderModalOpen(false);
      loadFolders();
    } catch (e: any) { if (!e?.errorFields) message.error('Lỗi'); }
  };

  const handleDeleteFolder = async () => {
    if (selectedFolder === 'all' || selectedFolder === 'none') return;
    const res = await deleteThuMuc(selectedFolder);
    const err = getApiError(res);
    if (err) { message.error(err); return; }
    message.success('Đã xóa thư mục');
    setSelectedFolder('all');
    onSelectFolder(['all']);
    loadFolders();
  };

  useEffect(() => { loadItems(); }, []);
  useEffect(() => { if (activeTab === 'ranking') loadRanking(); }, [activeTab]);
  useEffect(() => { loadWorkflowConfig(); }, [loadWorkflowConfig]);

  useEffect(() => {
    if (!workflowOpen) return;
    workflowForm.setFieldsValue({
      nguoiKiemDuyetMacDinhUserIds: workflowConfig.nguoiKiemDuyetMacDinhUserIds,
      batBuocChiDinhNguoiKiemDuyet: workflowConfig.batBuocChiDinhNguoiKiemDuyet,
      batBuocHanXuLy: workflowConfig.batBuocHanXuLy,
      macDinhHanXuLyGio: workflowConfig.macDinhHanXuLyGio,
    });
  }, [workflowOpen, workflowConfig, workflowForm]);

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
  const onChiGiaoChoToiChange = (checked: boolean) => {
    const req = { ...searchReq, nguoiKiemDuyetId: checked ? currentUser?.id : null, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onTacGiaChange = (v: any) => {
    const req = { ...searchReq, tacGiaId: v ?? null, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onLinhVucChange = (v: any) => {
    const req = { ...searchReq, linhVucKHCNId: v ?? null, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onDonViFilterChange = (v: any) => {
    const req = { ...searchReq, donViId: v ?? null, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onNguonChange = (v: any) => {
    const req = { ...searchReq, loaiNguonThamChieu: v ?? null, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onTagsFilterChange = (v: string[]) => {
    const req = { ...searchReq, tagIds: v ?? [], pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const onQuaHanChange = (checked: boolean) => {
    const req = { ...searchReq, quaHan: checked ? true : null, pageNumber: 1 };
    setSearchReq(req); loadItems(req);
  };
  const [filterResetKey, setFilterResetKey] = useState(0);
  const onClearFilters = () => {
    const req: ISearchTaiLieuRequest = { ...DEFAULT_SEARCH, thuMucId: searchReq.thuMucId, chuaPhanLoai: searchReq.chuaPhanLoai };
    setSearchReq(req); loadItems(req);
    setFilterResetKey(k => k + 1); // remount UserSelect (bỏ chọn tác giả)
  };
  const hasExtraFilters = !!(searchReq.keyword || searchReq.loaiTaiLieu || searchReq.trangThai
    || searchReq.tacGiaId || searchReq.linhVucKHCNId || searchReq.donViId || searchReq.loaiNguonThamChieu
    || (searchReq.tagIds && searchReq.tagIds.length > 0) || searchReq.nguoiKiemDuyetId || searchReq.quaHan);
  const onPageChange = (pg: number) => {
    const req = { ...searchReq, pageNumber: pg };
    setSearchReq(req); loadItems(req);
  };

  // ── Detail
  const openDetail = async (id: string) => {
    setDetailOpen(true); setDetailLoading(true);
    try {
      const res = await getTaiLieu(id);
      const normalized = normalizeTL(safeItem<any>(res));
      setDetail(normalized);
      setItems(prev => prev.map(it => it.id === id ? { ...it, luotXem: (it.luotXem ?? 0) + 1 } : it));
      const vRes = await searchPhienBans({ taiLieuId: id, pageNumber: 1, pageSize: 20, orderBy: ['soPhienBan desc'] });
      setVersions(safeList<any>(vRes));
      const dkRes = await searchTaiLieuDinhKems({ taiLieuId: id, pageNumber: 1, pageSize: 50 });
      setDinhKems(safeList<any>(dkRes).map(normalizeDinhKem));
    } catch { message.error('Không tải được chi tiết tài liệu'); }
    finally { setDetailLoading(false); }
  };

  const handleDeleteDinhKem = async (dkId: string) => {
    try {
      await deleteTaiLieuDinhKem(dkId);
      message.success('Đã xóa đính kèm');
      if (detail) {
        const dkRes = await searchTaiLieuDinhKems({ taiLieuId: detail.id, pageNumber: 1, pageSize: 50 });
        setDinhKems(safeList<any>(dkRes).map(normalizeDinhKem));
      }
    } catch { message.error('Không xóa được đính kèm'); }
  };

  // ── Form
  const openCreate = () => {
    setFormMode('create'); form.resetFields();
    setUploadFile(null); setUploadProgress(0); setExtraFiles([]);
    setIdeaOptions([]);
    form.setFieldsValue({ loaiTaiLieu: LoaiTaiLieu.HuongDan });
    setFormOpen(true);
  };
  const openEdit = (item: ITaiLieu) => {
    setFormMode('edit'); form.resetFields();
    setUploadFile(null); setUploadProgress(0); setExtraFiles([]);
    setIdeaOptions(item.ideaId ? [{ value: item.ideaId, label: item.tenYTuong || item.ideaId }] : []);
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
        loaiNguonThamChieu: values.loaiNguonThamChieu ?? null,
        tenNguonThamChieu: values.loaiNguonThamChieu ? (values.tenNguonThamChieu || null) : null,
        nguonThamChieuId: values.loaiNguonThamChieu ? (values.nguonThamChieuId || null) : null,
        thuMucId: values.thuMucId ?? null,
        ideaId: values.ideaId ?? null,
        tags,
        duongDanLuuTru: duongDanLuuTru || null,
        tenGoc: tenGoc || null,
        kichThuocBytes: kichThuocBytes || null,
        mimeType: mimeType || null,
      };

      let taiLieuId: string | null = null;
      if (formMode === 'create') {
        const res = await createTaiLieu(payload);
        taiLieuId = safeItem<string>(res);
        message.success('Tạo tài liệu thành công');
      } else {
        const editId = form.getFieldValue('id');
        await updateTaiLieu(editId, { ...payload, id: editId, capNhatNguonThamChieu: true, capNhatThuMuc: true, capNhatIdea: true });
        taiLieuId = editId;
        message.success('Cập nhật thành công');
      }

      // Upload các file đính kèm bổ sung (IV.1.4 — nhiều định dạng cho một tài liệu)
      if (taiLieuId && extraFiles.length > 0) {
        let failed = 0;
        for (const f of extraFiles) {
          try {
            const uploaded = await uploadTaiLieuFile(f);
            if (!uploaded) { failed++; continue; }
            await createTaiLieuDinhKem({
              taiLieuId,
              duongDanLuuTru: uploaded.filePath,
              tenGoc: uploaded.originalName ?? uploaded.fileName ?? f.name,
              kichThuocBytes: uploaded.fileSize ?? f.size,
              mimeType: f.type || 'application/octet-stream',
            });
          } catch { failed++; }
        }
        if (failed > 0) message.warning(`${failed} file đính kèm upload thất bại`);
      }

      setFormOpen(false); loadItems(); loadFolders();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error('Có lỗi xảy ra');
    } finally { setFormLoading(false); setUploading(false); }
  };

  // ── Workflow actions
  const openNop = (id: string) => {
    setNopId(id);
    nopForm.resetFields();
    const defaultReviewerId = workflowConfig.nguoiKiemDuyetMacDinhUserIds.length === 1
      ? workflowConfig.nguoiKiemDuyetMacDinhUserIds[0]
      : undefined;
    nopForm.setFieldsValue({
      nguoiKiemDuyetId: defaultReviewerId,
    });
    setNopOpen(true);
  };
  const handleNop = async () => {
    try {
      const { nguoiKiemDuyetId } = await nopForm.validateFields();
      const res = await nopKiemDuyetTaiLieu(nopId, nguoiKiemDuyetId, undefined);
      const err = getApiError(res);
      if (err) { message.error(err); return; }
      message.success('Đã nộp kiểm duyệt'); setNopOpen(false);
      loadItems(); if (detail?.id === nopId) openDetail(nopId);
    }
    catch (e: any) { if (!e?.errorFields) message.error('Không nộp được'); }
  };
  const handlePheDuyet = async (id: string) => {
    try {
      const res = await pheDuyetTaiLieu(id);
      const err = getApiError(res);
      if (err) { message.error(err); return; }
      message.success('Đã phê duyệt & xuất bản'); loadItems(); if (detail?.id === id) openDetail(id);
    }
    catch { message.error('Không phê duyệt được'); }
  };
  const openTuChoi = (id: string) => { setTuChoiId(id); tuChoiForm.resetFields(); setTuChoiOpen(true); };
  const handleTuChoi = async () => {
    try {
      const { lyDo } = await tuChoiForm.validateFields();
      const res = await tuChoiTaiLieu({ id: tuChoiId, lyDo });
      const err = getApiError(res);
      if (err) { message.error(err); return; }
      message.success('Đã từ chối tài liệu'); setTuChoiOpen(false);
      loadItems(); if (detail?.id === tuChoiId) openDetail(tuChoiId);
    } catch {}
  };
  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTaiLieu(id);
      const err = getApiError(res);
      if (err) { message.error(err); return; }
      message.success('Đã xóa'); loadItems(); loadFolders();
    }
    catch { message.error('Không xóa được'); }
  };

  // ── Download
  const handleDownload = (id: string, tenGocFile?: string) => {
    const url = getTaiLieuDownloadUrl(id);
    const a = document.createElement('a'); a.href = url;
    a.download = tenGocFile ?? 'tai-lieu'; a.click();
  };

  const getSelectedFileUrl = (file: RcFile | UploadFile) => {
    if ((file as UploadFile).url) return (file as UploadFile).url as string;
    if ('originFileObj' in file && file.originFileObj) {
      return window.URL.createObjectURL(file.originFileObj as Blob);
    }
    return '';
  };

  const renderSelectedFileActions = (file: RcFile | UploadFile) => {
    const href = getSelectedFileUrl(file);
    if (!href) return null;

    return (
      <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
        <Button
          size="small"
          type="text"
          icon={<i className="fa-regular fa-eye" />}
          onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
          aria-label="Xem file"
          title="Xem file"
        />
        <Button
          size="small"
          type="text"
          icon={<i className="fa-regular fa-download" />}
          href={href}
          target="_blank"
          rel="noreferrer"
          download={(file as UploadFile).name ?? 'tai-lieu'}
          aria-label="Tải xuống file"
          title="Tải xuống file"
        />
      </div>
    );
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
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-2 bg-light"
                style={{ width: 42, height: 42, flexShrink: 0 }}>
                {item.duongDanLuuTru || item.tenGoc
                  ? <i className={`fa-regular ${getFileIcon(item.mimeType)} fs-4`} />
                  : item.urlNgoai
                  ? <i className="fa-regular fa-link text-info fs-4" />
                  : <i className="fa-regular fa-file-lines text-muted fs-4" />
                }
              </div>
              <div className="d-flex flex-column gap-1">
                <Tag color={LOAI_COLOR[item.loaiTaiLieu]} style={{ margin: 0, width: 'fit-content' }}>
                  {LOAI_LABEL[item.loaiTaiLieu]}
                </Tag>
                {item.loaiNguonThamChieu && (
                  <span className="text-muted fs-9">
                    <i className="fa-regular fa-diagram-project me-1" />
                    {NGUON_LABEL[item.loaiNguonThamChieu]}{item.tenNguonThamChieu ? `: ${item.tenNguonThamChieu}` : ''}
                  </span>
                )}
              </div>
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

          {/* Author + date */}
          <div className="text-muted fs-8 mb-2 d-flex align-items-center gap-2">
            <i className="fa-regular fa-user" />
            <span>{item.tacGia?.hoTen ?? '—'}</span>
            {item.createdOn && (
              <>
                <span>·</span>
                <span>{new Date(item.createdOn).toLocaleDateString('vi-VN')}</span>
              </>
            )}
          </div>

          {item.trangThai === TrangThaiTaiLieu.ChoXetDuyet && (item.nguoiKiemDuyet || item.hanXuLy) && (
            <div className="text-muted fs-8 mb-2 d-flex align-items-center gap-2 flex-wrap">
              {item.nguoiKiemDuyet && (
                <span><i className="fa-regular fa-user-check me-1" />{item.nguoiKiemDuyet.hoTen}</span>
              )}
              {item.hanXuLy && (
                <Tag color={dayjs(item.hanXuLy).isBefore(dayjs()) ? 'red' : 'default'} style={{ margin: 0 }}>
                  Hạn: {dayjs(item.hanXuLy).format('DD/MM HH:mm')}
                </Tag>
              )}
            </div>
          )}

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
              {item.trangThai === TrangThaiTaiLieu.DaXuatBan && (
                <Tooltip title="Chia sẻ">
                  <Button size="small" onClick={() => openShare(item)}>
                    <i className="fa-regular fa-share-nodes" />
                  </Button>
                </Tooltip>
              )}
              {(isAdmin || item.trangThai === TrangThaiTaiLieu.NhapLieu) && (
                <Tooltip title="Chỉnh sửa">
                  <Button size="small" onClick={() => openEdit(item)}>
                    <i className="fa-regular fa-pen" />
                  </Button>
                </Tooltip>
              )}
              {item.trangThai === TrangThaiTaiLieu.NhapLieu && (
                <Tooltip title="Nộp kiểm duyệt">
                  <Button size="small" type="primary" ghost onClick={() => openNop(item.id)}>
                    <i className="fa-regular fa-paper-plane" />
                  </Button>
                </Tooltip>
              )}
              {canApprove && item.trangThai === TrangThaiTaiLieu.ChoXetDuyet && (
                <>
                  <Button size="small" type="primary" onClick={() => handlePheDuyet(item.id)}>Duyệt</Button>
                  <Button size="small" danger onClick={() => openTuChoi(item.id)}>Từ chối</Button>
                </>
              )}
              {isAdmin && (
                <Popconfirm title="Xóa tài liệu này?" onConfirm={() => handleDelete(item.id)}>
                  <Tooltip title="Xóa">
                    <Button size="small" danger><i className="fa-regular fa-trash" /></Button>
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const totalPages = Math.ceil(total / searchReq.pageSize);
  const maxViews = Math.max(...ranking.map(r => r.luotXem ?? 0), 1);

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Thư viện tài liệu</PageTitle>

      <Content>
        {/* Hero header */}
        <div className="mb-5 overflow-hidden shadow-sm"
          style={{
            backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
            backgroundColor: '#1e3a8a',
            borderRadius: 12,
          }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 px-6 py-6">
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center justify-content-center rounded-3"
                style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <i className="fa-regular fa-book-open fs-2" style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#fff' }}>Thư viện tài liệu ĐMST</h3>
                <span className="fs-7" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Hướng dẫn · Playbook · Biểu mẫu · Nghiên cứu · Case study · Bài học kinh nghiệm
                </span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {canApprove && (
                <Button
                  size="large"
                  onClick={openWorkflowConfig}
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.35)' }}
                  icon={<i className="fa-regular fa-diagram-project me-1" />}
                >
                  Thiết lập quy trình
                </Button>
              )}
              <Button size="large" onClick={openCreate}
                style={{ background: '#fff', color: '#1e3a8a', fontWeight: 600, border: 'none' }}
                icon={<i className="fa-regular fa-plus me-1" />}>
                Thêm tài liệu
              </Button>
            </div>
          </div>
        </div>

        {/* Tab pills */}
        <div className="d-inline-flex bg-light rounded-pill p-1 gap-1 mb-5">
          <Button
            shape="round"
            type={activeTab === 'danh-sach' ? 'primary' : 'text'}
            onClick={() => setActiveTab('danh-sach')}
            icon={<i className="fa-regular fa-folder-open me-1" />}
          >
            Danh sách
          </Button>
          <Button
            shape="round"
            type={activeTab === 'ranking' ? 'primary' : 'text'}
            onClick={() => setActiveTab('ranking')}
            icon={<i className="fa-regular fa-trophy me-1" />}
          >
            Xếp hạng
          </Button>
        </div>

        {/* ── Tab: Danh sách ─────────────────────────────────────────────────── */}
        {activeTab === 'danh-sach' && (
          <div className="d-flex gap-4" style={{ alignItems: 'flex-start' }}>
            {/* ── Cây thư mục tri thức (như Windows Explorer) ── */}
            <div style={{ width: 264, flexShrink: 0 }}>
              <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                    <span className="fw-bold text-gray-600 fs-8 text-uppercase" style={{ letterSpacing: '0.06em' }}>
                      <i className="fa-regular fa-folder-tree me-1" />Thư mục
                    </span>
                    {canApprove && (
                      <div className="d-flex gap-1">
                        <Tooltip title="Thư mục mới">
                          <Button size="small" type="text" icon={<i className="fa-regular fa-folder-plus" />}
                            onClick={openFolderCreate} />
                        </Tooltip>
                        {selectedFolder !== 'all' && selectedFolder !== 'none' && (
                          <>
                            <Tooltip title="Đổi tên / di chuyển">
                              <Button size="small" type="text" icon={<i className="fa-regular fa-pen" />}
                                onClick={openFolderEdit} />
                            </Tooltip>
                            <Popconfirm title="Xóa thư mục này? (chỉ xóa được khi rỗng)" onConfirm={handleDeleteFolder}>
                              <Button size="small" type="text" danger icon={<i className="fa-regular fa-trash" />} />
                            </Popconfirm>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <Tree
                    showIcon
                    blockNode
                    defaultExpandAll
                    selectedKeys={[selectedFolder]}
                    onSelect={onSelectFolder}
                    treeData={treeData}
                  />
                </div>
              </div>
            </div>

            {/* ── Danh sách tài liệu ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <div className="card border-0 shadow-sm mb-5">
              <div className="card-body py-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                  <div className="d-flex gap-2 flex-wrap">
                    <Input.Search key={filterResetKey} placeholder="Tìm kiếm tài liệu..." onSearch={onSearch} style={{ width: 260 }} allowClear defaultValue={searchReq.keyword ?? ''} />
                    <Select placeholder="Loại tài liệu" allowClear value={searchReq.loaiTaiLieu ?? undefined} onChange={onLoaiChange} style={{ width: 170 }}>
                      {Object.entries(LOAI_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                    </Select>
                    <Select placeholder="Trạng thái" allowClear value={searchReq.trangThai ?? undefined} onChange={onTrangThaiChange} style={{ width: 150 }}>
                      {Object.entries(TRANG_THAI_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                    </Select>
                  </div>
                  <div className="text-muted fs-8">
                    <span className="badge badge-light-primary me-2">{total} tài liệu</span>
                    Trang {searchReq.pageNumber}/{Math.max(1, totalPages)}
                  </div>
                </div>

                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <UserSelect
                    key={filterResetKey}
                    placeholder="Tác giả"
                    allowClear
                    style={{ width: 190 }}
                    onUserIdChange={onTacGiaChange}
                  />
                  <Select
                    placeholder="Lĩnh vực KHCN"
                    allowClear showSearch optionFilterProp="children"
                    style={{ width: 190 }}
                    value={searchReq.linhVucKHCNId ?? undefined}
                    onChange={onLinhVucChange}
                  >
                    {linhVucOptions.map(lv => <Option key={lv.id} value={lv.id}>{lv.ten}</Option>)}
                  </Select>
                  <Select
                    placeholder="Đơn vị"
                    allowClear showSearch optionFilterProp="children"
                    style={{ width: 190 }}
                    value={searchReq.donViId ?? undefined}
                    onChange={onDonViFilterChange}
                  >
                    {donViOptions.map(dv => <Option key={dv.id} value={dv.id}>{dv.name}</Option>)}
                  </Select>
                  <Select
                    placeholder="Nguồn tham chiếu"
                    allowClear
                    style={{ width: 170 }}
                    value={searchReq.loaiNguonThamChieu ?? undefined}
                    onChange={onNguonChange}
                  >
                    {Object.entries(NGUON_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                  </Select>
                  <Select
                    mode="multiple"
                    placeholder="Tags"
                    allowClear showSearch optionFilterProp="children"
                    style={{ minWidth: 190, maxWidth: 320 }}
                    value={searchReq.tagIds ?? []}
                    onChange={onTagsFilterChange}
                    maxTagCount="responsive"
                  >
                    {tagOptions.map(t => <Option key={t.id} value={t.id}>{t.ten}</Option>)}
                  </Select>
                  <Checkbox checked={!!searchReq.quaHan} onChange={e => onQuaHanChange(e.target.checked)}>
                    Quá hạn kiểm duyệt
                  </Checkbox>
                  {canApprove && (
                    <Checkbox
                      checked={!!searchReq.nguoiKiemDuyetId}
                      onChange={e => onChiGiaoChoToiChange(e.target.checked)}
                    >
                      Chỉ giao cho tôi
                    </Checkbox>
                  )}
                  {hasExtraFilters && (
                    <Button size="small" type="link" onClick={onClearFilters}>
                      <i className="fa-regular fa-filter-circle-xmark me-1" />Xóa lọc
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid */}
            <Spin spinning={loading}>
              {items.length === 0 && !loading ? (
                <div className="text-center py-10">
                  <Empty description={
                    <div>
                      <div className="text-gray-600 mb-3">Chưa có tài liệu nào. Hãy là người đầu tiên chia sẻ tri thức!</div>
                      <Button type="primary" icon={<i className="fa-regular fa-plus me-1" />} onClick={openCreate}>
                        Thêm tài liệu ngay
                      </Button>
                    </div>
                  } />
                </div>
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
            </div>
          </div>
        )}

        {/* ── Tab: Xếp hạng ──────────────────────────────────────────────────── */}
        {activeTab === 'ranking' && (
          <Spin spinning={rankLoading}>
            {ranking.length === 0 && !rankLoading ? (
              <Empty description="Chưa có dữ liệu xếp hạng" className="py-10" />
            ) : (
              <>
                {/* Podium top 3 */}
                <div className="row g-4 mb-5">
                  {ranking.slice(0, 3).map((item, idx) => {
                    const medalColor = ['#f59e0b', '#94a3b8', '#cd7f32'][idx];
                    const cardBg = [
                      'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                      'linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)',
                      'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    ][idx];
                    return (
                      <div key={item.id} className="col-md-4">
                        <div className="shadow-sm h-100"
                          style={{
                            backgroundImage: cardBg,
                            backgroundColor: '#fff',
                            borderRadius: 12,
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
                          }}
                          onClick={() => openDetail(item.id)}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
                        >
                          <div className="p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm"
                                style={{ width: 44, height: 44 }}>
                                <i className="fa-solid fa-trophy fs-4" style={{ color: medalColor }} />
                              </div>
                              <span className="badge badge-light fw-bold fs-7">#{idx + 1}</span>
                            </div>
                            <div className="fw-bold text-gray-800 mb-1"
                              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40 }}>
                              {item.tieuDe}
                            </div>
                            <div className="text-muted fs-8 mb-3">
                              <i className="fa-regular fa-user me-1" />{item.tacGia?.hoTen ?? '—'}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <Tag color={LOAI_COLOR[item.loaiTaiLieu]} style={{ margin: 0 }}>{LOAI_LABEL[item.loaiTaiLieu]}</Tag>
                              <span className="badge badge-light-primary fw-bold">
                                <i className="fa-regular fa-eye me-1" />{item.luotXem ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Table for the rest */}
                {ranking.length > 3 && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                      <table className="table table-row-dashed table-row-gray-300 align-middle mb-0">
                        <thead>
                          <tr className="text-muted fw-semibold fs-7 text-uppercase">
                            <th className="ps-4" style={{ width: 50 }}>#</th>
                            <th>Tài liệu</th>
                            <th>Loại</th>
                            <th>Tác giả</th>
                            <th className="text-end pe-4" style={{ width: 200 }}>Lượt xem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ranking.slice(3).map((item, i) => (
                            <tr key={item.id} className="cursor-pointer" onClick={() => openDetail(item.id)}>
                              <td className="ps-4"><span className="text-muted fw-semibold">{i + 4}</span></td>
                              <td>
                                <div className="fw-semibold text-gray-800">{item.tieuDe}</div>
                                <div className="text-muted fs-8">{(item.tags ?? []).slice(0, 2).join(' · ')}</div>
                              </td>
                              <td><Tag color={LOAI_COLOR[item.loaiTaiLieu]}>{LOAI_LABEL[item.loaiTaiLieu]}</Tag></td>
                              <td className="text-muted fs-7">{item.tacGia?.hoTen ?? '—'}</td>
                              <td className="text-end pe-4">
                                <div className="d-flex align-items-center justify-content-end gap-2">
                                  <Progress
                                    percent={Math.round(((item.luotXem ?? 0) / maxViews) * 100)}
                                    size="small" showInfo={false} style={{ width: 90 }}
                                  />
                                  <span className="badge badge-light-primary fw-bold">
                                    <i className="fa-regular fa-eye me-1" />{item.luotXem ?? 0}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </Spin>
        )}
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
          detail && (
            <Button key="share" onClick={() => openShare(detail)}>
              <i className="fa-regular fa-share-nodes me-1" />Chia sẻ
            </Button>
          ),
          detail && (isAdmin || detail.trangThai === TrangThaiTaiLieu.NhapLieu) && (
            <Button key="edit" onClick={() => { setDetailOpen(false); openEdit(detail); }}>
              <i className="fa-regular fa-pen me-1" />Chỉnh sửa
            </Button>
          ),
          detail?.trangThai === TrangThaiTaiLieu.NhapLieu && (
            <Button key="nop" type="primary" ghost onClick={() => openNop(detail.id)}>
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
                        {detail.trangThai === TrangThaiTaiLieu.ChoXetDuyet && detail.nguoiKiemDuyet && (
                          <div className="col-6">
                            <div className="text-muted fs-8 mb-1">Người kiểm duyệt</div>
                            <div className="fw-semibold">{detail.nguoiKiemDuyet?.hoTen ?? '—'}</div>
                          </div>
                        )}
                        {detail.trangThai === TrangThaiTaiLieu.ChoXetDuyet && detail.hanXuLy && (
                          <div className="col-6">
                            <div className="text-muted fs-8 mb-1">Hạn xử lý</div>
                            <div className="fw-semibold">
                              {dayjs(detail.hanXuLy).format('DD/MM/YYYY HH:mm')}
                              {dayjs(detail.hanXuLy).isBefore(dayjs()) && (
                                <Tag color="red" className="ms-2">Quá hạn</Tag>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {detail.loaiNguonThamChieu && (
                        <div className="mb-4">
                          <div className="text-muted fs-8 mb-1">Nguồn tham chiếu</div>
                          <div>
                            <Tag color="gold">{NGUON_LABEL[detail.loaiNguonThamChieu]}</Tag>
                            <span className="fw-semibold">{detail.tenNguonThamChieu ?? '—'}</span>
                          </div>
                        </div>
                      )}

                      <div className="mb-2">
                        <div className="text-muted fs-8 mb-1">Tags</div>
                        <div>{(detail.tags ?? []).map(t => <Tag key={t} color="blue">{t}</Tag>)}</div>
                      </div>
                    </>
                  ),
                },
                {
                  key: 'dinh-kem',
                  label: <span>Đính kèm <span className="badge badge-light-primary ms-1">{dinhKems.length}</span></span>,
                  children: (
                    dinhKems.length === 0 ? <Empty description="Chưa có đính kèm bổ sung" className="py-6" /> : (
                      <table className="table table-sm table-row-dashed align-middle mb-0">
                        <thead>
                          <tr className="text-muted fw-semibold fs-8">
                            <th>Tên file / Liên kết</th><th>Kích thước</th><th>Ngày tạo</th><th className="text-end">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dinhKems.map(dk => (
                            <tr key={dk.id}>
                              <td className="fs-7">
                                {dk.thongTinFile ? (
                                  <>
                                    <i className={`fa-regular ${getFileIcon(dk.thongTinFile.mimeType)} me-1`} />
                                    {dk.thongTinFile.tenGoc}
                                  </>
                                ) : dk.externalUrl || dk.urlNgoai ? (
                                  <a href={dk.externalUrl ?? dk.urlNgoai ?? undefined} target="_blank" rel="noopener noreferrer">
                                    <i className="fa-regular fa-link me-1" />{dk.externalUrl ?? dk.urlNgoai}
                                  </a>
                                ) : '—'}
                              </td>
                              <td className="text-muted fs-8">{formatBytes(dk.thongTinFile?.kichThuocBytes)}</td>
                              <td className="text-muted fs-8">{dk.createdOn ? new Date(dk.createdOn).toLocaleDateString('vi-VN') : '—'}</td>
                              <td className="text-end">
                                {dk.thongTinFile && (
                                  <Button size="small" type="link"
                                    onClick={() => {
                                      const a = document.createElement('a');
                                      a.href = getTaiLieuDinhKemDownloadUrl(dk.id);
                                      a.download = dk.thongTinFile?.tenGoc ?? 'dinh-kem';
                                      a.click();
                                    }}>
                                    <i className="fa-regular fa-download" />
                                  </Button>
                                )}
                                {isAdmin && (
                                  <Popconfirm title="Xóa đính kèm này?" onConfirm={() => handleDeleteDinhKem(dk.id)}>
                                    <Button size="small" type="link" danger><i className="fa-regular fa-trash" /></Button>
                                  </Popconfirm>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
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
        <Form form={form} layout="vertical">
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

          <Form.Item name="thuMucId" label="Thư mục lưu trữ">
            <TreeSelect
              allowClear
              showSearch
              treeDefaultExpandAll
              placeholder="Chọn thư mục (bỏ trống = Chưa phân loại)"
              treeData={buildSelectNodes(null)}
              treeNodeFilterProp="title"
            />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả nội dung tài liệu..." />
          </Form.Item>

          <Form.Item name="ideaId" label="Thuộc ý tưởng nào">
            <Select
              showSearch
              allowClear
              filterOption={false}
              placeholder="Tìm và chọn ý tưởng liên quan (bỏ trống nếu không có)"
              notFoundContent={ideaSearching ? <Spin size="small" /> : null}
              onSearch={searchIdeaOptions}
              options={ideaOptions}
            />
          </Form.Item>

          <Divider orientation="left" style={{ fontSize: 13, color: '#888' }}>
            Nguồn tham chiếu (dự án / sáng kiến đã triển khai)
          </Divider>

          <Form.Item name="nguonThamChieuId" hidden><Input /></Form.Item>
          <div className="row">
            <div className="col-6">
              <Form.Item name="loaiNguonThamChieu" label="Loại nguồn">
                <Select allowClear placeholder="Không gắn nguồn">
                  {Object.entries(NGUON_LABEL).map(([k, v]) => <Option key={k} value={Number(k)}>{v}</Option>)}
                </Select>
              </Form.Item>
            </div>
            <div className="col-6">
              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) => prev.loaiNguonThamChieu !== cur.loaiNguonThamChieu}
              >
                {({ getFieldValue }) => (
                  <Form.Item
                    name="tenNguonThamChieu"
                    label="Tên nguồn tham chiếu"
                    rules={getFieldValue('loaiNguonThamChieu')
                      ? [{ required: true, message: 'Nhập tên nguồn tham chiếu' }]
                      : []}
                  >
                    <Input
                      placeholder="VD: Dự án ABC giai đoạn 2"
                      disabled={!getFieldValue('loaiNguonThamChieu')}
                      maxLength={1024}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </div>
          </div>

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
            {uploadFile && (
              <div className="mt-2 p-2 border rounded bg-light d-flex align-items-center gap-2 flex-wrap">
                <i className={`fa-regular ${getFileIcon(uploadFile.type)} text-primary`} />
                <span className="fs-7 flex-grow-1">{uploadFile.name}</span>
                <span className="text-muted fs-8">{formatBytes(uploadFile.size)}</span>
                <Tag color="blue" style={{ fontSize: 11 }}>File đã chọn</Tag>
                {renderSelectedFileActions(uploadFile)}
              </div>
            )}

            {/* Đính kèm bổ sung — gộp chung mục Tệp đính kèm */}
            <div className="mt-3">
              <Upload
                multiple
                beforeUpload={(file) => {
                  setExtraFiles(prev => [...prev, file]);
                  return false; // prevent auto-upload
                }}
                onRemove={(file) => {
                  setExtraFiles(prev => prev.filter(f => f.uid !== file.uid));
                }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg,.gif"
                fileList={extraFiles.map(f => ({
                  uid: f.uid,
                  name: f.name,
                  status: 'done',
                  size: f.size,
                  type: f.type,
                } as UploadFile))}
              >
                <Button size="small" icon={<i className="fa-regular fa-paperclip me-1" />}>
                  Chọn thêm file đính kèm
                </Button>
              </Upload>
              {extraFiles.length > 0 && (
                <div className="mt-3 d-flex flex-column gap-2">
                  {extraFiles.map(file => (
                    <div key={file.uid} className="p-2 border rounded bg-light d-flex align-items-center gap-2 flex-wrap">
                      <i className={`fa-regular ${getFileIcon(file.type)} text-primary`} />
                      <span className="fs-7 flex-grow-1">{file.name}</span>
                      <span className="text-muted fs-8">{formatBytes(file.size)}</span>
                      <Tag color="blue" style={{ fontSize: 11 }}>File đính kèm</Tag>
                      {renderSelectedFileActions(file)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Form.Item name="urlNgoai" label="Liên kết ngoài (tuỳ chọn)">
            <Input placeholder="https://..." prefix={<i className="fa-regular fa-link text-muted" />} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Chia sẻ Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={shareOpen}
        onCancel={() => setShareOpen(false)}
        title={
          <span>
            <i className="fa-regular fa-share-nodes me-2 text-primary" />
            Chia sẻ tài liệu
          </span>
        }
        onOk={handleShare}
        okText="Gửi chia sẻ"
        cancelText="Đóng"
        confirmLoading={shareLoading}
      >
        {shareTarget && (
          <>
            <div className="p-3 rounded bg-light mb-4 d-flex align-items-center gap-3">
              <i className={`fa-regular ${getFileIcon(shareTarget.mimeType)} fs-3`} />
              <div className="fw-semibold text-gray-800 flex-grow-1">{shareTarget.tieuDe}</div>
            </div>

            {/* Sao chép liên kết */}
            <div className="d-flex gap-2 mb-4">
              <Input readOnly value={getTaiLieuShareLink(shareTarget.id)} />
              <Button onClick={handleCopyLink} icon={<i className="fa-regular fa-copy me-1" />}>
                Sao chép
              </Button>
            </div>

            <Divider style={{ fontSize: 12, color: '#999' }}>hoặc gửi trực tiếp cho đồng nghiệp</Divider>

            <Form form={shareForm} layout="vertical">
              <Form.Item
                name="nguoiNhanIds"
                label="Người nhận"
                rules={[{ required: true, message: 'Chọn ít nhất một người nhận' }]}
              >
                <UserSelect mode="multiple" placeholder="Tìm và chọn đồng nghiệp..." />
              </Form.Item>
              <Form.Item name="loiNhan" label="Lời nhắn (tuỳ chọn)">
                <TextArea rows={2} maxLength={500} showCount
                  placeholder="VD: Tài liệu này hữu ích cho dự án của nhóm mình..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* ── Thư mục Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={folderModalOpen}
        onCancel={() => setFolderModalOpen(false)}
        title={
          <span>
            <i className="fa-regular fa-folder-plus me-2 text-warning" />
            {folderModalMode === 'create' ? 'Tạo thư mục mới' : 'Đổi tên / di chuyển thư mục'}
          </span>
        }
        onOk={submitFolder}
        okText={folderModalMode === 'create' ? 'Tạo thư mục' : 'Lưu'}
        cancelText="Hủy"
      >
        <Form form={folderForm} layout="vertical">
          <Form.Item name="id" hidden><Input /></Form.Item>
          <Form.Item name="ten" label="Tên thư mục" rules={[{ required: true, message: 'Nhập tên thư mục' }]}>
            <Input placeholder="VD: Playbook chuyển đổi số, Biểu mẫu ĐMST..." maxLength={512} />
          </Form.Item>
          <Form.Item name="thuMucChaId" label="Thư mục cha">
            <TreeSelect
              allowClear
              showSearch
              treeDefaultExpandAll
              placeholder="Bỏ trống = thư mục gốc"
              treeData={buildSelectNodes(null)}
              treeNodeFilterProp="title"
            />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={2} placeholder="Mô tả ngắn về nội dung thư mục..." maxLength={1024} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Từ chối Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={workflowOpen}
        onCancel={() => setWorkflowOpen(false)}
        title="Thiết lập quy trình kiểm duyệt & phê duyệt"
        onOk={handleSaveWorkflowConfig}
        okText="Lưu cấu hình"
        cancelText="Đóng"
        okButtonProps={{ loading: workflowSaving }}
      >
        <Spin spinning={workflowLoading}>
          <Form form={workflowForm} layout="vertical" initialValues={workflowConfig}>
            <Form.Item
              name="nguoiKiemDuyetMacDinhUserIds"
              label="Người kiểm duyệt mặc định"
              extra="Danh sách này được gợi ý khi nộp tài liệu chờ duyệt. Nếu chỉ có 1 người thì hệ thống tự điền sẵn."
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Chọn người kiểm duyệt mặc định"
                options={workflowReviewerOptions}
                loading={workflowReviewerLoading}
                notFoundContent={workflowReviewerLoading ? 'Đang tải người dùng...' : 'Không có dữ liệu người dùng'}
              />
            </Form.Item>

            {/* <Form.Item name="batBuocChiDinhNguoiKiemDuyet" valuePropName="checked">
              <Checkbox>Bắt buộc chỉ định người kiểm duyệt khi nộp tài liệu</Checkbox>
            </Form.Item> */}

            {/* <Form.Item name="batBuocHanXuLy" valuePropName="checked">
              <Checkbox>Bắt buộc thiết lập hạn xử lý trước khi nộp</Checkbox>
            </Form.Item> */}

            <Form.Item
              name="macDinhHanXuLyGio"
              label="Hạn xử lý mặc định (giờ)"
              extra="Áp dụng tự động nếu người nộp chưa nhập hạn xử lý."
            >
              <InputNumber min={1} max={24 * 30} style={{ width: '100%' }} placeholder="Ví dụ: 24" />
            </Form.Item>
          </Form>
        </Spin>
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

      {/* ── Nộp kiểm duyệt Modal ───────────────────────────────────────────── */}
      <Modal
        open={nopOpen} onCancel={() => setNopOpen(false)}
        title="Nộp tài liệu chờ kiểm duyệt" onOk={handleNop} okText="Nộp kiểm duyệt"
      >
        <div className="alert alert-info py-2 px-3 mb-3 fs-8">
          <i className="fa-regular fa-circle-info me-1" />
          Bắt buộc chỉ định người kiểm duyệt trước khi nộp.
        </div>
        <Form form={nopForm} layout="vertical">
          <Form.Item
            name="nguoiKiemDuyetId"
            label="Người kiểm duyệt"
            rules={[{ required: true, message: 'Vui lòng chỉ định người kiểm duyệt.' }]}
          >
            <UserSelect
              placeholder="Chỉ định người kiểm duyệt"
              allowClear
              onChange={(val: any) => nopForm.setFieldValue('nguoiKiemDuyetId', val?.value ?? val)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
