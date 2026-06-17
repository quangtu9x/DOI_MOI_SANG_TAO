import { DefaultOptionType } from "antd/lib/select";
import { Dayjs } from "dayjs";

export enum TrangThaiDotDangKy
{
    ChuaMo = 1,
    DangMo = 2,
    DaDong = 3,
}

export enum TrangThaiDatHang
{
    ChoDuyet = 1,
    DaTiepNhan = 2,
    TuChoi = 3
}

export enum TrangThaiDeXuat
{
    ChoDuyet = 1,
    DaTiepNhan = 2,
    DaDuaVaoDanhMuc = 3, // Sau khi hội đồng họp và đưa vào danh mục nhiệm vụ chính thức.
    TuChoi = 4
}

export enum TrangThaiNhiemVu
{
    DangTuyenChon = 1,
    DangThucHien = 2,
    DaHoanThanh = 3,
    DaHuy = 4,
}

export enum LoaiNhiemVu
{
    KhoaHocCongNghe = 1,
    KhoaHocXaHoiNhanVan = 2,
    DuAnThuNghiem = 3,
}

export enum PhuongThucKhoan
{
    KhoanToanPhan = 1,
    KhoanTungPhan = 2,
}

export enum LoaiChiTietMoHoSo
{
    TruocRaSoat = 1,
    SauRaSoat = 2,
    HoSoHopLe = 3
}

export enum LoaiPhieuDanhGiaNhanXet
{
    DanhGia = 1,
    NhanXet = 2,
}

export enum LoaiDeNghiThucHien
{
    DeNghiThucHien = 1,
    DeNghiDieuChinh = 2,
    KhongDeNghiThucHien = 3,
}

export enum TrangThaiToTrinh
{
    ChoDuyet = 1,
    DaDuyet = 2,
    TuChoi = 3,
}

export enum LoaiHoSoThamDinh
{
    NoiDung = 1,
    KinhPhi = 2,
}

export enum LoaiBienBanThamDinh
{
    NoiDung = 1,
    KinhPhi = 2,
}

export enum TrangThaiThongTinChuyenGiao {
    ChuaChuyenGiao = 1,
    DangChuyenGiao = 2,
    DaChuyenGiao = 3
}

export enum TrangThaiPhieuDangKyCapGCN {
    ChoDuyet = 1,
    DaDuyet = 2,
    TuChoi = 3
}

export interface IDotDangKy {
    id: string;
    ma?: string | null;
    ten: string;

    linhVucId?: string | null;
    linhVuc?: DefaultOptionType | null;
    linhVucTen?: string | null;

    namTaiChinh?: Dayjs | null;

    capQuanLyId?: string | null;
    capQuanLy?: DefaultOptionType | null;
    capQuanLyTen?: string | null;

    thoiGian?: [Dayjs | null, Dayjs | null];
    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;
    vanBanCanCu?: string | null;
    trangThai?: TrangThaiDotDangKy | null;
    dinhKem?: string | null;

    readOnly?: boolean | null;
}

export interface IDatHangNhiemVu {
    id: string;
    
    dotDangKyId?: string | null;
    dotDangKy?: DefaultOptionType | null;
    dotDangKyTen?: string | null;
    
    donViId?: string | null;
    donVi?: DefaultOptionType | null;
    donViTen?: string | null;
    
    ten: string;
    tinhCapThiet?: string | null;
    mucTieu?: string | null;
    khaNangDuyTri?: string | null;
    kinhPhiDuKien?: number | null;
    thoiGianThucHien?: number | null;
    noiDungChinh?: string | null;
    sanPhamDuKien?: string | null;
    tenToChucCaNhanDeXuat?: string | null;
    maDinhDanh?: string | null;
    diaChiLienHe?: string | null;
    email?: string | null;
    dienThoai?: string | null;
    
    trangThai?: TrangThaiDatHang | null;
    ghiChuXuLy?: string | null;
    dinhKem?: string | null;

    readOnly?: boolean | null;
    approveView?: boolean | null;
}


export interface IDeXuatDeTai {
    id: string;

    nguoiDeXuatId?: string | null;
    nguoiDeXuat?: DefaultOptionType | null;
    nguoiDeXuatHoTen?: string | null;

    datHangNhiemVuId?: string | null;
    datHangNhiemVu?: DefaultOptionType | null;
    datHangNhiemVuTen?: string | null;

    ten: string;
    tinhCapThiet?: string | null;
    mucTieu?: string | null;
    noiDungSoBo?: string | null;
    sanPhamDuKien?: string | null;
    kinhPhiDuKien?: number | null;
    thoiGianThucHien?: number | null;
    trangThai?: TrangThaiDeXuat | null;
    ghiChuXuLy?: string | null;

