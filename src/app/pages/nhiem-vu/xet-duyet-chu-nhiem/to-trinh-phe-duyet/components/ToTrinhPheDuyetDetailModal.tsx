import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AutoComplete, DatePicker, Form, Input, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IToTrinhPheDuyet, IPaginationResponse, IResult, IUserDetails, IBienBanMoHoSo, IChiTietMoHoSo, LoaiChiTietMoHoSo } from '@/models';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect, UserSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';




export const ToTrinhPheDuyetDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IToTrinhPheDuyet | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IToTrinhPheDuyet>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [chiTietMoHoSosMap, setChiTietMoHoSosMap] = useState<Record<number, IChiTietMoHoSo[]>>({});

  const fetchChiTietMoHoSos = async (nhiemVuId: string, rowIndex: number) => {
    try {
      const res = await requestPOST<IPaginationResponse<IBienBanMoHoSo[]>>('BienBanMoHoSos/search', {
        pageNumber: 1,
        pageSize: 10,
        nhiemVuId: nhiemVuId,
      });
      const _data = res?.data?.data?.[0]?.chiTietMoHoSos ?? null;
      const hoSoHopLes = _data?.filter(x => x.phanLoai === LoaiChiTietMoHoSo.HoSoHopLe) ?? [];
      setChiTietMoHoSosMap(prev => ({
        ...prev,
        [rowIndex]: hoSoHopLes,
      }));
    } catch (error) {
      console.error('Error searching business:', error);
    }
  };


  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IToTrinhPheDuyet>>(`ToTrinhPheDuyets/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          const chiTietToTrinhs = _data?.chiTietToTrinhs?.map(x =>
            ({ ...x, nhiemVu: x.nhiemVuId ? { label: x.nhiemVuTen, value: x.nhiemVuId } : null })
          ) ?? [];

          form.setFieldsValue({
            ..._data,
            ngayTrinh: toViewDate(_data.ngayTrinh),
            chiTietToTrinhs: chiTietToTrinhs,
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
      const formData: IToTrinhPheDuyet = {
        ...values,
        ...(id && { id }),
        ngayTrinh: toSaveDate(values.ngayTrinh),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`ToTrinhPheDuyets/${id}`, formData)
        : await requestPOST<IResult<string>>(`ToTrinhPheDuyets`, formData);

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
        <Modal.Title className="text-white">{dataModal?.readOnly ? 'Chi tiết' : (id ? 'Chỉnh sửa' : 'Tạo mới')}</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IToTrinhPheDuyet>
              initialValues={{
                chiTietToTrinhs: [{}]
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <HeaderTitle title={"Thông tin chung"} />
              <div className="row">
                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Tên tờ trình" name='ten' rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Số tờ trình" name="soToTrinh" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Ngày trình" name='ngayTrinh' initialValue={dayjs()}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>

                <div className="col-xl-12 col-lg-12">
                  <Form.Item label="Nội dung" name='noiDungToTrinh' rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-6 col-lg-6">
                  <Form.Item label="Đính kèm" name='dinhKem'>
                    <FileUpload
                      accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
                      multiple={false}
                      URL={`${API_URL}/api/v1/attachments/public`}
                      maxCount={2}
                      fileList={dinhKem}
                      onChange={e => {
                        setDinhKem(e.fileList);
                      }}
                      isUseAliyunOSS
                    />
                  </Form.Item>
                </div>
              </div>
              <HeaderTitle title={"Thông tin nhiệm vụ"} />
              <Form.List name="chiTietToTrinhs">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered" style={{ tableLayout: 'fixed', width: '100%' }}>
                        <thead className="table-light">
                          <tr>
                            <th className="text-center" style={{ width: '50px' }}>TT</th>
                            <th className="text-center" style={{ width: '60%' }} >Nhiệm vụ</th>
                            <th className="text-center" style={{ width: '30%' }}>Tên cá nhân/tổ chức đăng ký</th>
                            <th className="text-center" style={{ width: '8%' }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map(({ key, name, ...restField }, index) => (
                            <tr key={key}>
                              <td className="text-center">{index + 1}</td>
                              <td style={{ width: '30%', maxWidth: '30%' }}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'nhiemVu']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <TDSelect
                                    notFoundContent="Không tìm thấy dữ liệu"
                                    reload
                                    showSearch
                                    placeholder="Chọn"
                                    fetchOptions={async keyword => {
                                      const res = await requestPOST<IPaginationResponse<any[]>>(`nhiemVuChinhThucs/search`, {
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
                                        form.setFieldValue(['chiTietToTrinhs', name, 'nhiemVuId'], current?.id);
                                        fetchChiTietMoHoSos(current?.id, name);
                                      } else {
                                        form.setFieldValue(['chiTietToTrinhs', name, 'nhiemVuId'], null);
                                        setChiTietMoHoSosMap(prev => {
                                          const newMap = { ...prev };
                                          delete newMap[name];
                                          return newMap;
                                        });
                                      }
                                    }}
                                  />

                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'tenCaNhanToChucDangKy']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <AutoComplete
                                    options={(chiTietMoHoSosMap[name] || []).map(item => ({ value: item.tenCaNhanToChucDangKy }))}
                                    placeholder=""
                                    allowClear
                                    filterOption={(inputValue, option) =>
                                      option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                                    }
                                  />
                                </Form.Item>
                              </td>

                              {/* Thao tác */}
                              < td className='text-center align-middle' >
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
                                Thêm nhiệm vụ
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
      </Modal.Body >
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