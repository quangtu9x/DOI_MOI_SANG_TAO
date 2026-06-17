export const USER_ROLES = {
  ADMIN: 'ADMIN',
  BASIC: 'BASIC',
} as const;

export type Action = 'Create' | 'View' | 'Update' | 'Delete' | 'Execute' | 'Approve';
export type Permission = `Permissions.${string}.${Action}`;

export const P = {
  of: (resource: string, action: Action) =>
    `Permissions.${resource}.${action}` as Permission,
};

// Resource constants
export const R = {
  Catalogs: 'Catalogs',
  DataSharings: 'DataSharings',
  Audits: 'Audits',
  Users: 'Users',
  Roles: 'Roles',
  Permissions: 'Permissions',
  OrganizationUnits: 'OrganizationUnits',
  LoginLogs: 'LoginLogs',
  Positions: 'Positions',

  ChuyenGias: 'ChuyenGias',
  GiaiThuongs: 'GiaiThuongs',
  QuaTrinhDaoTaos: 'QuaTrinhDaoTaos',
  QuaTrinhNghienCuus: 'QuaTrinhNghienCuus',

  DotDangKys: 'DotDangKys',
  DatHangNhiemVus: 'DatHangNhiemVus',
  DeXuatDeTais: 'DeXuatDeTais',
  HoiDongTuVans: 'HoiDongTuVans',
  KetQuaTuVans: 'KetQuaTuVans',
  DangKyChuTris: 'DangKyChuTris',
  ThuyetMinhNhiemVus: 'ThuyetMinhNhiemVus',

  BienBanMoHoSos: 'BienBanMoHoSos',
  HoiDongTuyenChons: 'HoiDongTuyenChons',
  PhieuDanhGiaNhanXets: 'PhieuDanhGiaNhanXets',
  HoanThienHoSos: 'HoanThienHoSos',
  BienBanKiemPhieus: 'BienBanKiemPhieus',
  QuyetDinhPheDuyets: 'QuyetDinhPheDuyets',
  ToTrinhPheDuyets: 'ToTrinhPheDuyets',
  HopDongKhoaHocs: 'HopDongKhoaHocs',
  
  DonViPhoiHops: 'DonViPhoiHops',
  HoSoThamDinhs: 'HoSoThamDinhs',
  HoiDongThamDinhs: 'HoiDongThamDinhs',
  BienBanThamDinhs: 'BienBanThamDinhs',
  QuyetDinhTrienKhais: 'QuyetDinhTrienKhais',
  HopDongTrienKhais: 'HopDongTrienKhais',

  BaoCaoTienDos: 'BaoCaoTienDos',
  BaoCaoGiaiNgans: 'BaoCaoGiaiNgans',
  DieuChinhHopDongs: 'DieuChinhHopDongs',
  KiemTraDinhKys: 'KiemTraDinhKys',
  NghiemThuKhoiLuongs: 'NghiemThuKhoiLuongs',
  
  SanPhamNghiemThus: 'SanPhamNghiemThus',
  HoiDongNghiemThus: 'HoiDongNghiemThus',
  KetQuaNghiemThus: 'KetQuaNghiemThus',
  ThamDinhSauNghiemThus: 'ThamDinhSauNghiemThus',
  BienBanNghiemThus: 'BienBanNghiemThus',
  HoSoNghiemThus: 'HoSoNghiemThus',
  GiayChungNhanKetQuas: 'GiayChungNhanKetQuas',

  ThongTinChuyenGiaos: 'ThongTinChuyenGiaos',
  QuyetDinhPhamViChuyenGiaos: 'QuyetDinhPhamViChuyenGiaos',
  SanPhamKhoaHocs: 'SanPhamKhoaHocs',
  PhieuDangKyCapGCNKetQuaThucHiens: 'PhieuDangKyCapGCNKetQuaThucHiens',

  PhieuDeNghiTamUngs: 'PhieuDeNghiTamUngs',
  ThongTinDaTamUngs: 'ThongTinDaTamUngs',
  PhieuDeNghiThanhToans: 'PhieuDeNghiThanhToans',
  ThongTinDaThanhToans: 'ThongTinDaThanhToans',

  Eforms: 'Eforms',

  DotXetSangKiens: 'DotXetSangKiens',
  HoSoSangKiens: 'HoSoSangKiens',
  HoiDongDanhGias: 'HoiDongDanhGias',
  PhieuDanhGiaSangKiens: 'PhieuDanhGiaSangKiens',
  KetQuaSangKiens: 'KetQuaSangKiens',
  GiayChungNhanSangKiens: 'GiayChungNhanSangKiens',

  KeHoachs: 'KeHoachs',


} as const;
  


