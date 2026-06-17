import { useEffect, useState } from 'react';
import { Form, InputNumber, Spin } from 'antd';
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

type DiemTrungBinhFormValues = {
  diemTrungBinh?: number | null;
};

export const CapNhatDiemTrungBinhModal = ({ record, visible, onClose, onSuccess }: Props) => {
  const [form] = Form.useForm<DiemTrungBinhFormValues>();
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
          diemTrungBinh: data.diemTrungBinh ?? null,
        });
      } catch (error) {
        console.error('Error fetching diem trung binh:', error);
        toast.error('Không thể tải điểm trung bình. Vui lòng thử lại!');
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
      const response = await requestPUT<IResult<string>>(`HoSoSangKiens/diem-trung-binh/${record.id}`, {
        id: record.id,
        diemTrungBinh: values.diemTrungBinh ?? null,
      });

      if (response?.status === 200 && response?.data?.succeeded !== false) {
        toast.success('Cập nhật điểm trung bình thành công!');
        form.resetFields();
        onSuccess();
      } else {
        toast.error(response?.data?.message || 'Cập nhật điểm trung bình thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error submitting diem trung binh:', error);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Modal show={visible} centered keyboard onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Cập nhật điểm trung bình</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading}>
          <div className="mb-3">
            <div className="fw-semibold">{record?.ten}</div>
          </div>
          <Form<DiemTrungBinhFormValues> form={form} layout="vertical" autoComplete="off">
            <Form.Item
              label="Điểm trung bình"
              name="diemTrungBinh"
              rules={[
                { required: true, message: 'Vui lòng nhập điểm trung bình' },
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || (value >= 0 && value <= 100)) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('Điểm trung bình phải nằm trong khoảng 0 - 100'));
                  },
                },
              ]}
            >
              <InputNumber className="w-100" min={0} max={100} step={0.1} precision={1} placeholder="Nhập điểm trung bình" />
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
