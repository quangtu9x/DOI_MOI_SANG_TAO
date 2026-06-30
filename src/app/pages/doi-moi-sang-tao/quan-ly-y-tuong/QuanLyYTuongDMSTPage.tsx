import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Input, Select, Empty, Tooltip } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';

export enum TrangThaiYTuong {
  DangSoanThao = 1,
  ChoDuyet = 2,
  DaDuyet = 3,
  TuChoi = 4,
  DuocCongNhan = 5,
}

export const TRANG_THAI_DISPLAY: Record<TrangThaiYTuong, { label: string; color: string }> = {
  [TrangThaiYTuong.DangSoanThao]: { label: 'Đang soạn thảo', color: 'default' },
  [TrangThaiYTuong.ChoDuyet]: { label: 'Chờ phê duyệt', color: 'processing' },
  [TrangThaiYTuong.DaDuyet]: { label: 'Đã phê duyệt', color: 'success' },
  [TrangThaiYTuong.TuChoi]: { label: 'Từ chối', color: 'error' },
  [TrangThaiYTuong.DuocCongNhan]: { label: 'Được công nhận', color: 'purple' },
};

export interface IYTuong {
  id: string;
  ma: string;
  tenYTuong: string;
  linhVuc: string;
  moTaVanDe: string;
  noiDungDeXuat: string;
  mucTieu: string;
  loiIch: string;
  nguoiGui: string;
  nguoiGuiTen: string;
  ngayNop?: string;
  trangThai: TrangThaiYTuong;
  lyDoTuChoi?: string;
  fileCount?: number;
  ghiChu?: string;
  luotThich?: number;
}

