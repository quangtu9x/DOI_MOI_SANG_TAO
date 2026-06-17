import { useAuth } from "@/app/modules/auth";
import {
    QuanLyThongTinDuAnPage,
    GiaiDoanThucHienDauTuPage,
    GiaiDoanKetThucDauTuPage,
    QuanLyDuAnSauDauTuPage
} from "@/app/pages/ke-hoach-von/quan-ly-tien-trinh";
import {
    GiaiDoanChuanBiDauTuPage,
    BaoCaoNghienCuuTienKhaThiPage,
    BaoCaoDeXuatChuTruongPage,
    QuyetDinhChuTruongDauTuPage,
    NhiemVuKhaoSatPage,
    BaoCaoNghienCuuKhaThiPage,
    HoSoThietKeCoSoPage,
    BaoCaoKinhTeKyThuatPage,
    QuyetDinhDauTuDuAnPage
} from "@/app/pages/ke-hoach-von/giai-doan-chuan-bi-dau-tu";
import {
    HoSoThietKeChiTietVaDuToanPage,
    DauThauLuaChonNhaThauPage,
    HopDongThucHienDuAnPage,
    TinhHinhThucHienDuAnKhoKhanVuongMacPage,
    KetQuaXuLyKhoKhanVuongMacPage,
    NghiemThuBanGiaoSanPhamDuAnPage
} from "@/app/pages/ke-hoach-von/giai-doan-thuc-hien-dau-tu";
import {
    QuanLyThongTinThanhToanQuyetToanDuAnPage,
    QuanLyThongTinVanHanhVaBaoTriSanPhamDuAnPage
} from "@/app/pages/ke-hoach-von/giai-doan-ket-thuc-dau-tu";
import { UserType } from "@/models";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";

export const QuanLyTienTrinhRoutes = () => {
    const { currentUser } = useAuth();
    const userType = currentUser?.type;
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="quan-ly-thong-tin-du-an" replace />}
                />

                <Route
                    path="quan-ly-thong-tin-du-an"
                    element={<QuanLyThongTinDuAnPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu"
                    element={<GiaiDoanChuanBiDauTuPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu/bao-cao-nghien-cuu-tien-kha-thi"
                    element={<BaoCaoNghienCuuTienKhaThiPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu/bao-cao-de-xuat-chu-truong"
                    element={<BaoCaoDeXuatChuTruongPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu/quyet-dinh-chu-truong-dau-tu"
                    element={<QuyetDinhChuTruongDauTuPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu/nhiem-vu-khao-sat"
                    element={<NhiemVuKhaoSatPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu/bao-cao-nghien-cuu-kha-thi"
                    element={<BaoCaoNghienCuuKhaThiPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu/ho-so-thiet-ke-co-so"
                    element={<HoSoThietKeCoSoPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu/bao-cao-kinh-te-ky-thuat"
                    element={<BaoCaoKinhTeKyThuatPage />}
                />
                <Route
                    path="giai-doan-chuan-bi-dau-tu/quyet-dinh-dau-tu-du-an"
                    element={<QuyetDinhDauTuDuAnPage />}
                />
                <Route
                    path="giai-doan-thuc-hien-dau-tu"
                    element={<GiaiDoanThucHienDauTuPage />}
                />
                <Route
                    path="giai-doan-thuc-hien-dau-tu/ho-so-thiet-ke-chi-tiet-va-du-toan"
                    element={<HoSoThietKeChiTietVaDuToanPage />}
                />
                <Route
                    path="giai-doan-thuc-hien-dau-tu/dau-thau-lua-chon-nha-thau"
                    element={<DauThauLuaChonNhaThauPage />}
                />
                <Route
                    path="giai-doan-thuc-hien-dau-tu/hop-dong-thuc-hien-du-an"
                    element={<HopDongThucHienDuAnPage />}
                />
                <Route
                    path="giai-doan-thuc-hien-dau-tu/tinh-hinh-thuc-hien-du-an-kho-khan-vuong-mac"
                    element={<TinhHinhThucHienDuAnKhoKhanVuongMacPage />}
                />
                <Route
                    path="giai-doan-thuc-hien-dau-tu/ket-qua-xu-ly-kho-khan-vuong-mac"
                    element={<KetQuaXuLyKhoKhanVuongMacPage />}
                />
                <Route
                    path="giai-doan-thuc-hien-dau-tu/nghiem-thu-ban-giao-san-pham-du-an"
                    element={<NghiemThuBanGiaoSanPhamDuAnPage />}
                />
                <Route
                    path="giai-doan-ket-thuc-dau-tu"
                    element={<GiaiDoanKetThucDauTuPage />}
                />
                <Route
                    path="giai-doan-ket-thuc-dau-tu/quan-ly-thong-tin-thanh-toan-quyet-toan-du-an"
                    element={<QuanLyThongTinThanhToanQuyetToanDuAnPage />}
                />
                <Route
                    path="giai-doan-ket-thuc-dau-tu/quan-ly-thong-tin-van-hanh-va-bao-tri-san-pham-du-an"
                    element={<QuanLyThongTinVanHanhVaBaoTriSanPhamDuAnPage />}
                />
                <Route
                    path="quan-ly-du-an-sau-dau-tu"
                    element={<QuanLyDuAnSauDauTuPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};
