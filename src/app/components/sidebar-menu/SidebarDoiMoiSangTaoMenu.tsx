import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

const SidebarDoiMoiSangTaoMenu = () => {
  const { isAdmin, isReviewer } = useDMSTRole();

  return (
    <>
      {/* ── Tổng quan (all roles) ── */}
      <SidebarMenuItem
        to='/doi-moi-sang-tao/dashboard'
        title='Tổng quan'
        fontIcon='fa-regular fa-gauge-high'
      />

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

      {/* ── Báo cáo & Thống kê (reviewer + admin only) ── */}
      {isReviewer && (
        <SidebarMenuItemWithSub
          to='/doi-moi-sang-tao/bao-cao'
          title='Báo cáo & thống kê'
          fontIcon='fa-regular fa-file-chart-column'
        >
          <SidebarMenuItem
            to='/doi-moi-sang-tao/bao-cao'
            title='Báo cáo Ý tưởng ĐMST'
            hasBullet={true}
          />
          <SidebarMenuItem
            to='/doi-moi-sang-tao/bao-cao-day-du'
            title='Báo cáo tổng hợp đầy đủ (Demo)'
            hasBullet={true}
          />
        </SidebarMenuItemWithSub>
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
