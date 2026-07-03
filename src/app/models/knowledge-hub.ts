// ─────────────────────────────────────────────────────────────────────────────
// Knowledge Hub — TypeScript Models
// Khớp 1-1 với Postman Collection v2.1 (kh-col-v2-2026-06-28)
// ─────────────────────────────────────────────────────────────────────────────

import { IPaginationResponse, IResult } from '@/models';
export type { IPaginationResponse, IResult };

// ── Enums ─────────────────────────────────────────────────────────────────────

/** Trạng thái tài liệu */
export enum TrangThaiTaiLieu {
  NhapLieu    = 0,
  ChoXetDuyet = 1,
  DaXuatBan   = 2,
  TuChoi      = 3,
}

/** Loại tài liệu */
export enum LoaiTaiLieu {
  HuongDan         = 1,
  Playbook         = 2,
  Template         = 3,
  NghienCuu        = 4,
  TinhHuong        = 5,
  BaiHocKinhNghiem = 6,
}

/** Loại nguồn tham chiếu của tài liệu (bài học kinh nghiệm gắn với dự án/sáng kiến) */
export enum LoaiNguonThamChieu {
  DuAn     = 1,
  SangKien = 2,
  YTuong   = 3,
  NhiemVu  = 4,
}

/** Loại bài viết trong cộng đồng */
export enum LoaiBaiViet {
  ThaoCuan = 1,
  HoiDap   = 2,
  ChiaSe   = 3,
}

/** Loại đối tượng dùng cho bình luận & lượt thích */
export enum LoaiDoiTuong {
  TaiLieu  = 1,
  BaiViet  = 2,
  BinhLuan = 3,
  YTuong   = 4,
  GiaiPhap = 5,
  SangKien = 6,
}

/** Trạng thái yêu cầu tư vấn */
export enum TrangThaiTuVan {
  ChoXacNhan = 0,
  DaXacNhan  = 1,
  HoanTat    = 2,
  DaHuy      = 3,
}

// ── Common ────────────────────────────────────────────────────────────────────

export interface IPageRequest {
  pageNumber: number;
  pageSize:   number;
  orderBy?:   string[];
}

// ── Tags ──────────────────────────────────────────────────────────────────────

export interface ITag {
  id:         string;
  ten:        string;
  soTaiLieu?: number;
}

export interface ISearchTagsRequest extends IPageRequest {
  keyword?: string;
}

export interface ICreateTagRequest {
  ten: string;
}

// ── Tài Liệu ──────────────────────────────────────────────────────────────────

export interface ITacGia {
  id:           string;
  hoTen:        string;
  email?:       string;
  hinhDaiDien?: string;
}

export interface ITaiLieu {
  id:               string;
  tieuDe:           string;
  moTa?:            string;
  loaiTaiLieu:      LoaiTaiLieu;
  trangThai:        TrangThaiTaiLieu;
  linhVucKHCNId?:   string;
  donViId?:         string;
  loaiNguonThamChieu?: LoaiNguonThamChieu | null;
  nguonThamChieuId?:   string | null;
  tenNguonThamChieu?:  string | null;
  urlNgoai?:        string;
  duongDanLuuTru?:  string;
  tenGoc?:          string;
  kichThuocBytes?:  number;
  mimeType?:        string;
  tags:             string[];
  tacGia?:          ITacGia;
  nguoiDuyet?:      ITacGia;
  luotXem:          number;
  luotThich?:       number;
  createdOn?:       string;
  lastModifiedOn?:  string;
}

export interface ISearchTaiLieuRequest extends IPageRequest {
  keyword?:       string;
  trangThai?:     TrangThaiTaiLieu | null;
  loaiTaiLieu?:   LoaiTaiLieu | null;
  tacGiaId?:      string | null;
  linhVucKHCNId?: string | null;
  donViId?:       string | null;
  loaiNguonThamChieu?: LoaiNguonThamChieu | null;
  nguonThamChieuId?:   string | null;
  tagIds?:        string[];
}

export interface ICreateTaiLieuRequest {
  tieuDe:          string;
  moTa?:           string;
  loaiTaiLieu:     LoaiTaiLieu;
  linhVucKHCNId?:  string | null;
  donViId?:        string | null;
  urlNgoai?:       string | null;
  duongDanLuuTru?: string | null;
  tenGoc?:         string | null;
  kichThuocBytes?: number | null;
  mimeType?:       string | null;
  loaiNguonThamChieu?: LoaiNguonThamChieu | null;
  nguonThamChieuId?:   string | null;
  tenNguonThamChieu?:  string | null;
  tags?:           string[];
}

