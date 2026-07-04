import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

const BASE_NAV_ITEMS = [
  { to: 'analytics',  label: 'Thống kê',              icon: 'fa-chart-column',      reviewerOnly: false },
  { to: 'thu-vien',   label: 'Thư viện tài liệu',     icon: 'fa-books',             reviewerOnly: false },
  { to: 'chuyen-gia', label: 'Danh bạ chuyên gia',    icon: 'fa-user-tie',          reviewerOnly: false },
  { to: 'cong-dong',  label: 'Cộng đồng',              icon: 'fa-users',             reviewerOnly: false },
  { to: 'news-feed',  label: 'Bảng tin',                icon: 'fa-newspaper',         reviewerOnly: false },
  { to: 'tim-kiem',   label: 'Tìm kiếm',               icon: 'fa-magnifying-glass',  reviewerOnly: false },
  { to: 'bao-cao',    label: 'Báo cáo',                icon: 'fa-file-chart-column', reviewerOnly: true  },
];

const NAV_ITEM_DESC: Record<string, string> = {
  analytics:  'Bảng điều hành tổng hợp, chỉ số và bảng xếp hạng',
  'thu-vien': 'Tìm kiếm, xem và quản lý tài liệu nội bộ',
  'chuyen-gia': 'Tìm chuyên gia, gửi yêu cầu tư vấn',
  'cong-dong':  'Tham gia thảo luận, chia sẻ kinh nghiệm',
  'news-feed':  'Nội dung mới nhất được cá nhân hóa',
  'tim-kiem':   'Tìm kiếm xuyên suốt tài liệu và chuyên gia',
  'bao-cao':    'Báo cáo chỉ số, đóng góp và xuất Excel/PDF',
};

export const KhoTriThucPage: React.FC = () => {
  const { pathname } = useLocation();
  const { isReviewer } = useDMSTRole();

  const NAV_ITEMS = BASE_NAV_ITEMS.filter(n => !n.reviewerOnly || isReviewer);
  const isShell = !NAV_ITEMS.some(n => pathname.includes(n.to));

  if (!isShell) {
    // Sub-page renders via Outlet — just provide the nav
    return (
      <div>
        {/* Sub-page tab nav */}
        <div className="d-flex border-bottom mb-1" style={{ background: 'var(--kt-card-bg, #fff)' }}>
          <div className="container-fluid px-5 py-0 d-flex gap-1 flex-wrap">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={`/doi-moi-sang-tao/kho-tri-thuc/${item.to}`}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-2 px-4 py-3 text-decoration-none border-bottom border-2 fs-7 fw-semibold ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted'
                  }`
                }
                style={{ marginBottom: -1 }}
              >
                <i className={`fa-regular ${item.icon}`} />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Outlet />
      </div>
    );
  }

  // Landing page shell
  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
      ]}>Kho tri thức</PageTitle>

      <Content>
        <div className="mb-6">
          <h4 className="fw-bold text-gray-900 mb-1">Kho Tri Thức & Cộng Đồng</h4>
          <p className="text-muted">Thư viện tài liệu, danh bạ chuyên gia, cộng đồng thực hành và news feed cá nhân hóa</p>
        </div>

        <div className="row g-4">
          {NAV_ITEMS.map(item => (
            <div key={item.to} className="col-md-6 col-xl-3">
              <NavLink to={`/doi-moi-sang-tao/kho-tri-thuc/${item.to}`} className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 card-hoverable" style={{ transition: 'box-shadow 0.2s, transform 0.15s' }}>
                  <div className="card-body text-center py-8">
                    <div className="d-flex justify-content-center mb-4">
                      <div className="bg-light-primary rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 64, height: 64 }}>
                        <i className={`fa-regular ${item.icon} text-primary fs-2x`} />
                      </div>
                    </div>
                    <h6 className="fw-bold text-gray-800 mb-2">{item.label}</h6>
                    <p className="text-muted fs-7 mb-0">{NAV_ITEM_DESC[item.to] ?? ''}</p>
                  </div>
                </div>
              </NavLink>
            </div>
          ))}
        </div>
      </Content>
    </>
  );
};
