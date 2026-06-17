import { useEffect, useState } from 'react';
import { Form, Input, Spin } from 'antd';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { IHoSoSangKien, IResult } from '@/models';
import { requestGET, requestPUT } from '@/utils/baseAPI';

type Props = {
  record: IHoSoSangKien | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type NhanXetFormValues = Pick<
  IHoSoSangKien,
  'nhanXetTinhMoi' | 'nhanXetNoiDungGiaiPhap' | 'nhanXetKetQua' | 'nhanXetKhaNangApDung' | 'nhanXetLoiIch'
>;

export const NhanXetHoSoModal = ({ record, visible, onClose, onSuccess }: Props) => {
  const [form] = Form.useForm<NhanXetFormValues>();
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!visible || !record?.id) return;

      try {
        setLoading(true);
        const response = await requestGET<IResult<IHoSoSangKien>>(`HoSoSangKiens/${record.id}`);
        const data = response?.data?.data ?? record;

        form.setFieldsValue({
          nhanXetTinhMoi: data.nhanXetTinhMoi ?? '',
          nhanXetNoiDungGiaiPhap: data.nhanXetNoiDungGiaiPhap ?? '',
          nhanXetKetQua: data.nhanXetKetQua ?? '',
          nhanXetKhaNangApDung: data.nhanXetKhaNangApDung ?? '',
          nhanXetLoiIch: data.nhanXetLoiIch ?? '',
        });
      } catch (error) {
        console.error('Error fetching dossier comments:', error);
        toast.error('Không thể tải nhận xét. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [form, record, visible]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    if (!record?.id) return;

    try {
      setButtonLoading(true);
      const values = await form.validateFields();
      const response = await requestPUT<IResult<string>>(`HoSoSangKiens/nhan-xet/${record.id}`, {
        id: record.id,
        ...values,
      });

      if (response?.status === 200 && response?.data?.succeeded !== false) {
        toast.success('Cập nhật nhận xét thành công!');
        form.resetFields();
        onSuccess();
      } else {
        toast.error(response?.data?.message || 'Cập nhật nhận xét thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error submitting dossier comments:', error);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Modal show={visible} size="lg" centered scrollable keyboard onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Nhận xét hồ sơ sáng kiến</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          <Form<NhanXetFormValues> form={form} layout="vertical" autoComplete="off">
            <Form.Item label="Tính mới" name="nhanXetTinhMoi">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Nội dung giải pháp" name="nhanXetNoiDungGiaiPhap">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Kết quả" name="nhanXetKetQua">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Khả năng áp dụng" name="nhanXetKhaNangApDung">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Lợi ích" name="nhanXetLoiIch">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2">
        <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={handleSubmit} disabled={buttonLoading || loading}>
          <i className="fa-regular fa-floppy-disk me-1"></i>
          Lưu
        </Button>
        <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel} disabled={buttonLoading}>
          <i className="fa-regular fa-xmark me-1"></i>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
