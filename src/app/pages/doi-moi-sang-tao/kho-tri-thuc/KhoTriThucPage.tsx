import React, { useState, useMemo } from 'react';
import { Input, Select, Tag, Button, Modal, Empty, Alert } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

interface IKhoTri {
  id: string;
  ma: string;
  ten: string;
  linhVuc: string;
  tomTat: string;
  nguoiGui: string;
  ngayCongnhan: string;
  loiIch: string;
  tags: string[];
  luotXem: number;
}

const MOCK_KHO: IKhoTri[] = [
  {
    id: '1', ma: 'KTT-2026-001', ten: 'Tối ưu lịch trình bay bằng Big Data — tiết kiệm nhiên liệu',
    linhVuc: 'Khai thác bay',
    tomTat: 'Phân tích dữ liệu khí tượng, ATC slot và lịch sử hành trình để tối ưu flight path. Đã áp dụng 18 đường bay nội địa, tiết kiệm trung bình 3.2% nhiên liệu/chuyến.',
    nguoiGui: 'Phạm Thị Lan', ngayCongnhan: '15/06/2026',
    loiIch: 'Tiết kiệm ~12 tỷ đồng/năm chi phí nhiên liệu, giảm phát thải CO₂.',
    tags: ['Big Data', 'Nhiên liệu', 'Khai thác bay', 'Tối ưu hóa'],
    luotXem: 128,
  },
  {
    id: '2', ma: 'KTT-2026-002', ten: 'AI dự báo bảo trì động cơ phòng ngừa (Predictive Maintenance)',
    linhVuc: 'Kỹ thuật bảo dưỡng',
    tomTat: 'Hệ thống AI phân tích dữ liệu cảm biến động cơ theo thời gian thực, phát hiện sớm dấu hiệu bất thường và đề xuất lịch bảo trì trước khi sự cố xảy ra.',
    nguoiGui: 'Trần Quang Hùng', ngayCongnhan: '10/06/2026',
    loiIch: 'Giảm 30% chi phí bảo dưỡng khẩn cấp, tăng độ tin cậy khai thác.',
    tags: ['AI', 'Predictive Maintenance', 'Động cơ', 'An toàn'],
    luotXem: 95,
  },
  {
    id: '3', ma: 'KTT-2026-003', ten: 'Hệ thống phản hồi hành khách thời gian thực qua QR Code',
    linhVuc: 'Dịch vụ hành khách',
    tomTat: 'Hành khách quét QR tại ghế ngồi để đánh giá dịch vụ ngay trên chuyến bay. Dữ liệu phản hồi được xử lý tự động, báo cáo về trung tâm trong 30 phút sau khi hạ cánh.',
    nguoiGui: 'Lê Thị Hương', ngayCongnhan: '08/06/2026',
    loiIch: 'Tăng chỉ số NPS từ 62 lên 74, phát hiện vấn đề dịch vụ ngay trong ngày.',
    tags: ['QR Code', 'Customer Feedback', 'NPS', 'Dịch vụ'],
    luotXem: 82,
  },
  {
    id: '4', ma: 'KTT-2026-004', ten: 'Blended Learning cho đào tạo phi công & tiếp viên',
    linhVuc: 'Đào tạo nhân lực',
    tomTat: 'Kết hợp học lý thuyết online (LMS) với thực hành simulator, giúp rút ngắn 25% thời gian đào tạo định kỳ. Áp dụng cho trên 2.000 nhân viên phi hành/năm.',
    nguoiGui: 'Nguyễn Thành Nam', ngayCongnhan: '05/06/2026',
    loiIch: 'Tiết kiệm chi phí đào tạo, linh hoạt lịch học cho phi hành đoàn.',
    tags: ['E-learning', 'Simulator', 'Phi công', 'Tiếp viên'],
    luotXem: 71,
  },
  {
    id: '5', ma: 'KTT-2026-005', ten: 'Self check-in kiosk tại sân bay Tier-2 — giảm thời gian chờ',
    linhVuc: 'Dịch vụ mặt đất',
    tomTat: 'Triển khai 24 kiosk self check-in tại Đà Nẵng, Nha Trang, Phú Quốc. Hành khách tự làm thủ tục trong dưới 3 phút, giảm tải quầy check-in truyền thống 40%.',
    nguoiGui: 'Nguyễn Minh Tuấn', ngayCongnhan: '01/06/2026',
    loiIch: 'Giảm thời gian chờ hành khách, tiết kiệm nhân lực phục vụ mặt đất.',
    tags: ['Self check-in', 'Kiosk', 'Mặt đất', 'Tự động hoá'],
    luotXem: 64,
  },
];

const LINH_VUC_OPTIONS = [
  { label: 'Tất cả lĩnh vực', value: '' },
  { label: 'Khai thác bay',        value: 'Khai thác bay' },
  { label: 'Kỹ thuật bảo dưỡng',  value: 'Kỹ thuật bảo dưỡng' },
  { label: 'Dịch vụ hành khách',  value: 'Dịch vụ hành khách' },
  { label: 'Dịch vụ mặt đất',     value: 'Dịch vụ mặt đất' },
  { label: 'Đào tạo nhân lực',    value: 'Đào tạo nhân lực' },
];

