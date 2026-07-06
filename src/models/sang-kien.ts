import { Dayjs } from "dayjs";
import { Gender } from "./catalogs";
import { DefaultOptionType } from "antd/lib/select";
import { TrangThaiDotDangKy } from "./nhiem-vu";
import { ActionModal } from '@/app/components';

export enum ActionModalType {
    Confirm = 1,
    Reject = 2,
    CheckDuplicate = 3,
}

export interface ActionModalConfig {
    type: ActionModalType;
    visible: boolean;
    title: string;
    apiEndpoint: string;
    payload: Record<string, unknown>;
    fieldName?: string;
    fieldLabel?: string;
    attachmentFieldName?: string;
    attachmentFieldLabel?: string;
    message?: string;
}

export enum TrangThaiHoSoSangKien {
    DangSoanThao = 1,
    ChoTiepNhan = 2,
    YeuCauBoSung = 3,
    DaTiepNhan = 4,
    TuChoiTiepNhan = 5,
    DuocCongNhan = 6,
    DangThamDinh = 10,
    KhongCongNhan = 11,
}


export interface IDotXetSangKien {
    id: string;
    ma?: string | null;
    ten: string;

    linhVucId?: string | null;
    linhVuc?: DefaultOptionType | null;
    linhVucTen?: string | null;

    capQuanLyId?: string | null;
    capQuanLy?: DefaultOptionType | null;
    capQuanLyTen?: string | null;
    thoiGian?: [Dayjs | null, Dayjs | null];
    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;
    vanBanCanCu?: string | null;
    trangThai?: TrangThaiDotDangKy | null;
    dinhKem?: string | null;

    readOnly?: boolean;
}


export interface IHoiDongSangKien {
    id: string;
    ten: string;
    ngayThanhLap?: Dayjs | null;
    moTa?: string | null;
    dinhKem?: string | null;
    thanhViens?: IThanhVienHoiDongSangKien[] | null;
    readOnly?: boolean | null;
}

export interface IThanhVienHoiDongSangKien {
    id?: string;

    hoiDongSangKienId?: string | null;
    hoiDongSangKien?: DefaultOptionType | null;
    hoiDongSangKienTen?: string | null;

    /** Id chuyên gia (chọn từ chuyengias/search) */
    chuyenGiaId?: string | null;
    chuyenGia?: DefaultOptionType | null;

    /** Vai trò trong hội đồng — lưu chuỗi tên danh mục (categories) */
    vaiTro?: string | null;

    donViCongTac?: string | null;
}

export enum PhanLoaiYKien {
    CapCoSo = 1,
    CapThanhPho = 2,
}

export interface IThanhVienDanhGiaHoiDongSangKien {
    id: string;
    hoiDongDanhGiaId?: string | null;
    chuyenGiaId?: string | null;
    chuyenGiaHoTen?: string | null;
    vaiTro?: string | null;
    daDanhGia: boolean;
    phieuDanhGiaSangKienId?: string | null;
    ngayLapPhieu?: Dayjs | null;
    tongDiem?: number | null;
}

export interface IHoiDongSangKienThanhVienDanhGia {
    hoiDongDanhGiaId: string;
    hoSoSangKienId: string;
    thanhViens: IThanhVienDanhGiaHoiDongSangKien[];
}

export interface IHoSoSangKien {
    id: string;

    dotXetSangKienId?: string | null;
    dotXetSangKien?: DefaultOptionType | null;
    dotXetSangKienTen?: string | null;
    HoSoDanhGiaSangKienId?: DefaultOptionType | null;
    donViDuocYeuCauId?: string | null;
    donViDuocYeuCau?: DefaultOptionType | null;
    donViDuocYeuCauTen?: string | null;

    chuDauTu?: string | null;
    ten: string;

    linhVucId?: string | null;
    linhVuc?: DefaultOptionType | null;
    linhVucTen?: string | null;

    ngayDuocApDungLanDau?: Dayjs | null;
    moTa?: string | null;
    thongTinCanBaoMat?: string | null;
    dieuKienCanThiet?: string | null;
    danhGiaLoiIch?: string | null;
    nhanXetTinhMoi?: string | null;
    nhanXetNoiDungGiaiPhap?: string | null;
    nhanXetKetQua?: string | null;
    nhanXetKhaNangApDung?: string | null;
    nhanXetLoiIch?: string | null;

    ngayNopHoSo?: Dayjs | null;
    nguoiNopHoSoId?: string | null;
    nguoiNopHoSo?: DefaultOptionType | null;

    /** Hội đồng đánh giá được gán cho hồ sơ (nếu có) */
    hoiDongDanhGiaId?: string | null;

    trangThai?: TrangThaiHoSoSangKien | null;
    lyDoTuChoi?: string | null;
    lyDoYeuCauBoSung?: string | null;
    maHoSo?: string | null;
    dinhKem?: string | null;
    organizationUnitCode?: string | null;
    createdBy?: string | null;

