import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Checkbox, InputNumber, Button, Space } from 'antd';
import { toast } from 'react-toastify';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { IEformField, IEformFieldOption, EformFieldType, IResult } from '@/models';
import { requestPOST, requestPUT } from '@/utils/baseAPI';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import * as actionsGlobal from '@/redux/global/Actions';

const { TextArea } = Input;
const { Option } = Select;

interface FieldFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eformId: string;
  editData?: IEformField;
}

export const FieldFormModal: React.FC<FieldFormModalProps> = ({ visible, onClose, eformId, editData }) => {
  const dispatch: AppDispatch = useDispatch();
  const [form] = Form.useForm();
  const [fieldType, setFieldType] = useState<EformFieldType>('text');
  const [showOptions, setShowOptions] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const id = editData?.id ?? null;

  
  useEffect(() => {
    if (visible && editData) {
      // Parse options if exists
      let optionsArray: IEformFieldOption[] = [];
      if (editData.options) {
        try {
          optionsArray = JSON.parse(editData.options);
        } catch (e) {
          console.error('Error parsing options:', e);
        }
      }

      form.setFieldsValue({
        label: editData.label,
        type: editData.type,
        required: editData.required,
        placeholder: editData.placeholder,
        defaultValue: editData.defaultValue,
        isActive: editData.isActive ?? true,
        options: optionsArray,
      });

      setFieldType(editData.type);
      setShowOptions(['select', 'combobox', 'listbox'].includes(editData.type));
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        type: 'text',
        required: false,
        isActive: true,
      });
      setFieldType('text');
      setShowOptions(false);
    }
  }, [visible, editData, form]);

  const handleTypeChange = (value: EformFieldType) => {
    setFieldType(value);
    setShowOptions(['select', 'combobox', 'listbox'].includes(value));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formData: IEformField = {
        ...values,
        ...(id && { id }),
        eformId: eformId,
        options: showOptions ? JSON.stringify(values.options || []) : undefined,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`eformfields/${id}`, formData)
        : await requestPOST<IResult<string>>(`eformfields`, formData);

      if (response?.status == 200) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        onClose();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal title={editData ? 'Chỉnh sửa trường dữ liệu' : 'Thêm trường dữ liệu mới'} open={visible} onCancel={handleClose} width={700} footer={null}>
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item name="label" label="Nhãn trường" rules={[{ required: true, message: 'Vui lòng nhập nhãn trường' }]}>
          <Input placeholder="Ví dụ: Họ và tên, Số điện thoại..." />
        </Form.Item>

        <Form.Item name="type" label="Loại trường" rules={[{ required: true, message: 'Vui lòng chọn loại trường' }]}>
          <Select placeholder="Chọn loại trường" onChange={handleTypeChange}>
            <Option value="text">Ký tự (Text)</Option>
            <Option value="number">Số (Number)</Option>
            <Option value="date">Ngày tháng (Date)</Option>
            <Option value="checkbox">Checkbox</Option>
            <Option value="select">Select (Dropdown)</Option>
            <Option value="combobox">Combobox</Option>
            <Option value="listbox">Listbox</Option>
            <Option value="textarea">Văn bản dài (Textarea)</Option>
          </Select>
        </Form.Item>

        <Form.Item name="required" valuePropName="checked">
          <Checkbox>Trường bắt buộc</Checkbox>
        </Form.Item>

        <Form.Item name="placeholder" label="Placeholder">
          <Input placeholder="Văn bản gợi ý..." />
        </Form.Item>

        {!showOptions && fieldType !== 'checkbox' && (
          <Form.Item name="defaultValue" label="Giá trị mặc định">
            {fieldType === 'number' ? (
              <InputNumber style={{ width: '100%' }} placeholder="Nhập giá trị số..." />
            ) : fieldType === 'textarea' ? (
              <TextArea rows={3} placeholder="Nhập văn bản..." />
            ) : (
              <Input placeholder="Nhập giá trị mặc định..." />
            )}
          </Form.Item>
        )}

        {showOptions && (
          <Form.List name="options">
            {(fields, { add, remove }) => (
              <>
                <div className="mb-2 d-flex justify-content-between align-items-center">
                  <label className="fw-bold">Các tùy chọn</label>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                    Thêm tùy chọn
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...field}
                      name={[field.name, 'label']}
                      rules={[{ required: true, message: 'Nhập nhãn' }]}
                      style={{ marginBottom: 0, flex: 1 }}
                    >
                      <Input placeholder="Nhãn hiển thị" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'value']}
                      rules={[{ required: true, message: 'Nhập giá trị' }]}
                      style={{ marginBottom: 0, flex: 1 }}
                    >
                      <Input placeholder="Giá trị" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: 'red', fontSize: 18 }} />
                  </Space>
                ))}
                {fields.length === 0 && (
                  <div className="text-muted text-center py-3 border rounded">Chưa có tùy chọn nào. Nhấn "Thêm tùy chọn" để thêm.</div>
                )}
              </>
            )}
          </Form.List>
        )}

        <Form.Item name="isActive" valuePropName="checked">
          <Checkbox>Trạng thái hoạt động</Checkbox>
        </Form.Item>
        <Form.Item name="sortOrder" label="Thứ tự sắp xếp">
          <InputNumber style={{ width: '100%' }} placeholder="Nhập thứ tự sắp xếp..." />
        </Form.Item>
        <Form.Item className="mb-0 mt-4">
          <div className="d-flex justify-content-end gap-2">
            <Button onClick={handleClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={buttonLoading} onClick={onFinish}>
              {editData ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
