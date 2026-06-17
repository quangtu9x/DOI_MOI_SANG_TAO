import { FC, Suspense, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { MasterLayout } from '../../_metronic/layout/MasterLayout';
import { DashboardLayout } from '../../_metronic/layout/DashboardLayout';
import TopBarProgress from 'react-topbar-progress-indicator';
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils';
import {
  MenuInnerSystem,
  SidebarNguonLucMenu,
  SidebarNhiemVuMenu,
  SidebarSangKienMenu,
  SidebarSystemMenu,
  SidebarKeHoachVonMenu,
  SidebarDanhMucHeThongMenu,
  SidebarLichSuMenu,
  SidebarEformMenu
} from '../components';
import { hasAll, uiManage } from '@/utils/utils';
import { useAuth } from '../modules/auth';
import { useDispatch } from 'react-redux';

// Page Imports
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper';
import { CatalogRoutes, SystemAdminRoutes, NotificationRoutes, DataSharingRoutes } from './admins';
import { R } from '@/data';
import { UserType } from '@/models';
import { AppDispatch } from '@/redux/Store';
import * as businessActions from '@/redux/business-filter/Actions';
// import { BusinessGuard } from '../modules/errors/components/BusinessGuard';
import { NguonLucRoutes } from './nguon-luc';
import { DangKyNhiemVuRoutes, ThucHienNhiemVuRoutes, TrienKhaiThucHienRoutes, XetDuyetChuNhiemRoutes, KetQuaHDKHRoutes, QuanLyTaiChinhRoutes } from './nhiem-vu';
import { NghiemThuThanhLyRoutes } from './nhiem-vu/NghiemThuThanhLyRoutes';
import { DangKySangKienRoutes, KiemTraTrungLapRoutes, TiepNhanXuLyRoutes, XetCongNhanRoutes, QuanLyGiaiPhapRoutes, QuanLySangKienNangCaoRoutes } from './sang-kien';
import { QuanLyYTuongRoutes } from './y-tuong';
import {
  LapKeHoachVonRoutes,
  QuanLyTienTrinhRoutes,
  TraCuuHoSoRoutes,
  TheoDoiDieuHanhRoutes,
  GiaiDoanXinVonRoutes,
} from './ke-hoach-von';

// Direct page imports for danh-muc
import {
  DanhMucCoQuanDonViPage,
  DanhMucChuDauTuPage,
  DanhMucTinhThanhPhoPage,
  DanhMucPhuongXaPage,
  DanhMucNhaThauPage,
  DanhMucNguonVonDauTuPage,
  DanhMucLoaiDuAnPage,
  DanhMucNhomDuAnPage
} from '@/app/pages/ke-hoach-von/danh-muc';

// Direct page imports for lich-su
import {
  LichSuCapNhatThongTinDuAnPage,
  LichSuCapNhatDuLieuNguoiDungPage,
  LichSuSuDungHeThongPage
} from '@/app/pages/ke-hoach-von/lich-su';

// Direct page imports for eform
import { QLEformPage } from '@/app/pages/ke-hoach-von/eform/ql-eform/QLEformPage';
import { ThietKePage } from '@/app/pages/ke-hoach-von/eform/thiet-ke/ThietKePage';

// Reusable ProtectedSuspenseView
interface ProtectedSuspenseViewProps {
  children: React.ReactNode;
  permissions?: string[];
}
const ProtectedSuspenseView: FC<ProtectedSuspenseViewProps> = ({ children, permissions }) => {
  const { currentUser } = useAuth();

  const userPerms = new Set(currentUser?.permissions ?? []);
  const baseColor = getCSSVariableValue('--bs-primary');
  TopBarProgress.config({
    barColors: { '0': baseColor },
    barThickness: 1,
    shadowBlur: 5,
  });

  if (permissions && !hasAll(userPerms, permissions)) {
    return <Navigate to="/error/403" replace />;
  }

  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>;
};

// Route config interfaces
interface RouteConfig {
  path: string;
  element: React.ReactNode;
  type?: UserType;
}
interface ProtectedRouteConfig extends Omit<RouteConfig, 'element'> {
  component: FC<Record<string, never>>;
  permissions?: string[];
}

// Dashboard Route
const dashboardRoutes: RouteConfig[] = [
  {
    path: '',
    element: (
      <ProtectedSuspenseView>
        <DashboardWrapper />
      </ProtectedSuspenseView>
    ),
    type: UserType.Admin,
  },
];

// Nguồn lực Routes
const nguonLucRoutes: ProtectedRouteConfig[] = [{ path: '', component: NguonLucRoutes, permissions: [...uiManage(R.ChuyenGias)] }];

// Nhiệm vụ Routes
const nhiemVuRoutes: ProtectedRouteConfig[] = [
  { path: 'dang-ky-nhiem-vu', component: DangKyNhiemVuRoutes },
  { path: 'xet-duyet-chu-nhiem', component: XetDuyetChuNhiemRoutes },
  { path: 'thuc-hien-nhiem-vu', component: ThucHienNhiemVuRoutes, permissions: [...uiManage(R.HoSoThamDinhs)] },
  { path: 'trien-khai-thuc-hien', component: TrienKhaiThucHienRoutes, permissions: [...uiManage(R.DonViPhoiHops)] },
  { path: 'quan-ly-tai-chinh', component: QuanLyTaiChinhRoutes, permissions: [...uiManage(R.PhieuDeNghiTamUngs)] },
  { path: 'nghiem-thu-thanh-ly', component: NghiemThuThanhLyRoutes },
  { path: 'ket-qua-hdkh', component: KetQuaHDKHRoutes },
];

// Sáng kiến Routes
const sangKienRoutes: ProtectedRouteConfig[] = [
  { path: 'dang-ky-sang-kien', component: DangKySangKienRoutes, permissions: [...uiManage(R.HoSoSangKiens)] },
  { path: 'tiep-nhan-xu-ly', component: TiepNhanXuLyRoutes, permissions: [...uiManage(R.HoSoSangKiens)] },
  { path: '', component: KiemTraTrungLapRoutes, permissions: [...uiManage(R.HoSoSangKiens)] },
  { path: 'xet-cong-nhan', component: XetCongNhanRoutes, permissions: [...uiManage(R.HoSoSangKiens)] },
  { path: 'quan-ly-giai-phap', component: QuanLyGiaiPhapRoutes, permissions: [...uiManage(R.HoSoSangKiens)] },
  { path: 'quan-ly-sang-kien-nang-cao', component: QuanLySangKienNangCaoRoutes, permissions: [...uiManage(R.HoSoSangKiens)] },
];

// Ý tưởng Routes
const yTuongRoutes: ProtectedRouteConfig[] = [{ path: '', component: QuanLyYTuongRoutes }];

// Admin Routes
const adminRoutes: ProtectedRouteConfig[] = [
  { path: 'system-admins', component: SystemAdminRoutes, permissions: [...uiManage(R.OrganizationUnits), ...uiManage(R.Permissions)] },
  { path: 'catalogs', component: CatalogRoutes, permissions: [...uiManage(R.Catalogs)] },
  { path: 'data-sharings', component: DataSharingRoutes, permissions: [...uiManage(R.DataSharings)] },
  { path: 'notifications', component: NotificationRoutes },
];

// Kế hoạch vốn Routes
const keHoachVonRoutes: ProtectedRouteConfig[] = [
  { path: 'giai-doan-xin-von', component: GiaiDoanXinVonRoutes },
  { path: 'lap-ke-hoach-von', component: LapKeHoachVonRoutes },
  { path: 'quan-ly-tien-trinh', component: QuanLyTienTrinhRoutes },
  { path: 'tra-cuu-ho-so', component: TraCuuHoSoRoutes },
  { path: 'theo-doi-dieu-hanh', component: TheoDoiDieuHanhRoutes },
];

const PrivateRoutes = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.type == UserType.Admin || currentUser?.type == UserType.Basic;
  //const isBusinessDraft = currentUser?.type == UserType.Business && currentUser?.businessIsDraft;
  const chuyenGiaId = currentUser?.chuyenGiaId;

  // Fetch specialist data ngay khi load app (nếu không phải Admin)
  useEffect(() => {
    if (!isAdmin && chuyenGiaId) {
      dispatch(businessActions.fetchBusinessById(chuyenGiaId));
    }
  }, [dispatch, isAdmin, chuyenGiaId]);

  // useEffect(() => {
  //   if (isBusinessDraft) {
  //     const data = chuyenGiaId ? { id: chuyenGiaId } : null;
  //     dispatch(modalActions.setDataModal(data));
  //     dispatch(modalActions.setModalVisible(true));
  //   }
  // }, [dispatch, isBusinessDraft, chuyenGiaId]);

  return (
    // <BusinessGuard>
    <Routes>
      <Route index element={<Navigate to={isAdmin ? '/admin-dashboard' : '/admin-dashboard'} replace />} />

      <Route path="admin-dashboard/*" element={<DashboardLayout menuInner={<MenuInnerSystem />} />}>
        {dashboardRoutes
          .filter(route => route.type === UserType.Admin)
          .map(({ path, element }) => (
            <Route key={path} index={path === ''} path="*" element={element} />
          ))}
      </Route>

      <Route path="admins/*" element={<MasterLayout asideMenu={<SidebarSystemMenu />} menuInner={<MenuInnerSystem />} />}>
        {adminRoutes.map(({ path, component: Component, permissions }) => (
          <Route
            key={path}
            path={path ? `${path}/*` : '*'}
            element={
              <ProtectedSuspenseView permissions={permissions}>
                <Component />
              </ProtectedSuspenseView>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>

      <Route path="nhiem-vu/*" element={<MasterLayout asideMenu={<SidebarNhiemVuMenu />} menuInner={<MenuInnerSystem />} />}>
        {nhiemVuRoutes.map(({ path, component: Component, permissions }) => (
          <Route
            key={path}
            path={path ? `${path}/*` : '*'}
            element={
              <ProtectedSuspenseView permissions={permissions}>
                <Component />
              </ProtectedSuspenseView>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>

      <Route path="nguon-luc/*" element={<MasterLayout asideMenu={<SidebarNguonLucMenu />} menuInner={<MenuInnerSystem />} />}>
        {nguonLucRoutes.map(({ path, component: Component, permissions }) => (
          <Route
            key={path}
            path={path ? `${path}/*` : '*'}
            element={
              <ProtectedSuspenseView permissions={permissions}>
                <Component />
              </ProtectedSuspenseView>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>

      <Route path="sang-kien/*" element={<MasterLayout asideMenu={<SidebarSangKienMenu />} menuInner={<MenuInnerSystem />} />}>
        {sangKienRoutes.map(({ path, component: Component, permissions }) => (
          <Route
            key={path}
            path={path ? `${path}/*` : '*'}
            element={
              <ProtectedSuspenseView permissions={permissions}>
                <Component />
              </ProtectedSuspenseView>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>

      <Route path="admin/y-tuong/*" element={<MasterLayout asideMenu={<SidebarSangKienMenu />} menuInner={<MenuInnerSystem />} />}>
        {yTuongRoutes.map(({ path, component: Component, permissions }) => (
          <Route
            key={path}
            path={path ? `${path}/*` : '*'}
            element={
              <ProtectedSuspenseView permissions={permissions}>
                <Component />
              </ProtectedSuspenseView>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>

      {/* Danh mục hệ thống - sidebar riêng */}
      <Route path="ke-hoach-von/danh-muc/*" element={<MasterLayout asideMenu={<SidebarDanhMucHeThongMenu />} menuInner={<MenuInnerSystem />} />}>
        <Route index element={<Navigate to="co-quan-don-vi" replace />} />
        <Route path="co-quan-don-vi" element={<ProtectedSuspenseView><DanhMucCoQuanDonViPage /></ProtectedSuspenseView>} />
        <Route path="chu-dau-tu" element={<ProtectedSuspenseView><DanhMucChuDauTuPage /></ProtectedSuspenseView>} />
        <Route path="tinh-thanh-pho" element={<ProtectedSuspenseView><DanhMucTinhThanhPhoPage /></ProtectedSuspenseView>} />
        <Route path="phuong-xa" element={<ProtectedSuspenseView><DanhMucPhuongXaPage /></ProtectedSuspenseView>} />
        <Route path="nha-thau" element={<ProtectedSuspenseView><DanhMucNhaThauPage /></ProtectedSuspenseView>} />
        <Route path="nguon-von-dau-tu" element={<ProtectedSuspenseView><DanhMucNguonVonDauTuPage /></ProtectedSuspenseView>} />
        <Route path="loai-du-an" element={<ProtectedSuspenseView><DanhMucLoaiDuAnPage /></ProtectedSuspenseView>} />
        <Route path="nhom-du-an" element={<ProtectedSuspenseView><DanhMucNhomDuAnPage /></ProtectedSuspenseView>} />
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>

      {/* Lịch sử thao tác hệ thống - sidebar riêng */}
      <Route path="ke-hoach-von/lich-su/*" element={<MasterLayout asideMenu={<SidebarLichSuMenu />} menuInner={<MenuInnerSystem />} />}>
        <Route index element={<Navigate to="lich-su-cap-nhat-thong-tin-du-an" replace />} />
        <Route path="lich-su-cap-nhat-thong-tin-du-an" element={<ProtectedSuspenseView><LichSuCapNhatThongTinDuAnPage /></ProtectedSuspenseView>} />
        <Route path="lich-su-cap-nhat-du-lieu-nguoi-dung" element={<ProtectedSuspenseView><LichSuCapNhatDuLieuNguoiDungPage /></ProtectedSuspenseView>} />
        <Route path="lich-su-su-dung-he-thong" element={<ProtectedSuspenseView><LichSuSuDungHeThongPage /></ProtectedSuspenseView>} />
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>

      {/* Quản lý eform động - sidebar riêng */}
      <Route path="ke-hoach-von/eform/*" element={<MasterLayout asideMenu={<SidebarEformMenu />} menuInner={<MenuInnerSystem />} />}>
        <Route index element={<Navigate to="ql-mau-eform" replace />} />
        <Route path="ql-mau-eform" element={<ProtectedSuspenseView><QLEformPage /></ProtectedSuspenseView>} />
        <Route path="thiet-ke" element={<ProtectedSuspenseView><ThietKePage /></ProtectedSuspenseView>} />
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>

      {/* Kế hoạch vốn chung - sidebar SidebarKeHoachVonMenu */}
      <Route path="ke-hoach-von/*" element={<MasterLayout asideMenu={<SidebarKeHoachVonMenu />} menuInner={<MenuInnerSystem />} />}>
        <Route index element={<Navigate to="lap-ke-hoach-von" replace />} />
        {keHoachVonRoutes.map(({ path, component: Component, permissions }) => (
          <Route
            key={path}
            path={path ? `${path}/*` : '*'}
            element={
              <ProtectedSuspenseView permissions={permissions}>
                <Component />
              </ProtectedSuspenseView>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/error/404/system" replace />} />
      </Route>
      {/* Fallback Not Found */}
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
    // </BusinessGuard>
  );
};

export { PrivateRoutes, ProtectedSuspenseView };
