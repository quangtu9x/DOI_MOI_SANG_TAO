// ─────────────────────────────────────────────────────────────────────────────
// Knowledge Hub — API Service Layer
// Base URL prefix: /api/v1/
// Khớp 1-1 với Postman Collection "TD.QLNVKH — Knowledge Hub API v2"
// ─────────────────────────────────────────────────────────────────────────────

import { API_URL, requestGET, requestPOST, requestPUT, requestDELETE, requestUploadFile, requestDownloadFile } from '@/utils/baseAPI';
import type { IAttachmentUploadResult } from '@/models/idea-portal';
import type {
  IPaginationResponse,
  IResult,
  ITag,
  ISearchTagsRequest,
  ICreateTagRequest,
  ITaiLieu,
  ITaiLieuSearchResult,
  ISearchTaiLieuRequest,
  ICreateTaiLieuRequest,
  IUpdateTaiLieuRequest,
  ITuChoiRequest,
  ITaiLieuPhienBan,
  ISearchPhienBanRequest,
  ICreatePhienBanRequest,
  ITaiLieuDinhKem,
  ISearchDinhKemRequest,
  ICreateDinhKemRequest,
  IThuMucTaiLieu,
  IChuyenGia,
  ICreateChuyenGiaRequest,
  IUpdateChuyenGiaRequest,
  ISearchChuyenGiaRequest,
  INhanXetChuyenGia,
  ISearchNhanXetRequest,
  ICreateNhanXetRequest,
  IYeuCauTuVan,
  ISearchTuVanRequest,
  ICreateTuVanRequest,
  ITuChoiTuVanRequest,
  ICongDong,
  ISearchCongDongRequest,
  ICreateCongDongRequest,
  IUpdateCongDongRequest,
  IThanhVien,
  ISearchThanhVienRequest,
  IBaiViet,
  ISearchBaiVietRequest,
  ICreateBaiVietRequest,
  IUpdateBaiVietRequest,
  IBinhLuan,
  ISearchBinhLuanRequest,
  ICreateBinhLuanRequest,
  IUpdateBinhLuanRequest,
  IThichRequest,
  INewsFeedItem,
  IKTDashboardStats,
  IKTLeaderboardTaiLieu,
  IKTLeaderboardChuyenGia,
  IKTLeaderboardCongDong,
  IKTLeaderboardNguoiDung,
  IKTBaoCaoFilter,
  IKTBaoCaoTongHop,
  IKTBaoCaoDongGop,
  IKTBaoCaoTaiLieu,
  IKhoTriThucWorkflowConfig,
} from '@/app/models/knowledge-hub';

// HOST_API đã bao gồm /api/v1/ — KHÔNG thêm prefix v1/ vào các endpoint

// ── 1. Tài Liệu ───────────────────────────────────────────────────────────────

/** Tìm kiếm / lọc tài liệu */
export const searchTaiLieus = (req: ISearchTaiLieuRequest) =>
  requestPOST<IPaginationResponse<ITaiLieu[]>>(`TaiLieus/search`, req);

/** Chi tiết tài liệu — tự tăng LuotXem */
export const getTaiLieu = (id: string) =>
  requestGET<ITaiLieu>(`TaiLieus/${id}`);

/** Tạo tài liệu mới — trạng thái NhapLieu (0) */
export const createTaiLieu = (req: ICreateTaiLieuRequest) =>
  requestPOST<IResult<string>>(`TaiLieus`, req);

/** Cập nhật tài liệu */
export const updateTaiLieu = (id: string, req: IUpdateTaiLieuRequest) =>
  requestPUT<IResult<boolean>>(`TaiLieus/${id}`, req);

/** Nộp kiểm duyệt: NhapLieu → ChoXetDuyet — có thể chỉ định trước người kiểm duyệt và hạn xử lý (giờ) */
export const nopKiemDuyetTaiLieu = (id: string, nguoiKiemDuyetId?: string, hanXuLyGio?: number) =>
  requestPOST<IResult<boolean>>(`TaiLieus/${id}/nop-kiem-duyet`, { id, nguoiKiemDuyetId, hanXuLyGio });

/** Lấy cấu hình quy trình kiểm duyệt/phê duyệt tài liệu tri thức */
export const getKhoTriThucWorkflowConfig = () =>
  requestGET<IResult<IKhoTriThucWorkflowConfig>>(`TaiLieus/quy-trinh-kiem-duyet`);