export interface IUpdateTaiLieuRequest extends ICreateTaiLieuRequest {
  id: string;
  /** true → BE cập nhật lại nguồn tham chiếu theo 3 field loai/nguon/ten (cho phép xóa bằng null) */
  capNhatNguonThamChieu?: boolean;
}

export interface ITuChoiRequest {
  id:    string;
  lyDo:  string;
}

// ── Tài Liệu Phiên Bản ────────────────────────────────────────────────────────

export interface ITaiLieuPhienBan {
  id:              string;
  taiLieuId:       string;
  soPhienBan:      number;
  ghiChu?:         string;
  duongDanLuuTru?: string;
  tenGoc?:         string;
  kichThuocBytes?: number;
  mimeType?:       string;
  createdOn?:      string;
}

export interface ISearchPhienBanRequest extends IPageRequest {
  taiLieuId: string;
}

export interface ICreatePhienBanRequest {
  taiLieuId:       string;
  soPhienBan:      number;
  ghiChu?:         string;
  duongDanLuuTru?: string;
  tenGoc?:         string;
  kichThuocBytes?: number;
  mimeType?:       string;
}

// ── Tài Liệu Đính Kèm (nhiều file/link cho một tài liệu) ─────────────────────

export interface ITaiLieuDinhKem {
  id:              string;
  taiLieuId:       string;
  thongTinFile?: {
    duongDanLuuTru: string;
    tenGoc:         string;
    kichThuocBytes: number;
    mimeType:       string;
  } | null;
  urlNgoai?:       string | null;
  moTa?:           string | null;
  createdOn?:      string;
}

export interface ISearchDinhKemRequest extends IPageRequest {
  taiLieuId: string;
}

export interface ICreateDinhKemRequest {
  taiLieuId:       string;
  duongDanLuuTru?: string | null;
  tenGoc?:         string | null;
  kichThuocBytes?: number | null;
  mimeType?:       string | null;
  urlNgoai?:       string | null;
  moTa?:           string | null;
}

// ── Tìm Kiếm Full-text ────────────────────────────────────────────────────────

export interface ITaiLieuSearchResult {
  id:          string;
  tieuDe:      string;
  moTa?:       string;
  loaiTaiLieu: LoaiTaiLieu;
  trangThai:   TrangThaiTaiLieu;
  tags:        string[];
  luotXem:     number;
  tacGia?:     ITacGia;
  createdOn?:  string;
}

// ── Chuyên Gia ────────────────────────────────────────────────────────────────

/** Khớp với BE ChuyenGiaBaseDto (NguonLuc domain) */
export interface IChuyenGia {
  id:               string;
  userId?:          string | null;
  userName?:        string | null;
  maSoVienChuc?:    string | null;
  hoTen:            string;
  donViCongTac?:    string | null;
  chucVu?:          string | null;
  email?:           string | null;
  linhVuc?:         string | null;
  chuyenNganh?:     string | null;
  chuyenMon?:       string | null;
  huongNghienCuu?:  string | null;  // mô tả / hướng NC
  laChuyenGiaNgoai?: boolean | null;
  hocViTen?:        string | null;
  hocViVietTat?:    string | null;
  hocHamTen?:       string | null;
  hocHamVietTat?:   string | null;
  dinhKem?:         string | null;  // đường dẫn ảnh / tệp đính kèm
  // Trường tính toán — BE chưa trả về, dự phòng tương lai
  diemDanhGia?:     number;
  soNhanXet?:       number;
  soTaiLieu?:       number;
}

/** Khớp với BE CreateChuyenGiaRequest */
export interface ICreateChuyenGiaRequest {
  maSoVienChuc?:    string | null;
  hoTen:            string;
  donViCongTac?:    string | null;
  chucVu?:          string | null;
  email?:           string | null;
  linhVuc?:         string | null;
  chuyenNganh?:     string | null;
  chuyenMon?:       string | null;
  huongNghienCuu?:  string | null;
  laChuyenGiaNgoai?: boolean | null;
  dinhKem?:         string | null;
}

export interface IUpdateChuyenGiaRequest extends ICreateChuyenGiaRequest {
  id: string;
}

/** keyword khớp với PaginationFilter.Keyword trong BE */
export interface ISearchChuyenGiaRequest extends IPageRequest {
  keyword?:         string;          // BE: PaginationFilter.Keyword
  linhVuc?:         string | null;
  laChuyenGiaNgoai?: boolean | null;
}

// ── Nhận Xét Chuyên Gia ───────────────────────────────────────────────────────

export interface INhanXetChuyenGia {
  id:               string;
  chuyenGiaId:      string;
  nguoiNhanXetId?:  string;
  nguoiNhanXet?:    ITacGia;
  noiDung:          string;
  diemDanhGia:      number;
  createdOn?:       string;
}

