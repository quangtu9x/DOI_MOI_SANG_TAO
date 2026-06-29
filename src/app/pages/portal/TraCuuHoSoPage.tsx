import { useState, useMemo, useEffect, useCallback } from 'react';
import { Spin } from 'antd';
import { useAuth } from '@/app/modules/auth';
import { searchIdeas } from '@/app/services/ideaPortalApi';
import type { IIdea } from '@/models/idea-portal';
import dayjs from 'dayjs';

// ── Status mapping ─────────────────────────────────────────────────────────────
type TrangThai = 'BanNhap' | 'ChoTiepNhan' | 'DaTiepNhan' | 'TraLai' | 'Huy' | 'DuocCongNhan';

const STATUS_MAP: Record<string, TrangThai> = {
  'Bản nháp':       'BanNhap',
  'Chờ tiếp nhận':  'ChoTiepNhan',
  'Đã tiếp nhận':   'DaTiepNhan',
  'Trả lại':        'TraLai',
  'Hủy':            'Huy',
  'Được công nhận': 'DuocCongNhan',
};

const STATUS_CFG: Record<TrangThai, { label: string; color: string; icon: string; bg: string }> = {
  BanNhap:       { label: 'Bản nháp',        color: '#6B7280', icon: 'fa-pen-to-square',  bg: '#F9FAFB' },
  ChoTiepNhan:   { label: 'Chờ tiếp nhận',   color: '#F59E0B', icon: 'fa-clock',          bg: '#FFFBEB' },
  DaTiepNhan:    { label: 'Đã tiếp nhận',    color: '#3B82F6', icon: 'fa-inbox',           bg: '#EFF6FF' },
  TraLai:        { label: 'Trả lại',         color: '#EF4444', icon: 'fa-rotate-left',     bg: '#FEF2F2' },
  Huy:           { label: 'Đã hủy',          color: '#9CA3AF', icon: 'fa-ban',             bg: '#F3F4F6' },
  DuocCongNhan:  { label: 'Được công nhận',  color: '#8B5CF6', icon: 'fa-medal',           bg: '#F5F3FF' },
};

const DEFAULT_STATUS: typeof STATUS_CFG[TrangThai] = {
  label: 'Không rõ', color: '#9CA3AF', icon: 'fa-question', bg: '#F3F4F6',
};

const ALL_TABS: Array<{ key: TrangThai | 'all'; label: string }> = [
  { key: 'all',          label: 'Tất cả' },
  { key: 'BanNhap',      label: 'Bản nháp' },
  { key: 'ChoTiepNhan',  label: 'Chờ tiếp nhận' },
  { key: 'DaTiepNhan',   label: 'Đã tiếp nhận' },
  { key: 'TraLai',       label: 'Trả lại' },
  { key: 'DuocCongNhan', label: 'Công nhận' },
];

const FILE_ICON: Record<string, string> = {
  '.pdf': 'fa-file-pdf', '.doc': 'fa-file-word', '.docx': 'fa-file-word',
  '.xls': 'fa-file-excel', '.xlsx': 'fa-file-excel',
  '.png': 'fa-file-image', '.jpg': 'fa-file-image', '.jpeg': 'fa-file-image',
};
const FILE_COLORS: Record<string, string> = {
  'fa-file-pdf':   '#EF4444', 'fa-file-word':  '#3B82F6',
  'fa-file-excel': '#10B981', 'fa-file-image': '#F59E0B',
  'fa-file-lines': '#6B7280',
};

