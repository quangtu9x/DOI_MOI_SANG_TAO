import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Divider, Button, Modal, Input, message, Upload } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { MOCK_Y_TUONG_DATA, TRANG_THAI_DISPLAY, TrangThaiYTuong } from './QuanLyYTuongDMSTPage';
import { TuongTacSection } from '@/app/components/tuong-tac/TuongTacSection';
import { LoaiDoiTuong } from '@/app/models/knowledge-hub';
import { useAuth } from '@/app/modules/auth';

const MOCK_HISTORY: Record<string, { action: string; user: string; time: string; note: string; dot: string }[]> = {
  '1': [
    { action: 'Tạo ý tưởng', user: 'Nguyễn Minh Tuấn', time: '25/06/2026 08:45', note: '', dot: 'primary' },
    { action: 'Nộp phê duyệt', user: 'Nguyễn Minh Tuấn', time: '25/06/2026 10:30', note: 'Đính kèm 2 tài liệu minh chứng', dot: 'primary' },
    { action: 'Tiếp nhận hồ sơ', user: 'Ban ĐMST — Lê Thị Hương', time: '25/06/2026 14:00', note: 'Đã tiếp nhận, đang chờ xét duyệt', dot: 'warning' },
  ],
  '2': [
    { action: 'Tạo ý tưởng', user: 'Trần Quang Hùng', time: '24/06/2026 07:30', note: '', dot: 'primary' },
    { action: 'Nộp phê duyệt', user: 'Trần Quang Hùng', time: '24/06/2026 09:00', note: '', dot: 'primary' },
    { action: 'Phê duyệt', user: 'Hội đồng ĐMST — Hoàng Văn Đức', time: '24/06/2026 16:00', note: 'Ý tưởng có tính khả thi cao, đề nghị triển khai thí điểm tại A76', dot: 'success' },
  ],
  '3': [
    { action: 'Tạo ý tưởng', user: 'Phạm Thị Lan', time: '23/06/2026 08:00', note: '', dot: 'primary' },
    { action: 'Nộp phê duyệt', user: 'Phạm Thị Lan', time: '23/06/2026 10:00', note: 'Đính kèm báo cáo phân tích dữ liệu', dot: 'primary' },
    { action: 'Phê duyệt', user: 'Hội đồng ĐMST', time: '23/06/2026 15:30', note: 'Đã áp dụng thí điểm 3 đường bay', dot: 'success' },
    { action: 'Được công nhận', user: 'Ban Tổng Giám đốc', time: '24/06/2026 09:00', note: 'Đưa vào Kho tri thức, tiết kiệm 12 tỷ/năm', dot: 'success' },
  ],
  default: [
    { action: 'Tạo ý tưởng', user: 'Nhân viên', time: '19/06/2026 09:00', note: '', dot: 'primary' },
    { action: 'Nộp phê duyệt', user: 'Nhân viên', time: '19/06/2026 11:00', note: '', dot: 'primary' },
  ],
};

const MOCK_FILES: Record<string, { name: string; size: string; type: string }[]> = {
  '1': [
    { name: 'Thuyết minh giải pháp self check-in.pdf', size: '1.4 MB', type: 'pdf' },
    { name: 'Khảo sát sân bay Đà Nẵng - Nha Trang.xlsx', size: '580 KB', type: 'xlsx' },
  ],
  '2': [
    { name: 'Predictive Maintenance Proposal.pdf', size: '2.1 MB', type: 'pdf' },
    { name: 'Dữ liệu cảm biến mẫu động cơ CFM56.xlsx', size: '1.8 MB', type: 'xlsx' },
    { name: 'Kế hoạch triển khai AI A76.docx', size: '320 KB', type: 'docx' },
  ],
  '3': [
    { name: 'Báo cáo phân tích nhiên liệu 2025.pdf', size: '3.2 MB', type: 'pdf' },
    { name: 'Dữ liệu flight path 18 đường bay.xlsx', size: '2.5 MB', type: 'xlsx' },
    { name: 'Kết quả thí điểm Q1-2026.docx', size: '450 KB', type: 'docx' },
    { name: 'Báo cáo tiết kiệm nhiên liệu.pdf', size: '1.1 MB', type: 'pdf' },
    { name: 'Phê duyệt Ban TGĐ.pdf', size: '210 KB', type: 'pdf' },
  ],
  default: [
    { name: 'Thuyết minh ý tưởng.pdf', size: '1.2 MB', type: 'pdf' },
    { name: 'Kế hoạch triển khai.docx', size: '456 KB', type: 'docx' },
    { name: 'Tài liệu tham khảo.pdf', size: '820 KB', type: 'pdf' },
    { name: 'Phân tích chi phí - lợi ích.xlsx', size: '340 KB', type: 'xlsx' },
  ],
};

