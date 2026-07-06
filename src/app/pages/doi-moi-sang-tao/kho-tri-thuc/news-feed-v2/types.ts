// ─────────────────────────────────────────────────────────────────────────────
// News Feed V2 — Types
// Contract khớp với backend NewsFeedItemDto / TacGiaInfoDto / PaginationResponse
//
// Lưu ý enum mapping (hai enum KHÁC NHAU, không nhầm):
//   LoaiItem trong INewsFeedV2Item: 0=TaiLieu, 1=BaiViet  (LoaiNewsFeedItem trên BE)
//   LoaiDoiTuong trong toggleThich: 1=TaiLieu, 2=BaiViet  (LoaiDoiTuong trên BE)
// ─────────────────────────────────────────────────────────────────────────────

/** Thông tin tác giả — khớp TacGiaInfoDto (id optional đến khi BE fix TacGiaInfoDto.Id) */
export interface INewsFeedV2Author {
  id?:           string;
  hoTen?:        string;
  email?:        string;
  hinhDaiDien?:  string;
}

/** Một item trong news feed — khớp NewsFeedItemDto sau camelCase serialization */
export interface INewsFeedV2Item {
  id:            string;
  /** 0 = TaiLieu, 1 = BaiViet — backend enum LoaiNewsFeedItem */
  loaiItem:      number;
  tieuDe:        string;
  moTa?:         string;
  tacGiaId:      string;
  tacGia?:       INewsFeedV2Author;
  linhVucKHCNId?: string;
  donViId?:       string;
  congDongId?:    string;
  soLuotThich:   number;
  soBinhLuan:    number;
  /** false khi BUG-02 chưa được merge vào backend */
  daThich:       boolean;
  /** Chỉ có ở TaiLieu (loaiItem === 0) */
  luotXem?:      number;
  /** Chỉ có ở TaiLieu (loaiItem === 0) */
  tags?:         string[];
  createdOn?:    string;
}

/** Bộ lọc bảng tin */
export interface INewsFeedV2Filters {
  donViId?:        string;
  linhVucKHCNId?:  string;
}
