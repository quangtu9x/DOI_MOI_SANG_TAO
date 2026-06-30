import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, MessageCircle, Share2, Send, LogIn, X } from "lucide-react";
import { useAuth } from "@/app/modules/auth";

// ── helpers ──────────────────────────────────────────────────────────────────

function copyLink(path: string) {
  const url = `${window.location.origin}${path}`;
  navigator.clipboard.writeText(url).then(() => {
    // simple toast via alert-free approach
    const el = document.createElement("div");
    el.textContent = "✓ Đã sao chép đường dẫn!";
    Object.assign(el.style, {
      position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
      background: "#18191c", color: "#fff", padding: "10px 22px",
      borderRadius: "999px", fontSize: "14px", fontWeight: "600",
      zIndex: "9999", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      transition: "opacity 0.3s",
    });
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; }, 1800);
    setTimeout(() => document.body.removeChild(el), 2200);
  });
}

// ── AuthRequiredModal ─────────────────────────────────────────────────────────

interface AuthRequiredModalProps { onClose: () => void; }

const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center"
    style={{ background: "rgba(0,0,0,0.45)" }}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5 relative"
      onClick={e => e.stopPropagation()}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f2f4] transition-colors text-[#6b7280]"
      >
        <X size={18} />
      </button>

      {/* Icon */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e7f0fa" }}>
        <LogIn size={28} style={{ color: "#003087" }} />
      </div>

      {/* Text */}
      <div className="text-center">
        <h3 className="text-[#18191c] text-xl font-bold mb-2">Đăng nhập để tương tác</h3>
        <p className="text-[#6b7280] text-base">Bạn cần đăng nhập để thích, bình luận hoặc chia sẻ ý tưởng.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 rounded-xl border border-[#e4e5e8] text-[#374151] font-semibold hover:bg-[#f1f2f4] transition-colors text-sm"
        >
          Để sau
        </button>
        <Link
          to="/auth/login"
          className="flex-1 px-4 py-3 rounded-xl font-bold text-white text-sm text-center no-underline flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #003087 0%, #0046A6 100%)", borderBottom: "2px solid #C5A028" }}
          onClick={onClose}
        >
          <LogIn size={16} />
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  </div>
);

// ── SectionHeader ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllTo?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, viewAllTo }) => (
  <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-3">
    <div>
      <h2 className="text-[#191f33] text-3xl font-semibold leading-tight">{title}</h2>
      {subtitle && <p className="text-[#4b5563] text-base mt-1">{subtitle}</p>}
    </div>
    {viewAllTo && (
      <Link
        to={viewAllTo}
        className="flex items-center gap-2 border border-[#e7f0fa] hover:bg-[#e7f0fa] transition-colors text-[#0a65cc] font-semibold px-5 py-2.5 rounded-lg text-sm no-underline"
      >
        Xem tất cả <ChevronRight size={16} />
      </Link>
    )}
  </div>
);

// ── ActionBar — shared by both card types ──────────────────────────────────────

