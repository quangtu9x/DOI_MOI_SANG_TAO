import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Spin, Modal, message } from 'antd';
import { useAuth } from '@/app/modules/auth';
import { useNavigate } from 'react-router-dom';
import { searchIdeas, deleteIdea, cancelIdea, recallIdea, getIdeaHistories } from '@/app/services/ideaPortalApi';
import type { IIdea, IIdeaHistory } from '@/models/idea-portal';
import dayjs from 'dayjs';

// Đánh dấu tài liệu đính kèm được thêm vào lúc công nhận ý tưởng (giống ChiTietYTuongPage.tsx —
// dùng chung tiền tố tên file để phân biệt với hồ sơ gốc, không cần đổi cấu trúc CSDL).
const KQCN_TAG = '[Kết quả công nhận] ';
const stripKqcnTag = (name?: string | null) => (name ?? '').startsWith(KQCN_TAG) ? name!.slice(KQCN_TAG.length) : name;
const isKqcnAttachment = (name?: string | null) => (name ?? '').startsWith(KQCN_TAG);

const safeList = <T,>(res: any): T[] => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

// ── Status mapping ─────────────────────────────────────────────────────────────
type TrangThai = 'BanNhap' | 'ChoTiepNhan' | 'DaTiepNhan' | 'TraLai' | 'Huy' | 'DuocCongNhan';

// Key = giá trị trạng thái BE lưu trong DB (IdeaStatus)
const STATUS_MAP: Record<string, TrangThai> = {
  'Bản nháp':       'BanNhap',
  'Đã nộp':         'ChoTiepNhan',
  'Đã tiếp nhận':   'DaTiepNhan',
  'Đã trả lại':     'TraLai',
  'Đã hủy':         'Huy',
  'Được công nhận': 'DuocCongNhan',
};

const STATUS_CFG: Record<TrangThai, { label: string; color: string; icon: string; bg: string }> = {
  BanNhap:       { label: 'Bản nháp',              color: '#6B7280', icon: 'fa-pen-to-square',  bg: '#F9FAFB' },
  ChoTiepNhan:   { label: 'Đã nộp/Chờ xét duyệt',  color: '#F59E0B', icon: 'fa-clock',          bg: '#FFFBEB' },
  DaTiepNhan:    { label: 'Đã tiếp nhận',          color: '#3B82F6', icon: 'fa-inbox',           bg: '#EFF6FF' },
  TraLai:        { label: 'Đã trả lại',            color: '#EF4444', icon: 'fa-rotate-left',     bg: '#FEF2F2' },
  Huy:           { label: 'Đã hủy',                color: '#9CA3AF', icon: 'fa-ban',             bg: '#F3F4F6' },
  DuocCongNhan:  { label: 'Được công nhận',        color: '#8B5CF6', icon: 'fa-medal',           bg: '#F5F3FF' },
};

const DEFAULT_STATUS: typeof STATUS_CFG[TrangThai] = {
  label: 'Không rõ', color: '#9CA3AF', icon: 'fa-question', bg: '#F3F4F6',
};

const ALL_TABS: Array<{ key: TrangThai | 'all'; label: string }> = [
  { key: 'all',          label: 'Tất cả' },
  { key: 'BanNhap',      label: 'Bản nháp' },
  { key: 'ChoTiepNhan',  label: 'Đã nộp/Chờ xét duyệt' },
  { key: 'DaTiepNhan',   label: 'Đã tiếp nhận' },
  { key: 'TraLai',       label: 'Đã trả lại' },
  { key: 'DuocCongNhan', label: 'Công nhận' },
];

// ── Truy xuất ngày tháng — BE trả về *_On (createdOn/submittedOn/lastModifiedOn),
//    một số nơi khác (vd: bản nháp lưu local) dùng *_At — ưu tiên field BE, dự phòng field At.
const getCreatedOn = (idea: IIdea) => idea.createdOn ?? idea.createdAt;
const getSubmittedOn = (idea: IIdea) => idea.submittedOn ?? idea.submittedAt;
const getLastModifiedOn = (idea: IIdea) => idea.lastModifiedOn ?? idea.updatedAt;

