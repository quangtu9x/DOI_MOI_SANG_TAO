import { Gender, LoaiBangChiPhi, LoaiNhapLieuChiPhi, OrganizationUnitType, TrangThaiDuyet, UserType } from "@/models";
import { LOAI_NHIEM_VU } from "./nhiem-vu";

export const CATEGORY_GROUP_CODE = {
    TRINH_DO_CHUYEN_MON: "DANH_MUC_TRINH_DO_CHUYEN_MON",
    JOB_POSITION: "DANH_MUC_VI_TRI_CONG_VIEC",
    INVESTMENT_SECTOR: "LINH_VUC_DAU_TU",
    LEVEL: 'DANH_MUC_CAP',
    DATA_SHARING: 'DANH_MUC_TICH_HOP_VA_CHIA_SE_DU_LIEU',

    INDUSTRIALPARK_TYPE: "DANH_MUC_LOAI_KHU_CONG_NGHIEP",
    INDUSTRIALPARK_STATUS: "DANH_MUC_TINH_TRANG_KHU_CONG_NGHIEP",
    INDUSTRIALPARK_WARTER: "DANH_MUC_TINH_TRANG_XU_LY_NUOC_THAI",

    BUSINESS_TYPE: "DANH_MUC_LOAI_DOANH_NGHIEP",
    BUSINESS_CATEGORY: "DANH_MUC_LOAI_HINH_DOANH_NGHIEP",
    BUSINESS_INDUSTRY: "DANH_MUC_LINH_VUC_DAU_TU",
    BUSINESS_SUBINDUSTRY: "DANH_MUC_LINH_VUC_DAU_TU_CHI_TIET",
    BUSINESS_STATUS: "DANH_MUC_TINH_TRANG_DOANH_NGHIEP",

    PROJECT_TYPE: "DANH_MUC_LOAI_DU_AN",
    PROJECT_CATEGORY: "DANH_MUC_LOAI_HINH_DU_AN",
    PROJECT_LEVEL: "DANH_MUC_CAP_QUAN_LY_DU_AN",
    PROJECT_LAND_CLEARANCE_STATUS: "DANH_MUC_TINH_TRANG_GIAI_PHONG_MAT_BANG_DU_AN",
    PROJECT_USAGE_CONSTRUC_TYPE: "DANH_MUC_LOAI_CONG_TRINH_THEO_CONG_NANG_SU_DUNG_DU_AN",
    PROJECT_STRUCTURE_CONSTRUC_TYPE: "DANH_MUC_LOAI_CONG_TRINH_THEO_TINH_CHAT_KET_CAU_DU_AN",
    PROJECT_SECTOR: 'DANH_MUC_NGANH_NGHE_DU_AN',
    PROJECT_PROGRESS_STATUS: "DANH_MUC_TIEN_DO_DU_AN",
    PROJECT_EXECUTION_STATUS: "DANH_MUC_TINH_TRANG_DU_AN",
    PROJECT_FUNDING_SOURCE: "DANH_MUC_NGUON_VON_DU_AN",

    PERMIT_TYPE: "DANH_MUC_HINH_THUC_CAP_PHEP",
    ISSUING_AUTHORITY: "DON_VI_CAP_GIAY_PHEP_LAO_DONG",
    EDUCATION_LEVEL: "DANH_MUC_TRINH_DO_HOC_VAN",
    WORK_MODE: "DANH_MUC_HINH_THUC_LAM_VIEC",
    EXEMPTION_CASE: "TRUONG_HOP_MIEN_CAP_PHEP",
    REPORT_CASE: "TRUONG_HOP_BAO_CAO",
    REQUEST_REASON: "LY_DO_DE_NGHI_CAP_LAI",

    VISA_TYPE: "DANH_MUC_LOAI_VISA",

    RECRUITMENT_POSITION: "DANH_MUC_VI_TRI_TUYEN_DUNG",
    RECRUITMENT_INDUSTRY: "DANH_MUC_NGANH_NGHE_TUYEN_DUNG",
    RECRUITMENT_SALARY: "DANH_MUC_MUC_LUONG_TUYEN_DUNG",
    RECRUITMENT_QUALIFICATION: "DANH_MUC_TRINH_DO_TUYEN_DUNG",
    RECRUITMENT_EXPERIENCE: "DANH_MUC_KINH_NGHIEM_TUYEN_DUNG",
    AGREEMENT_TYPE: "DANH_MUC_LOAI_THOA_UOC",

    TRAINING_TYPE: "DANH_MUC_LOAI_HINH_DAO_TAO",
    REGISTER_TYPE: "DANH_MUC_DANG_KY_NOI_QUY",

    MA_NGACH: "DANH_MUC_MA_NGACH",
    HOC_VI: "DANH_MUC_HOC_VI",
    HOC_HAM: "DANH_MUC_HOC_HAM",
    NGOAI_NGU: "DANH_MUC_NGOAI_NGU",
    BAC_DAO_TAO: "DANH_MUC_BAC_DAO_TAO",
    CAP_QUAN_LY: "DANH_MUC_CAP_QUAN_LY",
    VAI_TRO: "DANH_MUC_VAI_TRO",
    LINH_VUC: "DANH_MUC_LINH_VUC",
    CHUC_VU_HOI_DONG_DANH_GIA: "DANH_MUC_CHUC_VU_HOI_DONG_DANH_GIA",
    CHUC_VU_HOI_DONG_TU_VAN: "DANH_MUC_CHUC_VU_HOI_DONG_TU_VAN",
    TINH_TRANG_NHIEM_VU: "DANH_MUC_TINH_TRANG_NHIEM_VU",

    MUC_TIEU_DE_TAI: "DANH_MUC_MUC_TIEU_DE_TAI",
    TONG_QUAN_THNG: "DANH_MUC_TONG_QUAN_THNG",
    NOI_DUNG: "DANH_MUC_NOI_DUNG",
    CACH_TIEP_CAN: "DANH_MUC_CACH_TIEP_CAN",
    SAN_PHAM_LOI_ICH: "DANH_MUC_SAN_PHAM_LOI_ICH",
    LOAI_SAN_PHAM: "DANH_MUC_LOAI_SAN_PHAM",
    NANG_LUC_TO_CHUC: "DANH_MUC_NANG_LUC_TO_CHUC",
    DON_VI_TINH: "DANH_MUC_DON_VI_TINH",

    LINH_VUC_SANG_KIEN: "DANH_MUC_LINH_VUC_SANG_KIEN",
    DON_VI_CONG_NHAN: "DANH_MUC_DON_VI_CONG_NHAN",
    DON_VI_CONG_NHAN_SANG_KIEN: 'DANH_MUC_DON_VI_CONG_NHAN_SANG_KIEN',
    DOI_TUONG_NOP_SANG_KIEN: 'DANH_MUC_DOI_TUONG_NOP_SANG_KIEN',
    LOAI_SANG_KIEN: 'DANH_MUC_LOAI_SANG_KIEN',
    THANH_PHAN_HO_SO: 'DANH_MUC_THANH_PHAN_HO_SO',

    SU_CAN_THIET: "DANH_MUC_SU_CAN_THIET",
    TIEU_CHI_DANH_GIA_SANG_KIEN: "DANH_MUC_TIEU_CHI_DANH_GIA_SANG_KIEN",
    TINH_MOI: "DANH_MUC_TINH_MOI",
    HIEU_QUA_AP_DUNG: "DANH_MUC_HIEU_QUA_AP_DUNG",
    KHA_NANG_NHAN_RONG: "DANH_MUC_KHA_NANG_NHAN_RONG",
    LOAI_DU_AN: "DANH_MUC_LOAI_DU_AN",
    THUE_VAT: "DANH_MUC_THUE_VAT",


    LOAI_NHIEM_VU: "DANH_MUC_LOAI_NHIEM_VU",
    NGUON_NHIEM_VU: "DANH_MUC_NGUON_NHIEM_VU",
    CHUONG_TRINH_NCKH: "DANH_MUC_CHUONG_TRINH_NCKH",
    CHUYEN_NGANH: "DANH_MUC_CHUYEN_NGANH",
    NGUON_NGAN_SACH: "DANH_MUC_NGUON_NGAN_SACH",
    LOAI_TAI_LIEU_NVKH: "DANH_MUC_LOAI_TAI_LIEU_NVKH",
    CHU_DAU_TU: "DANH_MUC_CHU_DAU_TU",

} 


