import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────────
interface IKhoTri {
  id: string; ma: string; ten: string; linhVuc: string;
  tomTat: string; nguoiGui: string; donVi: string;
  ngayCongnhan: string; loiIch: string; tags: string[]; luotXem: number;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_KHO: IKhoTri[] = [
  {
    id: '1', ma: 'KTT-2026-001',
    ten: 'Tối ưu lịch trình bay bằng Big Data — tiết kiệm nhiên liệu',
    linhVuc: 'Khai thác bay',
    tomTat: 'Phân tích dữ liệu khí tượng, ATC slot và lịch sử hành trình để tối ưu flight path. Áp dụng 18 đường bay nội địa, tiết kiệm trung bình 3.2% nhiên liệu/chuyến.',
    nguoiGui: 'Phạm Thị Lan', donVi: 'Ban Khai thác bay', ngayCongnhan: '15/06/2026',
    loiIch: 'Tiết kiệm ~12 tỷ đồng/năm chi phí nhiên liệu, giảm phát thải CO₂.',
    tags: ['Big Data', 'Nhiên liệu', 'Tối ưu hóa'], luotXem: 128,
  },
  {
    id: '2', ma: 'KTT-2026-002',
    ten: 'AI dự báo bảo trì động cơ phòng ngừa (Predictive Maintenance)',
    linhVuc: 'Kỹ thuật bảo dưỡng',
    tomTat: 'Hệ thống AI phân tích dữ liệu cảm biến động cơ theo thời gian thực, phát hiện sớm dấu hiệu bất thường và đề xuất lịch bảo trì trước khi sự cố xảy ra.',
    nguoiGui: 'Trần Quang Hùng', donVi: 'Xí nghiệp A76', ngayCongnhan: '10/06/2026',
    loiIch: 'Giảm 30% chi phí bảo dưỡng khẩn cấp, tăng độ tin cậy khai thác.',
    tags: ['AI', 'Predictive Maintenance', 'An toàn'], luotXem: 95,
  },
  {
    id: '3', ma: 'KTT-2026-003',
    ten: 'Hệ thống phản hồi hành khách thời gian thực qua QR Code',
    linhVuc: 'Dịch vụ hành khách',
    tomTat: 'Hành khách quét QR tại ghế ngồi để đánh giá dịch vụ ngay trên chuyến bay. Dữ liệu phản hồi xử lý tự động, báo cáo về trung tâm trong 30 phút sau hạ cánh.',
    nguoiGui: 'Lê Thị Hương', donVi: 'Ban Dịch vụ hành khách', ngayCongnhan: '08/06/2026',
    loiIch: 'NPS tăng từ 62 lên 74, phát hiện vấn đề dịch vụ ngay trong ngày.',
    tags: ['QR Code', 'Customer Feedback', 'NPS'], luotXem: 82,
  },
  {
    id: '4', ma: 'KTT-2026-004',
    ten: 'Blended Learning cho đào tạo phi công & tiếp viên',
    linhVuc: 'Đào tạo nhân lực',
    tomTat: 'Kết hợp học lý thuyết online (LMS) với thực hành simulator, rút ngắn 25% thời gian đào tạo định kỳ cho trên 2.000 nhân viên phi hành/năm.',
    nguoiGui: 'Nguyễn Thành Nam', donVi: 'Trung tâm Đào tạo bay', ngayCongnhan: '05/06/2026',
    loiIch: 'Tiết kiệm chi phí đào tạo, linh hoạt lịch học cho phi hành đoàn.',
    tags: ['E-learning', 'Simulator', 'Phi công'], luotXem: 71,
  },
  {
    id: '5', ma: 'KTT-2026-005',
    ten: 'Self check-in kiosk tại sân bay Tier-2 — giảm thời gian chờ',
    linhVuc: 'Dịch vụ mặt đất',
    tomTat: 'Triển khai 24 kiosk self check-in tại Đà Nẵng, Nha Trang, Phú Quốc. Hành khách tự làm thủ tục dưới 3 phút, giảm tải quầy check-in truyền thống 40%.',
    nguoiGui: 'Nguyễn Minh Tuấn', donVi: 'Ban Dịch vụ mặt đất', ngayCongnhan: '01/06/2026',
    loiIch: 'Giảm thời gian chờ hành khách, tiết kiệm nhân lực phục vụ mặt đất.',
    tags: ['Self check-in', 'Kiosk', 'Tự động hoá'], luotXem: 64,
  },
];

const LV_COLORS: Record<string, string> = {
  'Khai thác bay':       '#3B82F6',
  'Kỹ thuật bảo dưỡng':  '#F59E0B',
  'Dịch vụ hành khách':  '#10B981',
  'Dịch vụ mặt đất':     '#8B5CF6',
  'Đào tạo nhân lực':    '#EF4444',
};
const LV_LIST = Object.keys(LV_COLORS);

// ── Main component ─────────────────────────────────────────────────────────────
export const KhoTriThucPortalPage = () => {
  const [kSearch, setKSearch]     = useState('');
  const [kLinhVuc, setKLinhVuc]   = useState('');
  const [detail, setDetail]       = useState<IKhoTri | null>(null);

  const kFiltered = useMemo(() => MOCK_KHO.filter(k => {
    const matchLV = !kLinhVuc || k.linhVuc === kLinhVuc;
    const matchQ  = !kSearch
      || k.ten.toLowerCase().includes(kSearch.toLowerCase())
      || k.ma.toLowerCase().includes(kSearch.toLowerCase())
      || k.tags.some(t => t.toLowerCase().includes(kSearch.toLowerCase()));
    return matchLV && matchQ;
  }), [kSearch, kLinhVuc]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-portal-primary py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-3 text-base">
            <Link to="/doi-moi/trang-chu" className="text-white/70 hover:text-white">Trang chủ</Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Kho tri thức</span>
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">
            <i className="fa-regular fa-books mr-3"></i>
            Kho tri thức đổi mới sáng tạo
          </h1>
          <p className="text-white/80 text-base">
            Tổng hợp các ý tưởng sáng tạo được công nhận tại Vietnam Airlines
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-base text-gray-600">
            <span>
              <i className="fa-regular fa-books mr-1.5 text-portal-primary"></i>
              <strong className="text-lg">{MOCK_KHO.length}</strong> tri thức công nhận
            </span>
            <span className="text-gray-400">|</span>
            <span>
              <i className="fa-regular fa-eye mr-1.5 text-green-500"></i>
              <strong className="text-lg">{MOCK_KHO.reduce((s, k) => s + k.luotXem, 0)}</strong> lượt xem
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <i className="fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-portal-primary/30"
                placeholder="Tìm theo tên, mã, tag..."
                value={kSearch}
                onChange={e => setKSearch(e.target.value)}
                style={{ width: 240 }}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-200 rounded-lg text-base focus:outline-none bg-white"
              value={kLinhVuc}
              onChange={e => setKLinhVuc(e.target.value)}
            >
              <option value="">Tất cả lĩnh vực</option>
              {LV_LIST.map(lv => (
                <option key={lv} value={lv}>{lv}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {kFiltered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <i className="fa-regular fa-magnifying-glass text-5xl mb-4 block"></i>
            <p className="text-lg">Không tìm thấy tri thức phù hợp</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {kFiltered.map(item => {
              const color = LV_COLORS[item.linhVuc] || '#6B7280';
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col group"
                  onClick={() => setDetail(item)}
                >
                  <div className="h-1.5 rounded-t-xl" style={{ background: color }}></div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className="text-sm font-bold px-2.5 py-1 rounded-full"
                        style={{ background: color + '18', color }}
                      >
                        {item.ma}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <i className="fa-regular fa-eye"></i>{item.luotXem}
                      </span>
                    </div>

                    <h3 className="text-gray-800 font-semibold text-base mb-2.5 leading-snug group-hover:text-portal-primary transition-colors">
                      {item.ten}
                    </h3>

                    <p
                      className="text-gray-700 text-base mb-4 leading-relaxed flex-1"
                      style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {item.tomTat}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {item.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-sm px-2.5 py-1 rounded-full border font-semibold"
                          style={{ borderColor: color + '80', color, background: color + '12' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-end justify-between border-t border-gray-200 pt-4 mt-auto">
                      <div className="text-sm text-gray-600 leading-relaxed">
                        <div><i className="fa-regular fa-user mr-1.5"></i>{item.nguoiGui}</div>
                        <div className="mt-0.5"><i className="fa-regular fa-building mr-1.5"></i>{item.donVi}</div>
                      </div>
                      <button
                        className="text-sm px-4 py-2 rounded-lg font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                        style={{ background: color }}
                      >
                        Đọc thêm
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-shrink-0 h-1.5 rounded-t-2xl" style={{ background: LV_COLORS[detail.linhVuc] || '#6B7280' }}></div>
            <div className="flex-shrink-0 flex items-start justify-between p-6 border-b border-gray-200">
              <div>
                <span
                  className="text-sm font-bold px-2.5 py-1 rounded-full mb-2 inline-block"
                  style={{ background: (LV_COLORS[detail.linhVuc] || '#6B7280') + '20', color: LV_COLORS[detail.linhVuc] || '#6B7280' }}
                >
                  {detail.ma}
                </span>
                <h2 className="text-gray-900 font-bold text-xl leading-snug mt-1">{detail.ten}</h2>
              </div>
              <button
                className="text-gray-500 hover:text-gray-800 text-2xl ml-4 flex-shrink-0"
                onClick={() => setDetail(null)}
              >
                <i className="fa-regular fa-xmark"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-wrap gap-2 mb-5">
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full"
                  style={{ background: (LV_COLORS[detail.linhVuc] || '#6B7280') + '22', color: LV_COLORS[detail.linhVuc] || '#6B7280' }}
                >
                  {detail.linhVuc}
                </span>
                {detail.tags.map(t => (
                  <span key={t} className="text-sm font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">{t}</span>
                ))}
              </div>

              <div className="mb-5">
                <div className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Tóm tắt</div>
                <p className="text-gray-800 text-base leading-relaxed bg-gray-50 border border-gray-200 p-4 rounded-lg">{detail.tomTat}</p>
              </div>

              <div className="mb-5">
                <div className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Lợi ích đã ghi nhận</div>
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 p-4 rounded-lg text-base text-green-900 font-medium">
                  <i className="fa-regular fa-circle-check mt-0.5 flex-shrink-0 text-green-600"></i>
                  <span>{detail.loiIch}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-5 text-sm text-gray-700 border-t border-gray-200 pt-4">
                <span><i className="fa-regular fa-user mr-1.5 text-gray-500"></i><strong>Tác giả:</strong> {detail.nguoiGui}</span>
                <span><i className="fa-regular fa-building mr-1.5 text-gray-500"></i><strong>Đơn vị:</strong> {detail.donVi}</span>
                <span><i className="fa-regular fa-calendar-check mr-1.5 text-gray-500"></i><strong>Công nhận:</strong> {detail.ngayCongnhan}</span>
                <span><i className="fa-regular fa-eye mr-1.5 text-gray-500"></i>{detail.luotXem} lượt xem</span>
              </div>
            </div>

            <div className="flex-shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                className="px-5 py-2.5 text-base font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                onClick={() => setDetail(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
