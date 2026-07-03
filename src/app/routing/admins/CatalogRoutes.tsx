
import {
    AppConfigPage,
    CategoryGroupPage,
    CategoryPage,
    CauHinhTruongYTuongPage,
    ChuDauTuPage,
    ChuongTrinhNVKHPage,
    ChuyenNganhPage,
    DoiTuongNopSangKienPage,
    DonViCongNhanPage,
    JobPositionPage,
    LinhVucSangKienPage,
    LoaiNVKHPage,
    LoaiSangKienPage,
    LoaiTaiLieuNVKHPage,
    NguonNganSachPage,
    TemplateFilePage,
    ThanhPhanHoSoPage,
    TieuChiDanhGiaPage,
    UserGuidePage
} from "@/app/pages/admins/catalogs";
import { DanhMucLoaiDuAnPage, DanhMucNguonVonDauTuPage, DanhMucNhaThauPage, DanhMucNhomDuAnPage, DanhMucPhuongXaPage, DanhMucTinhThanhPhoPage } from "@/app/pages/ke-hoach-von/danh-muc";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const CatalogRoutes = () => {
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="categories" replace />}
                />

                <Route
                    path="categories"
                    element={<CategoryPage />}
                />
                <Route
                    path="category-groups"
                    element={<CategoryGroupPage />}
                />
                <Route
                    path="job-positions"
                    element={<JobPositionPage />}
                />

                <Route
                    path="template-files"
                    element={<TemplateFilePage />}
                />
                <Route
                    path="app-configs"
                    element={<AppConfigPage />}
                />
                <Route
                    path="user-guides"
                    element={<UserGuidePage />}
                />

                <Route
                    path="linh-vuc-sang-kien"
                    element={<LinhVucSangKienPage />}
                />

                <Route
                    path="doi-tuong-nop-sang-kien"
                    element={<DoiTuongNopSangKienPage />}
                />

                <Route
                    path="loai-sang-kien"
                    element={<LoaiSangKienPage />}
                />

                <Route
                    path="chuong-trinh-nvkh"
                    element={<ChuongTrinhNVKHPage />}
                />

                <Route
                    path="loai-nvkh"
                    element={<LoaiNVKHPage />}
                />

                <Route
                    path="nguon-ngan-sach"
                    element={<NguonNganSachPage />}
                />
                <Route
                    path="chuyen-nganh"
                    element={<ChuyenNganhPage />}
                />
                <Route
                    path="loai-tai-lieu-nvkh"
                    element={<LoaiTaiLieuNVKHPage />}
                />
                <Route
                    path="chu-dau-tu"
                    element={<ChuDauTuPage />}
                />
                <Route
                    path="tinh-thanh-pho"
                    element={<DanhMucTinhThanhPhoPage />}
                />
                <Route
                    path="phuong-xa"
                    element={<DanhMucPhuongXaPage />}
                />
                <Route
                    path="nha-thau"
                    element={<DanhMucNhaThauPage />}
                />
                <Route
                    path="nguon-von-dau-tu"
                    element={<DanhMucNguonVonDauTuPage />}
                />
                <Route
                    path="loai-du-an"
                    element={<DanhMucLoaiDuAnPage />}
                />
                <Route
                    path="nhom-du-an"
                    element={<DanhMucNhomDuAnPage />}
                />
                <Route
                    path="nguon-von-dau-tu"
                    element={<DanhMucNguonVonDauTuPage />}
                />
                <Route
                    path="don-vi-cong-nhan"
                    element={<DonViCongNhanPage />}
                />
                <Route
                    path="tieu-chi-danh-gia"
                    element={<TieuChiDanhGiaPage />}
                />
                <Route
                    path="thanh-phan-ho-so"
                    element={<ThanhPhanHoSoPage />}
                />
                <Route
                    path="cau-hinh-truong-y-tuong"
                    element={<CauHinhTruongYTuongPage />}
                />
                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