    nhiemVuChinhThucId?: string | null;
    ketQuaTuVanId?: string | null;
    dinhKem?: string | null;

    readOnly?: boolean | null;
    approveView?: boolean | null;
}

export interface IHoiDongTuVan {
    id: string;
    ten: string;
    ngayThanhLap?: Dayjs | null;
    moTa?: string | null;
    dinhKem?: string | null;

    thanhViens?: IThanhVienHoiDongTuVan[] | null;
    readOnly?: boolean | null;
}

export interface IThanhVienHoiDongTuVan {
    id: string;

    hoiDongTuVanId?: string | null;
    hoiDongTuVan?: DefaultOptionType | null;
    hoiDongTuVanTen?: string | null;

    thanhVienId?: string | null;
    thanhVien?: DefaultOptionType | null;
    thanhVienHoTen?: string | null;

    chucVuId?: string | null;
    chucVu?: DefaultOptionType | null;
    chucVuTen?: string | null;

    donViCongTac?: string | null;

    readOnly?: boolean | null;
}

export interface IKetQuaTuVan {
    id: string;

    hoiDongTuVanId?: string | null;
    hoiDongTuVan?: DefaultOptionType | null;
    hoiDongTuVanTen?: string | null;

    ngayHop?: Dayjs | null;
    ketQuaBoPhieu?: string | null;
    diemTrungBinh?: number | null;
    yKienCuaHoiDong?: string | null;
    dinhKem?: string | null;
    deXuatDeTais?: IDeXuatDeTai[] | null;
    nhiemVuChinhThuc?: INhiemVuChinhThuc | null;
    readOnly?: boolean | null;
}

export interface IKetQuaTuVanAdd {
    id: string;

    hoiDongTuVanId?: string | null;
    hoiDongTuVan?: DefaultOptionType | null;
    hoiDongTuVanTen?: string | null;

    ngayHop?: Dayjs | null;
    ketQuaBoPhieu?: string | null;
    diemTrungBinh?: number | null;
    yKienCuaHoiDong?: string | null;
    dinhKem?: string | null;
    

    readOnly?: boolean | null;
}

export interface INhiemVuChinhThuc {
    id: string;
    ten: string;
    ma?: string | null;
    loaiNhiemVu?: LoaiNhiemVu | null;
    mucTieu?: string | null;
    yeuCauSanPham?: string | null;
    kinhPhiTran?: number | null;
    thoiGianThucHien?: number | null;
    trangThai?: TrangThaiNhiemVu | null;
    ghiChuXuLy?: string | null;

    ketQuaTuVanId?: string | null;
    ketQuaTuVan?: DefaultOptionType | null;

    dinhKem?: string | null;
    dangKyChuTris?: IDangKyChuTri[] | null;

    readOnly?: boolean | null;
}

export interface IDangKyChuTri {
    id: string;

    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    tenCaNhanToChucDangKy?: string | null;
    maDinhDanh?: string | null;
    diaChiLienHe?: string | null;
    email?: string | null;
    dienThoai?: string | null;
    
    camKetDungSuThat?: boolean | null;
    camKetSuDungNguonVon?: boolean | null;
    
    dinhKem?: string | null;
    taiLieuKemTheos?: ITaiLieuKemTheo[] | null;

    readOnly?: boolean | null;
}

export interface ITaiLieuKemTheo {
    id: string;
    
    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;
    
    ten?: string | null;
    dinhKem?: string | null;
}


export interface IThanhVienThamGia {
    id: string;

    thuyetMinhId?: string | null;

    thanhVienId?: string | null;
    thanhVienHoTen?: string | null;
    thanhVien?: DefaultOptionType | null;

    chucVuId?: string | null;
    chucVu?: DefaultOptionType | null;
    chucVuTen?: string | null;

    donViCongTac?: string | null;

    readOnly?: boolean | null;
}

export interface IThuyetMinhKHCN {
    id: string;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;
    dangKyChuTriTenToChuc?: string | null;

    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    loaiNhiemVu?: LoaiNhiemVu | null;

    thoiGian?: [Dayjs | null, Dayjs | null];
    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;

    capQuanLyId?: string | null;
    capQuanLy?: DefaultOptionType | null;
    capQuanLyTen?: string | null;

    tongKinhPhi?: number | null;
    kinhPhiTuNguonNhaNuoc?: number | null;
    kinhPhiNgoaiNhaNuoc?: number | null;
    vonTuCo?: number | null;
    vonLienDoanh?: number | null;

