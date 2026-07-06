import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Tag, Spin, Empty, Modal, Input, Upload, message, Timeline } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import {
  getIdeaDetail, getIdeaHistories, receiveIdea, returnIdea, recognizeIdea,
  uploadIdeaFiles, addIdeaAttachments,
} from '@/app/services/ideaPortalApi';
import type { IIdea, IIdeaHistory, IIdeaAttachment } from '@/models/idea-portal';
import { TuongTacSection } from '@/app/components/tuong-tac/TuongTacSection';
import { LoaiDoiTuong } from '@/app/models/knowledge-hub';
import { useAuth } from '@/app/modules/auth';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

// Đánh dấu tài liệu đính kèm được thêm vào lúc công nhận ý tưởng (để phân biệt với hồ sơ gốc,
// không cần đổi cấu trúc CSDL vì IdeaAttachment hiện chưa có trường phân loại).
const KQCN_TAG = '[Kết quả công nhận] ';
const stripKqcnTag = (name?: string | null) => (name ?? '').startsWith(KQCN_TAG) ? name!.slice(KQCN_TAG.length) : name;
const isKqcnAttachment = (name?: string | null) => (name ?? '').startsWith(KQCN_TAG);

// Trạng thái ý tưởng (key = giá trị IdeaStatus phía BE, label = tên hiển thị)
const STATUS_META: Record<string, { color: string; icon: string; label: string }> = {
  'Bản nháp':     { color: 'default',    icon: 'fa-file-pen',     label: 'Bản nháp' },
  'Đã nộp':       { color: 'processing', icon: 'fa-paper-plane',  label: 'Đã nộp/Chờ xét duyệt' },
  'Đã tiếp nhận': { color: 'success',    icon: 'fa-circle-check', label: 'Đã tiếp nhận' },
  'Đã trả lại':   { color: 'error',      icon: 'fa-rotate-left',  label: 'Đã trả lại' },
  'Đã hủy':       { color: 'default',    icon: 'fa-ban',          label: 'Đã hủy' },
  'Được công nhận': { color: 'purple',   icon: 'fa-medal',        label: 'Được công nhận' },
};

const HISTORY_DOT: Record<string, string> = {
  'Đã nộp':         'blue',
  'Đã tiếp nhận':   'green',
  'Đã trả lại':     'red',
  'Đã hủy':         'gray',
  'Được công nhận': 'purple',
};

const isGuid = (v?: string) =>
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const fmtDateTime = (v?: string | null) =>
  v ? new Date(v).toLocaleString('vi-VN') : '—';

