import React, { useCallback, useEffect, useState } from 'react';
import { Steps, Card, Tag, Row, Col, Spin, Button } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { getCauHinhXuLyYTuong } from '@/app/services/ideaPortalApi';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';
import { CauHinhXuLyYTuongModal } from '@/app/pages/doi-moi-sang-tao/quan-ly-y-tuong/components/CauHinhXuLyYTuongModal';

// Đồng bộ màu trạng thái với DashboardDoiMoiPage.tsx (STATUS_COLORS)
const STATUS_COLORS: Record<string, string> = {
  'Bản nháp':       'default',
  'Đã nộp':         'processing',
  'Đã tiếp nhận':   'success',
  'Đã trả lại':     'error',
  'Đã hủy':         'default',
  'Được công nhận': 'purple',
};

export const SoDoQuyTrinhPage: React.FC = () => {
  const { isReviewer } = useDMSTRole();
  const [loading, setLoading] = useState(false);
  const [cauHinhOpen, setCauHinhOpen] = useState(false);
  const [thoiHanTiepNhanNgay, setThoiHanTiepNhanNgay] = useState(5);
  const [thoiHanKiemDuyetCongNhanNgay, setThoiHanKiemDuyetCongNhanNgay] = useState(30);

  const loadCauHinh = useCallback(() => {
    setLoading(true);
    return getCauHinhXuLyYTuong()
      .then(res => {
        const cfg = (res as any)?.data?.data;
        setThoiHanTiepNhanNgay(cfg?.thoiHanTiepNhanNgay ?? 5);
        setThoiHanKiemDuyetCongNhanNgay(cfg?.thoiHanKiemDuyetCongNhanNgay ?? 30);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCauHinh(); }, [loadCauHinh]);

  const breadcrumbs = [
    { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
    { title: 'Quy trình phê duyệt', path: '#', isActive: false, isSeparator: false },
  ];

  const mainSteps = [
    {
      title: 'Bản nháp',
      icon: <i className="fa-regular fa-pen" />,
      status: 'finish' as const,
      description: 'Người đề xuất soạn thảo nội dung ý tưởng, có thể lưu và chỉnh sửa nhiều lần trước khi nộp.',
    },
    {
      title: 'Đã nộp',
      icon: <i className="fa-regular fa-paper-plane" />,
      status: 'finish' as const,
      description: `Ý tưởng được gửi cho cán bộ tiếp nhận xử lý. Thời hạn tiếp nhận: ${thoiHanTiepNhanNgay} ngày kể từ ngày nộp.`,
    },
    {
      title: 'Đã tiếp nhận',
      icon: <i className="fa-regular fa-inbox" />,
      status: 'finish' as const,
      description: `Cán bộ tiếp nhận kiểm duyệt nội dung. Thời hạn kiểm duyệt & công nhận: ${thoiHanKiemDuyetCongNhanNgay} ngày kể từ ngày tiếp nhận.`,
    },
    {
      title: 'Được công nhận',
      icon: <i className="fa-regular fa-award" />,
      status: 'finish' as const,
      description: 'Ý tưởng được công nhận, ghi nhận kết quả và đính kèm quyết định/tài liệu công nhận.',
    },
  ];

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Sơ đồ quy trình</PageTitle>
      <Content>
        <div className="card mb-5">
          <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center">
            <h3 className="card-title fw-bold text-gray-800">
              <i className="fa-regular fa-diagram-project me-2" />
              Luồng xử lý chính
            </h3>
            {isReviewer && (
              <Button
                icon={<i className="fa-regular fa-gear me-1" />}
                onClick={() => setCauHinhOpen(true)}
              >
                Cấu hình thời hạn từng bước
              </Button>
            )}
          </div>
          <div className="card-body py-3">
            <Spin spinning={loading}>
              <Steps
                items={mainSteps.map(s => ({ title: s.title, icon: s.icon, status: s.status, description: s.description }))}
                labelPlacement="vertical"
                responsive
              />
            </Spin>
            <div className="text-muted fs-8 mt-4">
              <i className="fa-regular fa-circle-info me-1" />
              Thời hạn tiếp nhận và kiểm duyệt/công nhận lấy theo cấu hình xử lý hồ sơ hiện hành, chỉ dùng để thống kê hồ sơ quá hạn.
              {isReviewer ? ' Nhấn "Cấu hình thời hạn từng bước" ở trên để thay đổi.' : ''}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header border-0 pt-5">
            <h3 className="card-title fw-bold text-gray-800">
              <i className="fa-regular fa-code-branch me-2" />
              Các nhánh phát sinh
            </h3>
          </div>
          <div className="card-body py-3">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" bordered className="h-100">
                  <div className="d-flex align-items-center mb-2">
                    <Tag color={STATUS_COLORS['Đã trả lại']} className="fs-7">Đã trả lại</Tag>
                  </div>
                  <div className="text-gray-700">
                    Phát sinh từ bước <b>Đã tiếp nhận</b> khi hồ sơ chưa đạt yêu cầu. Cán bộ tiếp nhận trả lại kèm ý kiến,
                    người đề xuất chỉnh sửa và nộp lại — quay về bước <b>Đã nộp</b>.
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" bordered className="h-100">
                  <div className="d-flex align-items-center mb-2">
                    <Tag color={STATUS_COLORS['Đã hủy']} className="fs-7">Đã hủy</Tag>
                  </div>
                  <div className="text-gray-700">
                    Người đề xuất thu hồi hoặc cán bộ tiếp nhận hủy bỏ ý tưởng khi không còn phù hợp để tiếp tục xử lý.
                    Đây là trạng thái kết thúc, không quay lại các bước trước.
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {isReviewer && (
          <CauHinhXuLyYTuongModal
            visible={cauHinhOpen}
            onClose={() => setCauHinhOpen(false)}
            onSaved={loadCauHinh}
          />
        )}
      </Content>
    </>
  );
};
