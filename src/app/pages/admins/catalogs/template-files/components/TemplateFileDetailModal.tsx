import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { ITemplateFile, IResult, TemplateFileType } from '@/models';
import { handleFiles, handleImage, removeAccents } from '@/utils/utils';
import { API_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { FileUpload } from '@/app/components';
import { getAuth } from '@/app/modules/auth';
import { TDUploadFile } from '@/models/TDUploadFile';
import { FILE_URL } from '@/utils/baseAPI';



interface ConfigFile {
  quantity: number;
  allowedTypes: string[];
}

export const TemplateFileDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props

  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as ITemplateFile | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<ITemplateFile>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const token = getAuth()?.token;
  const [attachment, setAttachment] = useState<TDUploadFile[]>([]);
  const [fileTypeSelected, setFileTypeSelected] = useState<TemplateFileType[]>([]);
  const [fileConfig, setFileConfig] = useState<ConfigFile>({
    quantity: 1,
    allowedTypes: ['.xlsx', '.xls', '.xlsm'],
  });


  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<ITemplateFile>>(`templatefiles/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          if (_data?.attachment) {
            setAttachment(handleImage(_data?.attachment ?? '', FILE_URL));
          }
          setFileTypeSelected(_data?.templateFileTypes ?? []);
          form.setFieldsValue({
            ..._data,
            templateFileTypes: _data?.templateFileTypes ?? undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching organization unit:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (fileTypeSelected.length > 0) {
      if (fileTypeSelected.includes(TemplateFileType.word) && fileTypeSelected.includes(TemplateFileType.excel)) {
        setFileConfig({
          quantity: 2,
          allowedTypes: ['.docx', '.doc', '.xlsx', '.xls', '.xlsm'],
        });
      }
      else if (fileTypeSelected.includes(TemplateFileType.word)) {
        setFileConfig({
          quantity: 1,
          allowedTypes: ['.docx', '.doc'],
        });
      } else if (fileTypeSelected.includes(TemplateFileType.excel)) {
        setFileConfig({
          quantity: 1,
          allowedTypes: ['.xlsx', '.xls', '.xlsm'],
        });
      } else {
        setFileConfig({
          quantity: 1,
          allowedTypes: [],
        });
      }
    } else {
      setFileConfig({
        quantity: 1,
        allowedTypes: [],
      });
    }
  }, [fileTypeSelected]);


  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      const attachments = handleFiles(attachment);
      if (attachments?.length != fileConfig.quantity) {
        toast.error(`Vui lòng đính kèm đúng số lượng file (${fileConfig.quantity} file)`);
        return;
      }
      const formData: ITemplateFile = {
        ...values,
        ...(id && { id }),
        attachment: attachments.join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`templatefiles/${id}`, formData)
        : await requestPOST<IResult<string>>(`templatefiles`, formData);

      if (response?.status == 200) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
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
      show={modalVisible}
      fullscreen={'lg-down'}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : (id ? 'Chỉnh sửa' : 'Tạo mới')}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<ITemplateFile> form={form}
              initialValues={{ sortOrder: totalCount + 1, isActive: true }}
              layout="vertical" autoComplete="off" disabled={dataModal?.readOnly ?? false}>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Tên" name="name" rules={[{ required: true, message: 'Không được để trống!' }]}
                  >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Mã" name="code" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Loại file" name="templateFileTypes"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}>
                    <Select
                      mode='multiple'
                      placeholder="Chọn"
                      onChange={value => {
                        setFileTypeSelected(value as TemplateFileType[]);
                      }
                      }>
                      <Select.Option value={TemplateFileType.word}>Word</Select.Option>
                      <Select.Option value={TemplateFileType.excel}>Excel</Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item name="isActive" label=" " valuePropName="checked" >
                    <Checkbox>Sử dụng</Checkbox>
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ghi chú" name="description">
                    <Input.TextArea rows={4} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label={<>Đính kèm ({fileConfig.quantity} file)</>} name="attachment"
                    rules={[
                      { required: true, message: "Không được để trống!" },
                    ]}
                  >
                    <FileUpload
                      maxCount={fileConfig.quantity}
                      accept={fileConfig.allowedTypes}
                      multiple={false}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      headers={{
                        Authorization: `Bearer ${token}`,
                      }}
                      fileList={attachment}
                      onChange={e => {
                        setAttachment(e.fileList);
                      }}
                    />
                  </Form.Item>
                </div>

              </div>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        {!dataModal?.readOnly && (
          <div className="d-flex justify-content-center  align-items-center">
            <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa-regular fa-floppy-disk"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
          </div>
        )}
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

