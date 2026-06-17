import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Checkbox, Select, DatePicker, Spin } from 'antd';
import { IEform, IEformField, IEformFieldOption, IPaginationResponse, IResult, IResultUserEform } from '@/models';
import { toast } from 'react-toastify';
import { useDataTableEformField } from './useDataTableEformField';
import { requestPOST } from '@/utils/baseAPI';
import { AppDispatch } from '@/redux/Store';
import { useDispatch } from 'react-redux';
import * as actionsGlobal from '@/redux/global/Actions';
import { Button } from 'react-bootstrap';

const { TextArea } = Input;
const { Option } = Select;

interface PreviewFormModalProps {
  visible: boolean;
  onClose: () => void;
  eformId: string;
  eformTitle?: string;
}

export const PreviewFormModal: React.FC<PreviewFormModalProps> = ({ visible, onClose, eformId, eformTitle }) => {
  const [form] = Form.useForm();
  const { data: fields, loading } = useDataTableEformField({ eformId });
  const [buttonLoading, setButtonLoading] = useState(false);
  const dispatch: AppDispatch = useDispatch();

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  //   useEffect(() => {
  //     const fetchData = async () => {
  //       try {
  //         const response = await requestPOST<IPaginationResponse<IResultUserEform[]>>('resultusereforms/search', {
  //           pageNumber: 1,
  //           pageSize: 1000,
  //           eformId: eformId,
  //         });

  //         if (response.data) {
  //           const { data: responseData } = response.data;
  //           let initialValues: any = {};
  //           responseData?.forEach(item => {
  //             initialValues[item.eformFieldId] = item.result;
  //           });
  //           form.setFieldsValue(initialValues);
  //         } else {
  //           form.setFieldsValue({});
  //         }
  //       } catch (error) {
  //         console.error('Error fetching positions:', error);
  //         toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
  //         form.setFieldsValue({});
  //       }
  //     };
  //     if (visible) {
  //       fetchData();
  //     }
  //   }, [visible, form]);
  const renderField = (field: IEformField) => {
    const commonProps = {
      placeholder: field.placeholder,
    };

    switch (field.type) {
      case 'text':
        return <Input {...commonProps} />;

      case 'number':
        return <InputNumber style={{ width: '100%' }} {...commonProps} />;

      case 'date':
        return <DatePicker style={{ width: '100%' }} placeholder={field.placeholder} />;

      case 'checkbox':
        return <Checkbox>{field.placeholder || 'Đồng ý'}</Checkbox>;

      case 'textarea':
        return <TextArea rows={4} {...commonProps} />;

      case 'select':
      case 'combobox':
      case 'listbox': {
        let options: IEformFieldOption[] = [];
        if (field.options) {
          try {
            options = JSON.parse(field.options);
          } catch (e) {
            console.error('Error parsing options:', e);
          }
        }

        if (field.type === 'listbox') {
          return (
            <Select
              {...commonProps}
              mode="multiple"
              style={{ width: '100%' }}
              options={options.map(opt => ({ label: opt.label, value: opt.value }))}
            />
          );
        }

        return (
          <Select
            {...commonProps}
            showSearch={field.type === 'combobox'}
            style={{ width: '100%' }}
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {options.map(opt => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        );
      }

      default:
        return <Input {...commonProps} />;
    }
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const formDataArray = Object.keys(values)
        .filter(key => key !== 'eformId')
        .map(fieldId => ({
          eformFieldId: fieldId,
          result: String(values[fieldId] || ''),
          eformId: eformId,
        }));

      console.log('Form Data to submit:', formDataArray);

      // Gửi từng request hoặc gửi hàng loạt
      const response = await requestPOST<IResult<string>>(`resultusereforms/createlst`, {
        results: formDataArray,
        eformId: eformId,
      });

      if (response?.status == 200) {
        toast.success('Gửi thử thành công!');
        dispatch(actionsGlobal.setRandom());
        handleClose();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div>
          <i className="fa fa-eye me-2"></i>
          Xem trước mẫu eform: {eformTitle || 'Mẫu eform'}
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width={800}
      footer={null}
    >
      <Spin spinning={loading}>
        <div className="alert alert-info d-flex align-items-center mb-4">
          <i className="fa fa-info-circle me-2"></i>
          <span>Đây là chế độ xem trước. Các trường được sắp xếp theo thứ tự hiển thị.</span>
        </div>

        {fields.length === 0 && !loading && (
          <div className="alert alert-warning text-center">
            <i className="fa fa-exclamation-triangle me-2"></i>
            Chưa có trường dữ liệu nào được thêm vào mẫu eform này.
          </div>
        )}

        {fields.length > 0 && (
          <Form form={form} layout="vertical" autoComplete="off">
            {fields.map((field, index) => (
              <Form.Item
                key={field.id}
                name={field.id}
                label={
                  <span>
                    {index + 1}. {field.label}
                    {field.required && <span className="text-danger ms-1">*</span>}
                  </span>
                }
                rules={[
                  {
                    required: field.required,
                    message: `Vui lòng nhập ${field.label.toLowerCase()}`,
                  },
                ]}
                valuePropName={field.type === 'checkbox' ? 'checked' : 'value'}
              >
                {renderField(field)}
              </Form.Item>
            ))}

            {fields.length > 0 && (
              <Form.Item className="mb-0 mt-4">
                <div className="d-flex justify-content-end gap-2">
                  <Button type="button" className="btn btn-secondary" onClick={handleClose}>
                    Đóng
                  </Button>
                  <Button type="submit" className="btn btn-primary" onClick={onFinish}>
                    <i className="fa fa-paper-plane me-2"></i>
                    Gửi thử (Demo)
                  </Button>
                </div>
              </Form.Item>
            )}
          </Form>
        )}
      </Spin>
    </Modal>
  );
};