export const KhoTriThucPage: React.FC = () => {
  const { isMember } = useDMSTRole();
  const [search, setSearch] = useState('');
  const [linhVuc, setLinhVuc] = useState('');
  const [detailItem, setDetailItem] = useState<IKhoTri | null>(null);

  const filtered = useMemo(() => {
    return MOCK_KHO.filter(k => {
      const matchSearch = !search || k.ten.toLowerCase().includes(search.toLowerCase()) || k.ma.toLowerCase().includes(search.toLowerCase());
      const matchLV = !linhVuc || k.linhVuc === linhVuc;
      return matchSearch && matchLV;
    });
  }, [search, linhVuc]);

  return (
    <>
      <PageTitle breadcrumbs={[{ title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false }]}>
        Kho tri thức
      </PageTitle>
      <Content>
        {/* Read-only banner for member role */}
        {isMember && (
          <Alert
            type="info"
            showIcon
            icon={<i className="fa-regular fa-eye text-info" />}
            className="mb-5"
            message={
              <span className="fw-semibold">Chế độ xem — Thành viên</span>
            }
            description="Bạn đang xem Kho tri thức ở chế độ chỉ đọc. Chức năng quản trị (thêm, sửa, xóa) chỉ dành cho Quản trị viên và Người duyệt."
          />
        )}

        {/* Header stats */}
        <div className="d-flex gap-4 mb-6">
          <div className="card flex-1 bg-light-success border-0">
            <div className="card-body py-4 d-flex align-items-center">
              <i className="fa-regular fa-books text-success fs-2x me-4" />
              <div>
                <div className="fs-2 fw-bold text-success">{MOCK_KHO.length}</div>
                <div className="fs-7 text-muted">Tri thức được công nhận</div>
              </div>
            </div>
          </div>
          <div className="card flex-1 bg-light-primary border-0">
            <div className="card-body py-4 d-flex align-items-center">
              <i className="fa-regular fa-eye text-primary fs-2x me-4" />
              <div>
                <div className="fs-2 fw-bold text-primary">{MOCK_KHO.reduce((s, k) => s + k.luotXem, 0)}</div>
                <div className="fs-7 text-muted">Lượt xem tổng</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h3 className="card-title fw-bold text-gray-800">Danh sách tri thức được công nhận</h3>
            <div className="d-flex gap-2">
              <Input
                placeholder="Tìm kiếm tri thức..."
                prefix={<i className="fa-regular fa-search text-muted" />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 220 }}
              />
              <Select
                options={LINH_VUC_OPTIONS}
                value={linhVuc}
                onChange={setLinhVuc}
                style={{ width: 180 }}
              />
            </div>
          </div>

          <div className="card-body py-3">
            {filtered.length === 0 ? (
              <Empty description="Không có tri thức phù hợp" />
            ) : (
              <div className="row g-4">
                {filtered.map(item => (
                  <div key={item.id} className="col-md-6 col-xl-4">
                    <div className="card border h-100 card-hoverable" style={{ transition: 'box-shadow 0.2s' }}>
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between mb-3">
                          <span className="badge badge-light-success">{item.ma}</span>
                          <span className="text-muted fs-8">
                            <i className="fa-regular fa-eye me-1" />{item.luotXem} lượt xem
                          </span>
                        </div>
                        <h5 className="fw-bold text-gray-800 mb-2 fs-6">{item.ten}</h5>
                        <p className="text-gray-600 fs-7 flex-grow-1 mb-3"
                          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.tomTat}
                        </p>
                        <div className="mb-3 d-flex flex-wrap gap-1">
                          {item.tags.map(tag => (
                            <Tag key={tag} color="blue" style={{ fontSize: 11 }}>{tag}</Tag>
                          ))}
                        </div>
                        <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-auto">
                          <div>
                            <div className="text-muted fs-8"><i className="fa-regular fa-user me-1" />{item.nguoiGui}</div>
                            <div className="text-muted fs-8"><i className="fa-regular fa-calendar me-1" />{item.ngayCongnhan}</div>
                          </div>
                          <Button size="small" type="primary" ghost onClick={() => setDetailItem(item)}>
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        <Modal
          title={
            <div>
              <div className="fw-bold">{detailItem?.ten}</div>
              <div className="text-muted fs-7 fw-normal mt-1">{detailItem?.ma}</div>
            </div>
          }
          open={!!detailItem}
          onCancel={() => setDetailItem(null)}
          width={700}
          footer={[
            !isMember && (
              <Button key="download" icon={<i className="fa-regular fa-download me-1" />}>
                Tải xuống
              </Button>
            ),
            <Button key="close" onClick={() => setDetailItem(null)}>Đóng</Button>,
          ]}
        >
          {detailItem && (
            <div>
              <div className="d-flex gap-2 mb-4">
                <Tag color="success">{detailItem.linhVuc}</Tag>
                {detailItem.tags.map(t => <Tag key={t} color="blue">{t}</Tag>)}
              </div>
              <div className="mb-4">
                <div className="fw-semibold text-gray-700 mb-2">Tóm tắt</div>
                <div className="bg-light p-3 rounded text-gray-600">{detailItem.tomTat}</div>
              </div>
              <div className="mb-4">
                <div className="fw-semibold text-gray-700 mb-2">Lợi ích</div>
                <div className="bg-light-success p-3 rounded text-gray-600">{detailItem.loiIch}</div>
              </div>
              <div className="d-flex gap-6 text-muted fs-7">
                <span><i className="fa-regular fa-user me-1" />Tác giả: {detailItem.nguoiGui}</span>
                <span><i className="fa-regular fa-calendar me-1" />Ngày công nhận: {detailItem.ngayCongnhan}</span>
                <span><i className="fa-regular fa-eye me-1" />{detailItem.luotXem} lượt xem</span>
              </div>
            </div>
          )}
        </Modal>
      </Content>
    </>
  );
};