// Sinh các bước timeline từ status
const buildSteps = (idea: IIdea) => {
  const st = STATUS_MAP[idea.status ?? ''] ?? 'ChoTiepNhan';
  const ORDER: TrangThai[] = ['BanNhap', 'ChoTiepNhan', 'DaTiepNhan', 'DuocCongNhan'];
  const stepDefs = [
    { key: 'BanNhap',     label: 'Đã nộp hồ sơ',       date: idea.createdAt },
    { key: 'ChoTiepNhan', label: 'Chờ tiếp nhận',       date: idea.submittedAt ?? idea.updatedAt },
    { key: 'DaTiepNhan',  label: 'Đã tiếp nhận',        date: idea.updatedAt },
    { key: 'DuocCongNhan',label: 'Công nhận & lưu kho', date: null },
  ];
  const idx = ORDER.indexOf(st);
  return stepDefs.map((s, i) => ({
    label: s.label,
    date: s.date ? dayjs(s.date).format('DD/MM/YYYY') : '—',
    done: i <= idx,
    active: i === idx + 1,
  }));
};

// ── Detail modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ item, onClose }: { item: IIdea; onClose: () => void }) => {
  const statusKey = STATUS_MAP[item.status ?? ''] ?? 'ChoTiepNhan';
  const cfg = STATUS_CFG[statusKey] ?? DEFAULT_STATUS;
  const steps = buildSteps(item);

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
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{item.code ?? item.id?.slice(0, 8)}</span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ color: cfg.color, background: cfg.bg }}
                >
                  <i className={`fa-regular ${cfg.icon} text-[10px]`}></i>
                  {cfg.label}
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-1">
              <i className="fa-regular fa-xmark text-xl"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Lĩnh vực',         val: item.linhVuc },
              { label: 'Người đề xuất',     val: item.nguoiDeXuat },
              { label: 'Đơn vị công tác',   val: item.donViCongTac },
              { label: 'Phạm vi áp dụng',   val: item.phamViApDung },
            ].map(r => r.val ? (
              <div key={r.label} className="bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-xs text-gray-400 mb-0.5">{r.label}</div>
                <div className="text-sm font-medium text-gray-800">{r.val}</div>
              </div>
            ) : null)}
          </div>

          {/* Text sections */}
          {[
            { label: 'Mô tả vấn đề',       val: item.problemDescription, color: '#3B82F6' },
            { label: 'Nội dung đề xuất',    val: item.ideaContent,       color: '#10B981' },
            { label: 'Mục tiêu kỳ vọng',    val: item.mucTieu,           color: '#8B5CF6' },
            { label: 'Lợi ích dự kiến',     val: item.expectedBenefit,   color: '#F59E0B' },
          ].map(s => s.val ? (
            <div key={s.label}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 rounded-full" style={{ background: s.color }}></div>
                <span className="text-base font-bold text-gray-800">{s.label}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-3">{s.val}</p>
            </div>
          ) : null)}

          {/* Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 rounded-full bg-indigo-500"></div>
              <span className="text-base font-bold text-gray-800">Tiến trình xử lý</span>
            </div>
            <div className="space-y-0 pl-3">
              {steps.map((s, i) => {
                const isDone = s.done;
                const isActive = s.active;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                        style={{
                          background: isDone ? '#3B82F6' : isActive ? '#FEF3C7' : '#F3F4F6',
                          borderColor: isDone ? '#3B82F6' : isActive ? '#F59E0B' : '#E5E7EB',
                        }}
                      >
                        {isDone ? (
                          <i className="fa-regular fa-check text-white text-[10px]"></i>
                        ) : isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 min-h-[14px] ${isDone ? 'bg-blue-300' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                    <div className="pb-3 pt-0.5">
                      <div className={`text-sm font-semibold ${isDone ? 'text-gray-800' : isActive ? 'text-amber-700' : 'text-gray-400'}`}>
                        {s.label}
                      </div>
                      {s.date !== '—' && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          <i className="fa-regular fa-calendar mr-1"></i>{s.date}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attachments */}
          {(item.attachments ?? []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full bg-gray-500"></div>
                <span className="text-base font-bold text-gray-800">Tài liệu đính kèm</span>
              </div>
              <div className="space-y-2">
                {item.attachments!.map((f, i) => {
                  const icon = FILE_ICON[f.fileExt?.toLowerCase()] ?? 'fa-file-lines';
                  const sizeMB = f.fileSize ? (f.fileSize / 1024 / 1024).toFixed(2) + ' MB' : '';
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <i className={`fa-regular ${icon} text-xl flex-shrink-0`} style={{ color: FILE_COLORS[icon] || '#6B7280' }}></i>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{f.fileName}</div>
                        {sizeMB && <div className="text-xs text-gray-500">{sizeMB}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <button
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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
  const [activeTab, setActiveTab] = useState<TrangThai | 'all'>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<IIdea | null>(null);
  const [ideas, setIdeas] = useState<IIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchIdeas = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await searchIdeas({
        pageNumber: 1,
        pageSize: 50,
        submittedById: currentUser.id,
      });

      // Debug — xem raw response
      console.log('[TraCuuHoSoPage] raw res:', res);

      const raw = res.data as any;
      if (!raw) { setIdeas([]); return; }

      // Dạng 1: IPaginationResponse { data: IIdea[], totalCount, ... }
      if (Array.isArray(raw.data)) {
        setIdeas(raw.data);
        setTotalCount(raw.totalCount ?? raw.data.length);
        return;
      }
      // Dạng 2: IResult { succeeded, data: { data: IIdea[], totalCount } }
      if (raw.succeeded !== undefined && raw.data) {
        const inner = raw.data as any;
        if (Array.isArray(inner.data)) {
          setIdeas(inner.data);
          setTotalCount(inner.totalCount ?? inner.data.length);
          return;
        }
        if (Array.isArray(inner)) {
          setIdeas(inner);
          setTotalCount(inner.length);
          return;
        }
      }
      // Dạng 3: mảng trực tiếp
      if (Array.isArray(raw)) {
        setIdeas(raw);
        setTotalCount(raw.length);
        return;
      }

      console.warn('[TraCuuHoSoPage] Unexpected response shape:', raw);
      setIdeas([]);
    } catch (e) {
      console.error('[TraCuuHoSoPage] fetchIdeas error:', e);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  const filtered = useMemo(() => {
    return ideas.filter(h => {
      const statusKey = STATUS_MAP[h.status ?? ''] ?? 'ChoTiepNhan';
      const matchTab = activeTab === 'all' || statusKey === activeTab;
      const matchSearch = !search ||
        h.title?.toLowerCase().includes(search.toLowerCase()) ||
        h.code?.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [ideas, activeTab, search]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ideas.length };
    ideas.forEach(h => {
      const k = STATUS_MAP[h.status ?? ''] ?? 'ChoTiepNhan';
      counts[k] = (counts[k] ?? 0) + 1;
    });
    return counts;
  }, [ideas]);

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
          {ALL_TABS.map(t => (
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
                {tabCounts[t.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spin size="large" tip="Đang tải hồ sơ..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fa-regular fa-folder-open text-5xl mb-4"></i>
            <p className="text-base">
              {ideas.length === 0 ? 'Bạn chưa có hồ sơ nào. ' : 'Không có hồ sơ nào phù hợp.'}
            </p>
            {ideas.length === 0 && (
              <a href="/doi-moi/y-tuong" className="mt-3 text-portal-primary underline text-sm">Tạo ý tưởng mới →</a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(h => {
              const statusKey = STATUS_MAP[h.status ?? ''] ?? 'ChoTiepNhan';
              const cfg = STATUS_CFG[statusKey] ?? DEFAULT_STATUS;
              return (
                <div
                  key={h.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setDetail(h)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{h.code ?? h.id?.slice(0, 8)}</span>
                      {h.linhVuc && <>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{h.linhVuc}</span>
                      </>}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 truncate">{h.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Nộp ngày {h.createdAt ? dayjs(h.createdAt).format('DD/MM/YYYY') : '—'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      <i className={`fa-regular ${cfg.icon}`}></i>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      Cập nhật {h.updatedAt ? dayjs(h.updatedAt).format('DD/MM/YYYY') : '—'}
                    </span>
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
