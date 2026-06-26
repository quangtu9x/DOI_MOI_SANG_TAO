import { SidebarMenuItemWithSub } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { SidebarMenuItem } from '@/_metronic/layout/components/sidebar/sidebar-menu';
import { useDMSTRole, DMST_ROLE_LABELS, DMSTRole } from '@/app/hooks/useDMSTRole';

const SidebarDoiMoiSangTaoMenu = () => {
  const { role, setRole, isAdmin, isReviewer, isMember } = useDMSTRole();

  return (
    <>
      {/* ── Demo Role Switcher ── */}
      <div className="px-6 pb-3 pt-1">
        <div className="text-muted fs-8 mb-1 text-uppercase fw-bold ls-1">Demo — vai trò</div>
        <div className="d-flex gap-1">
          {(['member', 'reviewer', 'admin'] as DMSTRole[]).map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`btn btn-xs px-2 py-1 fs-8 ${role === r ? 'btn-primary' : 'btn-light-primary'}`}
              style={{ fontSize: 10, lineHeight: '1.4' }}
            >
              {r === 'admin' ? 'Admin' : r === 'reviewer' ? 'Duyệt' : 'TV'}
            </button>
          ))}
        </div>
        <div className="badge badge-light-primary fs-8 mt-1">{DMST_ROLE_LABELS[role]}</div>
      </div>

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
        title={isMember ? 'Kho tri thức (đọc)' : 'Kho tri thức'}
        fontIcon='fa-regular fa-books'
      />

      {/* ── Báo cáo & Thống kê (reviewer + admin only) ── */}
      {isReviewer && (
        <SidebarMenuItem
          to='/doi-moi-sang-tao/bao-cao'
          title='Báo cáo & thống kê'
          fontIcon='fa-regular fa-file-chart-column'
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