// ── Lấy ngày tương ứng với trạng thái hiện tại ────────────────────────────────
const getStatusDateInfo = (idea: IIdea): { label: string; date: string } | null => {
  const statusKey = STATUS_MAP[idea.status ?? ''] ?? 'ChoTiepNhan';
  const createdOn = getCreatedOn(idea);
  const submittedOn = getSubmittedOn(idea);
  const lastModifiedOn = getLastModifiedOn(idea);
  switch (statusKey) {
    case 'BanNhap':
      return { label: 'Ngày tạo', date: createdOn ? dayjs(createdOn).format('DD/MM/YYYY HH:mm') : '—' };
    case 'ChoTiepNhan':
      return { label: 'Ngày nộp', date: submittedOn ? dayjs(submittedOn).format('DD/MM/YYYY HH:mm') : (lastModifiedOn ? dayjs(lastModifiedOn).format('DD/MM/YYYY HH:mm') : '—') };
    case 'DaTiepNhan':
      return { label: 'Ngày tiếp nhận', date: lastModifiedOn ? dayjs(lastModifiedOn).format('DD/MM/YYYY HH:mm') : '—' };
    case 'TraLai':
      return { label: 'Ngày trả lại', date: lastModifiedOn ? dayjs(lastModifiedOn).format('DD/MM/YYYY HH:mm') : '—' };
    case 'Huy':
      return { label: 'Ngày hủy', date: lastModifiedOn ? dayjs(lastModifiedOn).format('DD/MM/YYYY HH:mm') : '—' };
    case 'DuocCongNhan':
      return { label: 'Ngày công nhận', date: lastModifiedOn ? dayjs(lastModifiedOn).format('DD/MM/YYYY HH:mm') : '—' };
    default:
      return null;
  }
};

// ── Timeline helper ────────────────────────────────────────────────────────────
const buildSteps = (idea: IIdea) => {
  const st = STATUS_MAP[idea.status ?? ''] ?? 'ChoTiepNhan';
  const ORDER: TrangThai[] = ['BanNhap', 'ChoTiepNhan', 'DaTiepNhan', 'DuocCongNhan'];
  const stepDefs = [
    { key: 'BanNhap',      label: 'Khởi tạo hồ sơ',          date: getCreatedOn(idea) },
    { key: 'ChoTiepNhan',  label: 'Đã nộp/Chờ xét duyệt',    date: getSubmittedOn(idea) ?? getLastModifiedOn(idea) },
    { key: 'DaTiepNhan',   label: 'Đã tiếp nhận',            date: getLastModifiedOn(idea) },
    { key: 'DuocCongNhan', label: 'Công nhận & lưu kho',     date: null },
  ];
  const idx = ORDER.indexOf(st);
  return stepDefs.map((s, i) => ({
    label: s.label,
    date: s.date ? dayjs(s.date).format('DD/MM/YYYY') : '—',
    done: i <= idx,
    active: i === idx + 1,
  }));
};

