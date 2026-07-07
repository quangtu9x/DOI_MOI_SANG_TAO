import { useEffect, useState } from 'react';
import { useAuth } from '@/app/modules/auth';
import { UserType } from '@/models';
import { requestPOST } from '@/utils/baseAPI';

export type DMSTRole = 'admin' | 'lanh-dao-tct' | 'lanh-dao-don-vi' | 'chuyen-gia' | 'member';

export const DMST_ROLE_LABELS: Record<DMSTRole, string> = {
  admin:            'Quản trị viên',
  'lanh-dao-tct':   'Lãnh đạo TCT',
  'lanh-dao-don-vi':'Lãnh đạo đơn vị',
  'chuyen-gia':     'Chuyên gia',
  member:           'Chuyên viên',
};

// ── Cấu hình 2 vai trò "Lãnh đạo đơn vị" / "Lãnh đạo TCT" — lưu dạng danh sách UserId
// qua AppConfig chung của hệ thống (không đụng tới enum UserType toàn hệ thống), quản lý tại
// trang /doi-moi-sang-tao/quan-ly-nguoi-dung. Đọc qua endpoint AllowAnonymous appconfigs/search.
export const DMST_LANH_DAO_DON_VI_KEY = 'DMST_LanhDaoDonVi_UserIds';
export const DMST_LANH_DAO_TCT_KEY = 'DMST_LanhDaoTCT_UserIds';

interface ILeaderIdSets {
  donVi: Set<string>;
  tct: Set<string>;
}

const EMPTY_LEADER_IDS: ILeaderIdSets = { donVi: new Set(), tct: new Set() };

let leaderIdsCache: ILeaderIdSets | null = null;
let leaderIdsInflight: Promise<ILeaderIdSets> | null = null;

const parseIds = (value?: string | null): Set<string> =>
  new Set((value ?? '').split(',').map(s => s.trim()).filter(Boolean));

const fetchLeaderIds = (): Promise<ILeaderIdSets> => {
  if (leaderIdsCache) return Promise.resolve(leaderIdsCache);
  if (!leaderIdsInflight) {
    leaderIdsInflight = requestPOST<any>('appconfigs/search', {
      keys: [DMST_LANH_DAO_DON_VI_KEY, DMST_LANH_DAO_TCT_KEY],
      pageNumber: 1,
      pageSize: 10,
    })
      .then(res => {
        const list = (res?.data as any)?.data ?? [];
        const donVi = parseIds(list.find((x: any) => x.key === DMST_LANH_DAO_DON_VI_KEY)?.value);
        const tct = parseIds(list.find((x: any) => x.key === DMST_LANH_DAO_TCT_KEY)?.value);
        leaderIdsCache = { donVi, tct };
        return leaderIdsCache;
      })
      .catch(() => EMPTY_LEADER_IDS)
      .finally(() => { leaderIdsInflight = null; });
  }
  return leaderIdsInflight;
};

/** Gọi sau khi lưu lại danh sách "Lãnh đạo đơn vị/TCT" ở trang quản lý người dùng, để các tab đang mở nạp lại quyền mới. */
export const invalidateDMSTLeaderCache = () => {
  leaderIdsCache = null;
  leaderIdsInflight = null;
};

/**
 * Quyền truy cập khu vực Đổi mới sáng tạo, dựa trên loại tài khoản đăng nhập thật (currentUser.type)
 * kết hợp danh sách "Lãnh đạo đơn vị/TCT" cấu hình tại /doi-moi-sang-tao/quan-ly-nguoi-dung:
 * - admin:          UserType.Admin (Quản trị hệ thống)
 * - lanhDaoTCT:     User có trong danh sách Lãnh đạo TCT
 * - lanhDaoDonVi:   User có trong danh sách Lãnh đạo đơn vị
 * - chuyenGia:      UserType.Specialist (chuyên gia tư vấn — KHÔNG mặc định có quyền quản lý/duyệt toàn hệ thống)
 * - isReviewer:     admin || lanhDaoTCT || lanhDaoDonVi — quyền quản lý/phê duyệt ý tưởng, tài liệu, báo cáo...
 *   (Trước đây isReviewer = isAdmin || Specialist, khiến mọi chuyên gia tư vấn đều thấy menu Quản lý ĐMST — đã sửa.)
 */
export const useDMSTRole = () => {
  const { currentUser } = useAuth();
  const [leaderIds, setLeaderIds] = useState<ILeaderIdSets>(leaderIdsCache ?? EMPTY_LEADER_IDS);

  useEffect(() => {
    fetchLeaderIds().then(setLeaderIds);
  }, []);

  const userId = currentUser?.id;
  const isAdmin = currentUser?.type === UserType.Admin;
  const isChuyenGia = currentUser?.type === UserType.Specialist;
  const isLanhDaoTCT = !isAdmin && !!userId && leaderIds.tct.has(userId);
  const isLanhDaoDonVi = !isAdmin && !isLanhDaoTCT && !!userId && leaderIds.donVi.has(userId);

  const isReviewer = isAdmin || isLanhDaoTCT || isLanhDaoDonVi;
  const isMember = !isReviewer;

  const role: DMSTRole = isAdmin ? 'admin'
    : isLanhDaoTCT ? 'lanh-dao-tct'
    : isLanhDaoDonVi ? 'lanh-dao-don-vi'
    : isChuyenGia ? 'chuyen-gia'
    : 'member';

  return { role, isAdmin, isReviewer, isMember, isChuyenGia, isLanhDaoTCT, isLanhDaoDonVi };
};
