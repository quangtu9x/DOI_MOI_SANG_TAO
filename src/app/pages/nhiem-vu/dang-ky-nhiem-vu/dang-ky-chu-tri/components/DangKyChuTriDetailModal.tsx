import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IDangKyChuTri, IPaginationResponse, IResult } from '@/models';
import { handleFiles, handleImage } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';




export const DangKyChuTriDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IDangKyChuTri | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IDangKyChuTri>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [hoSoKemTheoDinhKems, setHoSoKemTheoDinhKems] = useState<{ [key: number]: TDUploadFile[] }>({});

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IDangKyChuTri>>(`DangKyChuTris/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          _data.nhiemVu = _data.nhiemVuId ? {
            value: _data.nhiemVuId,
            label: _data.nhiemVuTen,
          } : null;

          const hoSoKemTheoDinhKems = _data?.taiLieuKemTheos?.reduce((
            acc: { [key: number]: TDUploadFile[] }, item: any, index: number) => {
            if (item.dinhKem) {
              acc[index] = handleImage(item.dinhKem);
            }
            return acc;
          }, {}) || {};
          setHoSoKemTheoDinhKems(hoSoKemTheoDinhKems);
          form.setFieldsValue({
            ..._data,
            taiLieuKemTheos: _data?.taiLieuKemTheos ?? [],
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

      const taiLieuKemTheos = values.taiLieuKemTheos?.map((item, index) => ({
        ...item,
        dinhKem: handleFiles(hoSoKemTheoDinhKems[index] || []).join('##'),
      })) || [];

      const formData: IDangKyChuTri = {
        ...values,
        ...(id && { id }),
        dinhKem: handleFiles(dinhKem).join('##'),
        taiLieuKemTheos: taiLieuKemTheos,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`DangKyChuTris/${id}`, formData)
        : await requestPOST<IResult<string>>(`DangKyChuTris`, formData);

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
            <Form<IDangKyChuTri>
              initialValues={{ taiLieuKeTheos: [{}] }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <HeaderTitle title={"Thông tin chung"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Nhiệm vụ" name="nhiemVu" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <TDSelect
                      notFoundContent="Không tìm thấy dữ liệu"
                      reload
                      showSearch
                      placeholder="Chọn"
                      fetchOptions={async keyword => {
                        const res = await requestPOST<IPaginationResponse<any[]>>(`nhiemvuchinhthucs/search`, {
                          pageNumber: 1,
                          pageSize: 1000,
                          keyword: keyword,
                        });
                        return (
                          res.data?.data?.map(item => ({
                            ...item,
                            label: item?.ten,
                            value: item?.id,
                          })) ?? []
                        );
                      }}
                      onChange={(value, current: any) => {
                        if (value) {
                          form.setFieldValue('nhiemVuId', current?.id);
                        } else {
                          form.setFieldValue('nhiemVuId', null);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tên cá nhân/tổ chức đăng ký" name="tenCaNhanToChucDangKy" >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Địa chỉ liên hệ" name="diaChiLienHe" >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Điện thoại" name="dienThoai" >
                    <Input placeholder="" />
                  </Form.Item>
                </div>
              </div>
              <HeaderTitle title={"Hồ sơ kèm theo"} />
              <Form.List name="taiLieuKemTheos">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center" style={{ width: '50px' }}>TT</th>
                            <th className="text-center" style={{ width: '60%' }} >Tên</th>
                            <th className="text-center">Đính kèm</th>
                            <th className="text-center" style={{ width: '8%' }}>Thao tác</th>
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
                                  <Input placeholder="" />
                                </Form.Item>
                              </td>
                              <td>
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
                                    fileList={hoSoKemTheoDinhKems[name] || []}
                                    onChange={e => {
                                      setHoSoKemTheoDinhKems(prev => ({
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
                                Thêm thành viên
                              </Button>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </Form.List>
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