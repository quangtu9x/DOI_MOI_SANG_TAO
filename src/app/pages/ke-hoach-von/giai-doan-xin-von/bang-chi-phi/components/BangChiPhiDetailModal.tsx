import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Checkbox, Form, Input, InputNumber, Select, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IBangChiPhi, IPaginationResponse, IResult } from '@/models';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { CATEGORY_GROUP_CODE, LOAI_BANGS, LOAI_NHAP_LIEUS } from '@/data';
import { HeaderTitle, TDSelect } from '@/app/components';
import { number } from 'yup';




export const BangChiPhiDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IBangChiPhi | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IBangChiPhi>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IBangChiPhi>>(`BangChiPhis/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          form.setFieldsValue({
            ..._data,
            danhMucChiPhis: (_data.danhMucChiPhis ?? []).map(item => ({
              ...item,
              thueVAT: item.thueVATId ? { value: item.thueVATId, label: item.thueVATTen } : null,
            })),
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
      const formData: IBangChiPhi = {
        ...values,
        ...(id && { id }),
        danhMucChiPhis: values.danhMucChiPhis?.map(item => ({
          ...item,
          dinhMuc: item.dinhMuc ? Number(item.dinhMuc) : null,
        })) || [],
      };

      const response = id
        ? await requestPUT<IResult<string>>(`BangChiPhis/${id}`, formData)
        : await requestPOST<IResult<string>>(`BangChiPhis`, formData);

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
      fullscreen={true}
      size="xl"
      onExited={handleCancel}
      keyboard={true}
      scrollable={true}
      onEscapeKeyDown={handleCancel}
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IBangChiPhi>
              initialValues={{
                danhMucChiPhis: [{}],
              }}
              form={form} layout="vertical" autoComplete="off">
              <div className="row">
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Tên" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Loại bảng"
                    name='loaiBang'
                    rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Select placeholder="Chọn" allowClear>
                      {LOAI_BANGS?.map((item, key) => (
                        <Select.Option key={key} value={item.id}>{item.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Mã" name="ma" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
              </div>
              <HeaderTitle title={'Thông tin chi tiết'} />
              <Form.List name="danhMucChiPhis">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div className="card card-bordered mb-5 shadow-sm" key={key}>
                        <div className="card-header min-h-auto py-3 bg-light">
                          <h3 className="card-title text-gray-800 fw-bold fs-6">Danh mục chi phí #{index + 1}</h3>
                          <div className="card-toolbar">
                            <Button
                              type="button"
                              className="btn btn-icon btn-sm btn-light-danger"
                              onClick={() => remove(name)}
                              disabled={fields.length === 1 || (dataModal?.readOnly ?? false)}
                            >
                              <i className="fa-regular fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                        <div className="card-body py-5">
                          {/* Row 1: STT, Tên, Phân loại, Ký hiệu */}
                          <div className="row">
                            <div className="col-md-3">
                              <Form.Item label="STT" rules={[{ required: true, message: 'Không được để trống!' }]} {...restField} name={[name, 'stt']}>
                                <Input placeholder="Nhập STT" />
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label="Tên danh mục" rules={[{ required: true, message: 'Không được để trống!' }]} {...restField} name={[name, 'ten']}>
                                <Input placeholder="Nhập tên" />
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label="Phân loại" {...restField} name={[name, 'loaiNhapLieu']}>
                                <Select placeholder="Chọn" allowClear>
                                  {LOAI_NHAP_LIEUS?.map((item, key) => (
                                    <Select.Option key={key} value={item.id}>
                                      {item.name}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label="Ký hiệu" {...restField} name={[name, 'kyHieu']}>
                                <Input placeholder="Nhập ký hiệu" />
                              </Form.Item>
                            </div>
                          </div>

                          {/* Row 2: Công thức, Thuế VAT, Định mức, Mã tra định mức */}
                          <div className="row">
                            <div className="col-md-3">
                              <Form.Item label="Công thức" {...restField} name={[name, 'congThuc']}>
                                <Input placeholder="Nhập công thức" />
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label="Thuế VAT" {...restField} name={[name, 'thueVAT']}>
                                <TDSelect
                                  notFoundContent="Không tìm thấy dữ liệu"
                                  reload
                                  showSearch
                                  placeholder="Chọn"
                                  fetchOptions={async keyword => {
                                    const res = await requestPOST<IPaginationResponse<any[]>>(`categories/search`, {
                                      pageNumber: 1,
                                      pageSize: 1000,
                                      keyword: keyword,
                                      categoryGroupCode: CATEGORY_GROUP_CODE.THUE_VAT,
                                    });
                                    return (
                                      res.data?.data?.map(item => ({
                                        ...item,
                                        label: item?.name,
                                        value: item?.id,
                                      })) ?? []
                                    );
                                  }}
                                  onChange={(value, current: any) => {
                                    if (value) {
                                      form.setFieldValue(['danhMucChiPhis', name, 'thueVATId'], current?.id);
                                    } else {
                                      form.setFieldValue(['danhMucChiPhis', name, 'thueVATId'], null);
                                    }
                                  }}
                                />
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label="Định mức" {...restField} name={[name, 'dinhMuc']}>
                                <Input placeholder="Nhập định mức" />
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label="Mã tra định mức" {...restField} name={[name, 'maDinhMucTraCuu']}>
                                <Input.TextArea placeholder="Nhập mã tra cứu" autoSize={{ minRows: 1, maxRows: 3 }} />
                              </Form.Item>
                            </div>
                          </div>

                          {/* Row 3: Giá trị tối thiểu, Giá trị tối đa, Điều kiện áp dụng, Không thêm vào tổng */}
                          <div className="row">
                            <div className="col-md-3">
                              <Form.Item label="Giá trị tối thiểu" {...restField} name={[name, 'giaTriToiThieu']}>
                                <InputNumber
                                  placeholder=""
                                  className="input-with-addon"
                                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  parser={(value = '') => value.replace(/\$\s?|(,*)/g, '')}
                                  style={{ width: '100%' }}
                                  addonAfter="VND"
                                />
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label="Giá trị tối đa" {...restField} name={[name, 'giaTriToiDa']}>
                                <InputNumber
                                  placeholder=""
                                  className="input-with-addon"
                                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  parser={(value = '') => value.replace(/\$\s?|(,*)/g, '')}
                                  style={{ width: '100%' }}
                                  addonAfter="VND"
                                />
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label="Điều kiện áp dụng" {...restField} name={[name, 'dieuKienApDung']}>
                                <Input.TextArea placeholder="Nhập điều kiện" autoSize={{ minRows: 1, maxRows: 3 }} />
                              </Form.Item>
                            </div>
                            <div className="col-md-3">
                              <Form.Item label=" " name={[name, 'khongThemVaoTong']} valuePropName="checked" {...restField} className="">
                                <Checkbox>Không thêm vào tổng</Checkbox>
                              </Form.Item>
                            </div>
                          </div>

                          {/* Row 4: Căn cứ (Full width) */}
                          <div className="row">
                            <div className="col-md-12">
                              <Form.Item label="Căn cứ" {...restField} name={[name, 'canCu']}>
                                <Input.TextArea placeholder="Nhập căn cứ" autoSize={{ minRows: 2, maxRows: 4 }} />
                              </Form.Item>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="d-flex justify-content-center mt-5 mb-10">
                      <Button
                        type="button"
                        className="btn btn-outline btn-outline-dashed btn-outline-primary btn-active-light-primary w-100 py-3"
                        onClick={() => add()}
                        disabled={dataModal?.readOnly ?? false}
                      >
                        <i className="fa-regular fa-plus me-2"></i>
                        Thêm danh mục chi phí
                      </Button>
                    </div>
                  </>
                )}
              </Form.List>
            </Form>
          )}
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish} disabled={buttonLoading}>
            <i className="fa-regular fa-floppy-disk"></i>
            {id ? 'Lưu' : 'Tạo mới'}
          </Button>
        </div>
        <div className="d-flex justify-content-center  align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel} disabled={buttonLoading}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};