// ── Detail Modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }: { item: IIdea; onClose: () => void }) => {
  const statusKey = STATUS_MAP[item.status ?? ''] ?? 'ChoTiepNhan';
  const cfg = STATUS_CFG[statusKey] ?? DEFAULT_STATUS;
  const steps = buildSteps(item);

  // Kết quả của người duyệt (thông tin công nhận) — lấy từ lịch sử xử lý
  const [histories, setHistories] = useState<IIdeaHistory[]>([]);
  useEffect(() => {
    if (!item.id) return;
    getIdeaHistories(item.id)
      .then(res => setHistories(safeList<IIdeaHistory>(res)))
      .catch(() => setHistories([]));
  }, [item.id]);

  const recognitionEntry =
    histories.find(h => h.actionType === 'Được công nhận' && !!h.remark?.trim())
    ?? histories.find(h => h.actionType === 'Được công nhận');
  const recognitionRemark = recognitionEntry?.remark?.trim() ?? '';
  const kqcnAttachments = ((item as any).attachments ?? []).filter((a: any) => isKqcnAttachment(a.originalName));

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 py-6 border-b-2 border-gray-100 flex items-start justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="font-mono font-bold text-sm px-3 py-1 rounded-lg"
                style={{ background: '#f1f2f4', color: '#374151' }}
              >
                {item.code ?? item.id?.slice(0, 8)}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
                style={{ color: cfg.color, background: cfg.bg }}
              >
                <i className={`fa-regular ${cfg.icon}`} />
                {cfg.label}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{item.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors shrink-0"
          >
            <i className="fa-regular fa-xmark text-lg" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-6">

          {/* Timeline */}
          <div className="bg-[#f8faff] rounded-xl p-5">
            <p className="text-base font-bold text-gray-800 mb-4">📋 Tiến trình xử lý</p>
            <div className="flex items-start">
              {steps.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className={`flex-1 h-1 rounded ${s.done ? 'bg-[#003087]' : 'bg-gray-200'}`} />
                    )}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold border-2 text-sm
                        ${s.done ? 'bg-[#003087] border-[#003087] text-white'
                          : s.active ? 'bg-white border-[#003087] text-[#003087]'
                          : 'bg-white border-gray-300 text-gray-400'}`}
                    >
                      {s.done ? <i className="fa-solid fa-check" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-1 rounded ${s.done ? 'bg-[#003087]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <p className={`text-sm text-center font-semibold mt-1
                    ${s.done ? 'text-[#003087]' : s.active ? 'text-gray-800' : 'text-gray-400'}`}>
                    {s.label}
                  </p>
                  <p className={`text-xs text-center font-medium ${s.done ? 'text-gray-600' : 'text-gray-400'}`}>
                    {s.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Kết quả công nhận (kết quả của người duyệt) */}
          {statusKey === 'DuocCongNhan' && (
            <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #ddd6fe' }}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-medal text-lg" style={{ color: '#722ed1' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold mb-1" style={{ color: '#5b21b6' }}>Kết quả công nhận</p>
                  {recognitionRemark ? (
                    <p className="text-sm text-gray-700 mb-1 whitespace-pre-wrap">{recognitionRemark}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mb-1">Chưa có nội dung công nhận.</p>
                  )}
                  <p className="text-xs text-gray-500">
                    <i className="fa-regular fa-calendar me-1" />
                    {recognitionEntry ? `Ngày công nhận: ${dayjs(recognitionEntry.actionDate).format('DD/MM/YYYY HH:mm')}` : 'Đang tải thông tin công nhận...'}
                  </p>
                  {kqcnAttachments.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3">
                      {kqcnAttachments.map((f: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white" style={{ border: '1px solid #ddd6fe' }}>
                          <i className="fa-regular fa-file-check" style={{ color: '#722ed1' }} />
                          <span className="text-sm font-semibold text-gray-800">{stripKqcnTag(f.originalName) ?? f.fileName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Người đề xuất',   value: item.nguoiDeXuat,   icon: 'fa-user' },
              { label: 'Đơn vị',          value: item.donViCongTac,  icon: 'fa-building' },
              { label: 'Lĩnh vực',        value: item.linhVuc,       icon: 'fa-tag' },
              { label: 'Phạm vi áp dụng', value: item.phamViApDung,  icon: 'fa-map' },
              { label: 'Ngày áp dụng',    value: item.ngayApDung ? dayjs(item.ngayApDung).format('DD/MM/YYYY') : null, icon: 'fa-calendar' },
            ].filter(f => f.value).map(f => (
              <div key={f.label} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                  <i className={`fa-regular ${f.icon}`} />
                  {f.label}
                </p>
                <p className="text-base font-bold text-gray-900">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Text sections */}
          {[
            { title: '📝 Mô tả hiện trạng / vấn đề', value: item.problemDescription },
            { title: '💡 Nội dung đề xuất',           value: item.ideaContent },
            { title: '🎯 Mục tiêu kỳ vọng',           value: item.mucTieu },
            { title: '📈 Lợi ích dự kiến',             value: item.expectedBenefit },
          ].filter(s => s.value).map(s => (
            <div key={s.title} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <p className="text-base font-bold text-gray-800">{s.title}</p>
              </div>
              <p className="px-5 py-4 text-base text-gray-900 whitespace-pre-wrap leading-relaxed">{s.value}</p>
            </div>
          ))}

          {/* Attachments */}
          {Array.isArray((item as any).attachments) && (item as any).attachments.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <p className="text-base font-bold text-gray-800">📎 Tập tin đính kèm</p>
              </div>
              <div className="px-5 py-4 space-y-2">
                {((item as any).attachments as any[]).map((a: any, i: number) => {
                  const isKqcn = isKqcnAttachment(a.originalName);
                  return (
                    <div key={i} className="flex items-center gap-3 text-base font-semibold text-[#0a65cc]">
                      <i className={`fa-regular ${isKqcn ? 'fa-file-check' : 'fa-file-lines'} text-lg`}
                        style={isKqcn ? { color: '#722ed1' } : undefined} />
                      <span>{a.fileName ?? stripKqcnTag(a.originalName) ?? a.filePath}</span>
                      {isKqcn && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: '#722ed1', background: '#f5f3ff' }}>
                          Kết quả công nhận
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t-2 border-gray-100 flex justify-end shrink-0">
          <button
            className="px-7 py-3 text-base font-bold text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TrangThai | 'all'>('all');
  const [search, setSearch] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [detail, setDetail] = useState<IIdea | null>(null);
  const [ideas, setIdeas] = useState<IIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recallingId, setRecallingId] = useState<string | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchIdeas = useCallback(async (keyword = '') => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await searchIdeas({
        pageNumber: 1,
        pageSize: 100,
        submittedById: currentUser.id,
        keyword: keyword || undefined,
      });

      const raw = res.data as any;
      if (!raw) { setIdeas([]); return; }

      let list: IIdea[] = [];
      if (Array.isArray(raw.data)) list = raw.data;
      else if (raw.succeeded !== undefined && raw.data) {
        const inner = raw.data as any;
        if (Array.isArray(inner.data)) list = inner.data;
        else if (Array.isArray(inner)) list = inner;
      } else if (Array.isArray(raw)) list = raw;

      setIdeas(list);
    } catch (e) {
      console.error('[TraCuuHoSoPage] fetchIdeas error:', e);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  // Debounce search — gửi lên BE sau 500ms
  const handleSearchChange = (val: string) => {
    setPendingSearch(val);
    setSearch(val);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchIdeas(val), 500);
  };

  // Xóa ý tưởng (bản nháp)
  const handleDelete = (idea: IIdea) => {
    Modal.confirm({
      title: 'Xóa ý tưởng',
      content: (
        <p>Bạn có chắc muốn xóa <strong>"{idea.title}"</strong>? Hành động này không thể hoàn tác.</p>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setDeletingId(idea.id);
        try {
          const res = await deleteIdea(idea.id);
          if (res.status >= 400) {
            // Fallback: cancel thay vì delete nếu BE không có DELETE endpoint
            const cancelRes = await cancelIdea(idea.id, 'Người dùng xóa bản nháp');
            if (cancelRes.status >= 400) {
              message.error('Không thể xóa ý tưởng này!');
              return;
            }
          }
          message.success('Đã xóa ý tưởng!');
          setIdeas(prev => prev.filter(i => i.id !== idea.id));
        } catch {
          message.error('Lỗi khi xóa!');
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  // Thu hồi ý tưởng đã nộp (Chờ tiếp nhận)
  const handleRecall = (idea: IIdea) => {
    Modal.confirm({
      title: 'Thu hồi ý tưởng',
      content: (
        <div>
          <p>Bạn có chắc muốn <strong>thu hồi</strong> ý tưởng <strong>"{idea.title}"</strong>?</p>
          <p className="mt-2 text-amber-600 text-sm">⚠️ Ý tưởng sẽ được rút khỏi hàng chờ duyệt. Bạn có thể chỉnh sửa và nộp lại sau.</p>
        </div>
      ),
      okText: 'Thu hồi',
      okButtonProps: { style: { background: '#d97706', borderColor: '#d97706' } },
      cancelText: 'Hủy',
      onOk: async () => {
        setRecallingId(idea.id);
        try {
          const res = await recallIdea(idea.id, 'Người dùng thu hồi để chỉnh sửa');
          if (res.status >= 400) {
            // Fallback: thử cancelIdea nếu recall chưa có
            const cancelRes = await cancelIdea(idea.id, 'Người dùng thu hồi để chỉnh sửa');
            if (cancelRes.status >= 400) {
              message.error('Không thể thu hồi ý tưởng này! Vui lòng liên hệ quản trị viên.');
              return;
            }
            message.success('Đã hủy ý tưởng thành công!');
          } else {
            message.success('Đã thu hồi ý tưởng! Bạn có thể chỉnh sửa và nộp lại.');
          }
          await fetchIdeas(search);
        } catch {
          message.error('Lỗi khi thu hồi!');
        } finally {
          setRecallingId(null);
        }
      },
    });
  };

  // Sửa ý tưởng — chuyển sang NopYTuongPage với ideaId
  const handleEdit = (idea: IIdea) => {
    navigate(`/doi-moi/y-tuong?ideaId=${idea.id}`);
  };

  const filtered = useMemo(() => {
    return ideas.filter(h => {
      const statusKey = STATUS_MAP[h.status ?? ''] ?? 'ChoTiepNhan';
      return activeTab === 'all' || statusKey === activeTab;
    });
  }, [ideas, activeTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ideas.length };
    ideas.forEach(h => {
      const k = STATUS_MAP[h.status ?? ''] ?? 'ChoTiepNhan';
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return counts;
  }, [ideas]);

  // accent color per status for left bar
  const STATUS_ACCENT: Record<TrangThai, string> = {
    BanNhap:      '#6B7280',
    ChoTiepNhan:  '#F59E0B',
    DaTiepNhan:   '#3B82F6',
    TraLai:       '#EF4444',
    Huy:          '#9CA3AF',
    DuocCongNhan: '#8B5CF6',
  };

  return (
    <div className="min-h-screen" style={{ background: '#f4f6fb' }}>
      {detail && <DetailModal item={detail} onClose={() => setDetail(null)} />}

      {/* Hero */}
      <div className="bg-white border-b border-gray-200 py-10 px-4">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5">Tra cứu & Quản lý hồ sơ</h1>
            <p className="text-gray-500 text-base">Xem tiến trình xử lý, hiệu chỉnh bản nháp, thu hồi hoặc xóa ý tưởng</p>
          </div>
          <button
            onClick={() => navigate('/doi-moi/y-tuong')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-base shrink-0"
            style={{ background: 'linear-gradient(135deg,#003087 0%,#0046A6 100%)', borderBottom: '3px solid #C5A028' }}
          >
            <i className="fa-regular fa-lightbulb" />
            Tạo ý tưởng mới
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-8">

        {/* Search */}
        <div className="relative mb-5">
          <i className="fa-regular fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Tìm theo tên ý tưởng hoặc mã hồ sơ..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-800 font-medium focus:outline-none focus:border-[#003087] focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            style={{ fontSize: '15px' }}
          />
          {search && (
            <button onClick={() => handleSearchChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <i className="fa-regular fa-xmark text-lg" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-[#003087] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-[#003087]'
              }`}
            >
              {t.label}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                activeTab === t.key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {tabCounts[t.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spin size="large" tip="Đang tải hồ sơ..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm">
            <i className="fa-regular fa-folder-open text-6xl text-gray-300 mb-5" />
            <p className="text-xl font-bold text-gray-500 mb-1">
              {ideas.length === 0 ? 'Bạn chưa có hồ sơ nào' : 'Không tìm thấy hồ sơ phù hợp'}
            </p>
            <p className="text-gray-400 text-base mb-5">
              {ideas.length === 0 ? 'Hãy bắt đầu bằng cách tạo ý tưởng đầu tiên' : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
            </p>
            {ideas.length === 0 && (
              <button
                onClick={() => navigate('/doi-moi/y-tuong')}
                className="px-6 py-3 rounded-xl font-bold text-white text-base"
                style={{ background: '#003087' }}
              >
                <i className="fa-regular fa-lightbulb me-2" />Tạo ý tưởng mới
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(h => {
              const statusKey  = STATUS_MAP[h.status ?? ''] ?? 'ChoTiepNhan';
              const cfg        = STATUS_CFG[statusKey] ?? DEFAULT_STATUS;
              const accentColor = STATUS_ACCENT[statusKey] ?? '#9CA3AF';
              const isDraft    = statusKey === 'BanNhap';
              const isWaiting  = statusKey === 'ChoTiepNhan';
              const isReturned = statusKey === 'TraLai';
              const isDeleting  = deletingId === h.id;
              const isRecalling = recallingId === h.id;

              return (
                <div
                  key={h.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex"
                >
                  {/* Left accent bar */}
                  <div className="w-1.5 shrink-0 rounded-l-2xl" style={{ background: accentColor }} />

                  <div className="flex-1 min-w-0">
                    {/* Main row */}
                    <div
                      className="px-6 py-5 flex items-start gap-4 cursor-pointer"
                      onClick={() => setDetail(h)}
                    >
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {/* Meta row */}
                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                          <span className="font-mono font-extrabold text-sm text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg tracking-wide">
                            {h.code ?? h.id?.slice(0, 8)}
                          </span>
                          {h.linhVuc && (
                            <span className="text-sm font-semibold text-[#0a65cc] bg-blue-50 px-2.5 py-1 rounded-lg">
                              {h.linhVuc}
                            </span>
                          )}
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ml-auto"
                            style={{ color: cfg.color, background: cfg.bg }}
                          >
                            <i className={`fa-regular ${cfg.icon}`} />
                            {cfg.label}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1.5">{h.title}</h3>

                        {/* Preview */}
                        {h.problemDescription && (
                          <p className="text-base text-gray-500 line-clamp-1 mb-3">{h.problemDescription}</p>
                        )}

                        {/* Footer meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-400 font-medium flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <i className="fa-regular fa-calendar" />
                            {h.createdAt ? dayjs(h.createdAt).format('DD/MM/YYYY HH:mm') : '—'}
                          </span>
                          {(() => {
                            const statusDate = getStatusDateInfo(h);
                            if (statusDate && statusDate.date !== '—') {
                              return (
                                <span className="flex items-center gap-1.5 font-semibold" style={{ color: STATUS_CFG[STATUS_MAP[h.status ?? ''] ?? 'ChoTiepNhan']?.color ?? '#6B7280' }}>
                                  <i className="fa-regular fa-clock" />
                                  {statusDate.label}: {statusDate.date}
                                </span>
                              );
                            }
                            return null;
                          })()}
                          {Array.isArray((h as any).attachments) && (h as any).attachments.length > 0 && (
                            <span className="flex items-center gap-1.5">
                              <i className="fa-regular fa-paperclip" />
                              {(h as any).attachments.length} tệp
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-gray-300 text-xs ml-auto">
                            <i className="fa-regular fa-eye" /> Xem chi tiết
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action bar — Bản nháp */}
                    {isDraft && (
                      <div className="mx-6 mb-5 rounded-xl flex items-center gap-3 px-4 py-3" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                          <i className="fa-regular fa-pen-to-square text-gray-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 flex-1">
                          Bản nháp — chưa nộp
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); handleEdit(h); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors hover:opacity-90"
                          style={{ background: '#003087' }}
                        >
                          <i className="fa-regular fa-pen-to-square" />
                          Hiệu chỉnh
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(h); }}
                          disabled={isDeleting}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {isDeleting
                            ? <><i className="fa-solid fa-circle-notch fa-spin" /> Đang xóa...</>
                            : <><i className="fa-regular fa-trash-can" /> Xóa</>}
                        </button>
                      </div>
                    )}

                    {/* Action bar — Chờ tiếp nhận */}
                    {isWaiting && (
                      <div className="mx-6 mb-5 rounded-xl flex items-center gap-3 px-4 py-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <i className="fa-regular fa-clock text-amber-600" />
                        </div>
                        <span className="text-sm font-semibold text-amber-800 flex-1">
                          Đang chờ cán bộ tiếp nhận
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); handleRecall(h); }}
                          disabled={isRecalling}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors disabled:opacity-50"
                        >
                          {isRecalling
                            ? <><i className="fa-solid fa-circle-notch fa-spin" /> Đang thu hồi...</>
                            : <><i className="fa-regular fa-rotate-left" /> Thu hồi</>}
                        </button>
                      </div>
                    )}

                    {/* Action bar — Đã trả lại */}
                    {isReturned && (
                      <div className="mx-6 mb-5 rounded-xl flex items-center gap-3 px-4 py-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                          <i className="fa-regular fa-rotate-left text-red-500" />
                        </div>
                        <span className="text-sm font-semibold text-red-700 flex-1">
                          Ý tưởng bị trả lại — vui lòng chỉnh sửa và nộp lại
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); handleEdit(h); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors hover:opacity-90"
                          style={{ background: '#003087' }}
                        >
                          <i className="fa-regular fa-pen-to-square" />
                          Hiệu chỉnh &amp; nộp lại
                        </button>
                      </div>
                    )}
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
