
import {
    ChuyenGiaNgoaiPage,
    GiaiThuongPage,
    QuaTrinhDaoTaoPage,
    QuaTrinhNghienCuuPage,
    ThongTinChungPage,
    TraCuuLyLichPage
} from "@/app/pages/nguon-luc";
import { Navigate, Route, Routes, Outlet } from "react-router-dom";


export const NguonLucRoutes = () => {
    return (
        <Routes>
            <Route element={<Outlet />}>
                <Route
                    index
                    element={<Navigate to="chuyen-gia-ngoai" replace />}
                />

                <Route
                    path="chuyen-gia-ngoai"
                    element={<ChuyenGiaNgoaiPage />}
                />


                <Route
                    path="thong-tin-chung"
                    element={<ThongTinChungPage />}
                />

                <Route
                    path="qua-trinh-dao-tao"
                    element={<QuaTrinhDaoTaoPage />}
                />


                <Route
                    path="qua-trinh-nghien-cuu"
                    element={<QuaTrinhNghienCuuPage />}
                />


                <Route
                    path="giai-thuong"
                    element={<GiaiThuongPage />}
                />

                <Route
                    path="tra-cuu"
                    element={<TraCuuLyLichPage />}
                />

                <Route path="*" element={<Navigate to="/error/404/system" replace />} />
            </Route>
        </Routes>
    );
};

