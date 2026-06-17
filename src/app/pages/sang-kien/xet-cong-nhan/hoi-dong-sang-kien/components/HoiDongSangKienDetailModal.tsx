import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Avatar, DatePicker, Form, Input, Space, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IChuyenGia, IHoiDongSangKien, IThanhVienHoiDongSangKien, IPaginationResponse, IResult } from '@/models';
import { formatName, getThumbnailUrl, handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';
import { API_URL, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs from 'dayjs';




export const HoiDongSangKienDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const { totalCount } = props
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IHoiDongSangKien | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IHoiDongSangKien>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [chuyenGiaIdSelected, setChuyenGiaIdSelected] = useState<{ [key: number]: string | null }>({});

  useEffect(() => {
    const fetchChuyenGiaDonVi = async () => {
      const entries = Object.entries(chuyenGiaIdSelected);
      for (const [rowIndex, chuyenGiaId] of entries) {
        if (chuyenGiaId) {
          try {
            const res = await requestGET<IResult<IChuyenGia>>(`chuyengias/${chuyenGiaId}`);
            const _data = res?.data?.data ?? null;
            if (_data) {
              form.setFieldValue(['thanhViens', Number(rowIndex), 'donViCongTac'], _data.donViCongTac || '');
            }
          } catch (error) {
            console.error('Error fetching chuyen gia info:', error);
          }
        }
      }
    };

    const hasSelection = Object.values(chuyenGiaIdSelected).some(cid => cid);
    if (hasSelection) {
      fetchChuyenGiaDonVi();
    }
  }, [chuyenGiaIdSelected, form]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IHoiDongSangKien>>(`HoiDongDanhGias/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          const thanhViensWithInfo = await Promise.all(
            (_data?.thanhViens || []).map(async (item: any, index: number) => {
              const cgId = item.chuyenGiaId ?? null;
              let chuyenGiaLabel: React.ReactNode = item.chuyenGiaHoTen ?? '';
              let donViCongTac = item.donViCongTac ?? '';

              if (cgId) {
                try {
                  const res = await requestGET<IResult<IChuyenGia>>(`chuyengias/${cgId}`);
                  const chuyenGiaData = res?.data?.data;
                  if (chuyenGiaData) {
                    chuyenGiaLabel = (
                      <Space>
                        <Avatar
                          size="small"
                          src={chuyenGiaData.dinhKem ? getThumbnailUrl(chuyenGiaData.dinhKem) : undefined}
                          icon={!chuyenGiaData.dinhKem && <i className="fa-regular fa-user"></i>}
                        />
                        {formatName(chuyenGiaData.hocHamVietTat, chuyenGiaData.hocViVietTat, chuyenGiaData.hoTen)}
                      </Space>
                    );
                    donViCongTac = chuyenGiaData.donViCongTac || donViCongTac || '';
                  }
                } catch (error) {
                  console.error('Error fetching chuyen gia info:', error);
                }
              }

              const vaiTroStr =
                typeof item.vaiTro === 'string'
                  ? item.vaiTro
                  : item.chucVuTen ?? item.vaiTro?.label ?? item.vaiTro?.value ?? '';

              setChuyenGiaIdSelected(prev => ({
                ...prev,
                [index]: cgId
              }));

              return {
                ...item,
                chuyenGiaId: cgId,
                donViCongTac,
                chuyenGia: cgId
                  ? {
                    value: cgId,
                    label: chuyenGiaLabel,
                  }
                  : null,
                vaiTro: vaiTroStr
                  ? {
                    value: vaiTroStr,
                    label: vaiTroStr,
                  }
                  : null,
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
    setChuyenGiaIdSelected({});
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const { thanhViens, ...restValues } = values;

      const normalizedThanhViens =
        (thanhViens || []).map((row: any) => {
          const chuyenGiaIdVal = row.chuyenGiaId ?? row.chuyenGia?.value ?? null;
          let vaiTroStr: string | null = null;
          const v = row.vaiTro;
          if (typeof v === 'string') {
            vaiTroStr = v || null;
          } else if (v && typeof v === 'object') {
            vaiTroStr = (v as any).value ?? (v as any).label ?? null;
          }

          const out: Record<string, unknown> = {
            chuyenGiaId: chuyenGiaIdVal,
            vaiTro: vaiTroStr,
            donViCongTac: row.donViCongTac ?? '',
          };
          if (row.id) {
            out.id = row.id;
          }
          return out;
        }) ?? [];

      const formData: IHoiDongSangKien = {
        ...restValues,
        ...(id && { id }),
        ngayThanhLap: toSaveDate(values.ngayThanhLap),
        dinhKem: handleFiles(dinhKem).join('##'),
        thanhViens: normalizedThanhViens as IThanhVienHoiDongSangKien[],
      };

      const response = id
        ? await requestPUT<IResult<string>>(`HoiDongDanhGias/${id}`, formData)
        : await requestPOST<IResult<string>>(`HoiDongDanhGias`, formData);

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
            <Form<IHoiDongSangKien>
              initialValues={{
                thanhViens: [{
                  chuyenGiaId: null,
                  chuyenGia: null,
                  vaiTro: null,
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
                            <th className="text-center" style={{ width: '30%' }} >Chuyên gia</th>
                            <th className="text-center">Vai trò</th>
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
                                  name={[name, 'chuyenGia']}
                                  className="mb-0"
                                  rules={[{ required: true, message: "Không được để trống!" }]}
                                >
                                  <TDSelect
                                    notFoundContent="Không tìm thấy dữ liệu"
                                    reload
                                    showSearch
                                    placeholder="Chọn chuyên gia"
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
                                        form.setFieldValue(['thanhViens', name, 'chuyenGiaId'], current?.id);
                                        setChuyenGiaIdSelected(prev => ({
                                          ...prev,
                                          [name]: current?.id
                                        }));
                                      } else {
                                        form.setFieldValue(['thanhViens', name, 'chuyenGiaId'], null);
                                        form.setFieldValue(['thanhViens', name, 'donViCongTac'], '');
                                        setChuyenGiaIdSelected(prev => {
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
                                  name={[name, 'vaiTro']}
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
                                          value: item?.name,
                                        })) ?? []
                                      );
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