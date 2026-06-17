import { Dayjs } from "dayjs";
import { Gender } from "./catalogs";
import { DefaultOptionType } from "antd/lib/select";

export enum DiemTrinhDoNgoaiNgu {
    TrungBinh = 1,
    Kha = 2,
    Tot = 3,
}
export interface IBusiness {
    id: string;
}
export interface IIndustrialPark {
    id: string;
    name: string;
}

interface IChuyenGiaBase {
    id: string;
    maSoVienChuc: string;
    hoTen: string;
    maNgachId?: string | null;
    maNgach?: DefaultOptionType | null;
    maNgachTen?: string | null;
    ngaySinh?: Dayjs | null;
    gioiTinh?: Gender | null;
    donViCongTac?: string | null;
    chucVu?: string | null;

    hocViId?: string | null;
    hocVi?: DefaultOptionType | null;
    hocViTen?: string | null;
    hocViVietTat?: string | null;
    ngayDatHocVi?: Dayjs | null;

    hocHamId?: string | null;
    hocHam?: DefaultOptionType | null;
    hocHamTen?: string | null;
    hocHamVietTat?: string | null;
    ngayDatHocHam?: Dayjs | null;

    diaChi?: string | null;
    dienThoai?: string | null;
    email?: string | null;
    linhVuc?: string | null;
    chuyenNganh?: string | null;
    chuyenMon?: string | null;
    huongNghienCuu?: string | null;
    laChuyenGiaNgoai?: boolean | null;
    dinhKem?: string | null;

    readOnly?: boolean;
}

export interface IChuyenGia extends IChuyenGiaBase {
    trinhDoNgoaiNgus?: ITrinhDoNgoaiNgu[] | null;
}

export interface IChuyenGiaDaoTao extends IChuyenGiaBase {   
    chuyenGiaId?: string | null;
    chuyenGia?: DefaultOptionType | null;
    chuyenGia_dinhKem?: string | null;
    chuyenGia_ngaySinh?: Dayjs | null;
    chuyenGia_gioiTinh?: Gender | null;
    chuyenGia_email?: string | null;
    chuyenGia_dienThoai?: string | null;
    chuyenGia_diaChi?: string | null;
    quaTrinhDaoTaos?: IQuaTrinhDaoTao[] | null;
}

export interface IChuyenGiaNghienCuu extends IChuyenGiaBase  {
    chuyenGiaId?: string | null;
    chuyenGia?: DefaultOptionType | null;
    chuyenGia_dinhKem?: string | null;
    chuyenGia_ngaySinh?: Dayjs | null;
    chuyenGia_gioiTinh?: Gender | null;
    chuyenGia_email?: string | null;
    chuyenGia_dienThoai?: string | null;
    chuyenGia_diaChi?: string | null;
    quaTrinhNghienCuus?: IQuaTrinhNghienCuu[] | null;
}


export interface IChuyenGiaGiaiThuong extends IChuyenGiaBase  {
    chuyenGiaId?: string | null;
    chuyenGia?: DefaultOptionType | null;
    chuyenGia_dinhKem?: string | null;
    chuyenGia_ngaySinh?: Dayjs | null;
    chuyenGia_gioiTinh?: Gender | null;
    chuyenGia_email?: string | null;
    chuyenGia_dienThoai?: string | null;
    chuyenGia_diaChi?: string | null;
    giaiThuongs?: IGiaiThuong[] | null;
}

export interface IGiaiThuong {
    id: string;
    
    chuyenGiaId?: string | null;
    chuyenGia?: DefaultOptionType | null;
    
    ten?: string | null;
    noiDung?: string | null;
    namCap?: Dayjs | null;
    noiCap?: string | null;
    dinhKem?: string | null;

    readOnly?: boolean | null;
}

export interface IQuaTrinhDaoTao {
    id: string;
    
    chuyenGiaId?: string | null;
    chuyenGia?: DefaultOptionType | null;

    bacDaoTaoId?: string | null;
    bacDaoTao?: DefaultOptionType | null;
    bacDaoTaoTen?: string | null;

    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;
    noiDaoTao?: string | null;
    chuyenNganh?: string | null;
    tenLuanAn?: string | null;
    tenVanBang?: string | null;
    dinhKem?: string | null;

    readOnly?: boolean | null;
}

export interface IQuaTrinhNghienCuu {
    id: string;
    chuyenGiaId?: string | null;
    chuyenGia?: DefaultOptionType | null;
    ngayBatDau?: Dayjs | null;
    ngayKetThuc?: Dayjs | null;
    ten?: string | null;
    maSo?: string | null;
    capQuanLyId?: string | null;
    capQuanLy?: DefaultOptionType | null;
    capQuanLyTen?: string | null;
    kinhPhi?: number | null;
    ngayNghiemThu?: Dayjs | null;
    vaiTroId?: string | null;
    vaiTro?: DefaultOptionType | null;
    vaiTroTen?: string | null;
    ketQua?: string | null;
    dinhKem?: string | null;

    readOnly?: boolean | null;
}

export interface ITrinhDoNgoaiNgu {
    id: string;

    chuyenGiaId?: string | null;
    chuyenGia?: DefaultOptionType | null;

    ngoaiNguId?: string | null;
    ngoaiNgu?: DefaultOptionType | null;
    ngoaiNguTen?: string | null;

    nghe?: DiemTrinhDoNgoaiNgu | null;
    noi?: DiemTrinhDoNgoaiNgu | null;
    doc?: DiemTrinhDoNgoaiNgu | null;
    viet?: DiemTrinhDoNgoaiNgu | null;
    dinhKem?: string | null;
}

export interface ITrinhDoNgoaiNguFormItem {
  id?: string;
  ngoaiNguId?: string;
  ngoaiNguTen: string;
  ngheTot: boolean;
  ngheKha: boolean;
  ngheTrungBinh: boolean;
  noiTot: boolean;
  noiKha: boolean;
  noiTrungBinh: boolean;
  vietTot: boolean;
  vietKha: boolean;
  vietTrungBinh: boolean;
  docTot: boolean;
  docKha: boolean;
  docTrungBinh: boolean;
}