// Mock data — Vietnam Airlines context
export const MOCK_Y_TUONG_DATA: IYTuong[] = [
  {
    id: '1', ma: 'YT-2026061501', tenYTuong: 'Số hóa quy trình check-in nội địa — tăng tốc phục vụ hành khách',
    linhVuc: 'Dịch vụ mặt đất', nguoiGui: 'nmt', nguoiGuiTen: 'Nguyễn Minh Tuấn',
    moTaVanDe: 'Tại các sân bay tier-2 (Đà Nẵng, Nha Trang, Phú Quốc), hành khách phải chờ trung bình 15 phút tại quầy check-in do thiếu hệ thống tự phục vụ.',
    noiDungDeXuat: 'Triển khai 24 kiosk self check-in tích hợp nhận diện khuôn mặt và QR code vé, đồng bộ với hệ thống DCS trung tâm.',
    mucTieu: 'Giảm thời gian check-in xuống dưới 3 phút, giảm tải quầy truyền thống 40%.',
    loiIch: 'Tiết kiệm nhân lực phục vụ, tăng điểm hài lòng hành khách (NPS).',
    ngayNop: '25/06/2026', trangThai: TrangThaiYTuong.ChoDuyet, fileCount: 2,
  },
  {
    id: '2', ma: 'YT-2026061502', tenYTuong: 'AI dự báo bảo trì động cơ phòng ngừa (Predictive Maintenance)',
    linhVuc: 'Kỹ thuật bảo dưỡng', nguoiGui: 'tqh', nguoiGuiTen: 'Trần Quang Hùng',
    moTaVanDe: 'Bảo trì theo lịch định kỳ không phát hiện sớm các dấu hiệu suy giảm, dẫn đến chi phí bảo dưỡng khẩn cấp cao.',
    noiDungDeXuat: 'Hệ thống AI phân tích dữ liệu cảm biến động cơ theo thời gian thực, phát hiện dấu hiệu bất thường và đề xuất lịch bảo trì tối ưu.',
    mucTieu: 'Giảm 30% chi phí bảo dưỡng khẩn cấp, nâng độ tin cậy khai thác lên 99.5%.',
    loiIch: 'Tiết kiệm ~18 tỷ đồng/năm, giảm nguy cơ AOG (Aircraft on Ground).',
    ngayNop: '24/06/2026', trangThai: TrangThaiYTuong.DaDuyet, fileCount: 3,
  },
  {
    id: '3', ma: 'YT-2026061503', tenYTuong: 'Tối ưu lịch trình bay bằng Big Data — giảm tiêu hao nhiên liệu',
    linhVuc: 'Khai thác bay', nguoiGui: 'ptl', nguoiGuiTen: 'Phạm Thị Lan',
    moTaVanDe: 'Kế hoạch bay hiện tại chưa tận dụng tối đa dữ liệu khí tượng và luồng không lưu thực tế.',
    noiDungDeXuat: 'Tích hợp Big Data khí tượng, ATC slot và lịch sử hành trình để tự động đề xuất hành trình bay tối ưu cho từng chuyến.',
    mucTieu: 'Tiết kiệm 2-4% nhiên liệu/chuyến trên 18 đường bay nội địa chính.',
    loiIch: '~12 tỷ đồng tiết kiệm nhiên liệu/năm, giảm phát thải CO₂.',
    ngayNop: '23/06/2026', trangThai: TrangThaiYTuong.DuocCongNhan, fileCount: 5,
  },
  {
    id: '4', ma: 'YT-2026061504', tenYTuong: 'Hệ thống phản hồi hành khách thời gian thực qua QR Code trên máy bay',
    linhVuc: 'Dịch vụ hành khách', nguoiGui: 'lth', nguoiGuiTen: 'Lê Thị Hương',
    moTaVanDe: 'Phản hồi dịch vụ hiện thu thập sau chuyến bay, không kịp thời để xử lý vấn đề phát sinh.',
    noiDungDeXuat: 'Gắn QR code tại lưng ghế ngồi, hành khách quét và đánh giá ngay trên chuyến bay. Dữ liệu về trung tâm trong 30 phút sau hạ cánh.',
    mucTieu: 'Thu thập phản hồi 100% chuyến bay, xử lý vấn đề trong ngày.',
    loiIch: 'NPS tăng từ 62 lên 74, giảm khiếu nại chính thức 25%.',
    ngayNop: '22/06/2026', trangThai: TrangThaiYTuong.DaDuyet, fileCount: 2,
  },
  {
    id: '5', ma: 'YT-2026061505', tenYTuong: 'Blended Learning cho đào tạo phi công & tiếp viên định kỳ',
    linhVuc: 'Đào tạo nhân lực', nguoiGui: 'ntn', nguoiGuiTen: 'Nguyễn Thành Nam',
    moTaVanDe: 'Đào tạo định kỳ phi công và tiếp viên phụ thuộc hoàn toàn vào classroom, gây xung đột lịch bay và tốn chi phí.',
    noiDungDeXuat: 'Xây dựng LMS tích hợp với simulator training, học lý thuyết online linh hoạt theo ca, thực hành simulator theo nhóm nhỏ.',
    mucTieu: 'Rút ngắn 25% thời gian đào tạo định kỳ, phủ 100% nhân viên phi hành.',
    loiIch: 'Giảm chi phí đào tạo, linh hoạt lịch học cho 2.000+ nhân viên/năm.',
    ngayNop: '21/06/2026', trangThai: TrangThaiYTuong.ChoDuyet, fileCount: 4,
  },
  {
    id: '6', ma: 'YT-2026061506', tenYTuong: 'Hệ thống quản lý hành lý thông minh với RFID',
    linhVuc: 'Dịch vụ mặt đất', nguoiGui: 'hvd', nguoiGuiTen: 'Hoàng Văn Đức',
    moTaVanDe: 'Tỷ lệ hành lý thất lạc tại các sân bay nội địa vẫn ở mức 0.8%, gây khiếu nại và bồi thường.',
    noiDungDeXuat: 'Gắn tag RFID lên hành lý từ quầy check-in, theo dõi real-time qua toàn bộ hành trình băng chuyền và khoang hàng.',
    mucTieu: 'Giảm tỷ lệ thất lạc xuống dưới 0.2%, phát hiện lỗi định tuyến ngay lập tức.',
    loiIch: 'Giảm 75% chi phí bồi thường hành lý, tăng hài lòng hành khách.',
    ngayNop: '20/06/2026', trangThai: TrangThaiYTuong.TuChoi,
    lyDoTuChoi: 'Chi phí đầu tư hạ tầng RFID tại 5 sân bay ước tính 45 tỷ đồng, vượt ngân sách đổi mới năm 2026. Đề nghị tái đề xuất cho kế hoạch 2027.',
    fileCount: 3,
  },
  {
    id: '7', ma: 'YT-2026061507', tenYTuong: 'Ứng dụng mobile theo dõi sức khỏe phi công tích hợp lịch bay',
    linhVuc: 'An toàn bay', nguoiGui: 'dvk', nguoiGuiTen: 'Đỗ Văn Khoa',
    moTaVanDe: 'Quản lý trạng thái sức khỏe và giờ bay của phi công hiện tại còn thủ công, dễ sai sót.',
    noiDungDeXuat: 'App mobile kết nối với thiết bị đeo, theo dõi nhịp tim, giấc ngủ và trạng thái mệt mỏi. Tự động cảnh báo nếu phi công không đủ điều kiện bay.',
    mucTieu: 'Phát hiện sớm 95% trường hợp phi công không đủ điều kiện bay.',
    loiIch: 'Tăng an toàn bay, giảm rủi ro sự cố do yếu tố con người.',
    ngayNop: '19/06/2026', trangThai: TrangThaiYTuong.DangSoanThao, fileCount: 1,
  },
];

const LINH_VUC_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Khai thác bay',        value: 'Khai thác bay' },
  { label: 'Kỹ thuật bảo dưỡng',  value: 'Kỹ thuật bảo dưỡng' },
  { label: 'Dịch vụ hành khách',  value: 'Dịch vụ hành khách' },
  { label: 'Dịch vụ mặt đất',     value: 'Dịch vụ mặt đất' },
  { label: 'Đào tạo nhân lực',    value: 'Đào tạo nhân lực' },
  { label: 'An toàn bay',         value: 'An toàn bay' },
  { label: 'Công nghệ thông tin', value: 'Công nghệ thông tin' },
];

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  ...Object.entries(TRANG_THAI_DISPLAY).map(([k, v]) => ({ label: v.label, value: k })),
];