/** Lưu cấu hình quy trình kiểm duyệt/phê duyệt tài liệu tri thức */
export const saveKhoTriThucWorkflowConfig = (config: IKhoTriThucWorkflowConfig) =>
  requestPOST<IResult<boolean>>('appconfigs/createall', {
    data: [
      {
        key: 'KhoTriThuc_NguoiKiemDuyetMacDinh_UserIds',
        value: (config.nguoiKiemDuyetMacDinhUserIds ?? []).join(','),
        description: 'Danh sach UserId nguoi kiem duyet mac dinh tai lieu tri thuc',
        isActivePortal: false,
      },
      {
        key: 'KhoTriThuc_BatBuocChiDinhNguoiKiemDuyet',
        value: String(!!config.batBuocChiDinhNguoiKiemDuyet),
        description: 'Bat buoc chi dinh nguoi kiem duyet khi nop tai lieu',
        isActivePortal: false,
      },
      {
        key: 'KhoTriThuc_BatBuocHanXuLy',
        value: String(!!config.batBuocHanXuLy),
        description: 'Bat buoc dat han xu ly khi nop tai lieu',
        isActivePortal: false,
      },
      {
        key: 'KhoTriThuc_MacDinhHanXuLy_Gio',
        value: String(config.macDinhHanXuLyGio ?? ''),
        description: 'Han xu ly mac dinh theo gio cho tai lieu nop kiem duyet',
        isActivePortal: false,
      },
    ],
  });

/** Phê duyệt: ChoXetDuyet → DaXuatBan (cần quyền Specialist/Admin) */
export const pheDuyetTaiLieu = (id: string) =>
  requestPOST<IResult<boolean>>(`TaiLieus/${id}/phe-duyet`, {});

/** Từ chối: ChoXetDuyet → TuChoi */
export const tuChoiTaiLieu = (req: ITuChoiRequest) =>
  requestPOST<IResult<boolean>>(`TaiLieus/${req.id}/tu-choi`, req);

/**
 * Tải xuống file tài liệu
 * Trả về URL để trigger download trong browser
 */
export const getTaiLieuDownloadUrl = (id: string): string =>
  `${API_URL}/api/v1/TaiLieus/${id}/download`;

/** Bảng xếp hạng tài liệu (DaXuatBan, sắp xếp LuotXem DESC) */
export const getRankingTaiLieus = (pageNumber = 1, pageSize = 10, linhVucKHCNId?: string, donViId?: string) => {
  const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  if (linhVucKHCNId) params.append('linhVucKHCNId', linhVucKHCNId);
  if (donViId) params.append('donViId', donViId);
  return requestGET<IPaginationResponse<ITaiLieu[]>>(`TaiLieus/ranking?${params}`);
};

/** Xóa tài liệu */
export const deleteTaiLieu = (id: string) =>
  requestDELETE<IResult<boolean>>(`TaiLieus/${id}`);

/** Chia sẻ tài liệu cho đồng nghiệp — người nhận nhận thông báo hệ thống */
export const chiaSeTaiLieu = (id: string, req: { nguoiNhanIds: string[]; loiNhan?: string }) =>
  requestPOST<IResult<boolean>>(`TaiLieus/${id}/chia-se`, { id, ...req });

/** Liên kết chia sẻ mở thẳng tài liệu trong Thư viện */
export const getTaiLieuShareLink = (id: string): string =>
  `${window.location.origin}/doi-moi-sang-tao/kho-tri-thuc/thu-vien?taiLieuId=${id}`;

// ── Thư mục tri thức (cây thư mục) ────────────────────────────────────────────

/** Cây thư mục kèm số tài liệu */
export const getThuMucTree = () =>
  requestGET<IResult<IThuMucTaiLieu[]>>(`ThuMucTaiLieus/tree`);

/** Tạo thư mục (reviewer/admin) */
export const createThuMuc = (req: { ten: string; moTa?: string; thuMucChaId?: string | null; thuTu?: number }) =>
  requestPOST<IResult<string>>(`ThuMucTaiLieus`, req);

/** Đổi tên / di chuyển thư mục */
export const updateThuMuc = (id: string, req: { id: string; ten?: string; moTa?: string; thuMucChaId?: string | null; thuTu?: number }) =>
  requestPUT<IResult<boolean>>(`ThuMucTaiLieus/${id}`, req);

/** Xóa thư mục (chỉ khi rỗng) */
export const deleteThuMuc = (id: string) =>
  requestDELETE<IResult<boolean>>(`ThuMucTaiLieus/${id}`);