    phuongThucKhoan?: PhuongThucKhoan | null;
    kinhPhiKhoan?: number | null;
    kinhPhiKhongKhoan?: number | null;

    dinhKem?: string | null;

    tinhTrangNhiemVuId?: string | null;
    tinhTrangNhiemVuTen?: string | null;
    tinhTrangNhiemVu?: DefaultOptionType | null;

    phuongAnKyThuat?: string | null;
    keHoachUngDung?: string | null;

    thanhViens?: IThanhVienThamGia[] | null;

    readOnly?: boolean | null;
}

export interface IThuyetMinhXHNV {
    id: string;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;
    dangKyChuTriTenToChuc?: string | null;

    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    loaiNhiemVu?: LoaiNhiemVu | null;

    thoiGian?: [Dayjs | null, Dayjs | null];
    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;

    capQuanLyId?: string | null;
    capQuanLy?: DefaultOptionType | null;
    capQuanLyTen?: string | null;

    tongKinhPhi?: number | null;
    kinhPhiTuNguonNhaNuoc?: number | null;
    kinhPhiNgoaiNhaNuoc?: number | null;
    vonTuCo?: number | null;
    vonLienDoanh?: number | null;

    phuongThucKhoan?: PhuongThucKhoan | null;
    kinhPhiKhoan?: number | null;
    kinhPhiKhongKhoan?: number | null;

    dinhKem?: string | null;

    tinhTrangNhiemVuId?: string | null;
    tinhTrangNhiemVuTen?: string | null;
    tinhTrangNhiemVu?: DefaultOptionType | null;

    hoatDongPhucVuNghienCuu?: string | null;
    loiIchNhiemVu?: string | null;

    thanhViens?: IThanhVienThamGia[] | null;

    readOnly?: boolean | null;
}


export interface IThuyetMinhSXTN {
    id: string;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;
    dangKyChuTriTenToChuc?: string | null;

    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    loaiNhiemVu?: LoaiNhiemVu | null;

    thoiGian?: [Dayjs | null, Dayjs | null];
    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;

    capQuanLyId?: string | null;
    capQuanLy?: DefaultOptionType | null;
    capQuanLyTen?: string | null;

    tongKinhPhi?: number | null;
    kinhPhiTuNguonNhaNuoc?: number | null;
    kinhPhiNgoaiNhaNuoc?: number | null;
    vonTuCo?: number | null;
    vonLienDoanh?: number | null;

    phuongThucKhoan?: PhuongThucKhoan | null;
    kinhPhiKhoan?: number | null;
    kinhPhiKhongKhoan?: number | null;

    dinhKem?: string | null;

    phuongAnTaiChinh?: string | null;
    khaNangThuHoiVon?: string | null;

    thanhViens?: IThanhVienThamGia[] | null;

    readOnly?: boolean | null;
}

//#region XetDuyetChuNhiem

export interface IBienBanMoHoSo {
    id: string;
    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;
    ngayMoHoSo?: Dayjs | null;
    diaDiem?: string | null;
    tongSoHoSoDangKy?: number | null;
    soHoSoNiemPhongKin?: number | null;
    soHoSoHopLe?: number | null;


    thanhPhanThamGias?: IThanhPhanThamGiaMoHoSo[] | null;
    chiTietMoHoSos?: IChiTietMoHoSo[] | null;
    tinhTrangTruocKhiRaSoats?: IChiTietMoHoSo[] | null;
    tinhTrangSauKhiRaSoats?: IChiTietMoHoSo[] | null;
    hoSoHopLes?: IChiTietMoHoSo[] | null;

    readOnly?: boolean | null;
}

export interface IThanhPhanThamGiaMoHoSo {
    id: string;
    bienBanMoHoSoId?: string | null;
    bienBanMoHoSo?: DefaultOptionType | null;
    tenCoQuan?: string | null;
    hoTenNguoiThamDu?: string | null;
}



export interface IChiTietMoHoSo {
    id: string;

    bienBanMoHoSoId?: string | null;
    bienBanMoHoSo?: DefaultOptionType | null;

    nguoiDangKyId?: string | null;
    nguoiDangKy?: DefaultOptionType | null;
    nguoiDangKyHoTen?: string | null;

    tenCaNhanToChucDangKy?: string | null;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;

    phanLoai?: LoaiChiTietMoHoSo | null;

    nopDungHan?: boolean | null;
    dayDuTaiLieu?: boolean | null;
    coConDauTaiKhoan?: boolean | null;

    capQuanLyId?: string | null;
    capQuanLy?: DefaultOptionType | null;
    capQuanLyName?: string | null;

