import { DefaultOptionType } from "antd/es/select";
import { Dayjs } from "dayjs";

export enum TrangThaiPhieu {
    ChoDuyet = 1,
    DaDuyet = 2,
    TuChoi = 3,
}

export interface IPhieuDeNghiTamUng {
    id: string;
    nhiemVuId?: string | null;
    nhiemVu?: DefaultOptionType | null;
    nhiemVuTen?: string | null;
    maPhieu?: string | null;
    ngayLap?: Dayjs | null;
    soTienDeNghi?: number | null;
    lyDoTamUng?: string | null;
    dotTamUng?: number | null;
    trangThai?: TrangThaiPhieu | null;
    dinhKem?: string | null;
    ghiChu?: string | null;
}

export interface IThongTinDaTamUng {
    id: string;
    phieuDeNghiTamUngId?: string | null;
    phieuDeNghiTamUng?: DefaultOptionType | null;
    phieuDeNghiTamUngMaPhieu?: string | null;
    ngayTamUng?: Dayjs | null;
    soTienTamUng?: number | null;
    soChungTu?: string | null;
    dinhKem?: string | null;
    ghiChu?: string | null;
}

export interface IPhieuDeNghiThanhToan {
    id: string;
    nhiemVuId?: string | null;
    nhiemVuTen?: string | null;
    maPhieu?: string | null;
    ngayLap?: Dayjs | null;
    soTienDeNghi?: number | null;
    noiDungThanhToan?: string | null;
    dotThanhToan?: number | null;
    trangThai?: TrangThaiPhieu | null;
    dinhKem?: string | null;
    ghiChu?: string | null;
    readOnly?: boolean | null;
}

export interface IThongTinDaThanhToan {
    id: string;
    phieuDeNghiThanhToanId?: string | null;
    phieuDeNghiThanhToan?: DefaultOptionType | null;
    phieuDeNghiThanhToanMaPhieu?: string | null;
    ngayThanhToan?: Dayjs | null;
    soTienThanhToan?: number | null;
    soTienTamUngDaKhauTru?: number | null;
    soTienThucNhan?: number | null;
    soChungTu?: string | null;
    dinhKem?: string | null;
    ghiChu?: string | null;
}
