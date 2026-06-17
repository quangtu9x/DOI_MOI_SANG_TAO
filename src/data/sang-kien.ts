import { TrangThaiHoSoSangKien } from "@/models";

export const TRANG_THAI_HO_SO_SANG_KIEN = [
    {
        id: TrangThaiHoSoSangKien.DangSoanThao,
        name: "Đang soạn thảo",
        className: "badge badge-light-secondary"
    },
    {
        id: TrangThaiHoSoSangKien.ChoTiepNhan,
        name: "Chờ tiếp nhận",
        className: "badge badge-light-primary"
    },
    {
        id: TrangThaiHoSoSangKien.YeuCauBoSung,
        name: "Yêu cầu bổ sung",
        className: "badge badge-light-warning"
    },
    {
        id: TrangThaiHoSoSangKien.DaTiepNhan,
        name: "Đã tiếp nhận",
        className: "badge badge-light-info"
    },
    {
        id: TrangThaiHoSoSangKien.TuChoiTiepNhan,
        name: "Từ chối tiếp nhận",
        className: "badge badge-light-danger"
    },
    {
        id: TrangThaiHoSoSangKien.DangThamDinh,
        name: "Đang thẩm định",
        className: "badge badge-light-info"
    },
    {
        id: TrangThaiHoSoSangKien.DuocCongNhan,
        name: "Được công nhận",
        className: "badge badge-light-success"
    },
    {
        id: TrangThaiHoSoSangKien.KhongCongNhan,
        name: "Không công nhận",
        className: "badge badge-light-danger"
    },
];