    viPhamDangChuTri?: boolean | null;
    viPhamNoDong?: boolean | null;
    viPhamBiDinhChi?: boolean | null;
    viPhamNopMuon?: boolean | null;
    viPhamLuuGiuKetQua?: boolean | null;

    hopLeDeDuaVaoDanhGia?: boolean | null;
    ghiChu?: string | null;
}


export interface IHoiDongTuyenChon {
    id: string;
    ten: string;
    ngayThanhLap?: Dayjs | null;
    moTa?: string | null;
    dinhKem?: string | null;
    thanhViens?: IThanhVienHoiDongTuyenChon[] | null;
    readOnly?: boolean | null;
}

export interface IThanhVienHoiDongTuyenChon {
    id: string;
    
    hoiDongTuyenChonId?: string | null;
    hoiDongTuyenChon?: DefaultOptionType | null;
    hoiDongTuyenChonTen?: string | null;

    thanhVienId?: string | null;
    thanhVien?: DefaultOptionType | null;
    thanhVienHoTen?: string | null;

    chucVuId?: string | null;
    chucVu?: DefaultOptionType | null;
    chucVuTen?: string | null;

    donViCongTac?: string | null;
}

export interface IPhieuDanhGiaNhanXet {
    id: string;
    
    nguoiDanhGiaId?: string | null;
    nguoiDanhGia?: DefaultOptionType | null;
    nguoiDanhGiaHoTen?: string | null;
    
    ngayLapPhieu?: Dayjs | null;
    
    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;
    
    chuNhiemId?: string | null;
    chuNhiem?: DefaultOptionType | null;
    chuNhiemHoTen?: string | null;
    
    nhiemVuId?: string | null;
    nhiemVuTen?: string | null;
    nhiemVu?: DefaultOptionType | null;
    
    loaiPhieu?: LoaiPhieuDanhGiaNhanXet | null;
    tongDiem?: number | null;
    loaiDeNghiThucHien?: LoaiDeNghiThucHien | null;
    noiDungDieuChinh?: string | null;
    nhanXetGiaiThich?: string | null;

    chiTietDanhGiaNhanXets?: IChiTietDanhGiaNhanXet[] | null;
    readOnly?: boolean | null;
}

export interface IChiTietDanhGiaNhanXet {
    id: string;
    phieuDanhGiaNhanXetId?: string | null;
    tieuChiId?: string | null;
    tieuChiTen?: string | null;
    diemSo: number;
    heSo: number;
    diemQuyDoi: number;
    nhanXet?: string | null;
}

export enum LoaiHoanThienHoSo
{
    RaSoat = 1,
    TuDanhGia = 2,
}

export interface IHoanThienHoSo {
    id: string;
    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;
    nhiemVuId?: string | null;
    nhiemVuTen?: string | null;
    nhiemVu?: DefaultOptionType | null;
    chuNhiemId?: string | null;
    chuNhiem?: DefaultOptionType | null;
    chuNhiemHoTen?: string | null;
    baoCaoGiaiTrinh?: string | null;
    dinhKemBaoCaoGiaiTrinh?: string | null;
    dinhKemThuyetMinhDaSua?: string | null; 
    
    tongKinhPhiSauDieuChinh?: number | null;
    nganSachNhaNuocSauDieuChinh?: number | null;
    thoiGianThucHienDieuChinh?: number | null;
    chuyenVienDaDuyet?: boolean | null;
    yKienThamDinh?: string | null;
    ngayXacNhan?: Dayjs | null;

    loaiHoanThienHoSo?: LoaiHoanThienHoSo | null;

    readOnly?: boolean | null;
}

export enum LoaiBienBanKiemPhieu
{
    KiemPhieu = 1,
    XetChon = 2,
}

export interface IBienBanKiemPhieu {
    id: string;
    tenCaNhanToChucDangKy?: string | null;
    ngayKiemPhieu?: Dayjs | null;
    
    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;

    chuNhiemId?: string | null;
    chuNhiemHoTen?: string | null;
    chuNhiem?: DefaultOptionType | null;

    hoiDongTuyenChonId?: string | null;
    hoiDongTuyenChonTen?: string | null;
    hoiDongTuyenChon?: DefaultOptionType | null;

    soPhieuPhatRa?: number | null;
    soPhieuThuVe?: number | null;
    soPhieuHopLe?: number | null;
    soPhieuKhongHopLe?: number | null;
    soPhieuTanThanh?: number | null;
    soPhieuKhongTanThanh?: number | null;
    soPhieuTrong?: number | null;
    
    tongDiemTrungBinh?: number | null;
    ketLuanTrungTuyen?: boolean | null;
    dinhKem?: string | null;

    loaiBienBan?: LoaiBienBanKiemPhieu | null;

