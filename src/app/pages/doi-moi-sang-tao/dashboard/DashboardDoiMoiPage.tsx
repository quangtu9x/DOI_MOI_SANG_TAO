import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { Tag } from 'antd';

// Mock data — Vietnam Airlines context
const STATS = [
  { label: 'Tổng ý tưởng', value: 214, icon: 'fa-lightbulb', color: 'primary', sub: '+18 trong tháng này' },
  { label: 'Chờ phê duyệt', value: 31, icon: 'fa-clock', color: 'warning', sub: '5 quá hạn xử lý' },
  { label: 'Đã phê duyệt', value: 127, icon: 'fa-circle-check', color: 'success', sub: '59.3% tỷ lệ duyệt' },
  { label: 'Đang triển khai', value: 43, icon: 'fa-plane-departure', color: 'info', sub: 'Trên mạng bay nội địa' },
];

const STATUS_COLORS: Record<string, string> = {
  'Đang soạn thảo': 'default',
  'Chờ duyệt': 'processing',
  'Đã duyệt': 'success',
  'Từ chối': 'error',
  'Được công nhận': 'purple',
};

const RECENT_IDEAS = [
  { id: '1', ma: 'YT-2026061501', ten: 'Số hóa check-in nội địa — tăng tốc phục vụ hành khách', nguoiGui: 'Nguyễn Minh Tuấn', ngay: '25/06/2026', trangThai: 'Chờ duyệt', linhVuc: 'Dịch vụ mặt đất' },
  { id: '2', ma: 'YT-2026061502', ten: 'AI dự báo bảo trì động cơ phòng ngừa', nguoiGui: 'Trần Quang Hùng', ngay: '24/06/2026', trangThai: 'Đã duyệt', linhVuc: 'Kỹ thuật bảo dưỡng' },
  { id: '3', ma: 'YT-2026061503', ten: 'Tối ưu lịch trình bay — giảm tiêu hao nhiên liệu', nguoiGui: 'Phạm Thị Lan', ngay: '23/06/2026', trangThai: 'Được công nhận', linhVuc: 'Khai thác bay' },
  { id: '4', ma: 'YT-2026061504', ten: 'Hệ thống phản hồi hành khách thời gian thực qua QR', nguoiGui: 'Lê Thị Hương', ngay: '22/06/2026', trangThai: 'Đã duyệt', linhVuc: 'Dịch vụ hành khách' },
  { id: '5', ma: 'YT-2026061505', ten: 'Blended Learning cho đào tạo phi công & tiếp viên', nguoiGui: 'Nguyễn Thành Nam', ngay: '21/06/2026', trangThai: 'Chờ duyệt', linhVuc: 'Đào tạo nhân lực' },
];

const LINH_VUC_DATA = [
  { name: 'Khai thác bay',        count: 52, pct: 24 },
  { name: 'Kỹ thuật bảo dưỡng',  count: 45, pct: 21 },
  { name: 'Dịch vụ hành khách',  count: 38, pct: 18 },
  { name: 'Dịch vụ mặt đất',     count: 32, pct: 15 },
  { name: 'Công nghệ thông tin',  count: 27, pct: 13 },
  { name: 'Quản trị & Hỗ trợ',   count: 20, pct: 9 },
];

const MONTHLY = [
  { thang: 'T1', count: 18 },
  { thang: 'T2', count: 22 },
  { thang: 'T3', count: 29 },
  { thang: 'T4', count: 25 },
  { thang: 'T5', count: 33 },
  { thang: 'T6', count: 31 },
];

const BAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

const maxMonthly = Math.max(...MONTHLY.map(m => m.count));

