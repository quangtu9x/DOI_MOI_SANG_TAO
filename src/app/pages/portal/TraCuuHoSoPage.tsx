import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// ── Types ─────────────────────────────────────────────────────────────────────
type TrangThai = 'DangSoanThao' | 'ChoDuyet' | 'DaDuyet' | 'TuChoi' | 'DuocCongNhan';

interface IStep { label: string; date: string; done: boolean; active?: boolean; }

interface IHoSo {
  id: string; ma: string; ten: string; linhVuc: string;
  ngayNop: string; ngayCapNhat: string;
  trangThai: TrangThai; lyDoTuChoi?: string;
  // detail fields
  moTaVanDe: string;
  noiDungDeXuat: string;
  mucTieu: string;
  loiIch: string;
  nguoiDeXuat: string;
  donVi: string;
  files: Array<{ name: string; size: string; icon: string }>;
  steps: IStep[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MY_HO_SO: IHoSo[] = [
  {
    id: '1', ma: 'YT-2026061501',
    ten: 'Số hóa quy trình self check-in tại sân bay Tier-2',
    linhVuc: 'Dịch vụ mặt đất',
    ngayNop: '15/06/2026', ngayCapNhat: '25/06/2026',
    trangThai: 'ChoDuyet',
    nguoiDeXuat: 'Nguyễn Minh Tuấn', donVi: 'Ban Dịch vụ mặt đất',
    moTaVanDe: 'Tại các sân bay Tier-2 (Đà Nẵng, Nha Trang, Phú Quốc), hành khách phải xếp hàng trung bình 15–20 phút tại quầy check-in do thiếu hệ thống tự phục vụ, gây áp lực nhân lực vào cao điểm hè và lễ Tết.',
    noiDungDeXuat: 'Triển khai 24 kiosk self check-in tích hợp nhận diện khuôn mặt và QR code vé, đồng bộ với hệ thống DCS trung tâm. Hành khách có thể tự làm thủ tục, chọn ghế, in thẻ lên máy bay trong dưới 3 phút.',
    mucTieu: 'Giảm thời gian chờ check-in xuống dưới 3 phút, giảm tải quầy truyền thống 40%, phủ 100% các chuyến nội địa khởi hành từ 3 sân bay trên.',
    loiIch: 'Tiết kiệm nhân lực phục vụ mặt đất, tăng điểm hài lòng hành khách (NPS), giảm tình trạng chậm chuyến do thủ tục check-in.',
    lyDoTuChoi: undefined,
    files: [
      { name: 'Thuyết minh sáng kiến YT-2026061501.pdf', size: '1.2 MB', icon: 'fa-file-pdf' },
      { name: 'Sơ đồ triển khai kiosk.pptx', size: '3.4 MB', icon: 'fa-file-powerpoint' },
    ],
    steps: [
      { label: 'Đã nộp hồ sơ',        date: '15/06/2026', done: true },
      { label: 'Tiếp nhận & xem xét',  date: '20/06/2026', done: true },
      { label: 'Hội đồng duyệt',       date: '—',          done: false, active: true },
      { label: 'Phê duyệt / Từ chối',  date: '—',          done: false },
      { label: 'Công nhận & lưu kho',  date: '—',          done: false },
    ],
  },
  {
    id: '2', ma: 'YT-2026062201',
    ten: 'Triển khai mobile check-in cho thành viên Vietnam Airlines Club',
    linhVuc: 'Dịch vụ mặt đất',
    ngayNop: '22/06/2026', ngayCapNhat: '22/06/2026',
    trangThai: 'DangSoanThao',
    nguoiDeXuat: 'Nguyễn Minh Tuấn', donVi: 'Ban Dịch vụ mặt đất',
    moTaVanDe: 'Thành viên hạng Bạch Kim và Vàng của Vietnam Airlines Club hiện vẫn phải làm thủ tục check-in thủ công tại quầy hoặc kiosk, chưa có ứng dụng mobile riêng biệt.',
    noiDungDeXuat: 'Phát triển tính năng mobile check-in tích hợp vào app Vietnam Airlines, cho phép thành viên Club check-in từ 24h trước khởi hành, tự chọn ghế ưu tiên và nhận boarding pass điện tử.',
    mucTieu: 'Phục vụ 100% thành viên Club (khoảng 85.000 người) qua kênh mobile, giảm 30% lưu lượng quầy ưu tiên.',
    loiIch: 'Nâng cao trải nghiệm hành khách VIP, giảm tải nhân lực phục vụ quầy ưu tiên.',
    files: [],
    steps: [
      { label: 'Đang soạn thảo',       date: '22/06/2026', done: false, active: true },
      { label: 'Nộp hồ sơ',            date: '—',          done: false },
      { label: 'Hội đồng duyệt',       date: '—',          done: false },
      { label: 'Phê duyệt / Từ chối',  date: '—',          done: false },
      { label: 'Công nhận & lưu kho',  date: '—',          done: false },
    ],
  },
  {
    id: '3', ma: 'YT-2025112801',
    ten: 'Cải tiến quy trình xử lý hành lý thất lạc nội địa',
    linhVuc: 'Dịch vụ mặt đất',
    ngayNop: '28/11/2025', ngayCapNhat: '15/01/2026',
    trangThai: 'DuocCongNhan',
    nguoiDeXuat: 'Nguyễn Minh Tuấn', donVi: 'Ban Dịch vụ mặt đất',
    moTaVanDe: 'Tỷ lệ hành lý thất lạc nội địa ở mức 0.6%/chuyến, xử lý khiếu nại còn thủ công qua email/điện thoại, thời gian giải quyết trung bình 5–7 ngày làm việc.',
    noiDungDeXuat: 'Xây dựng hệ thống tra cứu hành lý thất lạc trực tuyến tích hợp với app Vietnam Airlines. Hành khách tự khai báo và theo dõi trạng thái; nhân viên nhận notification và cập nhật real-time.',
    mucTieu: 'Giảm thời gian xử lý xuống 48h, tăng tỷ lệ hành khách hài lòng với dịch vụ xử lý hành lý lên 90%.',
    loiIch: 'Giảm chi phí vận hành bộ phận hành lý, tăng uy tín thương hiệu, giảm khiếu nại chính thức 40%.',
    files: [
      { name: 'Thuyết minh sáng kiến YT-2025112801.pdf', size: '2.1 MB', icon: 'fa-file-pdf' },
      { name: 'Quy trình xử lý mới (BPMN).vsdx',         size: '0.8 MB', icon: 'fa-file-lines' },
      { name: 'Kết quả pilot Q1-2026.xlsx',               size: '0.5 MB', icon: 'fa-file-excel' },
    ],
    steps: [
      { label: 'Đã nộp hồ sơ',        date: '28/11/2025', done: true },
      { label: 'Tiếp nhận & xem xét',  date: '05/12/2025', done: true },
      { label: 'Hội đồng duyệt',       date: '20/12/2025', done: true },
      { label: 'Phê duyệt',            date: '02/01/2026', done: true },
      { label: 'Công nhận & lưu kho',  date: '15/01/2026', done: true },
    ],
  },
  {
    id: '4', ma: 'YT-2025102001',
    ten: 'Ứng dụng RFID tra cứu hành lý theo thời gian thực cho hành khách',
    linhVuc: 'Dịch vụ mặt đất',
    ngayNop: '20/10/2025', ngayCapNhat: '18/11/2025',
    trangThai: 'TuChoi',
    nguoiDeXuat: 'Nguyễn Minh Tuấn', donVi: 'Ban Dịch vụ mặt đất',
    moTaVanDe: 'Hành khách không biết hành lý của mình đang ở đâu trong quá trình vận chuyển, dẫn đến lo lắng và nhiều cuộc gọi hỏi thăm tới nhân viên mặt đất.',
    noiDungDeXuat: 'Gắn tag RFID thụ động lên hành lý từ quầy check-in, theo dõi real-time qua toàn bộ hành trình băng chuyền và khoang hàng. Hành khách tra cứu qua app hoặc QR code trên thẻ hành lý.',
    mucTieu: 'Giảm tỷ lệ thất lạc xuống 0.1%, 100% hành khách biết vị trí hành lý real-time.',
    loiIch: 'Giảm 75% chi phí bồi thường hành lý, tăng hài lòng hành khách, giảm cuộc gọi phàn nàn.',
    lyDoTuChoi: 'Chi phí đầu tư hạ tầng RFID tại 5 sân bay ước tính 45 tỷ đồng, vượt ngân sách đổi mới năm 2026. Đề nghị tái đề xuất cho kế hoạch 2027 với phương án phân kỳ đầu tư.',
    files: [
      { name: 'Thuyết minh sáng kiến YT-2025102001.pdf', size: '1.8 MB', icon: 'fa-file-pdf' },
      { name: 'Phân tích ROI hệ thống RFID.xlsx',         size: '0.6 MB', icon: 'fa-file-excel' },
      { name: 'Tài liệu kỹ thuật RFID gateway.pdf',       size: '2.3 MB', icon: 'fa-file-pdf' },
    ],
    steps: [
      { label: 'Đã nộp hồ sơ',        date: '20/10/2025', done: true },
      { label: 'Tiếp nhận & xem xét',  date: '28/10/2025', done: true },
      { label: 'Hội đồng duyệt',       date: '10/11/2025', done: true },
      { label: 'Từ chối',              date: '18/11/2025', done: true },
      { label: 'Công nhận & lưu kho',  date: '—',          done: false },
    ],
  },
];

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG: Record<TrangThai, { label: string; color: string; icon: string; bg: string }> = {
  DangSoanThao:  { label: 'Đang soạn thảo', color: '#3B82F6', icon: 'fa-pen-to-square', bg: '#EFF6FF' },
  ChoDuyet:      { label: 'Chờ phê duyệt',  color: '#F59E0B', icon: 'fa-clock',          bg: '#FFFBEB' },
  DaDuyet:       { label: 'Đã phê duyệt',   color: '#10B981', icon: 'fa-circle-check',   bg: '#ECFDF5' },
  TuChoi:        { label: 'Bị từ chối',     color: '#EF4444', icon: 'fa-circle-xmark',   bg: '#FEF2F2' },
  DuocCongNhan:  { label: 'Được công nhận', color: '#8B5CF6', icon: 'fa-medal',           bg: '#F5F3FF' },
};

const ALL_TABS: Array<{ key: TrangThai | 'all'; label: string }> = [
  { key: 'all',          label: 'Tất cả' },
  { key: 'DangSoanThao', label: 'Soạn thảo' },
  { key: 'ChoDuyet',     label: 'Chờ duyệt' },
  { key: 'DaDuyet',      label: 'Đã duyệt' },
  { key: 'TuChoi',       label: 'Từ chối' },
  { key: 'DuocCongNhan', label: 'Công nhận' },
];

const FILE_COLORS: Record<string, string> = {
  'fa-file-pdf':        '#EF4444',
  'fa-file-excel':      '#10B981',
  'fa-file-powerpoint': '#F59E0B',
  'fa-file-lines':      '#6B7280',
};

// ── Detail modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }: { item: IHoSo; onClose: () => void }) => {
  const cfg = STATUS_CFG[item.trangThai];

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 pt-5 pb-4 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-gray-600">{item.ma}</span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <i className={`fa-regular ${cfg.icon} text-xs`}></i>
                  {cfg.label}
                </span>
              </div>
              <h2 className="text-gray-900 font-bold text-lg leading-snug">{item.ten}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
                <span><i className="fa-regular fa-user mr-1.5"></i>{item.nguoiDeXuat}</span>
                <span><i className="fa-regular fa-building mr-1.5"></i>{item.donVi}</span>
                <span><i className="fa-regular fa-tag mr-1.5"></i>{item.linhVuc}</span>
                <span><i className="fa-regular fa-calendar mr-1.5"></i>Nộp: {item.ngayNop}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl flex-shrink-0 mt-1"
            >
              <i className="fa-regular fa-xmark"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Rejection notice */}
          {item.trangThai === 'TuChoi' && item.lyDoTuChoi && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-2">
                <i className="fa-regular fa-circle-exclamation text-red-600 mt-0.5 flex-shrink-0 text-base"></i>
                <div>
                  <div className="text-base font-bold text-red-800 mb-1">Lý do từ chối</div>
                  <p className="text-base text-red-700">{item.lyDoTuChoi}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mô tả vấn đề */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 rounded-full bg-portal-primary"></div>
              <span className="text-base font-bold text-gray-800">Mô tả vấn đề</span>
            </div>
            <p className="text-base text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-4">
              {item.moTaVanDe}
            </p>
          </div>

          {/* Nội dung đề xuất */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 rounded-full bg-blue-500"></div>
              <span className="text-base font-bold text-gray-800">Nội dung đề xuất</span>
            </div>
            <p className="text-base text-gray-700 leading-relaxed bg-blue-50 border border-blue-100 rounded-xl p-4">
              {item.noiDungDeXuat}
            </p>
          </div>

          {/* Mục tiêu & Lợi ích */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 rounded-full bg-amber-500"></div>
                <span className="text-base font-bold text-gray-800">Mục tiêu</span>
              </div>
              <p className="text-base text-gray-700 leading-relaxed bg-amber-50 border border-amber-100 rounded-xl p-4 h-full">
                {item.mucTieu}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 rounded-full bg-green-500"></div>
                <span className="text-base font-bold text-gray-800">Lợi ích dự kiến</span>
              </div>
              <p className="text-base text-gray-700 leading-relaxed bg-green-50 border border-green-100 rounded-xl p-4 h-full">
                {item.loiIch}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-purple-500"></div>
              <span className="text-base font-bold text-gray-800">Tiến trình xét duyệt</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              {item.steps.map((s, i) => {
                const isDone   = s.done;
                const isActive = !s.done && s.active;
                return (
                  <div key={i} className="flex gap-4 mb-3 last:mb-0">
                    <div className="relative flex flex-col items-center">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center z-10 flex-shrink-0 border-2"
                        style={
                          isDone
                            ? { background: '#006D88', borderColor: 'transparent' }
                            : isActive
                              ? { background: 'white', borderColor: '#F59E0B' }
                              : { background: 'white', borderColor: '#D1D5DB' }
                        }
                      >
                        {isDone ? (
                          <i className="fa-regular fa-check text-white text-[10px]"></i>
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                      {i < item.steps.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 min-h-[14px] ${isDone ? 'bg-portal-primary/40' : 'bg-gray-300'}`}></div>
                      )}
                    </div>
                    <div className="pb-1 pt-0.5">
                      <div className={`text-base font-semibold ${isDone ? 'text-gray-800' : isActive ? 'text-amber-700' : 'text-gray-500'}`}>
                        {s.label}
                      </div>
                      {s.date !== '—' && (
                        <div className="text-sm text-gray-600 mt-0.5">
                          <i className="fa-regular fa-calendar mr-1"></i>{s.date}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Files */}
          {item.files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-gray-500"></div>
                <span className="text-base font-bold text-gray-800">Tài liệu đính kèm</span>
              </div>
              <div className="space-y-2">
                {item.files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <i
                      className={`fa-regular ${f.icon} text-xl flex-shrink-0`}
                      style={{ color: FILE_COLORS[f.icon] || '#6B7280' }}
                    ></i>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium text-gray-800 truncate">{f.name}</div>
                      <div className="text-sm text-gray-600">{f.size}</div>
                    </div>
                    <button className="text-sm text-portal-primary hover:underline ml-2 shrink-0">Tải về</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
          <button
            className="px-5 py-2.5 text-base font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
export const TraCuuHoSoPage = () => {
  const [activeTab, setActiveTab] = useState<TrangThai | 'all'>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<IHoSo | null>(null);

  const filtered = useMemo(() => {
    return MY_HO_SO.filter(h => {
      const matchTab = activeTab === 'all' || h.trangThai === activeTab;
      const matchSearch = h.ten.toLowerCase().includes(search.toLowerCase()) ||
        h.ma.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [activeTab, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {detail && <DetailModal item={detail} onClose={() => setDetail(null)} />}

      {/* Hero */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-[1100px] mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Tra cứu hồ sơ</h1>
          <p className="text-gray-500 text-base">Theo dõi tiến trình xử lý các hồ sơ bạn đã nộp</p>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <i className="fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã hồ sơ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:border-portal-primary focus:ring-2 focus:ring-portal-primary/10"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_TABS.map(t => {
            const count = t.key === 'all' ? MY_HO_SO.length : MY_HO_SO.filter(h => h.trangThai === t.key).length;
            const cfg = t.key !== 'all' ? STATUS_CFG[t.key as TrangThai] : null;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  activeTab === t.key
                    ? 'bg-portal-primary text-white border-portal-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-portal-primary hover:text-portal-primary'
                }`}
              >
                {t.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fa-regular fa-folder-open text-5xl mb-4"></i>
            <p className="text-base">Không có hồ sơ nào phù hợp</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(h => {
              const cfg = STATUS_CFG[h.trangThai];
              return (
                <div
                  key={h.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setDetail(h)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{h.ma}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{h.linhVuc}</span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 truncate">{h.ten}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Nộp ngày {h.ngayNop}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      <i className={`fa-regular ${cfg.icon}`}></i>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">Cập nhật {h.ngayCapNhat}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