interface QuanLyYTuongDMSTPageProps {
  myIdeasOnly?: boolean;
}

// "Ý tưởng của tôi" mock — lọc theo user hiện tại (demo: nguoiGui = 'nmt')
const MY_USER_ID = 'nmt';

export const QuanLyYTuongDMSTPage: React.FC<QuanLyYTuongDMSTPageProps> = ({ myIdeasOnly = false }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [linhVuc, setLinhVuc] = useState('');
  const [trangThai, setTrangThai] = useState('');

  const baseData = myIdeasOnly
    ? MOCK_Y_TUONG_DATA.filter(r => r.nguoiGui === MY_USER_ID)
    : MOCK_Y_TUONG_DATA;

  const filtered = useMemo(() => {
    return baseData.filter(r => {
      const matchSearch = !search ||
        r.tenYTuong.toLowerCase().includes(search.toLowerCase()) ||
        r.ma.toLowerCase().includes(search.toLowerCase());
      const matchLinhVuc = !linhVuc || r.linhVuc === linhVuc;
      const matchStatus = !trangThai || r.trangThai === parseInt(trangThai);
      return matchSearch && matchLinhVuc && matchStatus;
    });
  }, [search, linhVuc, trangThai, baseData]);

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'ma',
      key: 'ma',
      width: 140,
      render: (text: string) => <span className="fw-bold text-primary">{text}</span>,
    },
    {
      title: 'Tên ý tưởng',
      dataIndex: 'tenYTuong',
      key: 'tenYTuong',
      render: (text: string, record: IYTuong) => (
        <div>
          <div className="fw-semibold">{text}</div>
          <div className="text-muted fs-8 mt-1">{record.linhVuc}</div>
        </div>
      ),
    },
    {
      title: 'Người gửi',
      dataIndex: 'nguoiGuiTen',
      key: 'nguoiGuiTen',
      width: 140,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'ngayNop',
      key: 'ngayNop',
      width: 110,
      render: (v: string) => v || '—',
    },
    {
      title: 'Đính kèm',
      dataIndex: 'fileCount',
      key: 'fileCount',
      width: 90,
      render: (count: number) => count > 0
        ? <span className="badge badge-light-primary"><i className="fa-regular fa-paperclip me-1" />{count}</span>
        : <span className="text-muted">—</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 150,
      render: (status: TrangThaiYTuong) => {
        const d = TRANG_THAI_DISPLAY[status];
        return <Tag color={d.color}>{d.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: unknown, record: IYTuong) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<i className="fa-regular fa-eye" />}
              onClick={() => navigate(`/doi-moi-sang-tao/quan-ly-y-tuong/chi-tiet/${record.id}`)}
            />
          </Tooltip>
          {record.trangThai === TrangThaiYTuong.DangSoanThao && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="link"
                size="small"
                icon={<i className="fa-regular fa-pen" />}
                onClick={() => navigate(`/doi-moi-sang-tao/quan-ly-y-tuong/chinh-sua/${record.id}`)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageTitle breadcrumbs={[{ title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false }]}>
        {myIdeasOnly ? 'Ý tưởng của tôi' : 'Quản lý ý tưởng'}
      </PageTitle>
      <Content>
        <div className="card">
          <div className="card-header border-0 pt-5 d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <h3 className="card-title fw-bold text-gray-800">
              {myIdeasOnly ? (
                <><i className="fa-regular fa-user-pen me-2 text-primary" />Ý tưởng của tôi</>
              ) : 'Danh sách ý tưởng'}
            </h3>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Input
                placeholder="Tìm kiếm mã, tên ý tưởng..."
                prefix={<i className="fa-regular fa-search text-muted" />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: 240 }}
              />
              <Select
                options={LINH_VUC_OPTIONS}
                value={linhVuc}
                onChange={setLinhVuc}
                style={{ width: 180 }}
              />
              <Select
                options={STATUS_OPTIONS}
                value={trangThai}
                onChange={setTrangThai}
                style={{ width: 180 }}
              />
              <Link
                to="/doi-moi-sang-tao/quan-ly-y-tuong/tao-moi"
                className="btn btn-primary btn-sm"
              >
                <i className="fa-regular fa-plus me-1" />
                Tạo ý tưởng mới
              </Link>
            </div>
          </div>
          <div className="card-body py-3">
            {filtered.length === 0
              ? <Empty description="Không có ý tưởng phù hợp" />
              : (
                <Table
                  columns={columns}
                  dataSource={filtered}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                  bordered
                  size="small"
                />
              )}
          </div>
        </div>
      </Content>
    </>
  );
};