    readOnly?: boolean | null;
}

export interface IToTrinhPheDuyet {
    id: string;
    soToTrinh?: string | null;
    ngayTrinh?: Dayjs | null;
    ten?: string | null;
    noiDungToTrinh?: string | null;
    dinhKem?: string | null;
    trangThai?: TrangThaiToTrinh | null;
    yKienLanhDao?: string | null;
    ngayDuyet?: Dayjs | null;
    chiTietToTrinhs?: IChiTietToTrinh[] | null;

    readOnly?: boolean | null;
}

export interface IChiTietToTrinh {
    id: string;
    ten?: string | null;
    toTrinhId?: string | null;
    toTrinh?: DefaultOptionType | null;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;

    nhiemVuId?: string | null;
    nhiemVuTen?: string | null;
    nhiemVu?: DefaultOptionType | null;

    chuNhiemId?: string | null;
    chuNhiem?: DefaultOptionType | null;
}

export interface IQuyetDinhPheDuyet {
    id: string;
    ten?: string | null;
    soQuyetDinh?: string | null;
    ngayKy?: Dayjs | null;
    nguoiKy?: string | null;
    trichYeu?: string | null;
    dinhKem?: string | null;

    toTrinhId?: string | null;
    toTrinhTen?: string | null;
    toTrinh?: DefaultOptionType | null;

    chiTietQuyetDinhs?: IChiTietQuyetDinh[] | null;
    readOnly?: boolean | null;
}

export interface IChiTietQuyetDinh {
    id: string;
    
    quyetDinhId?: string | null;
    quyetDinh?: DefaultOptionType | null;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;

    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    chuNhiemId?: string | null;
    chuNhiem?: DefaultOptionType | null;
    chuNhiemHoTen?: string | null;

    kinhPhiDuocDuyet?: number | null;
    thoiGianThucHien?: number | null;
}

export interface IHopDongKhoaHoc {
    id: string;

    quyetDinhPheDuyetId?: string | null;
    quyetDinhPheDuyetTen?: string | null;
    quyetDinhPheDuyet?: DefaultOptionType | null;

    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    chuNhiemId?: string | null;
    chuNhiem?: DefaultOptionType | null;
    chuNhiemHoTen?: string | null;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;

    soHopDong?: string | null;
    tenHopDong?: string | null;
    
    ngayKy?: Dayjs | null;
    ngayHieuLuc?: Dayjs | null;
    ngayKetThucDuKien?: Dayjs | null;

    tongKinhPhi?: number | null;
    kinhPhiNganSach?: number | null;
    kinhPhiKhac?: number | null;
    
    soDotCapKinhPhi?: number | null;
    dinhKem?: string | null;

    readOnly?: boolean | null;
}

//#endregion

//#region ThucHienNhiemVu
export interface IDonViPhoiHop {
    id: string;
    ten?: string | null;
    diaChi?: string | null;
    dienThoai?: string | null;
    email?: string | null;
    hoTenDaiDien?: string | null;
    chucVu?: string | null;
    noiDungThamGia?: string | null;
    sanPhamBanGiao?: string | null;
    kinhPhiPhanBo?: number | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}


export interface IHoSoThamDinh {
    id: string;
    
    nhiemVuId?: string | null;
    nhiemVuTen?: string | null;
    nhiemVu?: DefaultOptionType | null;
    
    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;
    
    chuNhiemId?: string | null;
    chuNhiemHoTen?: string | null;
    chuNhiem?: DefaultOptionType | null;
    
    tongKinhPhiDeXuat?: number | null;
    nganSachNhaNuoc?: number | null;
    nguonKhac?: number | null;
    dinhKem?: string | null;

    keHoachThucHiens?: IKeHoachThucHien[] | null;
    khoanMucKinhPhis?: IKhoanMucKinhPhi[] | null;

    readOnly?: boolean | null;
}


export interface IKeHoachThucHien {
    id: string;
    
    hoSoThamDinhId?: string | null;
    hoSoThamDinh?: DefaultOptionType | null;
    
    ten?: string | null;
    ketQuaPhaiDat?: string | null;
    
    thoiGian?: [Dayjs | null, Dayjs | null];
    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;
    
    nguoiPhuTrachId?: string | null;
    nguoiPhuTrachHoTen?: string | null;
    nguoiPhuTrach?: DefaultOptionType | null;
    
    kinhPhiDuKien?: number | null;
    nhanXet?: string | null;
}

export interface IKhoanMucKinhPhi {
    id: string;

    hoSoThamDinhId?: string | null;
    hoSoThamDinh?: DefaultOptionType | null;

    ten?: string | null;

