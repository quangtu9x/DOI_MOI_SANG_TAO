import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Form, FormInstance, Input, InputNumber } from 'antd';

import { FileUpload } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { API_URL } from '@/utils/baseAPI';
import { handleFiles, handleImage } from '@/utils/utils';

type Props = {
  form: FormInstance;
  name: 'yKienCapCoSo' | 'yKienCapThanhPho';
  title: string;
  disabled?: boolean;
};

type AttachmentFieldProps = {
  form: FormInstance;
  listName: string;
  index: number;
  disabled?: boolean;
};

const AttachmentField = ({ form, listName, index, disabled }: AttachmentFieldProps) => {
  const fieldPath = [listName, index, 'dinhKem'];
  const [files, setFiles] = useState<TDUploadFile[]>([]);

  useEffect(() => {
    setFiles(handleImage(form.getFieldValue(fieldPath) ?? ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, listName]);

  return (
    <FileUpload
      accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
      multiple={false}
      URL={`${API_URL}/api/v1/attachments/public`}
      maxCount={2}
      fileList={files}
      disabled={disabled}
      onChange={e => {
        setFiles(e.fileList);
        form.setFieldValue(fieldPath, handleFiles(e.fileList).join('##'));
      }}
      isUseAliyunOSS
    />
  );
};

export const YKienFormList = ({ form, name, title, disabled }: Props) => {
  return (
    <>
      <div className="separator separator-dashed my-6"></div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold mb-0">{title}</h5>
      </div>
      <Form.List name={name}>
        {(fields, { add, remove }) => (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: '50px' }}>TT</th>
                  <th className="text-center" style={{ width: '12%' }}>Điểm TB</th>
                  <th className="text-center" style={{ width: '12%' }}>Số phiếu đạt</th>
                  <th className="text-center">Nội dung ý kiến</th>
                  <th className="text-center" style={{ width: '22%' }}>Đính kèm</th>
                  <th className="text-center" style={{ width: '8%' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {fields.map(({ key, name: fieldName, ...restField }, index) => (
                  <tr key={key}>
                    <td className="text-center align-middle">{index + 1}</td>
                    <td>
                      <Form.Item {...restField} name={[fieldName, 'diemTrungBinh']} className="mb-0">
                        <InputNumber<number> min={0} precision={1} step={0.1} style={{ width: '100%' }} />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item {...restField} name={[fieldName, 'soPhieuDat']} className="mb-0">
                        <InputNumber<number> min={0} precision={0} step={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item {...restField} name={[fieldName, 'noiDungYKien']} className="mb-0">
                        <Input.TextArea rows={2} />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item {...restField} name={[fieldName, 'dinhKem']} className="mb-0">
                        <AttachmentField form={form} listName={name} index={fieldName} disabled={disabled} />
                      </Form.Item>
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        type="button"
                        className="btn btn-sm btn-light-danger d-inline-flex align-items-center justify-content-center"
                        onClick={() => remove(fieldName)}
                        disabled={disabled}
                      >
                        <i className="fa-regular fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-secondary">
                <tr>
                  <td colSpan={6} className="text-left py-3">
                    <Button type="button" className="btn btn-sm btn-primary" onClick={() => add()} disabled={disabled}>
                      <i className="fa-regular fa-plus me-2"></i>
                      Thêm ý kiến
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Form.List>
    </>
  );
};
