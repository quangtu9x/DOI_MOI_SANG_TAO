import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Button, Card, Form, Input, Select, Space, Tag, message,
  Upload, Descriptions, DatePicker, AutoComplete, Spin, Progress, Tooltip,
} from 'antd';
import { useAuth } from '@/app/modules/auth';
import dayjs from 'dayjs';
import type { UploadFile } from 'antd/es/upload/interface';
import { ImportHangLoatForm } from './components/import-y-tuong/ImportHangLoatForm';
import { UserSelect } from '@/app/components/UserSelect';
import {
  createIdea,
  updateIdea,
  uploadIdeaFiles,
  submitIdea,
  getIdeaTemplates,
  getIdeaDetail,
} from '@/app/services/ideaPortalApi';
import type { IIdea, IIdeaTemplate, IAttachmentUploadResult } from '@/models/idea-portal';
import type { IIdeaFieldConfig } from '@/models/cau-hinh-truong-y-tuong';
import { requestPOST } from '@/utils/baseAPI';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';

type KhoiTaoCach = 'new' | 'template' | 'import';

const LINH_VUC_OPTIONS = [
  'Khai thác bay',
  'Kỹ thuật bảo dưỡng',
  'Dịch vụ hành khách',
  'Dịch vụ mặt đất',
  'Đào tạo nhân lực',
  'Chuyển đổi số',
  'Cải cách hành chính',
  'An toàn hàng không',
  'Thương mại & Doanh thu',
  'Công nghệ thông tin',
].map(v => ({ value: v, label: v }));

