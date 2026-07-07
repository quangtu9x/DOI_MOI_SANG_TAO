import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

const SidebarDoiMoiSangTaoMenu = () => {
  const { isAdmin, isReviewer } = useDMSTRole();

  return (
    <>
      {/* ── Dashboard (all roles) ── */}
      <SidebarMenuItem
        to='/doi-moi-sang-tao/dashboard'
        title='Dashboard'
        fontIcon='fa-regular fa-gauge-high'
      />

      {/* ── Báo cáo (reviewer + admin only) ── */}
      {isReviewer && (
        <SidebarMenuItem
          to='/doi-moi-sang-tao/bao-cao'
          title='Báo cáo'
          fontIcon='fa-regular fa-file-chart-column'
        />
      )}

      {/* ── Quản lý ý tưởng ── */}
      <SidebarMenuItemWithSub
        to='/doi-moi-sang-tao/quan-ly-y-tuong'
        title='Quản lý ý tưởng'
        fontIcon='fa-regular fa-lightbulb'
      >
        {/* Admin & reviewer: xem toàn bộ danh sách */}
        {isReviewer && (
          <SidebarMenuItem
            to='/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach'
            title='Danh sách ý tưởng'
            hasBullet={true}
          />
        )}
        {/* Tất cả roles: tạo mới & xem của mình */}
        <SidebarMenuItem
          to='/doi-moi-sang-tao/quan-ly-y-tuong/tao-moi'
          title='Tạo ý tưởng mới'
          hasBullet={true}
        />
        <SidebarMenuItem
          to='/doi-moi-sang-tao/quan-ly-y-tuong/cua-toi'
          title='Ý tưởng của tôi'
          hasBullet={true}
        />
      </SidebarMenuItemWithSub>

      {/* ── Sơ đồ quy trình (thông tin, tất cả roles) ── */}
      <SidebarMenuItem
        to='/doi-moi-sang-tao/quy-trinh-duyet/so-do'
        title='Sơ đồ quy trình'
        fontIcon='fa-regular fa-diagram-project'
      />

      {/* ── Quy trình phê duyệt (reviewer + admin only) ── */}
      {isReviewer && (
        <SidebarMenuItemWithSub
          to='/doi-moi-sang-tao/quy-trinh-duyet'
          title='Quy trình phê duyệt'
          fontIcon='fa-regular fa-circle-check'
        >
          <SidebarMenuItem
            to='/doi-moi-sang-tao/quy-trinh-duyet/cho-duyet'
            title='Chờ phê duyệt'
            hasBullet={true}
          />
          <SidebarMenuItem
            to='/doi-moi-sang-tao/quy-trinh-duyet/da-duyet'
            title='Đã phê duyệt'
            hasBullet={true}
          />
          <SidebarMenuItem
            to='/doi-moi-sang-tao/quy-trinh-duyet/tu-choi'
            title='Đã từ chối'
            hasBullet={true}
          />
        </SidebarMenuItemWithSub>
      )}

      {/* ── Thông báo (all roles) ── */}
      <SidebarMenuItem
        to='/doi-moi-sang-tao/thong-bao'
        title='Thông báo hệ thống'
        fontIcon='fa-regular fa-bell'
      />

      {/* ── Kho tri thức (all roles, member = read-only) ── */}
      <SidebarMenuItem
        to='/doi-moi-sang-tao/kho-tri-thuc'
        title='Thư viện ĐMST'
        fontIcon='fa-regular fa-books'
      />

      {/* ── Báo cáo tổng hợp đầy đủ (demo) ── */}
      {isReviewer && (
        <SidebarMenuItem
          to='/doi-moi-sang-tao/bao-cao-day-du'
          title='Báo cáo tổng hợp đầy đủ (Demo)'
          fontIcon='fa-regular fa-chart-mixed'
        />
      )}

      {/* ── Quản lý người dùng (admin only) ── */}
      {isAdmin && (
        <SidebarMenuItem
          to='/doi-moi-sang-tao/quan-ly-nguoi-dung'
          title='Quản lý người dùng'
          fontIcon='fa-regular fa-users'
        />
      )}
    </>
  );
};

export { SidebarDoiMoiSangTaoMenu };