export interface ISearchNhanXetRequest extends IPageRequest {
  chuyenGiaId:      string;
  nguoiNhanXetId?:  string | null;
}

export interface ICreateNhanXetRequest {
  chuyenGiaId:  string;
  noiDung:      string;
  diemDanhGia:  number;
}

// ── Yêu Cầu Tư Vấn ───────────────────────────────────────────────────────────

export interface IYeuCauTuVan {
  id:              string;
  chuyenGiaId:     string;
  chuyenGia?:      IChuyenGia;
  nguoiYeuCauId?:  string;
  nguoiYeuCau?:    ITacGia;
  noiDung:         string;
  trangThai:       TrangThaiTuVan;
  lyDo?:           string;
  createdOn?:      string;
}

export interface ISearchTuVanRequest extends IPageRequest {
  chuyenGiaId?:   string | null;
  nguoiYeuCauId?: string | null;
  trangThai?:     TrangThaiTuVan | null;
}

export interface ICreateTuVanRequest {
  chuyenGiaId: string;
  noiDung:     string;
}

export interface ITuChoiTuVanRequest {
  id:    string;
  lyDo:  string;
}

// ── Cộng Đồng ─────────────────────────────────────────────────────────────────

export interface ICongDong {
  id:             string;
  ten:            string;
  moTa?:          string;
  linhVucKHCNId?: string;
  trangThai?:     number;
  soThanhVien?:   number;
  soThaoCuan?:    number;
  daThamGia?:     boolean;
  createdOn?:     string;
}

export interface ISearchCongDongRequest extends IPageRequest {
  keyword?:       string;
  trangThai?:     number | null;
  linhVucKHCNId?: string | null;
}

export interface ICreateCongDongRequest {
  ten:            string;
  moTa?:          string;
  linhVucKHCNId?: string | null;
}

export interface IUpdateCongDongRequest extends ICreateCongDongRequest {
  id: string;
}

export interface IThanhVien {
  id:       string;
  hoTen:    string;
  email?:   string;
  vaiTro?:  number;
  joinedOn?: string;
}

export interface ISearchThanhVienRequest extends IPageRequest {
  keyword?: string;
  vaiTro?:  number | null;
}

// ── Bài Viết ──────────────────────────────────────────────────────────────────

export interface IBaiViet {
  id:          string;
  congDongId:  string;
  congDong?:   { id: string; ten: string };
  tieuDe:      string;
  noiDung:     string;
  loaiBaiViet: LoaiBaiViet;
  tacGia?:     ITacGia;
  luotThich?:  number;
  soBinhLuan?: number;
  daTuThich?:  boolean;
  createdOn?:  string;
}

export interface ISearchBaiVietRequest extends IPageRequest {
  keyword?:    string;
  congDongId?: string | null;
  tacGiaId?:   string | null;
  loaiBaiViet?: LoaiBaiViet | null;
}

export interface ICreateBaiVietRequest {
  congDongId:  string;
  tieuDe:      string;
  noiDung:     string;
  loaiBaiViet: LoaiBaiViet;
}

export interface IUpdateBaiVietRequest extends ICreateBaiVietRequest {
  id: string;
}

// ── Bình Luận ─────────────────────────────────────────────────────────────────

export interface IBinhLuan {
  id:             string;
  loaiDoiTuong:   LoaiDoiTuong;
  doiTuongId:     string;
  binhLuanChaId?: string;
  noiDung:        string;
  tacGia?:        ITacGia;
  luotThich?:     number;
  soReply?:       number;
  createdOn?:     string;
}

export interface ISearchBinhLuanRequest extends IPageRequest {
  loaiDoiTuong:    LoaiDoiTuong;
  doiTuongId:      string;
  binhLuanChaId?:  string | null;
}

export interface ICreateBinhLuanRequest {
  loaiDoiTuong:   LoaiDoiTuong;
  doiTuongId:     string;
  noiDung:        string;
  binhLuanChaId?: string | null;
}

export interface IUpdateBinhLuanRequest {
  id:       string;
  noiDung:  string;
}

// ── Lượt Thích ────────────────────────────────────────────────────────────────

export interface IThichRequest {
  loaiDoiTuong: LoaiDoiTuong;
  doiTuongId:   string;
}

// ── News Feed ─────────────────────────────────────────────────────────────────

export interface INewsFeedItem {
  id:          string;
  tieuDe?:     string;
  moTa?:       string;
  loai?:       string;       // TaiLieu | BaiViet
  tacGia?:     ITacGia;
  luotXem?:    number;
  luotThich?:  number;
  tags?:       string[];
  createdOn?:  string;
}