// ── Người đã thích ────────────────────────────────────────────────────────────

export interface INguoiThich {
  nguoiDungId: string;
  hoTen?: string | null;
  email?: string | null;
  hinhDaiDien?: string | null;
  thoiGian?: string | null;
}

/** Danh sách người đã thích một nội dung (tài liệu / bài viết / bình luận) */
export const getNguoiThich = (loaiDoiTuong: number, doiTuongId: string) =>
  requestGET<IResult<INguoiThich[]>>(`LuotThichs/nguoi-thich?loaiDoiTuong=${loaiDoiTuong}&doiTuongId=${doiTuongId}`);

// ── 1b. Tài Liệu Đính Kèm (nhiều file/link cho một tài liệu) ─────────────────

/** Danh sách đính kèm của một tài liệu */
export const searchTaiLieuDinhKems = (req: ISearchDinhKemRequest) =>
  requestPOST<IPaginationResponse<ITaiLieuDinhKem[]>>(`TaiLieuDinhKems/search`, req);

/** Thêm file/liên kết đính kèm */
export const createTaiLieuDinhKem = (req: ICreateDinhKemRequest) =>
  requestPOST<IResult<string>>(`TaiLieuDinhKems`, req);

/** Xóa đính kèm */
export const deleteTaiLieuDinhKem = (id: string) =>
  requestDELETE<IResult<boolean>>(`TaiLieuDinhKems/${id}`);

/** URL tải xuống file đính kèm */
export const getTaiLieuDinhKemDownloadUrl = (id: string): string =>
  `${API_URL}/api/v1/TaiLieuDinhKems/${id}/download`;

// ── 2. Tìm Kiếm Full-text ─────────────────────────────────────────────────────

