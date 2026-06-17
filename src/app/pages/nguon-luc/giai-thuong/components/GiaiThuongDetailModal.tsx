import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, InputNumber, Radio, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IChuyenGiaGiaiThuong, IPaginationResponse, IResult, IChuyenGia } from '@/models';
import { API_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, ChuyenGiaInfoSection } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { useAuth } from '@/app/modules/auth';
import { formatName, handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';


export const GiaiThuongDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IChuyenGiaGiaiThuong | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const { currentUser } = useAuth();
  const [form] = Form.useForm<IChuyenGiaGiaiThuong>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [GiaiThuongDinhKems, setGiaiThuongDinhKems] = useState<{ [key: number]: TDUploadFile[] }>({});
  const [chuyenGiaIdSelected, setChuyenGiaIdSelected] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IChuyenGiaGiaiThuong>>(`chuyengias/${id}/giaithuong`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setChuyenGiaIdSelected(_data.id || null);
          _data.chuyenGiaId = _data.id;
          _data.chuyenGia = _data.id ? {
            label: formatName(_data.hocHamVietTat, _data.hocViVietTat, _data.hoTen),
            value: _data.id,
          } : null;

          const giaiThuongs = _data?.giaiThuongs?.reduce((
            acc: { [key: number]: TDUploadFile[] }, item: any, index: number) => {
            if (item.dinhKem) {
              acc[index] = handleImage(item.dinhKem);
            }
            item.namCap = toViewDate(item.namCap, 'YYYY');
            return acc;
          }, {}) || {};
          setGiaiThuongDinhKems(giaiThuongs);
          form.setFieldsValue({
            ..._data,
            giaiThuongs: _data.giaiThuongs || [],
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

  const handleCancel = () => {
    form.resetFields();
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);

      const giaiThuongs = values.giaiThuongs?.map((item, index) => ({
        ...item,
        namCap: toSaveDate(item.namCap, 'YYYY'),
        dinhKem: handleFiles(GiaiThuongDinhKems[index] || []).join('##'),
      })) || [];

      const formData: IChuyenGiaGiaiThuong = {
        ...values,
        ...(id && { id }),
        giaiThuongs: giaiThuongs,
      };
      const response = id
        ? await requestPUT<IResult<string>>(`giaiThuongs/${id}`, formData)
        : await requestPOST<IResult<string>>(`giaiThuongs`, formData);

      if (response?.status == 200) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
      if (errorInfo && typeof errorInfo === 'object' && 'errorFields' in errorInfo && Array.isArray((errorInfo as any).errorFields)) {
        toast.warning('Chưa nhập đủ thông tin, vui lòng kiểm tra lại!');
        const first = (errorInfo as any).errorFields[0].name;
        form.scrollToField(first, { behavior: 'smooth', block: 'start', focus: true });
      }
    } finally {
      setButtonLoading(false);
    }
  };


  return (
    <Modal
      show={modalVisible}
      fullscreen={true}
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
            <Form<IChuyenGiaGiaiThuong>
              initialValues={{
                organizationUnitId: currentUser?.organizationUnitId,
                giaiThuongs: [{
                  ten: null,
                  noiDung: null,
                  noiCap: null,
                  namCap: null,
                  dinhKem: null
                }]
              }}
              disabled={dataModal?.readOnly ?? false}
              form={form} layout="vertical" autoComplete="off">
              <>
                <ChuyenGiaInfoSection
                  form={form}
                  disabled={dataModal?.readOnly ?? false}
                  initialChuyenGiaId={chuyenGiaIdSelected}
                  onChuyenGiaIdChange={setChuyenGiaIdSelected}
                />
                <HeaderTitle title={"Thông tin giải thưởng"} />
                <Form.List name="giaiThuongs">
                  {(fields, { add, remove }) => (
                    <>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th className="text-center" style={{ width: '50px' }}>TT</th>
                              <th className="text-center" style={{ width: '15%' }} >Tên giải thưởng</th>
                              <th className="text-center">Nội dung</th>
                              <th className="text-center" >Nơi cấp</th>
                              <th className="text-center" style={{ width: '10%' }} >Năm cấp</th>
                              <th className="text-center" style={{ width: '15%' }} >Đính kèm</th>
                              <th className="text-center" style={{ width: '5%' }}>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'ten']}
                                    className="mb-0"
                                    rules={[{ required: true, message: "Không được để trống!" }]}
                                  >
                                    <Input.TextArea
                                      placeholder=" "
                                      autoSize={{ minRows: 1, maxRows: 3 }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'noiDung']}
                                    className="mb-0"
                                    rules={[{ required: true, message: "Không được để trống!" }]}
                                  >
                                    <Input.TextArea
                                      placeholder=" "
                                      autoSize={{ minRows: 1, maxRows: 3 }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'noiCap']}
                                    className="mb-0"
                                  >
                                    <Input placeholder="" allowClear />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'namCap']}
                                    className="mb-0"
                                  >
                                    <DatePicker picker="year" placeholder='' />
                                  </Form.Item>
                                </td>
                                {/* Đính kèm */}
                                <td className='text-center'>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'dinhKem']}
                                    className="mb-0"
                                  >
                                    <FileUpload
                                      accept={['.png', '.jpg', '.jpeg']}
                                      multiple={false}
                                      URL={`${API_URL}/api/v1/attachments/public`}
                                      maxCount={1}
                                      fileList={GiaiThuongDinhKems[name] || []}
                                      onChange={e => {
                                        setGiaiThuongDinhKems(prev => ({
                                          ...prev,
                                          [name]: e.fileList
                                        }));
                                      }}
                                      isUseAliyunOSS
                                    />
                                  </Form.Item>
                                </td>
                                {/* Thao tác */}
                                <td className='text-center align-middle'>
                                  <Button
                                    type="button"
                                    className="btn btn-sm btn-light-danger d-inline-flex align-items-center justify-content-center"
                                    onClick={() => {
                                      remove(name);
                                      setGiaiThuongDinhKems(prev => {
                                        const updated = { ...prev };
                                        delete updated[name];
                                        return updated;
                                      })
                                    }}
                                    disabled={fields.length === 1 || (dataModal?.readOnly ?? false)}

                                  >
                                    <i className="fa-regular fa-trash"></i>
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-secondary">
                            <tr>
                              <td colSpan={16} className="text-left py-3">
                                <Button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  onClick={() => add()}
                                  disabled={dataModal?.readOnly ?? false}
                                >
                                  <i className="fa-regular fa-plus me-2"></i>
                                  Thêm giải thưởng
                                </Button>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )}
                </Form.List>
              </>
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
    </Modal >
  );
};