export const ChiTietYTuongPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const idea = MOCK_Y_TUONG_DATA.find(i => i.id === id);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!idea) {
    return (
      <Content>
        <div className="alert alert-danger">Không tìm thấy ý tưởng.</div>
      </Content>
    );
  }

  const display  = TRANG_THAI_DISPLAY[idea.trangThai];
  const history  = MOCK_HISTORY[id!] ?? MOCK_HISTORY['default'];
  const files    = MOCK_FILES[id!]   ?? MOCK_FILES['default'];
  const fileSlice = files.slice(0, idea.fileCount ?? files.length);

  const handleApprove = () => {
    setApproveModal(false);
    message.success('Đã phê duyệt ý tưởng thành công!');
    navigate('/doi-moi-sang-tao/quy-trinh-duyet/da-duyet');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) { message.error('Vui lòng nhập lý do từ chối'); return; }
    setRejectModal(false);
    message.success('Đã từ chối ý tưởng.');
    navigate('/doi-moi-sang-tao/quy-trinh-duyet/tu-choi');
  };

  const fileIcon = (type: string) => {
    if (type === 'pdf') return 'fa-file-pdf text-danger';
    if (type === 'docx' || type === 'doc') return 'fa-file-word text-primary';
    if (type === 'xlsx' || type === 'xls') return 'fa-file-excel text-success';
    return 'fa-file text-muted';
  };

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Quản lý ý tưởng', path: '/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach', isActive: false, isSeparator: false },
      ]}>
        Chi tiết ý tưởng
      </PageTitle>
      <Content>
        <div className="row g-5">
          {/* Main content */}
          <div className="col-xl-8">
            <div className="card mb-5">
              <div className="card-header border-0 pt-5 d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="card-title fw-bold text-gray-800 mb-1">{idea.tenYTuong}</h3>
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted fs-7"><i className="fa-regular fa-hashtag me-1" />{idea.ma}</span>
                    <Tag color={display.color}>{display.label}</Tag>
                    <span className="badge badge-light-info">{idea.linhVuc}</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {idea.trangThai === TrangThaiYTuong.ChoDuyet && (
                    <>
                      <Button type="primary" onClick={() => setApproveModal(true)}>
                        <i className="fa-regular fa-check me-1 text-white" /> Phê duyệt
                      </Button>
                      <Button danger onClick={() => setRejectModal(true)}>
                        <i className="fa-regular fa-times me-1 text-white" /> Từ chối
                      </Button>
                    </>
                  )}
                  {idea.trangThai === TrangThaiYTuong.DangSoanThao && (
                    <Button type="primary" onClick={() => navigate(`/doi-moi-sang-tao/quan-ly-y-tuong/chinh-sua/${idea.id}`)}>
                      <i className="fa-regular fa-pen me-1" /> Chỉnh sửa
                    </Button>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className="mb-6">
                  <div className="fw-bold text-gray-700 mb-2 fs-6">Mô tả vấn đề hiện tại</div>
                  <div className="text-gray-600 bg-light p-4 rounded">{idea.moTaVanDe}</div>
                </div>
                <div className="mb-6">
                  <div className="fw-bold text-gray-700 mb-2 fs-6">Nội dung ý tưởng / Giải pháp đề xuất</div>
                  <div className="text-gray-600 bg-light p-4 rounded">{idea.noiDungDeXuat}</div>
                </div>
                <div className="row g-4 mb-6">
                  <div className="col-md-6">
                    <div className="fw-bold text-gray-700 mb-2 fs-6">Mục tiêu cụ thể</div>
                    <div className="text-gray-600 bg-light p-3 rounded">{idea.mucTieu}</div>
                  </div>
                  <div className="col-md-6">
                    <div className="fw-bold text-gray-700 mb-2 fs-6">Lợi ích dự kiến</div>
                    <div className="text-gray-600 bg-light p-3 rounded">{idea.loiIch}</div>
                  </div>
                </div>
                {idea.lyDoTuChoi && (
                  <div className="alert alert-danger">
                    <div className="fw-bold mb-1"><i className="fa-regular fa-circle-xmark me-2" />Lý do từ chối</div>
                    {idea.lyDoTuChoi}
                  </div>
                )}
              </div>
            </div>

            {/* Files */}
            <div className="card mb-5">
              <div className="card-header border-0 pt-4">
                <h4 className="card-title fw-semibold text-gray-700">
                  <i className="fa-regular fa-paperclip me-2" />Tài liệu đính kèm ({idea.fileCount || 0})
                </h4>
              </div>
              <div className="card-body py-3">
                {fileSlice.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {fileSlice.map((f, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between p-3 border rounded bg-light">
                        <div className="d-flex align-items-center">
                          <i className={`fa-regular ${fileIcon(f.type)} fs-3 me-3`} />
                          <div>
                            <div className="fw-semibold fs-7">{f.name}</div>
                            <div className="text-muted fs-8">{f.size}</div>
                          </div>
                        </div>
                        <Button type="link" size="small" icon={<i className="fa-regular fa-download" />}>
                          Tải xuống
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted text-center py-4">Chưa có tài liệu đính kèm</div>
                )}
              </div>
            </div>
            {/* Tương tác & Bình luận — IV.2.2 */}
            <div className="card">
              <div className="card-header border-0 pt-4 pb-2">
                <h4 className="card-title fw-semibold text-gray-700">
                  <i className="fa-regular fa-comments me-2" />Tương tác & Bình luận
                </h4>
              </div>
              <div className="card-body">
                <TuongTacSection
                  loaiDoiTuong={LoaiDoiTuong.YTuong}
                  doiTuongId={id!}
                  initialLikes={idea.luotThich ?? 0}
                  currentUserId={currentUser?.id}
                />
              </div>
            </div>
          </div>

          {/* Sidebar info */}
          <div className="col-xl-4">
            <div className="card mb-5">
              <div className="card-header border-0 pt-4">
                <h4 className="card-title fw-semibold text-gray-700">Thông tin hồ sơ</h4>
              </div>
              <div className="card-body py-3">
                {[
                  { label: 'Mã hồ sơ', value: idea.ma, icon: 'fa-hashtag' },
                  { label: 'Người gửi', value: idea.nguoiGuiTen, icon: 'fa-user' },
                  { label: 'Ngày nộp', value: idea.ngayNop || '—', icon: 'fa-calendar' },
                  { label: 'Lĩnh vực', value: idea.linhVuc, icon: 'fa-tag' },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center py-2 border-bottom">
                    <i className={`fa-regular ${item.icon} text-muted me-3 w-20px`} />
                    <div>
                      <div className="text-muted fs-8">{item.label}</div>
                      <div className="fw-semibold fs-7">{item.value}</div>
                    </div>
                  </div>
                ))}
                <div className="d-flex align-items-center py-2">
                  <i className="fa-regular fa-circle-dot text-muted me-3 w-20px" />
                  <div>
                    <div className="text-muted fs-8">Trạng thái</div>
                    <Tag color={display.color}>{display.label}</Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* History timeline */}
            <div className="card">
              <div className="card-header border-0 pt-4">
                <h4 className="card-title fw-semibold text-gray-700">Lịch sử xử lý</h4>
              </div>
              <div className="card-body py-3">
                <div className="timeline">
                  {history.map((h, i) => (
                    <div key={i} className="timeline-item d-flex pb-4">
                      <div className="timeline-line me-3 d-flex flex-column align-items-center" style={{ minWidth: 20 }}>
                        <div className={`rounded-circle bg-${h.dot}`} style={{ width: 10, height: 10, marginTop: 4 }} />
                        {i < history.length - 1 && (
                          <div className="bg-light flex-grow-1" style={{ width: 2, marginTop: 2 }} />
                        )}
                      </div>
                      <div>
                        <div className="fw-semibold fs-7">{h.action}</div>
                        <div className="text-muted fs-8">{h.user}</div>
                        <div className="text-muted fs-8">{h.time}</div>
                        {h.note && <div className="text-info fs-8 mt-1">{h.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Approve modal */}
        <Modal
          title={<><i className="fa-regular fa-circle-check text-success me-2" />Xác nhận phê duyệt</>}
          open={approveModal}
          onOk={handleApprove}
          onCancel={() => setApproveModal(false)}
          okText="Phê duyệt"
          cancelText="Hủy"
          okButtonProps={{ type: 'primary' }}
        >
          <p>Bạn có chắc chắn muốn <strong>phê duyệt</strong> ý tưởng này không?</p>
          <p className="text-muted fs-7">Sau khi phê duyệt, ý tưởng sẽ được chuyển sang Kho tri thức.</p>
        </Modal>

        {/* Reject modal */}
        <Modal
          title={<><i className="fa-regular fa-circle-xmark text-danger me-2" />Từ chối ý tưởng</>}
          open={rejectModal}
          onOk={handleReject}
          onCancel={() => setRejectModal(false)}
          okText="Xác nhận từ chối"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <p>Vui lòng nhập lý do từ chối:</p>
          <Input.TextArea
            rows={3}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối rõ ràng để người gửi có thể cải thiện..."
          />
        </Modal>
      </Content>
    </>
  );
};