/** Tìm kiếm toàn văn */
export const timKiem = (keyword: string, pageNumber = 1, pageSize = 20) =>
  requestGET<IPaginationResponse<ITaiLieuSearchResult[]>>(
    `TimKiems?keyword=${encodeURIComponent(keyword)}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

/** Gợi ý từ khóa — Autocomplete */
export const goiYTuKhoa = (prefix: string) =>
  requestGET<string[]>(`TimKiems/goi-y?prefix=${encodeURIComponent(prefix)}`);

/** Tìm kiếm tài liệu đính kèm qua Elasticsearch (attachment content) — BETA/TEST */
export const searchElasticsearchAttachments = (req: {
  indexName?: string;
  keyword: string;
  pageNumber?: number;
  pageSize?: number;
}) =>
  requestPOST<any>(`ElasticsearchAttachments/search`, {
    indexName: req.indexName ?? 'td-quan-ly-tri-thuc',
    keyword: req.keyword,
    pageNumber: req.pageNumber ?? 1,
    pageSize: req.pageSize ?? 20,
  }).catch(err => {
    console.error('Elasticsearch attachment search error:', err);
    return { data: [] };
  });

// ── 3. Chuyên Gia ─────────────────────────────────────────────────────────────

/** Tìm kiếm chuyên gia */
export const searchChuyenGias = (req: ISearchChuyenGiaRequest) =>
  requestPOST<IPaginationResponse<IChuyenGia[]>>(`qltt/ChuyenGias/search`, req);

/** Hồ sơ chuyên gia */
export const getChuyenGia = (id: string) =>
  requestGET<IChuyenGia>(`qltt/ChuyenGias/${id}`);

/** Tài liệu của chuyên gia */
export const getTaiLieuChuyenGia = (id: string, pageNumber = 1, pageSize = 10) =>
  requestGET<IPaginationResponse<ITaiLieu[]>>(
    `qltt/ChuyenGias/${id}/tai-lieu?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

/** Tạo hồ sơ chuyên gia mới (Admin) */
export const createChuyenGia = (req: ICreateChuyenGiaRequest) =>
  requestPOST<IResult<string>>(`qltt/ChuyenGias`, req);

/** Cập nhật hồ sơ chuyên gia (Admin) */
export const updateChuyenGia = (id: string, req: IUpdateChuyenGiaRequest) =>
  requestPUT<IResult<boolean>>(`qltt/ChuyenGias/${id}`, req);

/** Xóa chuyên gia (Admin) */
export const deleteChuyenGia = (id: string) =>
  requestDELETE<IResult<boolean>>(`qltt/ChuyenGias/${id}`);

// ── 4. Cộng Đồng ──────────────────────────────────────────────────────────────

/** Tìm kiếm cộng đồng */
export const searchCongDongs = (req: ISearchCongDongRequest) =>
  requestPOST<IPaginationResponse<ICongDong[]>>(`CongDongs/search`, req);

/** Chi tiết cộng đồng */
export const getCongDong = (id: string) =>
  requestGET<ICongDong>(`CongDongs/${id}`);

/** Tạo cộng đồng */
export const createCongDong = (req: ICreateCongDongRequest) =>
  requestPOST<IResult<string>>(`CongDongs`, req);

/** Cập nhật cộng đồng */
export const updateCongDong = (id: string, req: IUpdateCongDongRequest) =>
  requestPUT<IResult<boolean>>(`CongDongs/${id}`, req);

/** Tham gia cộng đồng */
export const thamGiaCongDong = (id: string) =>
  requestPOST<IResult<boolean>>(`CongDongs/${id}/tham-gia`, {});

/** Rời cộng đồng */
export const roiCongDong = (id: string) =>
  requestDELETE<IResult<boolean>>(`CongDongs/${id}/roi`);

/** Danh sách thành viên */
export const searchThanhViens = (congDongId: string, req: ISearchThanhVienRequest) =>
  requestPOST<IPaginationResponse<IThanhVien[]>>(`CongDongs/${congDongId}/thanh-vien/search`, req);

/** Xóa cộng đồng */
export const deleteCongDong = (id: string) =>
  requestDELETE<IResult<boolean>>(`CongDongs/${id}`);

// ── 5. Bài Viết ───────────────────────────────────────────────────────────────

/** Tìm kiếm bài viết */
export const searchBaiViets = (req: ISearchBaiVietRequest) =>
  requestPOST<IPaginationResponse<IBaiViet[]>>(`BaiViets/search`, req);

/** Chi tiết bài viết */
export const getBaiViet = (id: string) =>
  requestGET<IBaiViet>(`BaiViets/${id}`);

/** Tạo bài viết */
export const createBaiViet = (req: ICreateBaiVietRequest) =>
  requestPOST<IResult<string>>(`BaiViets`, req);

/** Cập nhật bài viết */
export const updateBaiViet = (id: string, req: IUpdateBaiVietRequest) =>
  requestPUT<IResult<boolean>>(`BaiViets/${id}`, req);

/** Xóa bài viết */
export const deleteBaiViet = (id: string) =>
  requestDELETE<IResult<boolean>>(`BaiViets/${id}`);

// ── 6. Bình Luận ──────────────────────────────────────────────────────────────

/** Tìm kiếm bình luận */
export const searchBinhLuans = (req: ISearchBinhLuanRequest) =>
  requestPOST<IPaginationResponse<IBinhLuan[]>>(`BinhLuans/search`, req);

/** Tạo bình luận (hoặc reply nếu có binhLuanChaId) */
export const createBinhLuan = (req: ICreateBinhLuanRequest) =>
  requestPOST<IResult<string>>(`BinhLuans`, req);

/** Cập nhật bình luận */
export const updateBinhLuan = (id: string, req: IUpdateBinhLuanRequest) =>
  requestPUT<IResult<boolean>>(`BinhLuans/${id}`, req);

/** Xóa bình luận */
export const deleteBinhLuan = (id: string) =>
  requestDELETE<IResult<boolean>>(`BinhLuans/${id}`);

// ── 7. Lượt Thích ─────────────────────────────────────────────────────────────

/**
 * Toggle like/unlike.
 * Response: { succeeded: true, data: boolean }
 *   data = true  → vừa LIKED
 *   data = false → vừa UNLIKED
 */
export const toggleThich = (req: IThichRequest) =>
  requestPOST<IResult<boolean>>(`LuotThichs/thich`, req);

// ── 8. News Feed ──────────────────────────────────────────────────────────────

/** News Feed cá nhân (7 ngày gần nhất, lọc theo vai trò & lịch sử) */
export const getNewsFeed = (pageNumber = 1, pageSize = 20, donViId?: string, linhVucKHCNId?: string) => {
  const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  if (donViId) params.append('donViId', donViId);
  if (linhVucKHCNId) params.append('linhVucKHCNId', linhVucKHCNId);
  return requestGET<IPaginationResponse<INewsFeedItem[]>>(`NewsFeed?${params}`);
};

// ── 9. Phiên Bản Tài Liệu ────────────────────────────────────────────────────

/** Tìm kiếm phiên bản */
export const searchPhienBans = (req: ISearchPhienBanRequest) =>
  requestPOST<IPaginationResponse<ITaiLieuPhienBan[]>>(`TaiLieuPhienBans/search`, req);

/** Chi tiết phiên bản */
export const getPhienBan = (id: string) =>
  requestGET<ITaiLieuPhienBan>(`TaiLieuPhienBans/${id}`);

/** Tạo phiên bản mới */
export const createPhienBan = (req: ICreatePhienBanRequest) =>
  requestPOST<IResult<string>>(`TaiLieuPhienBans`, req);

// ── 10. Yêu Cầu Tư Vấn ───────────────────────────────────────────────────────

/** Tìm kiếm yêu cầu tư vấn */
export const searchTuVans = (req: ISearchTuVanRequest) =>
  requestPOST<IPaginationResponse<IYeuCauTuVan[]>>(`YeuCauTuVans/search`, req);

/** Gửi yêu cầu tư vấn — trạng thái ChoXacNhan (0) */
export const createTuVan = (req: ICreateTuVanRequest) =>
  requestPOST<IResult<string>>(`YeuCauTuVans`, req);

/** Chuyên gia xác nhận yêu cầu: ChoXacNhan → DaXacNhan */
export const xacNhanTuVan = (id: string) =>
  requestPOST<IResult<boolean>>(`YeuCauTuVans/${id}/xac-nhan`, {});

/** Chuyên gia từ chối yêu cầu: ChoXacNhan → DaHuy */
export const tuChoiTuVan = (req: ITuChoiTuVanRequest) =>
  requestPOST<IResult<boolean>>(`YeuCauTuVans/${req.id}/tu-choi`, req);

/** Hoàn tất tư vấn: DaXacNhan → HoanTat */
export const hoanTatTuVan = (id: string) =>
  requestPOST<IResult<boolean>>(`YeuCauTuVans/${id}/hoan-tat`, {});

// ── 11. Nhận Xét Chuyên Gia ───────────────────────────────────────────────────

/** Tìm kiếm nhận xét */
export const searchNhanXets = (req: ISearchNhanXetRequest) =>
  requestPOST<IPaginationResponse<INhanXetChuyenGia[]>>(`NhanXetChuyenGias/search`, req);

/** Tạo nhận xét (1–5 sao) */
export const createNhanXet = (req: ICreateNhanXetRequest) =>
  requestPOST<IResult<string>>(`NhanXetChuyenGias`, req);

/** Xóa nhận xét */
export const deleteNhanXet = (id: string) =>
  requestDELETE<IResult<boolean>>(`NhanXetChuyenGias/${id}`);

// ── 12. Tags ──────────────────────────────────────────────────────────────────

export const searchTags = (req: ISearchTagsRequest) =>
  requestPOST<IPaginationResponse<ITag[]>>(`Tags/search`, req);

export const createTag = (req: ICreateTagRequest) =>
  requestPOST<IResult<string>>(`Tags`, req);

// ── 13. Upload File Tài Liệu ──────────────────────────────────────────────────

/**
 * Upload một file tài liệu (PDF/Word/Excel/...) lên MinIO
 * Trả về IAttachmentUploadResult với filePath, tenGoc, kichThuocBytes, mimeType
 */
export const uploadTaiLieuFile = async (
  file: File,
  onProgress?: (pct: number) => void,
): Promise<IAttachmentUploadResult | null> => {
  const form = new FormData();
  form.append('files', file);
  form.append('bucketName', 'my-bucket');
  form.append('prefix', 'kho-tri-thuc');
  form.append('generateThumbnail', 'false');

  const res = await requestUploadFile<any>(
    'attachments/public',
    form,
    'private',
    onProgress,
  );

  const raw = res.data;
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  if (raw.data !== undefined) {
    return Array.isArray(raw.data) ? (raw.data[0] ?? null) : (raw.data ?? null);
  }
  return null;
};

// ── 14. Analytics (Phase 2A) ──────────────────────────────────────────────────

/** Dashboard tổng hợp — trả dữ liệu theo vai trò người dùng */
export const getKTDashboard = (nam?: number, linhVucKHCNId?: string) => {
  const params = new URLSearchParams();
  if (nam !== undefined) params.append('nam', String(nam));
  if (linhVucKHCNId) params.append('linhVucKHCNId', linhVucKHCNId);
  const qs = params.toString();
  return requestGET<IResult<IKTDashboardStats>>(`KTAnalytics/dashboard${qs ? `?${qs}` : ''}`);
};

/** Top-N tài liệu nổi bật theo lượt xem */
export const getKTLeaderboardTaiLieu = (top = 10) =>
  requestGET<IResult<IKTLeaderboardTaiLieu[]>>(`KTAnalytics/leaderboard/tai-lieu?top=${top}`);

/** Top-N chuyên gia theo điểm đánh giá trung bình */
export const getKTLeaderboardChuyenGia = (top = 10) =>
  requestGET<IResult<IKTLeaderboardChuyenGia[]>>(`KTAnalytics/leaderboard/chuyen-gia?top=${top}`);

/** Top-N cộng đồng thực hành theo số thành viên */
export const getKTLeaderboardCongDong = (top = 10) =>
  requestGET<IResult<IKTLeaderboardCongDong[]>>(`KTAnalytics/leaderboard/cong-dong?top=${top}`);

/** Top-N người đóng góp theo số tài liệu đã xuất bản */
export const getKTLeaderboardNguoiDung = (top = 10) =>
  requestGET<IResult<IKTLeaderboardNguoiDung[]>>(`KTAnalytics/leaderboard/nguoi-dung?top=${top}`);

// ── 15. BaoCao (Phase 3B) ─────────────────────────────────────────────────────

const buildBaoCaoQS = (
  filter: IKTBaoCaoFilter & { pageNumber?: number; pageSize?: number },
): string => {
  const p = new URLSearchParams();
  if (filter.tuNgay)        p.append('tuNgay',        filter.tuNgay);
  if (filter.denNgay)       p.append('denNgay',       filter.denNgay);
  if (filter.linhVucKHCNId) p.append('linhVucKHCNId', filter.linhVucKHCNId);
  if (filter.loaiTaiLieu)   p.append('loaiTaiLieu',   filter.loaiTaiLieu);
  if (filter.trangThai)     p.append('trangThai',     filter.trangThai);
  if (filter.donViCode)     p.append('donViCode',     filter.donViCode);
  if (filter.pageNumber)    p.append('pageNumber',    String(filter.pageNumber));
  if (filter.pageSize)      p.append('pageSize',      String(filter.pageSize));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
};

/** Báo cáo tổng hợp KPI kho tri thức */
export const getKTBaoCaoTongHop = (filter: IKTBaoCaoFilter) =>
  requestGET<IResult<IKTBaoCaoTongHop>>(`KTBaoCao/tong-hop${buildBaoCaoQS(filter)}`);

/** Báo cáo đóng góp người dùng */
export const getKTBaoCaoDongGop = (filter: IKTBaoCaoFilter) =>
  requestGET<IResult<IKTBaoCaoDongGop[]>>(`KTBaoCao/dong-gop${buildBaoCaoQS(filter)}`);

/** Danh sách tài liệu có lọc và phân trang */
export const getKTBaoCaoTaiLieu = (
  filter: IKTBaoCaoFilter & { pageNumber?: number; pageSize?: number },
) =>
  requestGET<IResult<IPaginationResponse<IKTBaoCaoTaiLieu[]>>>(
    `KTBaoCao/tai-lieu${buildBaoCaoQS(filter)}`,
  );

/** Xuất Excel: báo cáo tổng hợp KPI */
export const exportKTBaoCaoTongHopExcel = (filter: IKTBaoCaoFilter) =>
  requestDownloadFile('KTBaoCao/export-tong-hop', filter);

/** Xuất Excel: báo cáo đóng góp người dùng */
export const exportKTBaoCaoDongGopExcel = (filter: IKTBaoCaoFilter) =>
  requestDownloadFile('KTBaoCao/export-dong-gop', filter);

// ── 16. News Feed V2 (Internal API) ──────────────────────────────────────────

/**
 * News Feed V2 — dùng API nội bộ thay thế iframe.
 * Cùng endpoint với getNewsFeed nhưng type-safe với INewsFeedV2Item (contract đúng với backend).
 */
export const getNewsFeedV2 = (pageNumber = 1, pageSize = 12, donViId?: string, linhVucKHCNId?: string) => {
  const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  if (donViId) params.append('donViId', donViId);
  if (linhVucKHCNId) params.append('linhVucKHCNId', linhVucKHCNId);
  // Kiểu INewsFeedV2Item được cast tại hook useNewsFeed để tránh import ngược chiều
  return requestGET<IPaginationResponse<any[]>>(`NewsFeed?${params}`);
};
