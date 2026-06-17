import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Avatar, DatePicker, Form, Input, Space, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IHoiDongNghiemThu, IPaginationResponse, IResult, IChuyenGia, CapNghiemThu } from '@/models';
import { formatName, getThumbnailUrl, handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';




export const HDNTChinhThucDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IHoiDongNghiemThu | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IHoiDongNghiemThu>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [thanhVienIdSelected, setThanhVienIdSelected] = useState<{ [key: number]: string | null }>({});

  useEffect(() => {
    const fetchThanhVienInfo = async () => {
      const entries = Object.entries(thanhVienIdSelected);
      for (const [rowIndex, thanhVienId] of entries) {
        if (thanhVienId) {
          try {
            const res = await requestGET<IResult<IChuyenGia>>(`chuyengias/${thanhVienId}`);
            const _data = res?.data?.data ?? null;
            if (_data) {
              form.setFieldValue(['thanhViens', Number(rowIndex), 'donViCongTac'], _data.donViCongTac || '');
            }
          } catch (error) {
            console.error('Error fetching thanh vien info:', error);
          }
        }
      }
    };

    const hasSelection = Object.values(thanhVienIdSelected).some(id => id);
    if (hasSelection) {
      fetchThanhVienInfo();
    }
  }, [thanhVienIdSelected, form]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IHoiDongNghiemThu>>(`HoiDongNghiemThus/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          const thanhViensWithInfo = await Promise.all(
            (_data?.thanhViens || []).map(async (item: any, index: number) => {
              let thanhVienLabel: React.ReactNode = item.thanhVienHoTen;

              if (item.thanhVienId) {
                try {
                  const res = await requestGET<IResult<IChuyenGia>>(`chuyengias/${item.thanhVienId}`);
                  const chuyenGiaData = res?.data?.data;
                  if (chuyenGiaData) {
                    thanhVienLabel = (
                      <Space>
                        <Avatar
                          size="small"
                          src={chuyenGiaData.dinhKem ? getThumbnailUrl(chuyenGiaData.dinhKem) : undefined}
                          icon={!chuyenGiaData.dinhKem && <i className="fa-regular fa-user"></i>}
                        />
                        {formatName(chuyenGiaData.hocHamVietTat, chuyenGiaData.hocViVietTat, chuyenGiaData.hoTen)}
                      </Space>
                    );
                    item.donViCongTac = chuyenGiaData.donViCongTac || '';
                  }
                } catch (error) {
                  console.error('Error fetching chuyengia info:', error);
                }
              }

              setThanhVienIdSelected(prev => ({
                ...prev,
                [index]: item.thanhVienId
              }));

              return {
                ...item,
                thanhVien: item.thanhVienId ? {
                  value: item.thanhVienId,
                  label: thanhVienLabel,
                } : null,
                chucVu: item.chucVuId ? {
                  value: item.chucVuId,
                  label: item.chucVuTen,
                } : null,
              };
            })
          );

          form.setFieldsValue({
            ..._data,
            ngayThanhLap: toViewDate(_data.ngayThanhLap),
            thanhViens: thanhViensWithInfo,
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
      const formData: IHoiDongNghiemThu = {
        ...values,
        ...(id && { id }),
        ngayThanhLap: toSaveDate(values.ngayThanhLap),
        dinhKem: handleFiles(dinhKem).join('##'),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`HoiDongNghiemThus/${id}`, formData)
        : await requestPOST<IResult<string>>(`HoiDongNghiemThus`, formData);

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
            <Form<IHoiDongNghiemThu>
              initialValues={{
                capHoiDong: CapNghiemThu.ChinhThuc,
                thanhViens: [{
                  thanhVienId: null,
                  chucVuId: null,
                  donViCongTac: '',
                }]
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <HeaderTitle title={"Thông tin chung"} />
              <div className="row">
                <div className="col-xl-8 col-lg-8">
                  <Form.Item label="Tên hội đồng" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ngày thành lập" name='ngayThanhLap' initialValue={dayjs()}>
                    <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Mô tả" name='moTa'>
                    <Input.TextArea rows={2} placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
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
              <HeaderTitle title={"Thông tin thành viên"} />
              <Form.List name="thanhViens">
                {(fields, { add, remove }) => (
                  <>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th className="text-center" style={{ width: '50px' }}>TT</th>
                            <th className="text-center" style={{ width: '30%' }} >Thành viên</th>
                            <th className="text-center">Chức vụ</th>
                            <th className="text-center" style={{ width: '30%' }}>Đơn vị công tác</th>
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
                                  name={[name, 'thanhVien']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <TDSelect
                                    notFoundContent="Không tìm thấy dữ liệu"
                                    reload
                                    showSearch
                                    placeholder="Chọn thành viên"
                                    fetchOptions={async keyword => {
                                      const res = await requestPOST<IPaginationResponse<any[]>>(`chuyengias/search`, {
                                        pageNumber: 1,
                                        pageSize: 1000,
                                        keyword: keyword,
                                      });
                                      return (
                                        res.data?.data?.map(item => ({
                                          ...item,
                                          label: (
                                            <Space>
                                              <Avatar
                                                size="small"
                                                src={item.dinhKem ? getThumbnailUrl(item.dinhKem) : undefined}
                                                icon={!item.dinhKem && <i className="fa-regular fa-user"></i>}
                                              />
                                              {formatName(item.hocHamVietTat, item.hocViVietTat, item.hoTen)}
                                            </Space>
                                          ),
                                          value: item?.id,
                                        })) ?? []
                                      );
                                    }}
                                    optionLabelProp="label"
                                    optionRender={(option) => (
                                      <Space>
                                        <Avatar
                                          size="small"
                                          src={option.data.dinhKem ? getThumbnailUrl(option.data.dinhKem) : undefined}
                                          icon={!option.data.dinhKem && <i className="fa-regular fa-user"></i>}
                                        />
                                        <span>{formatName(option.data.hocHamVietTat, option.data.hocViVietTat, option.data.hoTen)}</span>
                                      </Space>
                                    )}
                                    onChange={(value, current: any) => {
                                      if (value) {
                                        form.setFieldValue(['thanhViens', name, 'thanhVienId'], current?.id);
                                        setThanhVienIdSelected(prev => ({
                                          ...prev,
                                          [name]: current?.id
                                        }));
                                      } else {
                                        form.setFieldValue(['thanhViens', name, 'thanhVienId'], null);
                                        form.setFieldValue(['thanhViens', name, 'donViCongTac'], '');
                                        setThanhVienIdSelected(prev => {
                                          const updated = { ...prev };
                                          delete updated[name];
                                          return updated;
                                        });
                                      }
                                    }}
                                  />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'chucVu']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
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
                                        categoryGroupCode: CATEGORY_GROUP_CODE.CHUC_VU_HOI_DONG_TU_VAN,
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
                                        form.setFieldValue(['thanhViens', name, 'chucVuId'], current?.id);
                                      } else {
                                        form.setFieldValue(['thanhViens', name, 'chucVuId'], null);
                                      }
                                    }}
                                  />
                                </Form.Item>
                              </td>
                              <td>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'donViCongTac']}
                                  className="mb-0"
                                >
                                  <Input placeholder="" disabled />
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