export const NopYTuongPage = () => {
  const { currentUser } = useAuth();
  /**
   * Chỉ người có quyền quản lý hoặc quản trị mới được Import hàng loạt bằng Excel/CSV/API.
   * Dùng chung `useDMSTRole().isReviewer` (Admin hoặc Specialist) — cùng định nghĩa "quản lý/quản trị"
   * với toàn bộ khu vực Đổi mới sáng tạo (Quản lý ý tưởng, Quy trình duyệt, Báo cáo...).
   * Lưu ý: `currentUser.roles` KHÔNG được BE trả về (luôn rỗng) nên không dùng được để phân quyền.
   */
  const { isReviewer: canImport } = useDMSTRole();
  const [step, setStep] = useState(1);
  const [form] = Form.useForm();

  // ── Cấu hình trường thông tin ý tưởng (admin cấu hình ẩn/hiện + bắt buộc) ──
  const [fieldCfgs, setFieldCfgs] = useState<Record<string, IIdeaFieldConfig>>({});

  useEffect(() => {
    requestPOST<any>('ideafieldconfigs/search', { pageNumber: 1, pageSize: 100 })
      .then(res => {
        const list: IIdeaFieldConfig[] = res?.data?.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          setFieldCfgs(Object.fromEntries(list.map(c => [c.fieldCode, c])));
        }
      })
      .catch(() => { /* chưa có cấu hình → dùng mặc định của form */ });
  }, []);

  /** Trường có hiển thị không (mặc định có nếu chưa cấu hình) */
  const fieldShow = (code: string) => (fieldCfgs[code] ? fieldCfgs[code].isActive : true);
  /** Rule bắt buộc theo cấu hình (fallback về mặc định của form) */
  const fieldRules = (code: string, defaultRequired: boolean, msg: string) => {
    const required = fieldCfgs[code] ? fieldCfgs[code].isRequired : defaultRequired;
    return required ? [{ required: true, message: msg }] : [];
  };
  const fieldPh = (code: string, fallback: string) => fieldCfgs[code]?.placeholder || fallback;
  const fieldMax = (code: string) => {
    const m = fieldCfgs[code]?.maxLength;
    return m && m > 0 ? m : undefined;
  };
  const [khoiTaoCach, setKhoiTaoCach] = useState<KhoiTaoCach | null>(null);
  const [ticketCode, setTicketCode] = useState<string>('');
  const [createdIdeaId, setCreatedIdeaId] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, any> | null>(null);
  const [uploadedAttachments, setUploadedAttachments] = useState<IAttachmentUploadResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [templates, setTemplates] = useState<IIdeaTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receiverName, setReceiverName] = useState('');

  const isTemplate = useMemo(() => khoiTaoCach === 'template', [khoiTaoCach]);
  const [draftData, setDraftData] = useState<Record<string, any> | null>(null);
  const [searchParams] = useSearchParams();
  const [editMode, setEditMode] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Auto-detect import mode OR edit mode from URL params
  useEffect(() => {
    const mode = searchParams.get('mode');
    const ideaId = searchParams.get('ideaId');

    if (ideaId) {
      // Edit mode: load idea from server
      setLoadingEdit(true);
      setCreatedIdeaId(ideaId);
      setEditMode(true);
      setKhoiTaoCach('new');
      getIdeaDetail(ideaId)
        .then(res => {
          const idea: IIdea = (res.data as any)?.data ?? res.data as IIdea;
          if (!idea) { message.error('Không tìm thấy ý tưởng!'); return; }
          form.setFieldsValue({
            tenYTuong:     idea.title,
            moTaVanDe:     idea.problemDescription,
            noiDungDeXuat: idea.ideaContent,
            mucTieu:       idea.mucTieu,
            linhVuc:       idea.linhVuc,
            nguoiDeXuat:   idea.nguoiDeXuat,
            donViCongTac:  idea.donViCongTac,
            phamViApDung:  idea.phamViApDung,
            loiIchDuKien:  idea.expectedBenefit,
            receiverId:    idea.receiverId,
            thoiGianApDung: idea.ngayApDung ? dayjs(idea.ngayApDung) : undefined,
            templateId:    idea.templateId,
          });
          setStep(2);
          message.success('Đã tải ý tưởng để chỉnh sửa!');
        })
        .catch(() => message.error('Không thể tải ý tưởng!'))
        .finally(() => setLoadingEdit(false));
      return;
    }

    if (mode === 'import') {
      setKhoiTaoCach('import');
      setStep(2);
    }
  }, [searchParams]);

  // Load draft — BỎ QUA nếu đang ở edit mode (có ?ideaId)
  useEffect(() => {
    if (searchParams.get('ideaId')) return; // edit mode từ server — không load draft
    const saved = localStorage.getItem('yTuongDraft');
    if (!saved) return;
    try {
      const parsed: Record<string, any> = JSON.parse(saved);
      setDraftData(parsed);
      if (parsed.ideaId) setCreatedIdeaId(parsed.ideaId);
      const formVals = { ...parsed };
      delete formVals.ideaId;
      delete formVals.timestamp;
      if (formVals.thoiGianApDung) {
        formVals.thoiGianApDung = dayjs(formVals.thoiGianApDung);
      }
      form.setFieldsValue(formVals);
    } catch { /* ignore */ }
  }, []);

  // Load templates
  useEffect(() => {
    if (khoiTaoCach !== 'template') return;
    setLoadingTemplates(true);
    getIdeaTemplates()
      .then(res => { if (res.data) setTemplates(Array.isArray(res.data) ? res.data : []); })
      .catch(() => {})
      .finally(() => setLoadingTemplates(false));
  }, [khoiTaoCach]);

  // Hàm build payload chung
  const buildPayload = (values: Record<string, any>, attachments: IAttachmentUploadResult[]) => {
    const receiverRaw = values.receiverId;
    const receiverId: string | null =
      receiverRaw == null ? null
      : typeof receiverRaw === 'object' ? (receiverRaw.value ?? receiverRaw.key ?? null)
      : String(receiverRaw);

    return {
      code: `YT-${dayjs().format('YYMMDDHHmmss')}`,
      title: values.tenYTuong,
      problemDescription: values.moTaVanDe,
      ideaContent: values.noiDungDeXuat,
      expectedBenefit: values.loiIchDuKien ?? null,
      mucTieu: values.mucTieu ?? null,
      linhVuc: values.linhVuc ?? null,
      nguoiDeXuat: values.nguoiDeXuat ?? currentUser?.fullName,
      donViCongTac: values.donViCongTac ?? currentUser?.businessName,
      phamViApDung: values.phamViApDung ?? null,
      ngayApDung: values.thoiGianApDung
        ? dayjs(values.thoiGianApDung).toISOString()
        : null,
      templateId: isTemplate ? (values.templateId ?? null) : null,
      receiverId,
      status: 'Bản nháp',
      sourceType: 'MANUAL',
      attachments: (Array.isArray(attachments) ? attachments : []).map(a => ({
        fileName: a.fileName,
        filePath: a.filePath,
        fileExt: a.fileExt,
        fileSize: a.fileSize,
      })),
    };
  };

  // Helper: upload files nếu chưa upload
  const ensureUploaded = async (): Promise<IAttachmentUploadResult[]> => {
    if (fileList.length === 0) return uploadedAttachments;
    if (uploadedAttachments.length > 0) return uploadedAttachments;
    setUploadProgress(0);
    const result = await uploadIdeaFiles(fileList, setUploadProgress);
    setUploadedAttachments(result);
    return result;
  };

  // Helper: extract ID từ mọi cấu trúc response có thể của BE
  const extractId = (resData: any): string => {
    if (!resData) return '';
    const d = resData?.data;
    // IResult<IIdea>: { data: { id | Id } }
    if (d && typeof d === 'object') return d.id ?? d.Id ?? '';
    // IResult<string>: { data: "guid-string" }
    if (typeof d === 'string' && d.length > 0) return d;
    // Direct IIdea: { id | Id }
    return resData.id ?? resData.Id ?? '';
  };

  // Helper: xử lý lỗi 400 từ ASP.NET ValidationProblemDetails
  const handleApiError = (res: any) => {
    const errBody = res?.data as any;
    if (errBody?.errors) {
      const msg = Object.entries(errBody.errors as Record<string, string[]>)
        .map(([f, msgs]) => `${f}: ${msgs.join(', ')}`)
        .join(' | ');
      message.error(msg, 8);
    } else {
      const msg = Array.isArray(errBody?.message)
        ? errBody.message.join(', ')
        : errBody?.message ?? errBody?.title ?? `Lỗi ${res?.status}`;
      message.error(String(msg), 6);
    }
    console.error('[NopYTuong] API error:', JSON.stringify(errBody, null, 2));
  };

  // Lưu nháp → POST /api/v1/ideas (tạo mới hoặc PUT nếu đã có ID)
  const saveDraft = async () => {
    const values = form.getFieldsValue(true);
    if (!values.tenYTuong) { message.warning('Vui lòng nhập tên ý tưởng trước khi lưu nháp.'); return; }

    setSubmitting(true);
    try {
      const attachments = await ensureUploaded();
      const payload = buildPayload(values, attachments);

      let savedId = createdIdeaId;
      if (savedId) {
        // Đã lưu trước → PUT
        const res = await updateIdea(savedId, payload);
        if (res.status >= 400) { handleApiError(res); return; }
      } else {
        // Lần đầu → POST
        const res = await createIdea(payload);
        if (res.status >= 400 || !res.data) { handleApiError(res); return; }
        console.log('[saveDraft] createIdea response:', JSON.stringify(res.data));
        const id = extractId(res.data);
        if (id) { savedId = id; setCreatedIdeaId(id); }
      }

      const draft = { ...values, ideaId: savedId, timestamp: dayjs().format('DD/MM/YYYY HH:mm:ss') };
      localStorage.setItem('yTuongDraft', JSON.stringify(draft));
      setDraftData(draft);
      message.success('Đã lưu nháp thành công!');
    } catch (e) {
      console.error(e);
      message.error('Lưu nháp thất bại!');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handlePreview = () => {
    form.validateFields().then(() => {
      // File đính kèm bắt buộc theo cấu hình trường thông tin
      if (fieldShow('fileDinhKem') && fieldCfgs['fileDinhKem']?.isRequired && fileList.length === 0) {
        message.error('Vui lòng đính kèm tài liệu hỗ trợ (trường bắt buộc)!');
        return;
      }
      const values = form.getFieldsValue(true);
      setPreviewData({ ...values, attachmentCount: fileList.length });
      setStep(3);
    }).catch(() => {
      message.error('Vui lòng kiểm tra lại thông tin trước khi xem trước!');
    });
  };

  // Nộp ý tưởng:
  //   Nếu đã lưu nháp → chỉ gọi POST IdeaStatus/{id}/submit
  //   Nếu chưa → tạo mới (POST ideas) rồi submit
  const onFinish = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Ưu tiên state, fallback về ID đã lưu trong draft localStorage
      let ideaId = createdIdeaId || (draftData?.ideaId ?? '');

      if (!ideaId) {
        // Chưa lưu nháp → dùng previewData (đã validate khi handlePreview) hoặc re-validate
        const values = previewData ?? form.getFieldsValue(true);
        if (!values?.tenYTuong) {
          message.error('Thiếu thông tin ý tưởng — vui lòng quay lại điền đầy đủ!');
          setStep(2);
          return;
        }
        const attachments = await ensureUploaded();
        const payload = buildPayload(values, attachments);

        const createRes = await createIdea(payload);
        if (createRes.status >= 400 || !createRes.data) { handleApiError(createRes); return; }
        console.log('[onFinish] createIdea response:', JSON.stringify(createRes.data));

        ideaId = extractId(createRes.data);
        if (!ideaId) {
          message.error('Không lấy được ID ý tưởng vừa tạo! Xem Console để biết cấu trúc response.');
          return;
        }
        setCreatedIdeaId(ideaId);
      }

      // Gọi submit
      const submitRes = await submitIdea(ideaId, 'Nộp ý tưởng từ cổng thông tin');
      if (submitRes.status >= 400 || !submitRes.data) { handleApiError(submitRes); return; }

      const submitData = submitRes.data as any;
      if (submitData?.succeeded === false) {
        const errMsg = Array.isArray(submitData.message)
          ? submitData.message.join(', ')
          : submitData.message ?? 'Gửi ý tưởng thất bại!';
        message.error(String(errMsg));
        return;
      }

      const code = (submitData as any)?.data?.code ?? `YT-${ideaId.slice(-8).toUpperCase()}`;
      setTicketCode(code);
      localStorage.removeItem('yTuongDraft');
      setDraftData(null);
      message.success('Gửi ý tưởng thành công!');
      setStep(4);
    } catch (err: any) {
      if (err?.message !== 'validation') {
        console.error(err);
        message.error('Đã có lỗi xảy ra, vui lòng thử lại!');
      }
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setStep(1);
    setKhoiTaoCach(null);
    form.resetFields();
    setFileList([]);
    setPreviewData(null);
    setUploadedAttachments([]);
    setCreatedIdeaId('');
    setTicketCode('');
    setReceiverName('');
    localStorage.removeItem('yTuongDraft');
    setDraftData(null);
  };

  if (!currentUser) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-600 font-bold text-xl mb-6 text-center">Bạn cần đăng nhập để khởi tạo ý tưởng.</p>
        <Link to="/auth/login" className="bg-portal-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-portal-hover transition-colors">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (loadingEdit) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spin size="large" tip="Đang tải ý tưởng để chỉnh sửa..." />
      </div>
    );
  }

  return (
    <div className="bg-[#f7f8fa] min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 w-full">
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-2xs border border-gray-100">
          <h1 className="text-2xl lg:text-3xl font-medium text-[#18191c] mb-2">
            {editMode ? 'Chỉnh sửa ý tưởng' : 'Khởi tạo ý tưởng'}
          </h1>
          <p className="text-gray-500 mb-8">
            {editMode
              ? 'Chỉnh sửa và cập nhật thông tin ý tưởng trước khi nộp.'
              : 'Khởi tạo ý tưởng mới hoặc import hàng loạt từ file Excel/CSV/API.'}
          </p>

          {/* Step indicator */}
          {khoiTaoCach === 'import' ? (
            <Space className="mb-6" size={8}>
              <Tag color={step >= 1 ? 'blue' : 'default'}>1. Chọn cách khởi tạo</Tag>
              <Tag color={step >= 2 ? 'blue' : 'default'}>2. Import dữ liệu</Tag>
              <Tag color={step >= 3 ? 'green' : 'default'}>3. Hoàn tất</Tag>
            </Space>
          ) : (
            <Space className="mb-6" size={8}>
              <Tag color={step >= 1 ? 'blue' : 'default'}>1. Chọn cách khởi tạo</Tag>
              <Tag color={step >= 2 ? 'blue' : 'default'}>2. Nhập thông tin & đính kèm</Tag>
              <Tag color={step >= 3 ? 'blue' : 'default'}>3. Xem trước</Tag>
              <Tag color={step >= 4 ? 'green' : 'default'}>4. Hoàn thành</Tag>
            </Space>
          )}

          {/* ── Step 1: Chọn cách khởi tạo ── */}
          {step === 1 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card
                  hoverable
                  className={khoiTaoCach === 'new' ? 'border border-blue-500' : ''}
                  onClick={() => { setKhoiTaoCach('new'); setStep(2); }}
                  title="Cách 1: Tạo ý tưởng mới"
                >
                  Bắt đầu từ form trống, nhập đầy đủ thông tin cho ý tưởng mới.
                </Card>
                <Card
                  hoverable
                  className={khoiTaoCach === 'template' ? 'border border-blue-500' : ''}
                  onClick={() => { setKhoiTaoCach('template'); setStep(2); }}
                  title="Cách 2: Tạo từ mẫu có sẵn"
                >
                  Chọn một mẫu ý tưởng có sẵn, hệ thống nạp sẵn bộ khung nội dung.
                </Card>
                <Tooltip
                  title={canImport ? '' : 'Chỉ người có quyền Quản lý hoặc Quản trị mới được Import hàng loạt bằng Excel.'}
                >
                  <Card
                    hoverable={canImport}
                    className={`${khoiTaoCach === 'import' ? 'border border-green-500' : ''} ${!canImport ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => { if (canImport) { setKhoiTaoCach('import'); setStep(2); } }}
                    title="Cách 3: Import hàng loạt"
                  >
                    Import ý tưởng hàng loạt qua file Excel, CSV, API, hoặc tích hợp hệ thống khác.
                    {!canImport && (
                      <div className="text-orange-500 text-xs mt-2">
                        <i className="fa-solid fa-lock mr-1" />Yêu cầu quyền Quản lý/Quản trị
                      </div>
                    )}
                  </Card>
                </Tooltip>
              </div>
            </div>
          )}

          {/* ── Step 2: Import ── */}
          {step === 2 && khoiTaoCach === 'import' && canImport && (
            <ImportHangLoatForm
              onBack={() => { setStep(1); setKhoiTaoCach(null); }}
              onSubmit={(records) => {
                setTicketCode(`YT-${dayjs().format('YYMMDDHHmmss')}`);
                message.success(`Đã gửi thành công ${records.length} ý tưởng!`);
                setStep(4);
              }}
            />
          )}

          {/* ── Step 2: Form nhập thông tin ── */}
          {step === 2 && khoiTaoCach !== 'import' && (
            <Form layout="vertical" form={form}>
              {/* Mẫu (chỉ hiện khi chọn template) */}
              {isTemplate && (
                <Form.Item
                  label="Mẫu ý tưởng"
                  name="templateId"
                  rules={[{ required: true, message: 'Vui lòng chọn mẫu ý tưởng.' }]}
                >
                  {loadingTemplates ? (
                    <Spin size="small" />
                  ) : (
                    <Select
                      placeholder="Chọn mẫu ý tưởng"
                      options={templates.map(t => ({ label: t.name, value: t.id }))}
                      notFoundContent="Không có mẫu nào"
                    />
                  )}
                </Form.Item>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldShow('tenYTuong') && (
                  <Form.Item
                    label="Tên ý tưởng"
                    name="tenYTuong"
                    rules={fieldRules('tenYTuong', true, 'Vui lòng nhập tên ý tưởng.')}
                  >
                    <Input placeholder={fieldPh('tenYTuong', 'Nhập tên ý tưởng')} maxLength={fieldMax('tenYTuong')} />
                  </Form.Item>
                )}

                {fieldShow('linhVuc') && (
                  <Form.Item
                    label="Lĩnh vực"
                    name="linhVuc"
                    rules={fieldRules('linhVuc', true, 'Vui lòng nhập lĩnh vực.')}
                  >
                    <AutoComplete
                      options={LINH_VUC_OPTIONS}
                      placeholder={fieldPh('linhVuc', 'Chọn hoặc nhập lĩnh vực')}
                      filterOption={(input, option) =>
                        (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                      allowClear
                    />
                  </Form.Item>
                )}
              </div>

              {fieldShow('moTaVanDe') && (
                <Form.Item
                  label="Mô tả hiện trạng / vấn đề"
                  name="moTaVanDe"
                  rules={fieldRules('moTaVanDe', true, 'Vui lòng nhập mô tả hiện trạng.')}
                >
                  <Input.TextArea rows={4} placeholder={fieldPh('moTaVanDe', 'Mô tả vấn đề cần giải quyết')} maxLength={fieldMax('moTaVanDe')} />
                </Form.Item>
              )}

              {fieldShow('noiDungDeXuat') && (
                <Form.Item
                  label="Nội dung ý tưởng đề xuất"
                  name="noiDungDeXuat"
                  rules={fieldRules('noiDungDeXuat', true, 'Vui lòng nhập nội dung đề xuất.')}
                >
                  <Input.TextArea rows={4} placeholder={fieldPh('noiDungDeXuat', 'Mô tả giải pháp / ý tưởng đề xuất')} maxLength={fieldMax('noiDungDeXuat')} />
                </Form.Item>
              )}

              {fieldShow('mucTieu') && (
                <Form.Item
                  label="Mục tiêu và giá trị kỳ vọng"
                  name="mucTieu"
                  rules={fieldRules('mucTieu', true, 'Vui lòng nhập mục tiêu kỳ vọng.')}
                >
                  <Input.TextArea rows={3} placeholder={fieldPh('mucTieu', 'Mô tả kết quả mong đợi')} maxLength={fieldMax('mucTieu')} />
                </Form.Item>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldShow('nguoiDeXuat') && (
                  <Form.Item
                    label="Người đề xuất"
                    name="nguoiDeXuat"
                    initialValue={currentUser?.fullName || ''}
                    rules={fieldRules('nguoiDeXuat', true, 'Vui lòng nhập người đề xuất.')}
                  >
                    <Input placeholder={fieldPh('nguoiDeXuat', 'Họ tên người đề xuất')} maxLength={fieldMax('nguoiDeXuat')} />
                  </Form.Item>
                )}

                {fieldShow('donViCongTac') && (
                  <Form.Item
                    label="Đơn vị công tác"
                    name="donViCongTac"
                    initialValue={currentUser?.businessName || currentUser?.organizationUnitCode || ''}
                    rules={fieldRules('donViCongTac', true, 'Vui lòng nhập đơn vị công tác.')}
                  >
                    <Input placeholder={fieldPh('donViCongTac', 'Đơn vị / phòng ban công tác')} maxLength={fieldMax('donViCongTac')} />
                  </Form.Item>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fieldShow('phamViApDung') && (
                  <Form.Item label="Phạm vi áp dụng" name="phamViApDung"
                    rules={fieldRules('phamViApDung', false, 'Vui lòng nhập phạm vi áp dụng.')}>
                    <Input placeholder={fieldPh('phamViApDung', 'Đơn vị / phòng ban áp dụng')} maxLength={fieldMax('phamViApDung')} />
                  </Form.Item>
                )}

                <Form.Item label="Thời gian áp dụng dự kiến" name="thoiGianApDung">
                  <DatePicker className="w-full" placeholder="Chọn thời gian" />
                </Form.Item>
              </div>

              {fieldShow('loiIch') && (
                <Form.Item label="Lợi ích dự kiến (định tính / định lượng)" name="loiIchDuKien"
                  rules={fieldRules('loiIch', false, 'Vui lòng nhập lợi ích dự kiến.')}>
                  <Input.TextArea rows={3} placeholder={fieldPh('loiIch', 'Mô tả lợi ích dự kiến')} maxLength={fieldMax('loiIch')} />
                </Form.Item>
              )}

              {/* Đính kèm + Người tiếp nhận */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                {fieldShow('fileDinhKem') && (
                <div>
                  <h4 className="font-semibold mb-3">
                    📎 Đính kèm tài liệu hỗ trợ
                    {fieldCfgs['fileDinhKem']?.isRequired && <span className="text-red-500 ms-1">*</span>}
                  </h4>
                  <Upload
                    maxCount={5}
                    fileList={fileList}
                    onChange={(info) => {
                      setFileList(info.fileList);
                      setUploadedAttachments([]); // reset khi có file mới
                    }}
                    beforeUpload={() => false}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  >
                    <Button>Chọn tập tin</Button>
                  </Upload>
                  <p className="text-sm text-gray-500 mt-2">Tối đa 5 tập tin (PDF, Word, Excel, Ảnh)</p>
                </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3">👤 Cán bộ tiếp nhận</h4>
                  <Form.Item
                    name="receiverId"
                    rules={[{ required: true, message: 'Vui lòng chọn cán bộ tiếp nhận!' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <UserSelect
                      placeholder="Tìm và chọn cán bộ tiếp nhận"
                      onChange={(val: any) => {
                        if (val?.label) setReceiverName(val.label);
                        form.setFieldValue('receiverId', val?.value ?? val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>

              <Space>
                {!editMode && <Button onClick={() => setStep(1)}>Quay lại</Button>}
                {editMode && (
                  <Button onClick={() => window.history.back()}>
                    <i className="fa-regular fa-arrow-left me-2" />Quay lại danh sách
                  </Button>
                )}
                <Button
                  onClick={saveDraft}
                  style={{ backgroundColor: '#13c2c2', borderColor: '#13c2c2', color: 'white' }}
                >
                  <i className="fa-regular fa-floppy-disk me-2" />
                  {editMode ? 'Lưu thay đổi' : 'Lưu nháp'}
                </Button>
                <Button type="primary" onClick={handlePreview}>
                  Xem trước
                </Button>
              </Space>

              {draftData && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-600 flex items-center justify-between gap-3">
                  <span>💾 Đã khôi phục bản nháp — lưu lần cuối: <strong>{draftData.timestamp}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      const { ideaId: _id, timestamp: _ts, thoiGianApDung, ...rest } = draftData as any;
                      form.setFieldsValue({
                        ...rest,
                        thoiGianApDung: thoiGianApDung ? dayjs(thoiGianApDung) : undefined,
                      });
                      message.success('Đã khôi phục dữ liệu từ bản nháp!');
                    }}
                    className="text-blue-600 underline font-medium whitespace-nowrap text-xs"
                  >
                    Khôi phục lại
                  </button>
                </div>
              )}
            </Form>
          )}

          {/* ── Step 3: Xem trước ── */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Bước 3: Xem trước trước khi nộp</h3>

              <div className="bg-white p-6 rounded border border-gray-200 mb-6">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Tên ý tưởng">{previewData?.tenYTuong}</Descriptions.Item>
                  <Descriptions.Item label="Lĩnh vực">{previewData?.linhVuc}</Descriptions.Item>
                  <Descriptions.Item label="Mô tả hiện trạng">
                    <div className="whitespace-pre-wrap">{previewData?.moTaVanDe}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nội dung đề xuất">
                    <div className="whitespace-pre-wrap">{previewData?.noiDungDeXuat}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mục tiêu">
                    <div className="whitespace-pre-wrap">{previewData?.mucTieu}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Người đề xuất">{previewData?.nguoiDeXuat || currentUser?.fullName}</Descriptions.Item>
                  <Descriptions.Item label="Đơn vị">{previewData?.donViCongTac}</Descriptions.Item>
                  <Descriptions.Item label="Phạm vi áp dụng">{previewData?.phamViApDung || '—'}</Descriptions.Item>
                  <Descriptions.Item label="Thời gian áp dụng">
                    {previewData?.thoiGianApDung ? dayjs(previewData.thoiGianApDung).format('DD/MM/YYYY') : '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lợi ích dự kiến">
                    <div className="whitespace-pre-wrap">{previewData?.loiIchDuKien || '—'}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tập tin đính kèm">
                    {fileList.length > 0
                      ? fileList.map(f => <div key={f.uid} className="text-blue-600">📄 {f.name}</div>)
                      : <span className="text-gray-400">Không có</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cán bộ tiếp nhận">
                    {receiverName || (previewData?.receiverId ? 'Đã chọn' : <span className="text-gray-400">—</span>)}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <div className="p-4 bg-yellow-50 rounded border border-yellow-200 mb-6">
                <p className="text-sm text-yellow-800">⚠️ <strong>Lưu ý:</strong> Sau khi nộp, bạn không thể chỉnh sửa ý tưởng. Vui lòng kiểm tra kỹ trước khi nộp!</p>
              </div>

              {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Đang tải file lên...</p>
                  <Progress percent={uploadProgress} size="small" />
                </div>
              )}

              <Space>
                <Button onClick={() => setStep(2)} disabled={submitting}>Quay lại</Button>
                <Button
                  type="primary"
                  danger
                  loading={submitting}
                  onClick={onFinish}
                >
                  <i className="fa-regular fa-paper-plane me-2"></i>
                  Nộp ý tưởng
                </Button>
              </Space>
            </div>
          )}

          {/* ── Step 4: Hoàn thành ── */}
          {step === 4 && (
            <div className="text-center py-10">
              <i className="fa-solid fa-circle-check text-6xl text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold text-[#18191c] mb-2">Gửi ý tưởng thành công!</h3>
              <p className="text-gray-600 mb-1">
                Mã hồ sơ: <span className="font-bold text-[#18191c]">{ticketCode}</span>
              </p>
              {createdIdeaId && (
                <p className="text-xs text-gray-400 mb-4">ID: {createdIdeaId}</p>
              )}

              <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 max-w-md mx-auto text-left">
                <p className="text-sm text-green-800 mb-1">✅ Ý tưởng đã được ghi nhận và chuyển cho cán bộ tiếp nhận.</p>
                <p className="text-sm text-green-700">Cán bộ quản lý sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
              </div>

              <Space>
                <Button onClick={resetForm}>Tạo ý tưởng mới</Button>
                <Link to="/doi-moi/tra-cuu">
                  <Button>Tra cứu hồ sơ</Button>
                </Link>
                <Link to="/doi-moi/trang-chu">
                  <Button type="primary">Về trang chủ</Button>
                </Link>
              </Space>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