interface ActionBarProps {
  liked:            boolean;
  likeCount:        number;
  commentCount:     number;
  commentOpen:      boolean;
  onLike:           () => void;
  onToggleComment:  () => void;
  onShare:          () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  liked, likeCount, commentCount, commentOpen, onLike, onToggleComment, onShare,
}) => (
  <div className="flex items-center gap-1 pt-3 border-t border-[#f1f2f4]">
    {/* Like */}
    <button
      onClick={e => { e.stopPropagation(); onLike(); }}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center
        ${liked
          ? "text-rose-500 bg-rose-50 hover:bg-rose-100"
          : "text-[#6b7280] hover:bg-[#f1f2f4] hover:text-[#18191c]"
        }`}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      <span>{likeCount > 0 ? likeCount : "Thích"}</span>
    </button>

    {/* Comment */}
    <button
      onClick={e => { e.stopPropagation(); onToggleComment(); }}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center
        ${commentOpen
          ? "text-[#0a65cc] bg-[#e7f0fa]"
          : "text-[#6b7280] hover:bg-[#f1f2f4] hover:text-[#18191c]"
        }`}
    >
      <MessageCircle size={16} />
      <span>{commentCount > 0 ? commentCount : "Bình luận"}</span>
    </button>

    {/* Share */}
    <button
      onClick={e => { e.stopPropagation(); onShare(); }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex-1 justify-center text-[#6b7280] hover:bg-[#f1f2f4] hover:text-[#18191c]"
    >
      <Share2 size={16} />
      <span>Chia sẻ</span>
    </button>
  </div>
);

// ── InlineCommentBox ──────────────────────────────────────────────────────────

interface Comment { text: string; time: string; }

interface InlineCommentBoxProps {
  comments:   Comment[];
  onSubmit:   (text: string) => void;
}

const InlineCommentBox: React.FC<InlineCommentBoxProps> = ({ comments, onSubmit }) => {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit(t);
    setText("");
  };

  return (
    <div
      className="border-t border-[#f1f2f4] bg-[#fafbff] rounded-b-xl px-4 pt-3 pb-4"
      onClick={e => e.stopPropagation()}
    >
      {/* Recent comments */}
      <div className="max-h-[140px] overflow-y-auto mb-2.5 space-y-2.5">
        {comments.slice(0, 3).map((c, i) => (
          <div key={i} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#0a65cc] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
              Me
            </div>
            <div className="bg-white border border-[#e4e5e8] rounded-lg px-3 py-2 flex-1">
              <span className="text-[#0a65cc] text-xs font-bold mr-2">Bạn</span>
              <span className="text-[#9ca3af] text-xs">{c.time}</span>
              <p className="text-[#374151] text-sm mt-0.5 mb-0">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2.5 items-end">
        <div className="w-7 h-7 rounded-full bg-[#0a65cc] flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1">
          Me
        </div>
        <div className="flex-1 relative">
          <textarea
            ref={ref}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="Viết bình luận... (Enter để gửi)"
            rows={2}
            className="w-full border border-[#e4e5e8] rounded-xl px-3 py-2 pr-11 text-sm resize-none outline-none focus:border-[#0a65cc] transition-colors"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className={`absolute right-2 bottom-2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors
              ${text.trim() ? "bg-[#0a65cc] text-white hover:bg-[#084fa3]" : "bg-[#e4e5e8] text-[#9ca3af] cursor-not-allowed"}`}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── IdeaCard ──────────────────────────────────────────────────────────────────

interface IdeaCardData {
  id:        string;
  ma:        string;
  ten:       string;
  linhVuc:   string;
  nguoiGui:  string;
  ngay:      string;
  trangThai: "Chờ duyệt" | "Đã duyệt" | "Được công nhận";
  tomTat:    string;
  initLikes: number;
  initCmts:  number;
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "Chờ duyệt":      { bg: "#fff7e6", text: "#d97706" },
  "Đã duyệt":       { bg: "#ecfdf5", text: "#059669" },
  "Được công nhận": { bg: "#f0f4ff", text: "#4f46e5" },
};

interface IdeaCardProps {
  idea:         IdeaCardData;
  liked:        boolean;
  likeCount:    number;
  commentOpen:  boolean;
  comments:     Comment[];
  onLike:       () => void;
  onToggle:     () => void;
  onComment:    (t: string) => void;
  onShare:      () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({
  idea, liked, likeCount, commentOpen, comments, onLike, onToggle, onComment, onShare,
}) => {
  const st = STATUS_STYLE[idea.trangThai] ?? STATUS_STYLE["Đã duyệt"];
  return (
    <div className="bg-white border border-[#e4e5e8] hover:shadow-[0_12px_48px_0_rgba(0,44,109,0.08)] transition-all duration-300 rounded-xl flex flex-col overflow-hidden group cursor-pointer">
      {idea.trangThai === "Được công nhận" && (
        <div className="h-1 bg-gradient-to-r from-[#003087] to-[#C5A028]" />
      )}
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: st.bg, color: st.text }}>
            {idea.trangThai}
          </span>
          <span className="text-[#6b7280] text-sm">{idea.ngay}</span>
        </div>
        <h3 className="text-[#18191c] text-lg font-bold group-hover:text-[#0a65cc] transition-colors line-clamp-2 leading-snug">
          {idea.ten}
        </h3>
        <p className="text-[#374151] text-base line-clamp-2 flex-1">{idea.tomTat}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e7f0fa] flex items-center justify-center">
              <i className="fa-regular fa-user text-[#0a65cc] text-xs" />
            </div>
            <span className="text-[#18191c] text-base font-semibold">{idea.nguoiGui}</span>
          </div>
          <span className="text-sm px-2.5 py-1 rounded-md font-semibold" style={{ background: "#f1f2f4", color: "#374151" }}>
            {idea.linhVuc}
          </span>
        </div>

        {/* Stats line */}
        {(likeCount > 0 || (idea.initCmts + comments.length) > 0) && (
          <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
            {likeCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                  <Heart size={8} className="text-white fill-white" />
                </span>
                {likeCount}
              </span>
            )}
            {(idea.initCmts + comments.length) > 0 && (
              <span className="ml-auto">{idea.initCmts + comments.length} bình luận</span>
            )}
          </div>
        )}

        <ActionBar
          liked={liked}
          likeCount={likeCount}
          commentCount={idea.initCmts + comments.length}
          commentOpen={commentOpen}
          onLike={onLike}
          onToggleComment={onToggle}
          onShare={onShare}
        />
      </div>

      {commentOpen && <InlineCommentBox comments={comments} onSubmit={onComment} />}
    </div>
  );
};

// ── KnowledgeCard ─────────────────────────────────────────────────────────────

interface KnowledgeCardData {
  id:       string;
  ma:       string;
  ten:      string;
  linhVuc:  string;
  nguoiGui: string;
  ngay:     string;
  tomTat:   string;
  tags:     string[];
  luotXem:  number;
  initLikes: number;
  initCmts:  number;
}

interface KnowledgeCardProps {
  item:         KnowledgeCardData;
  liked:        boolean;
  likeCount:    number;
  commentOpen:  boolean;
  comments:     Comment[];
  onLike:       () => void;
  onToggle:     () => void;
  onComment:    (t: string) => void;
  onShare:      () => void;
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  item, liked, likeCount, commentOpen, comments, onLike, onToggle, onComment, onShare,
}) => (
  <div className="bg-white border border-[#e4e5e8] hover:shadow-[0_12px_48px_0_rgba(0,44,109,0.08)] transition-all duration-300 rounded-xl flex flex-col overflow-hidden group cursor-pointer">
    <div className="p-6 flex flex-col gap-4 flex-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#059669]">{item.ma}</span>
        <span className="text-[#6b7280] text-sm flex items-center gap-1">
          <i className="fa-regular fa-eye" /> {item.luotXem + (liked ? 1 : 0)} lượt xem
        </span>
      </div>
      <h3 className="text-[#18191c] text-base font-semibold group-hover:text-[#0a65cc] transition-colors line-clamp-2 leading-snug">
        {item.ten}
      </h3>
      <p className="text-[#374151] text-base line-clamp-2 flex-1">{item.tomTat}</p>
      <div className="flex flex-wrap gap-1.5">
        {item.tags.map(t => (
          <span key={t} className="text-xs bg-[#e7f0fa] text-[#0a65cc] px-2 py-0.5 rounded-md font-medium">{t}</span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#374151] text-base font-medium">
          <i className="fa-regular fa-user me-1.5" />{item.nguoiGui}
        </span>
        <span className="text-[#6b7280] text-sm">
          <i className="fa-regular fa-calendar me-1" />{item.ngay}
        </span>
      </div>

      {/* Stats line */}
      {(likeCount > 0 || (item.initCmts + comments.length) > 0) && (
        <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
          {likeCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                <Heart size={8} className="text-white fill-white" />
              </span>
              {likeCount}
            </span>
          )}
          {(item.initCmts + comments.length) > 0 && (
            <span className="ml-auto">{item.initCmts + comments.length} bình luận</span>
          )}
        </div>
      )}

      <ActionBar
        liked={liked}
        likeCount={likeCount}
        commentCount={item.initCmts + comments.length}
        commentOpen={commentOpen}
        onLike={onLike}
        onToggleComment={onToggle}
        onShare={onShare}
      />
    </div>

    {commentOpen && <InlineCommentBox comments={comments} onSubmit={onComment} />}
  </div>
);

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { no: "01", icon: "fa-regular fa-lightbulb",     title: "Tạo ý tưởng",       desc: "Điền thông tin ý tưởng, mô tả vấn đề và giải pháp đề xuất của bạn.",                                    color: "#0a65cc" },
  { no: "02", icon: "fa-regular fa-floppy-disk",   title: "Lưu nháp & Đính kèm", desc: "Lưu nháp để chỉnh sửa sau, đính kèm tài liệu minh chứng nếu cần.",                                 color: "#7c3aed" },
  { no: "03", icon: "fa-regular fa-paper-plane",   title: "Nộp phê duyệt",     desc: "Nộp ý tưởng để Hội đồng xem xét. Bạn sẽ nhận thông báo về kết quả.",                                  color: "#d97706" },
  { no: "04", icon: "fa-regular fa-medal",         title: "Được công nhận",    desc: "Ý tưởng được duyệt sẽ vào Kho tri thức và bạn được ghi nhận đóng góp.",                               color: "#059669" },
];

// ── Mock data ─────────────────────────────────────────────────────────────────

const RECENT_IDEAS: IdeaCardData[] = [
  {
    id: "1", ma: "YT-2026061501",
    ten: "Số hóa quy trình check-in nội địa — tăng tốc độ phục vụ hành khách",
    linhVuc: "Dịch vụ mặt đất", nguoiGui: "Nguyễn Minh Tuấn",
    ngay: "25/06/2026", trangThai: "Chờ duyệt",
    tomTat: "Tích hợp self check-in kiosk tại các sân bay tier-2, giảm thời gian chờ từ 15 phút xuống dưới 3 phút cho hành khách nội địa.",
    initLikes: 24, initCmts: 7,
  },
  {
    id: "2", ma: "YT-2026061502",
    ten: "Ứng dụng AI dự báo bảo trì động cơ máy bay phòng ngừa",
    linhVuc: "Kỹ thuật bảo dưỡng", nguoiGui: "Trần Quang Hùng",
    ngay: "24/06/2026", trangThai: "Đã duyệt",
    tomTat: "Hệ thống AI phân tích dữ liệu cảm biến động cơ theo thời gian thực, phát hiện sớm dấu hiệu hỏng hóc, giảm 30% chi phí bảo dưỡng khẩn cấp.",
    initLikes: 41, initCmts: 12,
  },
  {
    id: "3", ma: "YT-2026061503",
    ten: "Tối ưu lịch trình bay — giảm tiêu hao nhiên liệu bằng Big Data",
    linhVuc: "Khai thác bay", nguoiGui: "Phạm Thị Lan",
    ngay: "23/06/2026", trangThai: "Được công nhận",
    tomTat: "Phân tích dữ liệu khí tượng và luồng không lưu để tối ưu hành trình bay, tiết kiệm 2–4% nhiên liệu mỗi chuyến.",
    initLikes: 88, initCmts: 21,
  },
];

const KNOWLEDGE_ITEMS: KnowledgeCardData[] = [
  {
    id: "k1", ma: "KTT-2026-001",
    ten: "Tối ưu lịch trình bay bằng Big Data — tiết kiệm nhiên liệu",
    linhVuc: "Khai thác bay", nguoiGui: "Phạm Thị Lan",
    ngay: "15/06/2026",
    tomTat: "Áp dụng thành công tại 18 đường bay nội địa, tiết kiệm trung bình 3,2% nhiên liệu/chuyến bay, tương đương 12 tỷ đồng/năm.",
    tags: ["Nhiên liệu", "Big Data", "Tối ưu bay"],
    luotXem: 128, initLikes: 56, initCmts: 14,
  },
  {
    id: "k2", ma: "KTT-2026-002",
    ten: "Hệ thống phản hồi hành khách thời gian thực qua QR Code",
    linhVuc: "Dịch vụ hành khách", nguoiGui: "Lê Thị Hương",
    ngay: "10/06/2026",
    tomTat: "Hành khách quét QR tại ghế ngồi để đánh giá dịch vụ ngay trên chuyến bay; dữ liệu phản hồi được xử lý tự động và báo cáo về trung tâm trong 30 phút.",
    tags: ["QR Code", "Hành khách", "Phản hồi"],
    luotXem: 94, initLikes: 33, initCmts: 9,
  },
  {
    id: "k3", ma: "KTT-2026-003",
    ten: "Nền tảng đào tạo phi công và tiếp viên theo mô hình Blended Learning",
    linhVuc: "Đào tạo nhân lực", nguoiGui: "Nguyễn Thành Nam",
    ngay: "05/06/2026",
    tomTat: "Kết hợp học trực tuyến và thực hành simulator giúp rút ngắn 25% thời gian đào tạo định kỳ, tiết kiệm chi phí cho trên 2.000 nhân viên/năm.",
    tags: ["Đào tạo", "E-learning", "Phi công"],
    luotXem: 76, initLikes: 28, initCmts: 6,
  },
];

// ── Main Component ────────────────────────────────────────────────────────────

type InteractionState = {
  liked:       boolean;
  likeCount:   number;
  cmtOpen:     boolean;
  comments:    Comment[];
};

function initState(initLikes: number): InteractionState {
  return { liked: false, likeCount: initLikes, cmtOpen: false, comments: [] };
}

export const PortalFeaturedSections = () => {
  const { currentUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [ideaState, setIdeaState] = useState<Record<string, InteractionState>>(
    () => Object.fromEntries(RECENT_IDEAS.map(i => [i.id, initState(i.initLikes)]))
  );
  const [kttState, setKttState] = useState<Record<string, InteractionState>>(
    () => Object.fromEntries(KNOWLEDGE_ITEMS.map(i => [i.id, initState(i.initLikes)]))
  );

  // Gate any interaction behind auth
  const requireAuth = useCallback((action: () => void) => {
    if (!currentUser) { setShowAuthModal(true); return; }
    action();
  }, [currentUser]);

  const toggleLike = (
    setter: React.Dispatch<React.SetStateAction<Record<string, InteractionState>>>,
    id: string
  ) => {
    requireAuth(() =>
      setter(prev => {
        const s = prev[id];
        return { ...prev, [id]: { ...s, liked: !s.liked, likeCount: s.liked ? s.likeCount - 1 : s.likeCount + 1 } };
      })
    );
  };

  const toggleComment = (
    setter: React.Dispatch<React.SetStateAction<Record<string, InteractionState>>>,
    id: string
  ) => {
    requireAuth(() =>
      setter(prev => ({ ...prev, [id]: { ...prev[id], cmtOpen: !prev[id].cmtOpen } }))
    );
  };

  const addComment = (
    setter: React.Dispatch<React.SetStateAction<Record<string, InteractionState>>>,
    id: string,
    text: string
  ) => {
    // addComment is only reachable after comment panel is open (which requires auth)
    setter(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        comments: [{ text, time: "Vừa xong" }, ...prev[id].comments],
      },
    }));
  };

  const handleShare = (path: string) => {
    requireAuth(() => copyLink(path));
  };

  return (
    <>
    {showAuthModal && <AuthRequiredModal onClose={() => setShowAuthModal(false)} />}
    <div className="w-full bg-white py-20 px-4">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-20">

        {/* Quy trình gửi ý tưởng */}
        <section className="w-full">
          <SectionHeader
            title="Quy trình gửi ý tưởng"
            subtitle="Đơn giản, minh bạch và được theo dõi từng bước"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(step => (
              <div
                key={step.no}
                className="flex flex-col gap-4 p-6 rounded-xl border border-[#e4e5e8] bg-white hover:shadow-[0_8px_32px_0_rgba(0,44,109,0.08)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${step.color}15` }}>
                    <i className={`${step.icon} text-xl`} style={{ color: step.color }} />
                  </div>
                  <span className="text-3xl font-bold">{step.no}</span>
                </div>
                <h3 className="text-[#18191c] text-lg font-bold">{step.title}</h3>
                <p className="text-[#374151] text-base leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ý tưởng mới nhất */}
        <section className="w-full">
          <SectionHeader
            title="Ý tưởng mới nhất"
            subtitle="Những ý tưởng vừa được gửi lên hệ thống — hãy tương tác và ủng hộ!"
            viewAllTo="/doi-moi/tra-cuu"
          />
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
             {RECENT_IDEAS.map(idea => {
              const s = ideaState[idea.id];
              return (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  liked={s.liked}
                  likeCount={s.likeCount}
                  commentOpen={s.cmtOpen}
                  comments={s.comments}
                  onLike={() => toggleLike(setIdeaState, idea.id)}
                  onToggle={() => toggleComment(setIdeaState, idea.id)}
                  onComment={t => addComment(setIdeaState, idea.id, t)}
                  onShare={() => handleShare(`/doi-moi/tra-cuu?id=${idea.id}`)}
                />
              );
            })}
          </div>
        </section>

        {/* Kho tri thức nổi bật */}
        <section className="w-full">
          <SectionHeader
            title="Kho tri thức nổi bật"
            subtitle="Những ý tưởng đã được công nhận và đưa vào ứng dụng thực tiễn"
            viewAllTo="/doi-moi/kho-tri-thuc"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {KNOWLEDGE_ITEMS.map(item => {
              const s = kttState[item.id];
              return (
                <KnowledgeCard
                  key={item.id}
                  item={item}
                  liked={s.liked}
                  likeCount={s.likeCount}
                  commentOpen={s.cmtOpen}
                  comments={s.comments}
                  onLike={() => toggleLike(setKttState, item.id)}
                  onToggle={() => toggleComment(setKttState, item.id)}
                  onComment={t => addComment(setKttState, item.id, t)}
                  onShare={() => handleShare(`/doi-moi/kho-tri-thuc?id=${item.id}`)}
                />
              );
            })}
          </div>
        </section>

      </div>
    </div>
    </>
  );
};