export const GENDERS = [
    {
        id: Gender.female,
        name: "Nữ"
    },
    {
        id: Gender.male,
        name: "Nam"
        },
    ];

export const USER_TYPES = [
    {
        id: UserType.Admin,
        name: "Lãnh đạo, Quản trị hệ thống"
    },
    {
        id: UserType.Basic,
        name: "Chuyên viên, Người NCKH"
    },
    {
        id: UserType.Specialist,
        name: "Chuyên gia"
    },
    ];

export const ORGANIZATION_UNIT_TYPES = [
    {
        id: OrganizationUnitType.organization,
        name: "Đơn vị"
    },
    {
        id: OrganizationUnitType.department,
        name: "Phòng ban"
    },
    {
        id: OrganizationUnitType.team,
        name: "Nhóm"
    },
];

export const TRANG_THAIS = [
    {
        id: TrangThaiDuyet.ChoDuyet,
        name: "Chờ duyệt",
        className: "badge badge-light-warning"
    },
    {
        id: TrangThaiDuyet.DaDuyet,
        name: "Đã duyệt",
        className: "badge badge-light-success"
    },
    {
        id: TrangThaiDuyet.TuChoi,
        name: "Từ chối",
        className: "badge badge-light-danger"
    },
];

export const LOAI_BANGS = [
    {
        id: LoaiBangChiPhi.MotBuoc,
        name: " (1 bước) Hạng mục phần mềm nội bộ, cơ sở dữ liệu trong Báo cáo kinh tế - kỹ thuật"
    },
    {
        id: LoaiBangChiPhi.HaiBuoc,
        name: "(2 bước) Hạng mục phần mềm nội bộ, cơ sở dữ liệu"
    },
];

export const LOAI_NHAP_LIEUS = [
    {
        id: LoaiNhapLieuChiPhi.NguoiDungNhapLieu,
        name: "Người dùng nhập liệu"
    },
    {
        id: LoaiNhapLieuChiPhi.TinhTongCacChiPhiCon,
        name: "Tính tổng các chi phí con"
    },
    {
        id: LoaiNhapLieuChiPhi.TinhDinhMucVaCongThuc,
        name: "Tính định mức và công thức"
    },
    {
        id: LoaiNhapLieuChiPhi.DaCoDinhMucChiTinhCongThuc,
        name: "Đã có định mức, chỉ tính công thức"
    },
    {
        id: LoaiNhapLieuChiPhi.TinhTongDuToan,
        name: "Tính tổng dự toán"
    },
    {
        id: LoaiNhapLieuChiPhi.NguoiDungNhapDinhMucTinhCongThuc,
        name: "Người dùng nhập định mức, tính công thức"
    }
];

export const EASE_IN = [0.12, 0.00, 0.39, 0.00] as const; // nhanh dần 
export const EASE_OUT = [0.12, 0.00, 0.39, 0.00] as const; // chậm dần
    