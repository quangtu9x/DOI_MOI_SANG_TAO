import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Steps, message, Alert, Descriptions, Modal, Upload, Select, Table, Space, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, CloudUploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Content } from '@/_metronic/layout/components/content';

const { TextArea } = Input;

interface IGiaiPhapDraft {
  tenGiaiPhap: string;
  linhVuc: string;
  moTa: string;
  noiDungGiaiPhap: string;
  laiSuatKyVong: number;
  chiPhiApDung: number;
  thoiGianThucHien: number;
  nhanLucCanThiet: string;
  dinhKyReview?: string;
  files: any[];
}

const FIELDS = [
  'Công nghệ thông tin',
  'Công nghệ blockchain',
  'Trí tuệ nhân tạo',
  'Cải cách hành chính',
  'Phát triển mobile',
  'IoT',
  'Cloud Computing',
  'Bảo mật',
];

export const NopGiaiPhapPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<IGiaiPhapDraft>({
    tenGiaiPhap: '',
    linhVuc: '',
    moTa: '',
    noiDungGiaiPhap: '',
    laiSuatKyVong: 0,
    chiPhiApDung: 0,
    thoiGianThucHien: 0,
    nhanLucCanThiet: '',
    dinhKyReview: '',
    files: [],
  });
  const [previewData, setPreviewData] = useState<IGiaiPhapDraft | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [ticketCode, setTicketCode] = useState('');
  const [form] = Form.useForm();

  const saveDraft = () => {
    const formValues = form.getFieldsValue();
    if (!formValues.tenGiaiPhap || !formValues.linhVuc || !formValues.moTa) {
      message.error('Vui lòng điền các trường bắt buộc!');
      return;
    }
    const draftData = {
      ...formValues,
      timestamp: dayjs().format('HH:mm:ss DD/MM/YYYY'),
    };
    localStorage.setItem('giaiPhap_draft', JSON.stringify(draftData));
    message.success(`Giải pháp được lưu lúc ${draftData.timestamp}`);
  };

  const handlePreview = () => {
    const formValues = form.getFieldsValue();
    if (!formValues.tenGiaiPhap || !formValues.linhVuc) {
      message.error('Vui lòng điền các trường bắt buộc!');
      return;
    }
    setPreviewData({ ...formData, ...formValues });
    setStep(3);
  };

  const handleSubmit = () => {
    setTicketCode(`GP-${dayjs().format('YYMMDDHHmmss')}`);
    localStorage.removeItem('giaiPhap_draft');
    setStep(4);
  };

  const steps = [
    { title: 'Thông tin giải pháp', description: 'Nhập chi tiết' },
    { title: 'Tập tin đính kèm', description: 'Upload tài liệu' },
    { title: 'Xem trước', description: 'Kiểm tra' },
    { title: 'Thành công', description: 'Hoàn tất' },
  ];

  // Step 1: Thông tin giải pháp
  if (step === 1) {
    return (
      <Content>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Nộp Giải Pháp Mới</h3>
            <Steps current={step - 1} items={steps} className="mt-4" />
          </div>
          <div className="card-body">
            <Form form={form} layout="vertical" autoComplete="off">
              <Form.Item
                label="Tên giải pháp"
                name="tenGiaiPhap"
                rules={[{ required: true, message: 'Vui lòng nhập tên giải pháp' }]}
              >
                <Input placeholder="VD: Blockchain cho cấp phép điện tử" />
              </Form.Item>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    label="Lĩnh vực"
                    name="linhVuc"
                    rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực' }]}
                  >
                    <Select placeholder="Chọn lĩnh vực" options={FIELDS.map(f => ({ label: f, value: f }))} />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    label="Lợi suất kỳ vọng (%)"
                    name="laiSuatKyVong"
                    rules={[{ required: true, message: 'Vui lòng nhập lợi suất' }]}
                  >
                    <InputNumber min={0} max={100} placeholder="75" />
                  </Form.Item>
                </div>
              </div>

              <Form.Item
                label="Mô tả giải pháp"
                name="moTa"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <TextArea rows={3} placeholder="Mô tả tóm tắt về giải pháp" />
              </Form.Item>

              <Form.Item
                label="Nội dung chi tiết giải pháp"
                name="noiDungGiaiPhap"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <TextArea rows={4} placeholder="Mô tả chi tiết cách thực hiện giải pháp" />
              </Form.Item>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    label="Chi phí áp dụng (VNĐ)"
                    name="chiPhiApDung"
                    rules={[{ required: true }]}
                  >
                    <InputNumber placeholder="0" formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    label="Thời gian thực hiện (tháng)"
                    name="thoiGianThucHien"
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={0} placeholder="6" />
                  </Form.Item>
                </div>
              </div>

              <Form.Item
                label="Nhân lực cần thiết"
                name="nhanLucCanThiet"
                rules={[{ required: true }]}
              >
                <TextArea rows={2} placeholder="VD: 2 developer, 1 QA, 1 manager" />
              </Form.Item>

              <Form.Item
                label="Định kỳ review"
                name="dinhKyReview"
              >
                <Input placeholder="VD: Hàng tháng" />
              </Form.Item>

              <Alert
                message="Lưu ý"
                description="Bạn có thể lưu nháp để quay lại sau hoặc tiếp tục nộp ngay bây giờ."
                type="info"
                showIcon
                className="mb-4"
              />

              <div className="d-flex gap-2 justify-content-between">
                <Button type="default" size="large" onClick={saveDraft}>
                  💾 Lưu nháp
                </Button>
                <Button type="primary" size="large" onClick={() => setStep(2)}>
                  Tiếp tục
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Content>
    );
  }

  // Step 2: Tập tin đính kèm
  if (step === 2) {
    return (
      <Content>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Đính kèm Tài liệu</h3>
            <Steps current={step - 1} items={steps} className="mt-4" />
          </div>
          <div className="card-body">
            <Alert
              message="Tải lên các tài liệu hỗ trợ cho giải pháp"
              description="Cho phép: PDF, Word, Excel, PowerPoint. Tối đa 3 tập tin, mỗi file tối đa 10MB"
              type="info"
              showIcon
              className="mb-4"
            />

            <div className="border rounded p-4 text-center bg-light">
              <CloudUploadOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <p className="mb-2">Kéo thả hoặc nhấp để chọn tập tin</p>
              <Button type="primary">Chọn tập tin</Button>
            </div>

            {formData.files.length > 0 && (
              <div className="mt-4">
                <h6 className="mb-3">Tập tin đã chọn:</h6>
                <Table
                  dataSource={formData.files}
                  columns={[
                    { title: 'Tên tập tin', dataIndex: 'name', key: 'name' },
                    { title: 'Kích thước', dataIndex: 'size', key: 'size', render: (size) => `${(size / 1024).toFixed(2)} KB` },
                    {
                      title: 'Thao tác',
                      key: 'action',
                      render: (_, record) => (
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                          Xóa
                        </Button>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="small"
                />
              </div>
            )}

            <div className="p-3 bg-warning-light rounded mt-4">
              <p className="text-sm mb-0">⚠️ Tài liệu là tùy chọn, bạn có thể bỏ qua nếu không có</p>
            </div>

            <div className="d-flex gap-2 justify-content-between mt-4">
              <Button type="default" size="large" onClick={() => setStep(1)}>
                Quay lại
              </Button>
              <Button type="primary" size="large" onClick={handlePreview}>
                Xem trước
              </Button>
            </div>
          </div>
        </div>
      </Content>
    );
  }

  // Step 3: Xem trước
  if (step === 3) {
    return (
      <Content>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Xem Trước Trước Khi Nộp</h3>
            <Steps current={step - 1} items={steps} className="mt-4" />
          </div>
          <div className="card-body">
            <Alert
              message="⚠️ Xin lưu ý"
              description="Sau khi nộp, bạn không thể chỉnh sửa. Vui lòng kiểm tra kỹ tất cả thông tin trước khi nộp."
              type="warning"
              showIcon
              className="mb-4"
            />

            <Descriptions column={1} bordered size="small" className="mb-4">
              <Descriptions.Item label="Tên giải pháp">{previewData?.tenGiaiPhap}</Descriptions.Item>
              <Descriptions.Item label="Lĩnh vực">{previewData?.linhVuc}</Descriptions.Item>
              <Descriptions.Item label="Lợi suất kỳ vọng">{previewData?.laiSuatKyVong}%</Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                <div className="whitespace-pre-wrap">{previewData?.moTa}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung chi tiết">
                <div className="whitespace-pre-wrap">{previewData?.noiDungGiaiPhap}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Chi phí áp dụng">
                {previewData?.chiPhiApDung.toLocaleString('vi-VN')} VNĐ
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian thực hiện">
                {previewData?.thoiGianThucHien} tháng
              </Descriptions.Item>
              <Descriptions.Item label="Nhân lực cần thiết">
                <div className="whitespace-pre-wrap">{previewData?.nhanLucCanThiet}</div>
              </Descriptions.Item>
            </Descriptions>

            <div className="d-flex gap-2 justify-content-between">
              <Button type="default" size="large" onClick={() => setStep(2)}>
                Quay lại
              </Button>
              <Button type="primary" danger size="large" onClick={handleSubmit}>
                ✈️ Nộp Giải Pháp
              </Button>
            </div>
          </div>
        </div>
      </Content>
    );
  }

  // Step 4: Thành công
  if (step === 4) {
    return (
      <Content>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Nộp Giải Pháp Thành Công</h3>
            <Steps current={step - 1} items={steps} className="mt-4" />
          </div>
          <div className="card-body text-center">
            <div className="p-6 bg-success-light rounded mb-4">
              <h2 className="text-success mb-2">✅ Giải Pháp Được Nộp Thành Công!</h2>
              <p className="text-muted mb-0">Mã theo dõi của bạn là:</p>
            </div>

            <div className="p-4 bg-light rounded mb-4">
              <h3 className="font-monospace text-header-td">{ticketCode}</h3>
              <p className="text-muted small">Lưu mã này để theo dõi tiến độ</p>
            </div>

            <div className="alert alert-success mb-4">
              <p className="mb-0">
                Giải pháp của bạn đã được gửi cho quản lý để xem xét. Bạn sẽ nhận được thông báo khi có cập nhật.
              </p>
            </div>

            <div className="d-flex gap-2 justify-content-center">
              <Button type="primary" size="large" onClick={() => {
                setStep(1);
                form.resetFields();
                setFormData({
                  tenGiaiPhap: '',
                  linhVuc: '',
                  moTa: '',
                  noiDungGiaiPhap: '',
                  laiSuatKyVong: 0,
                  chiPhiApDung: 0,
                  thoiGianThucHien: 0,
                  nhanLucCanThiet: '',
                  dinhKyReview: '',
                  files: [],
                });
              }}>
                + Nộp Giải Pháp Mới
              </Button>
              <Button type="default" size="large">
                🏠 Quay Về Trang Chủ
              </Button>
            </div>
          </div>
        </div>
      </Content>
    );
  }

  return null;
};