export const DashboardDoiMoiPage: React.FC = () => {
  return (
    <>
      <PageTitle breadcrumbs={[]}>Tổng quan Đổi mới sáng tạo</PageTitle>
      <Content>
        {/* Stats row */}
        <div className="row g-5 mb-6">
          {STATS.map((s, i) => (
            <div key={i} className="col-sm-6 col-xl-3">
              <div className={`card card-flush border-${s.color} border-start border-4 h-100`}>
                <div className="card-body d-flex align-items-center py-5 px-6">
                  <div className={`symbol symbol-50px me-4`}>
                    <div className={`symbol-label bg-light-${s.color}`}>
                      <i className={`fa-regular ${s.icon} fs-2x text-${s.color}`}></i>
                    </div>
                  </div>
                  <div>
                    <div className={`fs-2 fw-bold text-${s.color}`}>{s.value}</div>
                    <div className="fs-6 fw-semibold text-gray-700">{s.label}</div>
                    <div className="fs-8 text-muted mt-1">{s.sub}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-5 mb-6">
          {/* Monthly bar chart */}
          <div className="col-xl-7">
            <div className="card h-100">
              <div className="card-header border-0 pt-5">
                <h3 className="card-title fw-bold text-gray-800">Ý tưởng theo tháng (2026)</h3>
              </div>
              <div className="card-body pt-3">
                <div className="d-flex align-items-end gap-3" style={{ height: 200 }}>
                  {MONTHLY.map((m, i) => (
                    <div key={i} className="d-flex flex-column align-items-center flex-1">
                      <div className="fw-bold fs-7 mb-1 text-gray-700">{m.count}</div>
                      <div
                        className="rounded-top w-100"
                        style={{
                          height: `${(m.count / maxMonthly) * 160}px`,
                          background: 'linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%)',
                          minHeight: 8,
                        }}
                      />
                      <div className="fs-8 text-muted mt-2">{m.thang}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lĩnh vực breakdown */}
          <div className="col-xl-5">
            <div className="card h-100">
              <div className="card-header border-0 pt-5">
                <h3 className="card-title fw-bold text-gray-800">Phân bổ theo lĩnh vực</h3>
              </div>
              <div className="card-body pt-2">
                {LINH_VUC_DATA.map((lv, i) => (
                  <div key={i} className="d-flex align-items-center mb-4">
                    <div
                      className="rounded-circle me-3 flex-shrink-0"
                      style={{ width: 10, height: 10, background: BAR_COLORS[i] }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fs-7 fw-semibold text-gray-700">{lv.name}</span>
                        <span className="fs-7 text-muted">{lv.count}</span>
                      </div>
                      <div className="bg-light rounded" style={{ height: 6 }}>
                        <div
                          className="rounded"
                          style={{ height: 6, width: `${lv.pct}%`, background: BAR_COLORS[i], transition: 'width 0.6s ease' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent ideas table */}
        <div className="card">
          <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center">
            <h3 className="card-title fw-bold text-gray-800">Ý tưởng mới nhất</h3>
            <Link to="/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach" className="btn btn-sm btn-light-primary">
              Xem tất cả
            </Link>
          </div>
          <div className="card-body py-3">
            <div className="table-responsive">
              <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                <thead>
                  <tr className="fw-bold text-muted">
                    <th className="min-w-100px">Mã hồ sơ</th>
                    <th className="min-w-250px">Tên ý tưởng</th>
                    <th className="min-w-120px">Lĩnh vực</th>
                    <th className="min-w-120px">Người gửi</th>
                    <th className="min-w-100px">Ngày gửi</th>
                    <th className="min-w-120px">Trạng thái</th>
                    <th className="min-w-80px text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_IDEAS.map(idea => (
                    <tr key={idea.id}>
                      <td><span className="text-dark fw-bold fs-7">{idea.ma}</span></td>
                      <td>
                        <span className="text-dark fw-semibold d-block fs-7" style={{ maxWidth: 300 }}>
                          {idea.ten}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-light-info fs-8">{idea.linhVuc}</span>
                      </td>
                      <td><span className="text-muted fs-7">{idea.nguoiGui}</span></td>
                      <td><span className="text-muted fs-7">{idea.ngay}</span></td>
                      <td>
                        <Tag
                          color={STATUS_COLORS[idea.trangThai] || 'default'}
                          style={{ fontSize: 11 }}
                        >
                          {idea.trangThai}
                        </Tag>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/doi-moi-sang-tao/quan-ly-y-tuong/chi-tiet/${idea.id}`}
                          className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                        >
                          <i className="fa-regular fa-eye fs-4"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Content>
    </>
  );
};
