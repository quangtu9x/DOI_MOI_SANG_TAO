/**
 * TuongTacSection — IV.2.2 Tương tác với ý tưởng / giải pháp / sáng kiến
 *
 * Props:
 *   loaiDoiTuong  — LoaiDoiTuong enum (YTuong=4, GiaiPhap=5, SangKien=6, ...)
 *   doiTuongId    — ID của đối tượng
 *   initialLikes  — số lượt thích ban đầu (lấy từ trang cha)
 *   readOnly      — ẩn form nhập (chỉ xem)
 *
 * Features:
 *   ✔ Like / Unlike (toggle, optimistic UI)
 *   ✔ Danh sách bình luận + load more
 *   ✔ Gửi bình luận mới (Enter = gửi, Shift+Enter = xuống dòng)
 *   ✔ Reply lồng nhau (xem / ẩn replies)
 *   ✔ Xóa bình luận của mình
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Avatar, Spin, message, Tooltip, Popconfirm } from 'antd';
import {
  searchBinhLuans,
  createBinhLuan,
  deleteBinhLuan,
  toggleThich,
} from '@/app/services/khoTriThucApi';
import type { IBinhLuan } from '@/app/models/knowledge-hub';
import { LoaiDoiTuong } from '@/app/models/knowledge-hub';

// ── helpers ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

function initials(name?: string): string {
  if (!name) return '?';
  return name.split(' ').map(p => p[0]).slice(-2).join('').toUpperCase();
}

// ── sub-component: một bình luận ────────────────────────────────────────────

interface CommentItemProps {
  comment:         IBinhLuan;
  loaiDoiTuong:    LoaiDoiTuong;
  depth?:          number;           // 0 = top-level, 1 = reply
  onReply?:        (id: string, authorName: string) => void;
  onDelete?:       (id: string) => void;
  currentUserId?:  string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment, loaiDoiTuong, depth = 0, onReply, onDelete, currentUserId,
}) => {
  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(comment.luotThich ?? 0);
  const [replies, setReplies]       = useState<IBinhLuan[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyPage, setReplyPage]   = useState(1);
  const [replyHasMore, setReplyHasMore] = useState(false);

  const handleLike = async () => {
    try {
      const res = await toggleThich({ loaiDoiTuong: LoaiDoiTuong.BinhLuan, doiTuongId: comment.id });
      const nowLiked: boolean = (res as any)?.data ?? !liked;
      setLiked(nowLiked);
      setLikeCount(prev => nowLiked ? prev + 1 : Math.max(0, prev - 1));
    } catch {
      message.error('Lỗi khi thích bình luận');
    }
  };

  const loadReplies = useCallback(async (page = 1, reset = false) => {
    setLoadingReplies(true);
    try {
      const res = await searchBinhLuans({
        loaiDoiTuong,
        doiTuongId:     comment.id,   // replies của comment này
        binhLuanChaId:  comment.id,
        pageNumber:     page,
        pageSize:       5,
      });
      const data: IBinhLuan[] = (res as any)?.data ?? [];
      const total: number     = (res as any)?.totalCount ?? 0;
      setReplies(prev => reset ? data : [...prev, ...data]);
      const loaded = reset ? data.length : replies.length + data.length;
      setReplyHasMore(loaded < total);
    } catch {
      message.error('Không tải được phản hồi');
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.id, loaiDoiTuong, replies.length]);

  const toggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      loadReplies(1, true);
    }
    setShowReplies(v => !v);
  };

  const isOwn = currentUserId && comment.tacGia?.id === currentUserId;

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: depth === 0 ? 20 : 12 }}>
      {/* Avatar */}
      <Avatar
        size={depth === 0 ? 36 : 28}
        style={{ background: depth === 0 ? '#003087' : '#C5A028', flexShrink: 0, fontSize: 12, fontWeight: 700 }}
      >
        {initials(comment.tacGia?.hoTen)}
      </Avatar>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Bubble */}
        <div style={{
          background: depth === 0 ? '#f5f7fa' : '#fefae8',
          borderRadius: 10, padding: '10px 14px',
          border: `1px solid ${depth === 0 ? '#eaeaea' : '#f0dfa0'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#003087' }}>
              {comment.tacGia?.hoTen ?? 'Ẩn danh'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#bbb' }}>{timeAgo(comment.createdOn)}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {comment.noiDung}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 16, marginTop: 5, paddingLeft: 4 }}>
          <button
            onClick={handleLike}
            style={{
              border: 'none', background: 'none', padding: 0, cursor: 'pointer',
              fontSize: '0.78rem', color: liked ? '#e0443a' : '#999',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart`} style={{ fontSize: 12 }} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {depth === 0 && onReply && (
            <button
              onClick={() => onReply(comment.id, comment.tacGia?.hoTen ?? '')}
              style={{
                border: 'none', background: 'none', padding: 0, cursor: 'pointer',
                fontSize: '0.78rem', color: '#999', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <i className='fa-regular fa-reply' style={{ fontSize: 12 }} />
              Phản hồi
            </button>
          )}

          {depth === 0 && (comment.soReply ?? 0) > 0 && (
            <button
              onClick={toggleReplies}
              style={{
                border: 'none', background: 'none', padding: 0, cursor: 'pointer',
                fontSize: '0.78rem', color: '#C5A028', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <i className={`fa-regular ${showReplies ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: 11 }} />
              {showReplies ? 'Ẩn' : 'Xem'} {comment.soReply} phản hồi
            </button>
          )}

          {isOwn && onDelete && (
            <Popconfirm
              title='Xóa bình luận này?'
              onConfirm={() => onDelete(comment.id)}
              okText='Xóa' cancelText='Hủy'
              okButtonProps={{ danger: true }}
            >
              <button
                style={{
                  border: 'none', background: 'none', padding: 0, cursor: 'pointer',
                  fontSize: '0.78rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <i className='fa-regular fa-trash-can' style={{ fontSize: 12 }} />
              </button>
            </Popconfirm>
          )}
        </div>

        {/* Nested replies */}
        {showReplies && (
          <div style={{ marginTop: 10, paddingLeft: 4 }}>
            {loadingReplies && replies.length === 0 ? (
              <Spin size='small' />
            ) : (
              replies.map(r => (
                <CommentItem
                  key={r.id}
                  comment={r}
                  loaiDoiTuong={loaiDoiTuong}
                  depth={1}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                />
              ))
            )}
            {replyHasMore && (
              <button
                onClick={() => { const next = replyPage + 1; setReplyPage(next); loadReplies(next); }}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', color: '#C5A028', padding: '4px 0',
                }}
              >
                {loadingReplies ? <Spin size='small' /> : 'Xem thêm phản hồi...'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── main component ───────────────────────────────────────────────────────────

export interface TuongTacSectionProps {
  loaiDoiTuong:   LoaiDoiTuong;
  doiTuongId:     string;
  initialLikes?:  number;
  readOnly?:      boolean;
  currentUserId?: string;
}

export const TuongTacSection: React.FC<TuongTacSectionProps> = ({
  loaiDoiTuong,
  doiTuongId,
  initialLikes = 0,
  readOnly = false,
  currentUserId,
}) => {
  const [comments, setComments]     = useState<IBinhLuan[]>([]);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [total, setTotal]           = useState(0);

  const [liked, setLiked]           = useState(false);
  const [likeCount, setLikeCount]   = useState(initialLikes);

  const [text, setText]             = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── load comments ─────────────────────────────────────────────────────────

  const loadComments = useCallback(async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const res = await searchBinhLuans({
        loaiDoiTuong,
        doiTuongId,
        binhLuanChaId: null,   // top-level only
        pageNumber:    p,
        pageSize:      PAGE_SIZE,
      });
      const data: IBinhLuan[] = (res as any)?.data ?? [];
      const tot: number       = (res as any)?.totalCount ?? 0;
      setComments(prev => reset ? data : [...prev, ...data]);
      setTotal(tot);
      const loaded = reset ? data.length : comments.length + data.length;
      setHasMore(loaded < tot);
    } catch {
      message.error('Không tải được bình luận');
    } finally {
      setLoading(false);
    }
  }, [loaiDoiTuong, doiTuongId, comments.length]);

  useEffect(() => {
    if (doiTuongId) loadComments(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doiTuongId]);

  // ── like ──────────────────────────────────────────────────────────────────

  const handleLike = async () => {
    try {
      const res = await toggleThich({ loaiDoiTuong, doiTuongId });
      const nowLiked: boolean = (res as any)?.data ?? !liked;
      setLiked(nowLiked);
      setLikeCount(prev => nowLiked ? prev + 1 : Math.max(0, prev - 1));
    } catch {
      message.error('Lỗi khi thích');
    }
  };

  // ── submit comment ────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const content = text.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      await createBinhLuan({
        loaiDoiTuong,
        doiTuongId: replyingTo ? replyingTo.id : doiTuongId,
        noiDung:    content,
        binhLuanChaId: replyingTo ? replyingTo.id : null,
      });
      setText('');
      setReplyingTo(null);
      message.success('Đã gửi bình luận');
      // reload
      await loadComments(1, true);
    } catch {
      message.error('Không gửi được bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      await deleteBinhLuan(id);
      message.success('Đã xóa bình luận');
      setComments(prev => prev.filter(c => c.id !== id));
      setTotal(prev => prev - 1);
    } catch {
      message.error('Không xóa được bình luận');
    }
  };

  // ── reply focus ───────────────────────────────────────────────────────────

  const handleReply = (id: string, name: string) => {
    setReplyingTo({ id, name });
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Like bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '12px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 20,
      }}>
        <button
          onClick={handleLike}
          style={{
            border: `1px solid ${liked ? '#e0443a' : '#e0e0e0'}`,
            borderRadius: 20, padding: '6px 18px', cursor: 'pointer',
            background: liked ? '#fff2f0' : '#fafafa',
            color: liked ? '#e0443a' : '#666',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s',
          }}
        >
          <i className={`fa-${liked ? 'solid' : 'regular'} fa-heart`} />
          {liked ? 'Đã thích' : 'Thích'}
          {likeCount > 0 && (
            <span style={{
              background: liked ? '#e0443a' : '#eee',
              color: liked ? '#fff' : '#666',
              borderRadius: 10, padding: '1px 8px', fontSize: '0.8rem',
            }}>
              {likeCount}
            </span>
          )}
        </button>

        <span style={{ color: '#bbb', fontSize: '0.82rem' }}>
          <i className='fa-regular fa-comment me-1' />
          {total} bình luận
        </span>
      </div>

      {/* Comment form */}
      {!readOnly && (
        <div style={{ marginBottom: 24 }}>
          {replyingTo && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff8e6', border: '1px solid #ffe58f',
              borderRadius: 6, padding: '6px 12px', marginBottom: 8, fontSize: '0.82rem',
            }}>
              <i className='fa-regular fa-reply' style={{ color: '#C5A028' }} />
              <span>Đang phản hồi <b>{replyingTo.name}</b></span>
              <button
                onClick={() => setReplyingTo(null)}
                style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: '#aaa', fontSize: 14 }}
              >
                ×
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <Avatar
              size={34}
              style={{ background: '#003087', flexShrink: 0, fontSize: 12, fontWeight: 700 }}
            >
              Me
            </Avatar>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={replyingTo ? `Phản hồi ${replyingTo.name}...` : 'Viết bình luận... (Enter để gửi, Shift+Enter xuống dòng)'}
                rows={2}
                style={{
                  width: '100%', resize: 'vertical', borderRadius: 10,
                  border: '1px solid #ddd', padding: '10px 48px 10px 14px',
                  fontSize: '0.875rem', lineHeight: 1.5, outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#003087'; }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; }}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                style={{
                  position: 'absolute', right: 8, bottom: 8,
                  border: 'none', borderRadius: 8,
                  background: text.trim() ? '#003087' : '#e0e0e0',
                  color: '#fff', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: text.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s',
                }}
              >
                {submitting
                  ? <span className='spinner-border spinner-border-sm' style={{ width: 14, height: 14, borderWidth: 2 }} />
                  : <i className='fa-solid fa-paper-plane-top' style={{ fontSize: 13 }} />
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment list */}
      <Spin spinning={loading && comments.length === 0}>
        {comments.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
            <i className='fa-regular fa-comment-dots' style={{ fontSize: 32, display: 'block', marginBottom: 8 }} />
            <span style={{ fontSize: '0.875rem' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</span>
          </div>
        ) : (
          <div>
            {comments.map(c => (
              <CommentItem
                key={c.id}
                comment={c}
                loaiDoiTuong={loaiDoiTuong}
                depth={0}
                onReply={handleReply}
                onDelete={handleDelete}
                currentUserId={currentUserId}
              />
            ))}

            {hasMore && (
              <div style={{ textAlign: 'center', paddingTop: 8 }}>
                <button
                  onClick={() => { const next = page + 1; setPage(next); loadComments(next, false); }}
                  style={{
                    border: '1px solid #e0e0e0', borderRadius: 20,
                    padding: '6px 20px', background: '#fafafa',
                    color: '#555', fontSize: '0.82rem', cursor: 'pointer',
                  }}
                >
                  {loading ? <Spin size='small' /> : `Xem thêm bình luận (${total - comments.length} còn lại)`}
                </button>
              </div>
            )}
          </div>
        )}
      </Spin>
    </div>
  );
};
