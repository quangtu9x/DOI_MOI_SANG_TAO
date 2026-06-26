import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Space, Tag, message, Upload, Modal, Descriptions, Collapse, DatePicker } from 'antd';
import { useAuth } from '@/app/modules/auth';
import dayjs from 'dayjs';
import type { UploadFile } from 'antd/es/upload/interface';
import { ImportHangLoatForm } from './components/import-y-tuong/ImportHangLoatForm';

type KhoiTaoCach = 'new' | 'template' | 'import';

const MOCK_TEMPLATES = [
  { id: 'tpl-1', name: 'Mẫu cải tiến quy trình nội bộ' },
  { id: 'tpl-2', name: 'Mẫu ứng dụng số hóa nghiệp vụ' },
  { id: 'tpl-3', name: 'Mẫu tối ưu hóa chi phí vận hành' },
];

export const NopYTuongPage = () => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [form] = Form.useForm();
  const [khoiTaoCach, setKhoiTaoCach] = useState<KhoiTaoCach | null>(null);
  const [ticketCode, setTicketCode] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, any> | null>(null);
  const [draftData, setDraftData] = useState<Record<string, any> | null>(null);

  const isTemplate = useMemo(() => khoiTaoCach === 'template', [khoiTaoCach]);
  const [searchParams] = useSearchParams();

  // Auto-detect import mode from URL param ?mode=import
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'import') {
      setKhoiTaoCach('import');
      setStep(2);
    }
  }, [searchParams]);

  // Load draft data if available
  useEffect(() => {
    const saved = localStorage.getItem('yTuongDraft');
    if (saved) {
      try {
        setDraftData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  const onStart = () => {
    if (!khoiTaoCach) {
      message.warning('Vui lòng chọn cách khởi tạo ý tưởng.');
      return;
    }

    setStep(2);
  };

  const saveDraft = () => {
    form.validateFields().then((values) => {
      const draft = {
        ...values,
        timestamp: dayjs().format('DD/MM/YYYY HH:mm:ss')
      };
      localStorage.setItem('yTuongDraft', JSON.stringify(draft));
      message.success('Đã lưu nháp ý tưởng thành công!');
      setDraftData(draft);
    }).catch(() => {
      message.error('Vui lòng kiểm tra lại thông tin trước khi lưu nháp!');
    });
  };

  const handlePreview = () => {
    form.validateFields().then((values) => {
      setPreviewData({
        ...values,
        attachments: fileList.length,
      });
      setStep(4);
    }).catch(() => {
      message.error('Vui lòng kiểm tra lại thông tin trước khi xem trước!');
    });
  };

  const onFinish = (values: Record<string, string>) => {
    const generatedTicket = `YT-${dayjs().format('YYMMDDHHmmss')}`;
    setTicketCode(generatedTicket);

    const selectedTemplateName = MOCK_TEMPLATES.find(x => x.id === values.templateId)?.name;

    message.success(
      selectedTemplateName
        ? `Đã khởi tạo ý tưởng từ mẫu: ${selectedTemplateName}`
        : 'Đã khởi tạo ý tưởng mới thành công.'
    );

    // Clear draft
    localStorage.removeItem('yTuongDraft');
    setDraftData(null);
    form.resetFields();
    setFileList([]);
    setStep(5);
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

  return (
    <div className="bg-[#f7f8fa] min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 w-full">
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-2xs border border-gray-100">
          <h1 className="text-2xl lg:text-3xl font-medium text-[#18191c] mb-2">Khởi tạo ý tưởng</h1>
          <p className="text-gray-500 mb-8">Khởi tạo ý tưởng mới hoặc import hàng loạt từ file Excel/CSV/API.</p>

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

          {step === 1 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card
                  hoverable
                  className={khoiTaoCach === 'new' ? 'border border-blue-500' : ''}
                  onClick={() => setKhoiTaoCach('new')}
                  title="Cách 1: Tạo ý tưởng mới"
                >
                  Bắt đầu từ form trống, nhập đầy đủ thông tin cho ý tưởng mới.
                </Card>
                <Card
                  hoverable
                  className={khoiTaoCach === 'template' ? 'border border-blue-500' : ''}
                  onClick={() => setKhoiTaoCach('template')}
                  title="Cách 2: Tạo từ mẫu có sẵn"
                >
                  Chọn một mẫu ý tưởng có sẵn, hệ thống nạp sẵn bộ khung nội dung.
                </Card>
                <Card
                  hoverable
                  className={khoiTaoCach === 'import' ? 'border border-green-500' : ''}
                  onClick={() => {
                    setKhoiTaoCach('import');
                    setStep(2);
                  }}
                  title="Cách 3: Import hàng loạt"
                >
                  Import ý tưởng hàng loạt qua file Excel, CSV, API, hoặc tích hợp hệ thống khác.
                </Card>
              </div>

              <Button type="primary" size="large" onClick={onStart}>
                Tiếp tục
              </Button>
            </div>
          )}

          {step === 2 && khoiTaoCach === 'import' && (
            <ImportHangLoatForm
              onBack={() => {
                setStep(1);
                setKhoiTaoCach(null);
              }}
              onSubmit={(records) => {
                const generatedTicket = `YT-${dayjs().format('YYMMDDHHmmss')}`;
                setTicketCode(generatedTicket);
                message.success(`Đã gửi thành công ${records.length} ý tưởng!`);
                setStep(5);
              }}
            />
          )}

          {step === 2 && khoiTaoCach !== 'import' && (
            <Form layout="vertical" form={form} onFinish={onFinish}>
              {isTemplate && (
                <Form.Item
                  label="Mẫu ý tưởng"
                  name="templateId"
                  rules={[{ required: true, message: 'Vui lòng chọn mẫu ý tưởng.' }]}
                >
                  <Select
                    placeholder="Chọn mẫu ý tưởng"
                    options={MOCK_TEMPLATES.map(item => ({ label: item.name, value: item.id }))}
                  />
                </Form.Item>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Tên ý tưởng"
                  name="tenYTuong"
                  rules={[{ required: true, message: 'Vui lòng nhập tên ý tưởng.' }]}
                >
                  <Input placeholder="Nhập tên ý tưởng" />
                </Form.Item>

                <Form.Item
                  label="Lĩnh vực"
                  name="linhVuc"
                  rules={[{ required: true, message: 'Vui lòng nhập lĩnh vực.' }]}
                >
                  <Input placeholder="VD: Chuyển đổi số, cải cách hành chính" />
                </Form.Item>
              </div>

              <Form.Item
                label="Mô tả hiện trạng/vấn đề"
                name="moTaVanDe"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả hiện trạng.' }]}
              >
                <Input.TextArea rows={4} placeholder="Mô tả vấn đề cần giải quyết" />
              </Form.Item>

              <Form.Item
                label="Nội dung ý tưởng đề xuất"
                name="noiDungDeXuat"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung đề xuất.' }]}
              >
                <Input.TextArea rows={4} placeholder="Mô tả giải pháp/ý tưởng đề xuất" />
              </Form.Item>

              <Form.Item
                label="Mục tiêu và giá trị kỳ vọng"
                name="mucTieu"
                rules={[{ required: true, message: 'Vui lòng nhập mục tiêu kỳ vọng.' }]}
              >
                <Input.TextArea rows={3} placeholder="Mô tả kết quả mong đợi" />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Người đề xuất"
                  name="nguoiDeXuat"
                  rules={[{ required: true, message: 'Vui lòng nhập người đề xuất.' }]}
                  initialValue={currentUser?.fullName || ''}
                >
                  <Input placeholder="Họ tên người đề xuất" />
                </Form.Item>

                <Form.Item
                  label="Đơn vị công tác"
                  name="donViCongTac"
                  rules={[{ required: true, message: 'Vui lòng nhập đơn vị công tác.' }]}
                  initialValue={currentUser?.businessName || currentUser?.organizationUnitCode || ''}
                >
                  <Input placeholder="Đơn vị/phòng ban công tác" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Phạm vi áp dụng"
                  name="phamViApDung"
                >
                  <Input placeholder="Đơn vị/phòng ban áp dụng" />
                </Form.Item>

                <Form.Item
                  label="Thời gian áp dụng dự kiến"
                  name="thoiGianApDung"
                >
                  <DatePicker className="w-full" placeholder="Chọn thời gian" />
                </Form.Item>
              </div>

              <Form.Item
                label="Lợi ích dự kiến (định tính/định lượng)"
                name="loiIchDuKien"
              >
                <Input.TextArea rows={3} placeholder="Mô tả lợi ích dự kiến về mặt định tính và định lượng" />
              </Form.Item>

              <Space>
                <Button onClick={() => setStep(1)}>Quay lại</Button>
                <Button onClick={saveDraft} style={{ backgroundColor: '#13c2c2', borderColor: '#13c2c2', color: 'white' }}>
                  <i className="fa-regular fa-floppy-disk me-2"></i>
                  Lưu nháp
                </Button>
                <Button type="primary" onClick={() => setStep(3)}>
                  Tiếp tục
                </Button>
              </Space>

              {draftData && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-gray-600">💾 Đã lưu nháp lần cuối vào: <strong>{draftData.timestamp}</strong></p>
                </div>
              )}
            </Form>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Bước 3: Đính kèm tài liệu và chọn người tiếp nhận</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">📎 Đính kèm tài liệu hỗ trợ</h4>
                  <Upload
                    maxCount={3}
                    fileList={fileList}
                    onChange={(info) => setFileList(info.fileList)}
                    beforeUpload={() => false}
                  >
                    <Button>Chọn tập tin</Button>
                  </Upload>
                  <p className="text-sm text-gray-500 mt-2">Tối đa 3 tập tin (PDF, Word, Excel)</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">👤 Chọn cán bộ tiếp nhận</h4>
                  <Form form={form} layout="vertical">
                    <Form.Item
                      label="Cán bộ quản lý tiếp nhận"
                      name="canBoQuanLy"
                      rules={[{ required: true, message: 'Vui lòng chọn cán bộ!' }]}
                    >
                      <Select
                        placeholder="Chọn cán bộ"
                        options={[
                          { label: 'Nguyễn Văn A - Phòng Đổi mới', value: 'nva' },
                          { label: 'Trần Thị B - Phòng Kỹ thuật', value: 'ttb' },
                          { label: 'Lê Văn C - Phòng Tổ chức', value: 'lvc' },
                        ]}
                      />
                    </Form.Item>
                  </Form>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm mb-2"><strong>📋 Tóm tắt thông tin:</strong></p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>✓ Tên ý tưởng: <strong>{form.getFieldValue('tenYTuong')}</strong></p>
                  <p>✓ Lĩnh vực: <strong>{form.getFieldValue('linhVuc')}</strong></p>
                  <p>✓ Tập tin đính kèm: <strong>{fileList.length}</strong></p>
                </div>
              </div>

              <Space className="mt-6">
                <Button onClick={() => setStep(2)}>Quay lại</Button>
                <Button onClick={handlePreview} type="primary">
                  Xem trước
                </Button>
              </Space>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Bước 4: Xem trước trước khi nộp</h3>
              
              <div className="bg-white p-6 rounded border border-gray-200 mb-6">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Tên ý tưởng">
                    {previewData?.tenYTuong}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lĩnh vực">
                    {previewData?.linhVuc}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả hiện trạng/vấn đề">
                    <div className="whitespace-pre-wrap">{previewData?.moTaVanDe}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nội dung ý tưởng đề xuất">
                    <div className="whitespace-pre-wrap">{previewData?.noiDungDeXuat}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mục tiêu và giá trị kỳ vọng">
                    <div className="whitespace-pre-wrap">{previewData?.mucTieu}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Người đề xuất">
                    {previewData?.nguoiDeXuat || currentUser?.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Đơn vị công tác">
                    {previewData?.donViCongTac || currentUser?.businessName || currentUser?.organizationUnitCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phạm vi áp dụng">
                    {previewData?.phamViApDung || 'Chưa nhập'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian áp dụng dự kiến">
                    {previewData?.thoiGianApDung ? dayjs(previewData.thoiGianApDung).format('DD/MM/YYYY') : 'Chưa chọn'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lợi ích dự kiến">
                    <div className="whitespace-pre-wrap">{previewData?.loiIchDuKien || 'Chưa nhập'}</div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tập tin đính kèm">
                    {previewData?.attachments > 0 ? (
                      <div>
                        {fileList.map((file) => (
                          <div key={file.uid} className="text-blue-600">📄 {file.name}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Không có tập tin</span>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cán bộ tiếp nhận">
                    {form.getFieldValue('canBoQuanLy') ? 'Đã chọn' : 'Chưa chọn'}
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <div className="p-4 bg-yellow-50 rounded border border-yellow-200 mb-6">
                <p className="text-sm text-yellow-800">⚠️ <strong>Lưu ý:</strong> Sau khi nộp, bạn không thể chỉnh sửa ý tưởng. Vui lòng kiểm tra kỹ trước khi nộp!</p>
              </div>

              <Space>
                <Button onClick={() => setStep(3)}>Quay lại</Button>
                <Button type="primary" danger onClick={() => onFinish(form.getFieldsValue())}>
                  <i className="fa-regular fa-paper-plane me-2"></i>
                  Nộp ý tưởng
                </Button>
              </Space>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-10">
              <i className="fa-solid fa-circle-check text-6xl text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold text-[#18191c] mb-2">Khởi tạo ý tưởng thành công</h3>
              <p className="text-gray-600 mb-4">Mã hồ sơ tạm: <span className="font-bold text-[#18191c]">{ticketCode}</span></p>
              
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-6 text-left">
                <p className="text-sm text-green-800 mb-2">✅ Ý tưởng của bạn đã được ghi nhận thành công!</p>
                <p className="text-sm text-green-700">Cán bộ quản lý sẽ liên hệ với bạn trong 24 giờ tới.</p>
              </div>

              <Space>
                <Button onClick={() => {
                  setStep(1);
                  setKhoiTaoCach(null);
                  form.resetFields();
                  setFileList([]);
                  setPreviewData(null);}}>Tạo ý tưởng mới</Button>
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
