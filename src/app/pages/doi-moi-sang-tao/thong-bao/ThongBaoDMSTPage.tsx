import React, { useState } from 'react';
import { Button, Tag, Input, Select } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';

interface INotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  source: string;
}

const MOCK_NOTIFICATIONS: INotification[] = [
  { id: '1', type: 'info', title: 'Ý tưởng YT-2026061501 đã được tiếp nhận', content: 'Ý tưởng "Số hóa quy trình self check-in tại sân bay Tier-2" của Nguyễn Minh Tuấn (Ban Dịch vụ mặt đất) đã được tiếp nhận và đang chờ Hội đồng xem xét.', time: '25/06/2026 10:30', isRead: false, source: 'Hệ thống' },
  { id: '2', type: 'success', title: 'Ý tưởng YT-2026061502 được phê duyệt', content: 'Ý tưởng "Ứng dụng AI dự báo bảo trì động cơ phòng ngừa" của Trần Quang Hùng (Xí nghiệp A76) đã được Hội đồng Đổi mới phê duyệt triển khai thí điểm.', time: '24/06/2026 15:00', isRead: false, source: 'Hội đồng Đổi mới sáng tạo' },
  { id: '3', type: 'warning', title: 'Nhắc nhở: 2 ý tưởng sắp quá hạn xem xét', content: 'Ý tưởng YT-2026061501 (self check-in) và YT-2026061505 (Blended Learning) sẽ hết hạn xem xét trong 2 ngày tới. Hội đồng cần xử lý trước 27/06/2026.', time: '24/06/2026 09:00', isRead: true, source: 'Hệ thống' },
  { id: '4', type: 'error', title: 'Ý tưởng YT-2026061506 bị từ chối', content: 'Ý tưởng "Hệ thống RFID theo dõi hành lý thời gian thực" bị từ chối. Lý do: Chi phí triển khai vượt ngân sách cho phép, đề nghị tác giả cải thiện phương án tài chính.', time: '22/06/2026 14:00', isRead: true, source: 'Hội đồng Đổi mới sáng tạo' },
  { id: '5', type: 'success', title: 'Ý tưởng YT-2026061503 được công nhận & vào Kho tri thức', content: 'Ý tưởng "Tối ưu lịch trình bay bằng Big Data — tiết kiệm nhiên liệu" của Phạm Thị Lan đã được công nhận chính thức và lưu vào Kho tri thức với mã KTT-2026-001.', time: '21/06/2026 11:00', isRead: true, source: 'Ban Giám đốc Vietnam Airlines' },
  { id: '6', type: 'info', title: 'Mở đợt gửi ý tưởng Quý III/2026', content: 'Vietnam Airlines mở đợt thu thập ý tưởng đổi mới sáng tạo Quý III/2026 (01/07 – 30/09/2026). Chủ đề ưu tiên: Chuyển đổi số, An toàn bay, Trải nghiệm hành khách.', time: '20/06/2026 08:00', isRead: true, source: 'Ban Tổ chức & Nhân sự' },
];

const TYPE_CONFIG = {
  info: { color: 'processing', icon: 'fa-circle-info', label: 'Thông tin' },
  success: { color: 'success', icon: 'fa-circle-check', label: 'Thành công' },
  warning: { color: 'warning', icon: 'fa-triangle-exclamation', label: 'Cảnh báo' },
  error: { color: 'error', icon: 'fa-circle-xmark', label: 'Từ chối' },
};

export const ThongBaoDMSTPage: React.FC = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    const matchFilter = filter === 'all' || (filter === 'unread' && !n.isRead) || n.type === filter;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <>
      <PageTitle breadcrumbs={[{ title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false }]}>
        Thông báo hệ thống
      </PageTitle>
      <Content>
        <div className="card">
          <div className="card-header border-0 pt-5 d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <h3 className="card-title fw-bold text-gray-800 mb-0">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="badge badge-danger">{unreadCount} chưa đọc</span>
              )}
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Input
                placeholder="Tìm kiếm thông báo..."
                prefix={<i className="fa-regular fa-search text-muted" />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
              <Select
                value={filter}
                onChange={setFilter}
                style={{ width: 160 }}
                options={[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Chưa đọc', value: 'unread' },
                  { label: 'Thông tin', value: 'info' },
                  { label: 'Thành công', value: 'success' },
                  { label: 'Cảnh báo', value: 'warning' },
                  { label: 'Từ chối', value: 'error' },
                ]}
              />
              {unreadCount > 0 && (
                <Button size="small" onClick={markAllRead}>
                  <i className="fa-regular fa-check-double me-1" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
          </div>

          <div className="card-body py-3">
            {filtered.length === 0 ? (
              <div className="text-center text-muted py-10">
                <i className="fa-regular fa-bell-slash fs-2x mb-3 d-block text-muted" />
                Không có thông báo
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {filtered.map(n => {
                  const tc = TYPE_CONFIG[n.type];
                  return (
                    <div
                      key={n.id}
                      className={`d-flex align-items-start p-4 border rounded cursor-pointer ${!n.isRead ? 'bg-light-primary border-primary border-opacity-25' : 'bg-white'}`}
                      onClick={() => markRead(n.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={`symbol symbol-40px me-4 flex-shrink-0`}>
                        <div className={`symbol-label bg-light-${tc.color}`}>
                          <i className={`fa-regular ${tc.icon} text-${tc.color} fs-4`} />
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <span className={`fw-bold fs-7 ${!n.isRead ? 'text-dark' : 'text-gray-700'}`}>{n.title}</span>
                            {!n.isRead && <span className="badge badge-primary fs-9">Mới</span>}
                          </div>
                          <div className="text-muted fs-8 flex-shrink-0 ms-4">{n.time}</div>
                        </div>
                        <div className="text-gray-600 fs-7 mb-2">{n.content}</div>
                        <div className="d-flex align-items-center gap-2">
                          <Tag color={tc.color} style={{ fontSize: 11 }}>{tc.label}</Tag>
                          <span className="text-muted fs-8"><i className="fa-regular fa-building me-1" />{n.source}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Content>
    </>
  );
};
