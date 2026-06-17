import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Form, Input, InputNumber, Spin } from 'antd';
import { toast } from 'react-toastify';
import { requestPOST, requestPUT } from '@/utils/baseAPI';
import { IResult } from '@/models';

interface KeHoachActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'approve' | 'reject';
  id: string;
}

export const KeHoachActionModal: React.FC<KeHoachActionModalProps> = ({ visible, onClose, onSuccess, type, id }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let response;
      if (type === 'approve') {
        response = await requestPUT<IResult<string>>(`kehoachs/phe-duyet/${id}`, {
          id,
          duToanDuocDuyet: values.duToanDuocDuyet,
        });
      } else {
        response = await requestPUT<IResult<string>>(`kehoachs/tu-choi/${id}`, {
          id,
          lyDoTuChoi: values.lyDoTuChoi,
        });
      }

      if (response?.data?.succeeded) {
        toast.success(type === 'approve' ? 'Phê duyệt thành công!' : 'Từ chối thành công!');
        onSuccess();
        onClose();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error handling action:', error);
      // form validation error doesn't need toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={visible} onHide={onClose} centered size="lg">
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">
          {type === 'approve' ? 'Phê duyệt kế hoạch' : 'Từ chối kế hoạch'}
        </Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        <Spin spinning={loading}>
          <Form form={form} layout="vertical">
            {type === 'approve' ? (
              <Form.Item
                label="Dự toán được duyệt (VNĐ)"
                name="duToanDuocDuyet"
                rules={[{ required: true, message: 'Vui lòng nhập dự toán được duyệt!' }]}
              >
                <InputNumber
                  placeholder=""
                  className='input-with-addon'
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value = '') => value.replace(/\$\s?|(,*)/g, "")}
                  style={{ width: "100%" }}
                  addonAfter="VND"
                />
              </Form.Item>
            ) : (
              <Form.Item
                label="Lý do từ chối"
                name="lyDoTuChoi"
                rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            )}
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="px-4 py-3 border-0">
        <Button variant="secondary" className="btn-sm rounded-1 p-2 ms-2" onClick={onClose} disabled={loading}>
          <i className="fa-regular fa-xmark"></i> Đóng
        </Button>
        <Button variant="primary" className="btn-sm rounded-1 p-2 ms-2" onClick={handleOk} disabled={loading}>
          <i className="fa-regular fa-floppy-disk"></i> {type === 'approve' ? 'Phê duyệt' : 'Từ chối'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