    donViTinhId?: string | null;
    donViTinhTen?: string | null;
    donViTinh?: DefaultOptionType | null;

    soLuong?: number | null;
    donGia?: number | null;
    thanhTien?: number | null;
    ghiChu?: string | null;
    nhanXet?: string | null;
}

export interface IHoiDongThamDinh {
    id: string;
    ten: string;
    ngayThanhLap?: Dayjs | null;
    moTa?: string | null;
    dinhKem?: string | null;
    thanhViens?: IThanhVienHoiDongThamDinh[] | null;

    readOnly?: boolean | null;
}

export interface IThanhVienHoiDongThamDinh {
    id: string;
    hoiDongThamDinhId?: string | null;
    
    thanhVienId?: string | null;
    thanhVienHoTen?: string | null;
    thanhVien?: DefaultOptionType | null;
    
    chucVuId?: string | null;
    chucVuTen?: string | null;
    chucVu?: DefaultOptionType | null;

    donViCongTac?: string | null;
}

export interface IBienBanThamDinh {
    id: string;
    
    hoSoThamDinhId?: string | null;
    hoSoThamDinh?: DefaultOptionType | null;

    hoiDongThamDinhId?: string | null;
    hoiDongThamDinh?: DefaultOptionType | null;
    hoiDongThamDinhTen?: string | null;

    ngayHop?: Dayjs | null;
    diaDiem?: string | null;

    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;

    chuNhiemId?: string | null;
    chuNhiem?: DefaultOptionType | null;
    chuNhiemHoTen?: string | null;

    tongKinhPhiDeXuat?: number | null;
    tongKinhPhiDuocDuyet?: number | null;
    tongKinhPhiCatGiam?: number | null;

    ghiChu?: string | null;
    dinhKem?: string | null;

    ketQuaThamDinhKeHoachs?: IKetQuaThamDinhKeHoach[] | null;
    ketQuaThamDinhKinhPhis?: IKetQuaThamDinhKinhPhi[] | null;

    readOnly?: boolean | null;
}

export interface IKetQuaThamDinhKeHoach {
    id: string;
    
    bienBanThamDinhId?: string | null;
    bienBanThamDinh?: DefaultOptionType | null;

    dongY?: boolean | null;
    keHoachThucHienId?: string | null;
    keHoachThucHienTen?: string | null;
    keHoachThucHien?: DefaultOptionType | null;
    sanPhamYeuCauLai?: string | null;
    
    thoiGian?: [Dayjs | null, Dayjs | null];
    ngayBatDauDuocDuyet?: Dayjs | null;
    ngayKetThucDuocDuyet?: Dayjs | null;
    
    kinhPhiDuocDuyet?: number | null;
}

export interface IKetQuaThamDinhKinhPhi {
    id: string;
    
    bienBanThamDinhId?: string | null;
    bienBanThamDinh?: DefaultOptionType | null;

    khoanMucKinhPhiId?: string | null;
    khoanMucKinhPhiTen?: string | null;
    khoanMucKinhPhi?: DefaultOptionType | null;

    soLuongDuocDuyet?: number | null;
    donGiaDuocDuyet?: number | null;
    thanhTienDuocDuyet?: number | null;
    
    lyDoCatGiam?: string | null;
    ghiChuHoiDong?: string | null;
}

