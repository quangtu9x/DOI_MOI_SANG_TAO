import { XepLoaiNghiemThu } from "@/models"

export const DEFAULT_USER_PASSWORD = "Demo@123"
export const DEFAULT_HIGHLIGHT_CURRENT_NODE_COLOR = "#ffe000"


export const LEVEL_CODE = {
    PROVINCE: "CAP_TINH",
    DISTRICT: "CAP_HUYEN",
    WARD: "CAP_XA",
}

export const STATUS_CODE = {
    ACTIVE: "DANG_HOAT_DONG",
    INACTIVE: "DUNG_HOAT_DONG",
    INPROCESS: "DANG_THUC_HIEN",
}

export const ADMINISTRATIVEUNIT_LEVEL = {
    PROVINCE:  0,
    WARD: 1,
}


export const DEFAULT_IMAGE = {
    SQUARE: 'https://placehold.co/400x400?text=No+Image',
}


export const FILE_EXTENSIONS = [
  {
    NAME:'pdf',
    EXTENSION:['.pdf'],
    ICON:'fa-regular fa-file-pdf text-danger'
  },
  {
    NAME:'word',
    EXTENSION:['.doc', '.docx'],
    ICON:'fa-regular fa-file-word text-primary'
  },
  {
    NAME:'image',
    EXTENSION:['.jpg','.jpeg','.png','.gif','.svg' ],
    ICON:"fa-solid fa-file-image text-warning"
  },
]

export const TEMPLATE_FILE_CODE = {
    KE_HOACH: 'ke-hoach-export',
}

export const DATA_SHARING_CODE = {
    NHIEM_VU_KHOA_HOC: "NHIEM_VU_KHOA_HOC",
    SANG_KIEN_KHOA_HOC: "SANG_KIEN_KHOA_HOC",
    DU_AN_CNTT: "DU_AN_CNTT",
}



