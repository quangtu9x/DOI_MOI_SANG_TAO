import { useAuth } from '@/app/modules/auth';
import { UserType } from '@/models';

export type DMSTRole = 'admin' | 'reviewer' | 'member';

export const DMST_ROLE_LABELS: Record<DMSTRole, string> = {
  admin:    'Quản trị viên',
  reviewer: 'Người duyệt',
  member:   'Thành viên',
};

/**
 * Quyền truy cập khu vực Đổi mới sáng tạo, dựa trên loại tài khoản đăng nhập thật (currentUser.type).
 * - admin:    UserType.Admin (Quản trị, lãnh đạo)
 * - reviewer: UserType.Admin hoặc UserType.Specialist (quản lý / chuyên gia duyệt)
 * - member:   các loại tài khoản còn lại
 *
 * Trước đây hook này là demo role switcher lưu ở localStorage (không gắn với tài khoản đăng nhập thật),
 * nay đã đổi sang dùng quyền thật để tránh việc bất kỳ ai cũng có thể tự nâng quyền qua localStorage.
 */
export const useDMSTRole = () => {
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.type === UserType.Admin;
  const isReviewer = isAdmin || currentUser?.type === UserType.Specialist;
  const isMember = !isReviewer;

  const role: DMSTRole = isAdmin ? 'admin' : isReviewer ? 'reviewer' : 'member';

  return { role, isAdmin, isReviewer, isMember };
};
