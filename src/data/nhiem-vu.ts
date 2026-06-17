import { DiemDanhGia, LoaiNhiemVu, PhuongThucKhoan, TrangThaiDatHang, TrangThaiDeXuat, TuDanhGia, XepLoaiNghiemThu, TrangThaiThongTinChuyenGiao, TrangThaiPhieuDangKyCapGCN } from "@/models";

export const TRANG_THAI_DAT_HANG = [
    {
        id: TrangThaiDatHang.ChoDuyet,
        name: "Chờ tiếp nhận",
        className: "badge badge-light-warning"
    },
    {
        id: TrangThaiDatHang.DaTiepNhan,
        name: "Đã tiếp nhận",
        className: "badge badge-light-success"
        },
    {
        id: TrangThaiDatHang.TuChoi,
        name: "Từ chối",
        className: "badge badge-light-danger"
    },

];

export const TRANG_THAI_DE_XUAT= [
    {
        id: TrangThaiDeXuat.ChoDuyet,
        name: "Chờ tiếp nhận",
        className: "badge badge-light-warning"
    },
    {
        id: TrangThaiDeXuat.DaTiepNhan,
        name: "Đã tiếp nhận",
        className: "badge badge-light-success"
    },
   {
        id: TrangThaiDeXuat.DaDuaVaoDanhMuc,
        name: "Đã đưa vào danh mục",
        className: "badge badge-light-primary"
    },
    {
        id: TrangThaiDeXuat.TuChoi,
        name: "Từ chối",
        className: "badge badge-light-danger"
    },
];

export const LOAI_NHIEM_VU = [
    {
        id: LoaiNhiemVu.KhoaHocCongNghe,
        name: "Nhiệm vụ khoa học công nghệ",
    },
    {
        id: LoaiNhiemVu.KhoaHocXaHoiNhanVan,
        name: "Nhiệm vụ khoa học công nghệ xã hội nhân văn",
    },
{
        id: LoaiNhiemVu.DuAnThuNghiem,
        name: "Nhiệm vụ sản xuất dự án thử nghiệm",
    },
];

export const PHUONG_THUC_KHOAN = [
    {
        id: PhuongThucKhoan.KhoanToanPhan,
        name: "Khoán toàn phần",
    },
    {
        id: PhuongThucKhoan.KhoanTungPhan,
        name: "Khoán từng phần",
    }
];

export const TU_DANH_GIA = [
    {
        id: TuDanhGia.ChamTienDo,
        name: "Chậm tiến độ",
    },
    {
        id: TuDanhGia.DamBaoTienDo,
        name: "Đảm bảo tiến độ",
    },
{
        id: TuDanhGia.VuotTienDo,
        name: "Vượt tiến độ",
    },
];

export const DIEM_DANH_GIA = [
    {
        id: DiemDanhGia.TrungBinh,
        name: "Trung bình",
    },
    {
        id: DiemDanhGia.Kha,
        name: "Khá",
    },
{
        id: DiemDanhGia.Tot,
        name: "Tốt",
    },
];

export const XEP_LOAI_NGHIEM_THU = [
  { id: XepLoaiNghiemThu.KhongDat, name: 'Không đạt' },
  { id: XepLoaiNghiemThu.Dat, name: 'Đạt' },
  { id: XepLoaiNghiemThu.XuatSac, name: 'Xuất sắc' },
];

export const TRANG_THAI_THONG_TIN_CHUYEN_GIAO = [
    {
        id: TrangThaiThongTinChuyenGiao.ChuaChuyenGiao,
        name: "Chưa chuyển giao",
        className: "badge badge-light-warning"
    },
    {
        id: TrangThaiThongTinChuyenGiao.DangChuyenGiao,
        name: "Đang chuyển giao",
        className: "badge badge-light-primary"
    },
    {
        id: TrangThaiThongTinChuyenGiao.DaChuyenGiao,
        name: "Đã chuyển giao",
        className: "badge badge-light-success"
    },
];

export const TRANG_THAI_PHIEU_DANG_KY_CAP_GCN = [
    {
        id: TrangThaiPhieuDangKyCapGCN.ChoDuyet,
        name: "Chờ duyệt",
        className: "badge badge-light-warning"
    },
    {
        id: TrangThaiPhieuDangKyCapGCN.DaDuyet,
        name: "Đã duyệt",
        className: "badge badge-light-success"
    },
    {
        id: TrangThaiPhieuDangKyCapGCN.TuChoi,
        name: "Từ chối",
        className: "badge badge-light-danger"
    },
];