    /** Điểm trung bình đánh giá */
    diemTrungBinh?: number | null;
    ngayTiepNhan?: string | null;
    hanTiepNhan?: string | null;
    quaHanTiepNhan?: boolean | null;
    ngayCoKetQua?: string | null;
    hanKiemDuyetCongNhan?: string | null;
    quaHanKiemDuyetCongNhan?: boolean | null;
    quaHanTong?: boolean | null;
    ketQuaSangKienId?: string | null;
    ketQuaSangKienSoQuyetDinh?: string | null;
    giayChungNhanSangKienId?: string | null;
    giayChungNhanSangKienSoGCN?: string | null;
    phieuDanhGiaSangKiens?: IPhieuDanhGiaSangKien[] | null;
    yKienCapCoSo?: IYKien[];
    yKienCapThanhPho?: IYKien[];

    thanhViens?: INguoiThamGia[] | null;
    tacGias?: INguoiThamGia[] | null;
    thanhVienThamGiaApDungThus?: INguoiThamGia[] | null;
    readOnly?: boolean | null;
}

export interface ICauHinhXuLyHoSoSangKien {
    nguoiTiepNhanUserIds: string[];
    thoiHanTiepNhanNgay: number;
    thoiHanKiemDuyetCongNhanNgay: number;
}

export interface IYKien {
    id?: string;
    hoSoSangKienId?: string | null;
    diemTrungBinh?: number | null;
    soPhieuDat?: number | null;
    phanLoai?: PhanLoaiYKien | null;
    noiDungYKien?: string | null;
    dinhKem?: string | null;
}

export interface IHoSoSangKienTrungLap {
    id: string;
    maHoSo?: string | null;
    ten: string;
    moTa?: string | null;
    donViDuocYeuCauTen?: string | null;
    tyLeTrungTen: number;
    tyLeTrungMoTa: number;
    lyDoTrungLap: string;
}

export interface IHoSoDanhGiaSangKien {
    id: string;

    ten: string;
    maHoSo: string;
    moTa?: string | null;
    dinhKem?: string | null;

    trangThai?: TrangThaiHoSoSangKien | null;

    hoSoSangKienIds?: string[] | null;

    readOnly?: boolean | null;
}

export interface INguoiThamGia {
    id: string;

    hoTen?: string| null;

    chucDanhId?: string | null;
    chucDanh?: DefaultOptionType | null;
    chucDanhTen?: string | null;

    hoSoSangKienId?: string | null;
    ngaySinh?: Dayjs | null;
    donViCongTac?: string | null;

    trinhDoChuyenMonId?: string | null;
    trinhDoChuyenMon?: DefaultOptionType | null;
    trinhDoChuyenMonTen?: string | null;

    tyLeDongGop?: number | null;
    thamGiaApDungThu?: boolean | null;
    noiDungCongViec?: string | null;
}

export interface IPhieuDanhGiaSangKien {
    id: string;
    
    nguoiDanhGiaId?: string | null;
    nguoiDanhGia?: DefaultOptionType | null;
    nguoiDanhGiaHoTen?: string | null;
    
    ngayLapPhieu?: Dayjs | null;
    hoSoSangKienId?: string | null;
    hoSoSangKien?: DefaultOptionType | null;
    hoSoSangKienTen?: string | null;
    
    tongDiem?: number | null;
    noiDungDieuChinh?: string | null;
    nhanXetGiaiThich?: string | null;
    
    chiTietDanhGiaSangKiens?: IChiTietDanhGiaSangKien[] | null;
    readOnly?: boolean | null;
}

export interface IChiTietDanhGiaSangKien {
    id: string;

    phieuDanhGiaSangKienId?: string | null;
    phieuDanhGiaSangKien?: DefaultOptionType | null;

    tieuChiId?: string | null;
    tieuChi?: DefaultOptionType | null;
    tieuChiTen?: string | null;

    diemSo?: number | null;
    heSo?: number | null;
    diemQuyDoi?: number | null;
    nhanXet?: string | null;
}

export interface IKetQuaSangKien {
    id: string;
    soQuyetDinh?: string | null;
    ngayRaKetQua?: Dayjs | null;
    soPhieuDongY?: string | null;
    diemTrungBinh?: number | null;
    nhanXetChung?: string | null;
    dinhKem?: string | null;
    donViBanHanh?: string | null;

    hoSoSangKienId?: string | null;
    hoSoSangKien?: DefaultOptionType | null;
    hoSoSangKienTen?: string | null;
    hoSoSangKienIds?: string[] | null;
    hoSoSangKiens?: IHoSoSangKien[] | null;

    hoiDongSangKienId?: string | null;
    hoiDongSangKien?: DefaultOptionType | null;
    hoiDongSangKienTen?: string | null;
    readOnly?: boolean | null;
}

export interface IGiayChungNhanSangKien {
    id: string;
    soGCN?: string | null;

    hoSoSangKienId?: string | null;
    hoSoSangKien?: DefaultOptionType | null;
    hoSoSangKienTen?: string | null;
    hoSoSangKienIds?: string[] | null;
    hoSoSangKiens?: IHoSoSangKien[] | null;

    ngayCongNhan?: Dayjs | null;

    nguoiCongNhanId?: string | null;
    nguoiCongNhan?: DefaultOptionType | null;
    nguoiCongNhanTen?: string | null;

    nhanXet?: string | null;
    dinhKem?: string | null;
    readOnly?: boolean | null;
}


