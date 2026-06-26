import React, { useState } from 'react';
import { Form, Input, Select, Button, Upload, message, Steps, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';

const { TextArea } = Input;


const LINH_VUC_OPTIONS = [
  { label: 'Cải cách hành chính', value: 'Cải cách hành chính' },
  { label: 'Công nghệ thông tin', value: 'Công nghệ thông tin' },
  { label: 'Chuyển đổi số', value: 'Chuyển đổi số' },
  { label: 'Sở hữu trí tuệ', value: 'Sở hữu trí tuệ' },
  { label: 'Giáo dục', value: 'Giáo dục' },
  { label: 'Nghiên cứu khoa học', value: 'Nghiên cứu khoa học' },
  { label: 'Y tế - Sức khỏe', value: 'Y tế - Sức khỏe' },
  { label: 'Khác', value: 'Khác' },
];

export const TaoYTuongPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    message.success('Đã lưu nháp thành công!');
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setSubmitting(true);
      await new Promise(r => setTimeout(r, 1000));
      setSubmitting(false);
      message.success('Đã nộp ý tưởng để phê duyệt!');
      navigate('/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach');
    } catch {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
    }
  };

  const steps = ['Thông tin cơ bản', 'Nội dung chi tiết', 'Đính kèm & Nộp'];

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Quản lý ý tưởng', path: '/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach', isActive: false, isSeparator: false },
      ]}>
        Tạo ý tưởng mới
      </PageTitle>
      <Content>
        <div className="card">
          <div className="card-header border-0 pt-5">
            <h3 className="card-title fw-bold text-gray-800">Tạo ý tưởng đổi mới sáng tạo</h3>
          </div>
          <div className="card-body">
            {/* Steps indicator */}
            <div className="mb-8">
              <Steps
                current={currentStep}
                size="small"
                items={steps.map(s => ({ title: s }))}
              />
            </div>

            <Form form={form} layout="vertical">
              {/* Step 0: Basic info */}
              {currentStep === 0 && (
                <div>
                  <div className="row">
                    <div className="col-md-8">
                      <Form.Item
                        label="Tên ý tưởng"
                        name="tenYTuong"
                        rules={[{ required: true, message: 'Vui lòng nhập tên ý tưởng' }]}
                      >
                        <Input placeholder="Nhập tên ý tưởng ngắn gọn, rõ ràng..." size="large" />
                      </Form.Item>
                    </div>
                    <div className="col-md-4">
                      <Form.Item
                        label="Lĩnh vực"
                        name="linhVuc"
                        rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực' }]}
                      >
                        <Select options={LINH_VUC_OPTIONS} placeholder="Chọn lĩnh vực" size="large" />
                      </Form.Item>
                    </div>
                  </div>
                  <Form.Item
                    label="Mô tả vấn đề hiện tại"
                    name="moTaVanDe"
                    rules={[{ required: true, message: 'Vui lòng mô tả vấn đề' }]}
                    extra="Mô tả rõ ràng vấn đề, thực trạng hiện tại cần giải quyết"
                  >
                    <TextArea rows={4} placeholder="Mô tả vấn đề, thực trạng hiện tại..." showCount maxLength={1000} />
                  </Form.Item>
                </div>
              )}

              {/* Step 1: Detail */}
              {currentStep === 1 && (
                <div>
                  <Form.Item
                    label="Nội dung ý tưởng / Giải pháp đề xuất"
                    name="noiDungDeXuat"
                    rules={[{ required: true, message: 'Vui lòng mô tả nội dung ý tưởng' }]}
                  >
                    <TextArea rows={5} placeholder="Mô tả chi tiết giải pháp, cách thức thực hiện..." showCount maxLength={2000} />
                  </Form.Item>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item
                        label="Mục tiêu cụ thể"
                        name="mucTieu"
                        rules={[{ required: true, message: 'Vui lòng nêu mục tiêu' }]}
                      >
                        <TextArea rows={3} placeholder="Các mục tiêu cụ thể, có thể đo lường được..." />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Lợi ích dự kiến"
                        name="loiIch"
                      >
                        <TextArea rows={3} placeholder="Lợi ích mang lại cho tổ chức, cộng đồng..." />
                      </Form.Item>
                    </div>
                  </div>
                  <Form.Item label="Ghi chú thêm" name="ghiChu">
                    <TextArea rows={2} placeholder="Các thông tin bổ sung nếu có..." />
                  </Form.Item>
                </div>
              )}

              {/* Step 2: Files & submit */}
              {currentStep === 2 && (
                <div>
                  <div className="mb-6">
                    <label className="form-label fw-semibold">Tài liệu đính kèm</label>
                    <div className="text-muted fs-7 mb-3">
                      Đính kèm tài liệu minh họa, báo cáo, hình ảnh hoặc các file liên quan (PDF, Word, Excel, hình ảnh)
                    </div>
                    <Upload.Dragger
                      multiple
                      fileList={fileList}
                      onChange={({ fileList: fl }) => setFileList(fl)}
                      beforeUpload={() => false}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    >
                      <p className="ant-upload-drag-icon">
                        <i className="fa-regular fa-cloud-upload fs-2x text-primary" />
                      </p>
                      <p className="ant-upload-text">Kéo thả file vào đây hoặc click để chọn</p>
                      <p className="ant-upload-hint">
                        Hỗ trợ PDF, Word, Excel, PNG, JPG. Tối đa 10MB/file.
                      </p>
                    </Upload.Dragger>
                  </div>
                  <Divider />
                  <div className="alert alert-info">
                    <i className="fa-regular fa-circle-info me-2" />
                    Sau khi nộp, ý tưởng sẽ được chuyển sang trạng thái <strong>"Chờ phê duyệt"</strong> và không thể chỉnh sửa. Bạn có thể <strong>Lưu nháp</strong> để tiếp tục chỉnh sửa sau.
                  </div>
                </div>
              )}

              <Divider />
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {currentStep > 0 && (
                    <Button onClick={() => setCurrentStep(s => s - 1)} className="me-2">
                      <i className="fa-regular fa-arrow-left me-1" /> Quay lại
                    </Button>
                  )}
                  <Button onClick={() => navigate('/doi-moi-sang-tao/quan-ly-y-tuong/danh-sach')}>
                    Hủy
                  </Button>
                </div>
                <div>
                  <Button onClick={handleSaveDraft} loading={saving} className="me-2">
                    <i className="fa-regular fa-floppy-disk me-1" /> Lưu nháp
                  </Button>
                  {currentStep < 2 ? (
                    <Button type="primary" onClick={() => setCurrentStep(s => s + 1)}>
                      Tiếp theo <i className="fa-regular fa-arrow-right ms-1 text-white" />
                    </Button>
                  ) : (
                    <Button type="primary" onClick={handleSubmit} loading={submitting}>
                      <i className="fa-regular fa-paper-plane me-1 text-white" /> Nộp phê duyệt
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          </div>
        </div>
      </Content>
    </>
  );
};