const fmtBytes = (bytes?: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const safeItem = <T,>(res: any): T | null => {
  const d = res?.data ?? res;
  return (d?.data ?? d ?? null) as T | null;
};
const safeList = <T,>(res: any): T[] => {
  const d = res?.data ?? res;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const ChiTietYTuongPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isReviewer, isAdmin } = useDMSTRole();
  const canApprove = isReviewer || isAdmin;

  const [loading, setLoading]     = useState(false);
  const [idea, setIdea]           = useState<IIdea | null>(null);
  const [histories, setHistories] = useState<IIdeaHistory[]>([]);
  const [notFound, setNotFound]   = useState(false);

  // Trả lại (từ chối)
  const [rejectOpen, setRejectOpen]       = useState(false);
  const [rejectReason, setRejectReason]   = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Công nhận
  const [recognizeOpen, setRecognizeOpen] = useState(false);
  const [recognizeInfo, setRecognizeInfo] = useState('');
  const [recognizeFiles, setRecognizeFiles] = useState<UploadFile[]>([]);

  const load = useCallback(async () => {
    if (!isGuid(id)) { setNotFound(true); return; }
    setLoading(true);
    try {
      const [ideaRes, histRes] = await Promise.allSettled([
        getIdeaDetail(id!),
        getIdeaHistories(id!),
      ]);
      const item = ideaRes.status === 'fulfilled' ? safeItem<IIdea>(ideaRes.value) : null;
      if (!item || !item.id) { setNotFound(true); return; }
      setIdea(item);
      setHistories(histRes.status === 'fulfilled' ? safeList<IIdeaHistory>(histRes.value) : []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = () => {
    Modal.confirm({
      title: 'Phê duyệt (tiếp nhận) ý tưởng này?',
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await receiveIdea(id!, 'Phê duyệt từ trang chi tiết');
          if ((res as any)?.status >= 400 || (res as any)?.data?.succeeded === false) {
            message.error((res as any)?.data?.messages?.join(', ') || 'Không phê duyệt được');
            return;
          }
          message.success('Đã tiếp nhận ý tưởng');
          load();
        } catch { message.error('Lỗi khi phê duyệt'); }
      },
    });
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { message.error('Vui lòng nhập lý do'); return; }
    setActionLoading(true);
    try {
      const res = await returnIdea(id!, rejectReason.trim());
      if ((res as any)?.status >= 400 || (res as any)?.data?.succeeded === false) {
        message.error((res as any)?.data?.messages?.join(', ') || 'Không trả lại được');
        return;
      }
      message.success('Đã trả lại ý tưởng');
      setRejectOpen(false); setRejectReason('');
      load();
    } catch { message.error('Lỗi'); }
    finally { setActionLoading(false); }
  };

  const handleRecognize = async () => {
    if (!recognizeInfo.trim()) { message.error('Vui lòng nhập thông tin công nhận'); return; }
    setActionLoading(true);
    try {
      // Đính kèm tài liệu kết quả công nhận (nếu có) trước khi đổi trạng thái
      if (recognizeFiles.length > 0) {
        try {
          const uploaded = await uploadIdeaFiles(recognizeFiles);
          if (uploaded.length > 0) {
            const attachments: IIdeaAttachment[] = uploaded.map(f => ({
              fileName: f.fileName,
              originalName: `${KQCN_TAG}${f.originalName ?? f.fileName}`,
              filePath: f.filePath,
              fileExt: f.fileExt,
              fileSize: f.fileSize,
              bucketName: f.bucketName,
              prefix: f.prefix,
              thumbnailUrl: f.thumbnailUrl,
            }));
            await addIdeaAttachments(id!, attachments);
          }
        } catch {
          message.error('Không tải lên được tài liệu đính kèm — vui lòng thử lại');
          return;
        }
      }

      const res = await recognizeIdea(id!, recognizeInfo.trim());
      if ((res as any)?.status >= 400 || (res as any)?.data?.succeeded === false) {
        message.error((res as any)?.data?.messages?.join(', ') || 'Không công nhận được');
        return;
      }
      message.success('Đã công nhận ý tưởng');
      setRecognizeOpen(false); setRecognizeInfo(''); setRecognizeFiles([]);
      load();
    } catch { message.error('Lỗi'); }
    finally { setActionLoading(false); }
  };

  // Thông tin công nhận (lấy từ lịch sử)
  const recognitionEntry = histories.find(h => h.actionType === 'Được công nhận');
  // Tài liệu đính kèm được thêm khi công nhận (đánh dấu qua tiền tố tên file)
  const kqcnAttachments = (idea?.attachments ?? []).filter(a => isKqcnAttachment(a.originalName));

  const statusMeta = STATUS_META[idea?.status ?? '']
    ?? { color: 'default', icon: 'fa-circle-question', label: idea?.status ?? 'Không rõ' };

  const breadcrumbs = [
    { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
    { title: 'Quản lý ý tưởng', path: '/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach', isActive: false, isSeparator: false },
  ];

  // ── Not found / invalid id ─────────────────────────────────────────────────
  if (notFound) {
    return (
      <>
        <PageTitle breadcrumbs={breadcrumbs}>Chi tiết ý tưởng</PageTitle>
        <Content>
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body py-16 text-center">
              <i className="fa-regular fa-file-circle-question fs-3x text-muted mb-4 d-block" />
              <div className="fw-bold fs-4 text-gray-800 mb-2">Không tìm thấy ý tưởng</div>
              <div className="text-muted fs-7 mb-4">
                Ý tưởng không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại đường dẫn.
              </div>
              <Button type="primary" onClick={() => navigate('/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach')}>
                <i className="fa-regular fa-arrow-left me-1" />Về danh sách ý tưởng
              </Button>
            </div>
          </div>
        </Content>
      </>
    );
  }

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Chi tiết ý tưởng</PageTitle>
      <Content>
        <Spin spinning={loading}>
          {idea && (
            <div className="d-flex gap-4 flex-wrap flex-lg-nowrap" style={{ alignItems: 'flex-start' }}>
              {/* ── Main column ─────────────────────────────────────────── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header card */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                  <div className="card-body p-5">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                          <span className="badge badge-light-primary fw-bold">{idea.code}</span>
                          {idea.linhVuc && <Tag color="cyan" style={{ margin: 0 }}>{idea.linhVuc}</Tag>}
                          <Tag color={statusMeta.color} style={{ margin: 0 }}>
                            <i className={`fa-regular ${statusMeta.icon} me-1`} />{statusMeta.label}
                          </Tag>
                        </div>
                        <h3 className="fw-bold text-gray-900 mb-0">{idea.title}</h3>
                      </div>
                      <div className="d-flex gap-2">
                        <Button onClick={() => navigate(-1)}>
                          <i className="fa-regular fa-arrow-left me-1" />Quay lại
                        </Button>
                        {canApprove && idea.status === 'Đã nộp' && (
                          <>
                            <Button type="primary" onClick={handleApprove}>
                              <i className="fa-regular fa-check me-1" />Phê duyệt
                            </Button>
                            <Button danger onClick={() => setRejectOpen(true)}>
                              <i className="fa-regular fa-rotate-left me-1" />Trả lại
                            </Button>
                          </>
                        )}
                        {canApprove && idea.status === 'Đã tiếp nhận' && (
                          <Button type="primary" style={{ background: '#722ed1', borderColor: '#722ed1' }}
                            onClick={() => setRecognizeOpen(true)}>
                            <i className="fa-regular fa-medal me-1" />Công nhận
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="row g-3 text-muted fs-7">
                      <div className="col-md-4">
                        <i className="fa-regular fa-user me-2" />
                        Người đề xuất: <span className="text-gray-800 fw-semibold">{idea.nguoiDeXuat || '—'}</span>
                      </div>
                      <div className="col-md-4">
                        <i className="fa-regular fa-building me-2" />
                        Đơn vị: <span className="text-gray-800 fw-semibold">{idea.donViCongTac || '—'}</span>
                      </div>
                      <div className="col-md-4">
                        <i className="fa-regular fa-calendar me-2" />
                        Ngày nộp: <span className="text-gray-800 fw-semibold">{fmtDateTime(idea.submittedOn ?? idea.submittedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin công nhận */}
                {idea.status === 'Được công nhận' && (
                  <div className="shadow-sm mb-4 overflow-hidden"
                    style={{
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                      border: '1px solid #ddd6fe',
                    }}>
                    <div className="p-5 d-flex gap-4 align-items-start">
                      <div className="d-flex align-items-center justify-content-center rounded-circle bg-white shadow-sm"
                        style={{ width: 52, height: 52, flexShrink: 0 }}>
                        <i className="fa-solid fa-medal fs-2" style={{ color: '#722ed1' }} />
                      </div>
                      <div>
                        <div className="fw-bold fs-5 mb-1" style={{ color: '#5b21b6' }}>Ý tưởng đã được công nhận</div>
                        {recognitionEntry?.remark && (
                          <div className="text-gray-700 fs-7 mb-1">{recognitionEntry.remark}</div>
                        )}
                        {recognitionEntry && (
                          <div className="text-muted fs-8 mb-2">
                            <i className="fa-regular fa-calendar me-1" />
                            Ngày công nhận: {fmtDateTime(recognitionEntry.actionDate)}
                          </div>
                        )}
                        {kqcnAttachments.length > 0 && (
                          <div className="d-flex flex-column gap-2 mt-2">
                            {kqcnAttachments.map((f, i) => (
                              <div key={i}
                                className="d-flex align-items-center gap-2 p-2 rounded bg-white"
                                style={{ border: '1px solid #ddd6fe' }}>
                                <i className="fa-regular fa-file-check" style={{ color: '#722ed1' }} />
                                <span className="fs-7 text-gray-800 fw-semibold">{stripKqcnTag(f.originalName)}</span>
                                <span className="text-muted fs-8">{f.fileExt?.toUpperCase()} · {fmtBytes(f.fileSize)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content sections */}
                {[
                  { label: 'Mô tả vấn đề hiện tại', icon: 'fa-circle-exclamation', value: idea.problemDescription },
                  { label: 'Nội dung ý tưởng / Giải pháp đề xuất', icon: 'fa-lightbulb', value: idea.ideaContent },
                  { label: 'Mục tiêu cụ thể', icon: 'fa-bullseye', value: idea.mucTieu },
                  { label: 'Lợi ích dự kiến', icon: 'fa-chart-line', value: idea.expectedBenefit },
                  { label: 'Phạm vi áp dụng', icon: 'fa-diagram-project', value: idea.phamViApDung },
                ].filter(s => s.value).map(s => (
                  <div key={s.label} className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className={`fa-regular ${s.icon} text-primary me-2`} />{s.label}
                      </div>
                      <div className="text-gray-700 fs-7" style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                        {s.value}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Attachments */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                  <div className="card-body p-5">
                    <div className="fw-bold text-gray-800 mb-3">
                      <i className="fa-regular fa-paperclip text-primary me-2" />
                      Tài liệu đính kèm ({idea.attachments?.length ?? 0})
                    </div>
                    {!idea.attachments?.length ? (
                      <div className="text-muted fs-7">Không có tài liệu đính kèm</div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {idea.attachments.map((f, i) => {
                          const isKqcn = isKqcnAttachment(f.originalName);
                          return (
                            <div key={i} className="d-flex align-items-center gap-3 p-3 rounded bg-light">
                              <i className={`fa-regular ${isKqcn ? 'fa-file-check' : 'fa-file'} fs-4`}
                                style={{ color: isKqcn ? '#722ed1' : undefined }} />
                              <div className="flex-grow-1 min-w-0">
                                <div className="fw-semibold fs-7 text-truncate">
                                  {stripKqcnTag(f.originalName) ?? f.fileName}
                                  {isKqcn && <Tag color="purple" className="ms-2">Kết quả công nhận</Tag>}
                                </div>
                                <div className="text-muted fs-8">{f.fileExt?.toUpperCase()} · {fmtBytes(f.fileSize)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tương tác: thích + bình luận */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                  <div className="card-body p-5">
                    <div className="fw-bold text-gray-800 mb-3">
                      <i className="fa-regular fa-comments text-primary me-2" />Thảo luận
                    </div>
                    <TuongTacSection
                      loaiDoiTuong={LoaiDoiTuong.YTuong}
                      doiTuongId={idea.id}
                      initialLikes={0}
                      currentUserId={currentUser?.id}
                    />
                  </div>
                </div>
              </div>

              {/* ── Right column: timeline ──────────────────────────────── */}
              <div style={{ width: 320, flexShrink: 0 }}>
                <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
                  <div className="card-body p-5">
                    <div className="fw-bold text-gray-800 mb-4">
                      <i className="fa-regular fa-timeline text-primary me-2" />Lịch sử xử lý
                    </div>
                    {histories.length === 0 ? (
                      <Empty description="Chưa có lịch sử" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <Timeline
                        items={histories.map(h => ({
                          color: HISTORY_DOT[h.actionType] ?? 'blue',
                          children: (
                            <div>
                              <div className="fw-semibold fs-7 text-gray-800">{h.actionType}</div>
                              {h.remark && <div className="text-muted fs-8 mt-1">{h.remark}</div>}
                              <div className="text-muted fs-9 mt-1">
                                <i className="fa-regular fa-clock me-1" />{fmtDateTime(h.actionDate)}
                              </div>
                            </div>
                          ),
                        }))}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Spin>
      </Content>

      {/* Reject modal */}
      <Modal
        title={<><i className="fa-regular fa-rotate-left text-danger me-2" />Trả lại ý tưởng</>}
        open={rejectOpen}
        onOk={handleReject}
        onCancel={() => { setRejectOpen(false); setRejectReason(''); }}
        okText="Xác nhận trả lại"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        confirmLoading={actionLoading}
      >
        <p>Lý do trả lại (người gửi có thể chỉnh sửa và nộp lại):</p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Nhập lý do để người gửi hoàn thiện ý tưởng..."
        />
      </Modal>

      {/* Recognize modal */}
      <Modal
        title={<><i className="fa-solid fa-medal me-2" style={{ color: '#722ed1' }} />Công nhận ý tưởng</>}
        open={recognizeOpen}
        onOk={handleRecognize}
        onCancel={() => { setRecognizeOpen(false); setRecognizeInfo(''); setRecognizeFiles([]); }}
        okText="Xác nhận công nhận"
        cancelText="Hủy"
        confirmLoading={actionLoading}
      >
        <p>Thông tin công nhận (số quyết định, nội dung ghi nhận, giá trị mang lại...):</p>
        <Input.TextArea
          rows={3}
          value={recognizeInfo}
          onChange={e => setRecognizeInfo(e.target.value)}
          placeholder="VD: Quyết định số 123/QĐ-TCT ngày ..., công nhận sáng kiến cấp Tổng công ty..."
        />
        <p className="mt-4 mb-2">Tài liệu đính kèm (quyết định công nhận, minh chứng...):</p>
        <Upload
          fileList={recognizeFiles}
          beforeUpload={() => false}
          onChange={({ fileList }) => setRecognizeFiles(fileList)}
          onRemove={file => setRecognizeFiles(prev => prev.filter(f => f.uid !== file.uid))}
          multiple
        >
          <Button icon={<i className="fa-regular fa-paperclip me-1" />}>Chọn file</Button>
        </Upload>
      </Modal>
    </>
  );
};