export interface IQuyetDinhTrienKhai {
    id: string;
    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;
    dangKyChuTriId?: string | null;
    chuNhiemId?: string | null;
    chuNhiem?: DefaultOptionType | null;
    chuNhiemHoTen?: string | null;
    ten?: string | null;
    soQuyetDinh?: string | null;
    ngayKy?: Dayjs | null;
    coQuanBanHanh?: string | null;
    kinhPhiPheDuyet?: number | null;
    thoiGianThucHien?: number | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface IHopDongTrienKhai {
    id: string;
    
    quyetDinhTrienKhaiId: string;
    quyetDinhTrienKhai?: DefaultOptionType | null;
    quyetDinhTrienKhaiTen?: string | null;

    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;

    dangKyChuTriId?: string | null;
    dangKyChuTri?: DefaultOptionType | null;

    chuNhiemId?: string | null;
    chuNhiem?: DefaultOptionType | null;
    chuNhiemTen?: string | null;

    ten?: string | null;
    soHopDong?: string | null;
    
    ngayKy?: Dayjs | null;
    ngayHieuLuc?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;
    
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

//#endregion

//#region TrienKhaiNhiemVu
export enum TuDanhGia
{
    ChamTienDo = 1,
    DamBaoTienDo = 2,
    VuotTienDo = 3
}
export interface IBaoCaoTienDo {
    id: string;
    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;
    ngayBaoCao?: Dayjs | null;
    keHoachThucHienId?: string | null;
    keHoachThucHien?: DefaultOptionType | null;
    keHoachThucHienTen?: string | null;
    phanTramHoanThanh?: number | null;
    ketQuaDatDuoc?: string | null;
    sanPhamCuThe?: string | null;
    tuDanhGia?: TuDanhGia | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface IBaoCaoGiaiNgan {
    id: string;

    hopDongId?: string | null;
    hopDongTen?: string | null;
    hopDong?: DefaultOptionType | null;

    ngayGiaiNgan?: Dayjs | null;

    khoanMucKinhPhiId?: string | null;
    khoanMucKinhPhi?: DefaultOptionType | null;
    khoanMucKinhPhiTen?: string | null;

    noiDungChi?: string | null;
    soTienDaChi?: number | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export enum TrangThaiGiaiDoan
{
    ChuaThucHien = 1,
    DangThucHien = 2,
    ChoNghiemThu = 3,
    DaHoanThanh = 4
}

export interface IKeHoachHopDong {
    id: string;
    
    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;

    ten?: string | null;
    ketQuaPhaiDat?: string | null;
    
    thoiGian?: [Dayjs | null, Dayjs | null];
    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;
    
    nguoiPhuTrachId?: string | null;
    nguoiPhuTrach?: DefaultOptionType | null;
    nguoiPhuTrachHoTen?: string | null;
    
    kinhPhiDuKien?: number | null;
    trangThai?: TrangThaiGiaiDoan | null;
    readOnly?: boolean | null;
}

export interface IDieuChinhHopDong {
    id: string;
    hopDongId?: string | null;
    hopDongTen?: string | null;
    hopDong?: DefaultOptionType | null;

    keHoachHopDongId?: string | null;
    keHoachHopDong?: DefaultOptionType | null;
    keHoachHopDongTen?: string | null;

    soPhuLucHopDong?: string | null;
    ngayKyPhuLuc?: Dayjs | null;
    lyDoDieuChinh?: string | null;
    thoiGianKetThucMoi?: Dayjs | null;
    tongKinhPhiMoi?: number | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface IKiemTraDinhKy {
    id: string;
    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;
    
    thanhPhanDoanKiemTra?: string | null;
    noiDungKiemTra?: string | null;
    ketLuanDoanKiemTra?: string | null;
    
    datYeuCau?: boolean | null;
    kienNghi?: string | null;
    dinhKem?: string | null;

    readOnly?: boolean | null;
}

export enum DiemDanhGia
{
    TrungBinh = 1,
    Kha = 2,
    Tot = 3
}

export interface INghiemThuKhoiLuong {
    id: string;
    
    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;
    
    keHoachHopDongId?: string | null;
    keHoachHopDong?: DefaultOptionType | null;
    keHoachHopDongTen?: string | null;
    
    ngayNghiemThu?: Dayjs | null;
    khoiLuongDuocDuyet?: number | null;
    danhGiaChatLuong?: DiemDanhGia | null;
    soTienDeNghiThanhToan?: number | null;
    
    chuyenVienDaDuyet?: boolean | null;
    yKienChuyenVien?: string | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

//#endregion

//#region NghiemThuNhiemVu
export interface ISanPhamNghiemThu {
    id: string;

    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;

    ten: string;

    loaiSanPhamId?: string | null;
    loaiSanPham?: DefaultOptionType | null;
    loaiSanPhamTen?: string | null;

    yeuCauTheoHopDong?: string | null;
    ketQuaDatDuocThucTe?: string | null;
    datYeuCau?: boolean | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export enum CapNghiemThu
{
    CoSo = 1,
    ChinhThuc = 2
}

export interface IHoiDongNghiemThu {
    id: string;
    ten: string;
    ngayThanhLap?: Dayjs | null;
    capHoiDong?: CapNghiemThu | null;
    moTa?: string | null;
    dinhKem?: string | null;
    thanhViens?: IThanhVienHoiDongNghiemThu[] | null;
    readOnly?: boolean | null;
}

export interface IThanhVienHoiDongNghiemThu {
    id: string;
    hoiDongNghiemThuId?: string | null;

    thanhVienId?: string | null;
    thanhVien?: DefaultOptionType | null;
    thanhVienHoTen?: string | null;

    chucVuId?: string | null;
    chucVu?: DefaultOptionType | null;
    chucVuTen?: string | null;

    donViCongTac?: string | null;
}

export enum XepLoaiNghiemThu
{
    KhongDat = 1, // < 70 điểm
    Dat = 2,     // >= 70 điểm
    XuatSac = 3 // > 90 điểm
}

export interface IKetQuaNghiemThu {
    id: string;
    
    sanPhamNghiemThuId?: string | null;
    sanPhamNghiemThu?: DefaultOptionType | null;
    sanPhamNghiemThuTen?: string | null;

    hoiDongNghiemThuId?: string | null;
    hoiDongNghiemThu?: DefaultOptionType | null;
    hoiDongNghiemThuTen?: string | null;

    capNghiemThu?: CapNghiemThu | null;
    ngayNghiemThu?: Dayjs | null;
    diemSo?: number | null;
    xepLoai?: XepLoaiNghiemThu | null;
    nhanXet?: string | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface IBienBanNghiemThu {
    id: string;
    
    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;

    hopDongNghiemThuId?: string | null;
    hopDongNghiemThu?: DefaultOptionType | null;
    hopDongNghiemThuTen?: string | null;

    ten?: string | null;
    ngayNghiemThu?: Dayjs | null;
    
    soPhieuPhatRa?: number | null;
    soPhieuThuVe?: number | null;
    soPhieuHopLe?: number | null;
    tongDiemTrungBinh?: number | null;

    xepLoai?: XepLoaiNghiemThu | null;
    ketLuanCuaHoiDong?: string | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface IThamDinhSauNghiemThu {
    id: string;

    bienBanNghiemThuId?: string | null;
    bienBanNghiemThu?: DefaultOptionType | null;
    bienBanNghiemThuTen?: string | null;

    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;

    baoCaoGiaiTrinhSuaChua?: string | null;
    dinhKemBaoCaoMoi?: string | null;
    canBoThamDinh?: string | null;
    
    xacNhanDaSuaChua?: boolean | null;
    yKienThamDinh?: string | null;
    ngayXacNhan?: Dayjs | null;
    
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface IHoSoNghiemThu {
    id: string;

    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;

    hoiDongNghiemThuId?: string | null;
    hoiDongNghiemThu?: DefaultOptionType | null;
    hoiDongNghiemThuTen?: string | null;

    capNghiemThu?: CapNghiemThu | null;
    ngayNopHoSo?: Dayjs | null;
    
    baoCaoTongKet?: string | null;
    baoCaoTomTat?: string | null;
    baoCaoVeSanPham?: string | null;
    
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface IGiayChungNhanKetQua {
    id: string;
    
    hopDongId?: string | null;
    hopDong?: DefaultOptionType | null;
    hopDongTen?: string | null;

    maSoDangKy?: string | null;
    soGiayChungNhan?: string | null;
    ngayCap?: Dayjs | null;
    nguoiKy?: string | null;
    tenKetQuaLuuTru?: string | null;
    mucDoUngDung?: string | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

//#endregion

//#region KetQuaHDKH

export interface IThongTinChuyenGiao {
    id: string;
    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;
    tenCaNhanToChucNhan?: string | null;
    diaChi?: string | null;
    dienThoai?: string | null;
    email?: string | null;
    noiDungChuyenGiao?: string | null;
    phuongThucChuyenGiao?: string | null;
    thoiGianChuyenGiao?: Dayjs | null;
    diaDiemChuyenGiao?: string | null;
    dinhKem?: string | null;
    trangThai?: TrangThaiThongTinChuyenGiao | null;
    readOnly?: boolean | null;
}

export interface IQuyetDinhPhamViChuyenGiao {
    id: string;
    thongTinChuyenGiaoId: string;
    thongTinChuyenGiao?: DefaultOptionType | null;
    thongTinChuyenGiaoNoiDung?: string | null;
    soQuyetDinh?: string | null;
    ngayKy?: Dayjs | null;
    coQuanBanHanh?: string | null;
    phamViChuyenGiao?: string | null;
    doiTuongChuyenGiao?: string | null;
    yeuCauChuyenGiao?: string | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface ISanPhamKhoaHoc {
    id: string;
    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;
    tenSanPham?: string | null;
    loaiSanPhamId?: string | null;
    loaiSanPham?: DefaultOptionType | null;
    loaiSanPhamTen?: string | null;
    moTaSanPham?: string | null;
    khaNangUngDung?: string | null;
    diaChiUngDung?: string | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}

export interface IPhieuDangKyCapGCNKetQuaThucHien {
    id: string;
    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;
    soPhieu?: string | null;
    ngayDangKy?: Dayjs | null;
    toChucCaNhanDangKy?: string | null;
    ketQuaThucHien?: string | null;
    dinhKem?: string | null;
    trangThai?: TrangThaiPhieuDangKyCapGCN | null;
    readOnly?: boolean | null;
}

//#endregion
