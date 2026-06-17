import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, InputNumber, Spin } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IBangDinhMuc, IPaginationResponse, IResult } from '@/models';
import { handleImage } from '@/utils/utils';
import { HOST_API, requestGET, requestPOST } from '@/utils/baseAPI';
import { requestPUT } from '@/utils/baseAPI';
import { TDUploadFile } from '@/models/TDUploadFile';
import { FileUpload, HeaderTitle, TDSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE } from '@/data';

export const BangDinhMucDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IBangDinhMuc | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;

  const [form] = Form.useForm<IBangDinhMuc>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [mocDinhMucs, setMocDinhMucs] = useState<number[]>([0, 7, 15, 20, 30, 50, 100, 150, 200, 500, 1000]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IBangDinhMuc>>(`BangDinhMucs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          // Trích xuất các mốc định mức từ dữ liệu trả về nếu có để đồng bộ UI
          let currentMocs = mocDinhMucs;
          if (_data?.danhMucHangMucs?.[0]?.chiTietHangMucs?.length) {
            const mocsFromData = _data.danhMucHangMucs[0].chiTietHangMucs
              .map(ct => ct.mocDinhMuc)
              .filter((m): m is number => m !== null && m !== undefined)
              .sort((a, b) => a - b);
            if (mocsFromData.length > 0) {
              currentMocs = mocsFromData;
              setMocDinhMucs(mocsFromData);
            }
          }
          setMocDinhMucs(currentMocs);
          form.setFieldsValue({
            ..._data,
            mocDinhMucs: currentMocs.join(', '),
            danhMucHangMucs:
              _data?.danhMucHangMucs?.map(item => {
                const chiTiets = item?.chiTietHangMucs ?? [];
                // Ánh xạ chi tiết hạng mục khớp với các cột mốc định mức đang hiển thị
                const alignedChiTiets = currentMocs.map(moc => {
                  const found = chiTiets.find(ct => ct.mocDinhMuc === moc);
                  return found ? { ...found, dinhMuc: found.heSo } : { mocDinhMuc: moc, dinhMuc: 0 };
                });

                return {
                  ...item,
                  loaiDuAnId: item.loaiDuAnId,
                  loaiDuAn: item.loaiDuAnId ? { value: item.loaiDuAnId, label: item.loaiDuAnTen || '' } : null,
                  chiTietHangMucs: alignedChiTiets ?? [],
                };
              }) ?? [],
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, form]);

  const handleCancel = () => {
    form.resetFields();
    setDinhKem([]);
    dispatch(actionsModal.setModalVisible(false));
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      await form.validateFields();

      const values = form.getFieldsValue(true);
      const dinhKemString = dinhKem?.map(x => x.url).join(',') || '';

      // Chuẩn hóa dữ liệu theo CreateBangDinhMucRequest/UpdateBangDinhMucRequest
      const formData = {
        id: id || undefined,
        ma: values.ma,
        ten: values.ten,
        ghiChu: values.ghiChu,
        dinhKem: dinhKemString,
        danhMucHangMucs: values.danhMucHangMucs?.map((dm: any) => ({
          id: dm.id || undefined,
          loaiDuAnId: dm.loaiDuAnId || dm.loaiDuAn,
          ghiChu: dm.ghiChu,
          chiTietHangMucs: mocDinhMucs.map((moc, idx) => {
            const ct = dm.chiTietHangMucs?.[idx];
            return {
              id: ct?.id || undefined,
              mocDinhMuc: moc,
              heSo: ct?.dinhMuc ?? 0,
            };
          }),
        })),
      };

      const response = id
        ? await requestPUT<IResult<string>>(`BangDinhMucs/${id}`, formData)
        : await requestPOST<IResult<string>>(`BangDinhMucs`, formData);

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
    <Modal show={modalVisible} fullscreen={true} size="xl" onExited={handleCancel} keyboard={true} scrollable={true} onEscapeKeyDown={handleCancel}>
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Chi tiết</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={isLoading}>
          {!isLoading && (
            <Form<IBangDinhMuc>
              initialValues={{
                danhMucHangMucs: [{}],
                mocDinhMucs: mocDinhMucs.join(', '),
              }}
              form={form}
              layout="vertical"
              autoComplete="off"
            >
              <div className="row">
                <div className="col-xl-8 col-lg-8">
                  <Form.Item label="Tên" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Mã" name="ma" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input placeholder="" />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Mốc định mức" name="mocDinhMucs" rules={[{ required: true, message: 'Không được để trống!' }]}>
                    <Input
                      placeholder=""
                      onChange={e => {
                        const newMocs = e.target.value
                          .split(',')
                          .map(v => parseFloat(v.trim()))
                          .filter(v => !isNaN(v));
                        setMocDinhMucs(newMocs);
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Ghi chú" name="ghiChu">
                    <Input placeholder="" />
                  </Form.Item>
                </div>

                <div className="col-xl-4 col-lg-4">
                  <Form.Item label="Đính kèm" name="dinhKem">
                    <FileUpload
                      accept={['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc']}
                      multiple={false}
                      URL={`${HOST_API}attachments/public`}
                      maxCount={2}
                      fileList={dinhKem}
                      onChange={e => {
                        setDinhKem(e.fileList);
                      }}
                      isUseAliyunOSS
                    />
                  </Form.Item>
                </div>
                <HeaderTitle title={'Thông tin chi tiết'} />
                <Form.List name="danhMucHangMucs">
                  {(fields, { add, remove }) => (
                    <>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th rowSpan={2} className="text-center align-middle" style={{ width: '3%' }}>
                                STT
                              </th>
                              <th rowSpan={2} className="text-center align-middle" >
                                Loại dự án
                              </th>
                              <th rowSpan={2} className="text-center align-middle">
                                Ghi chú
                              </th>
                              <th colSpan={mocDinhMucs.length} className="text-center align-middle">
                                Bảng định mức (chưa có thuế GTGT) (tỷ đồng)
                              </th>
                              <th rowSpan={2} className="text-center align-middle" style={{ width: '5%' }}>
                                Thao tác
                              </th>
                            </tr>
                            <tr>
                              {mocDinhMucs.map(v => (
                                <th key={v} className="text-center" style={{ width: '5%' }}>
                                  {v}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td className="text-center">{index + 1}</td>
                                <td>
                                  <Form.Item {...restField} name={[name, 'loaiDuAn']} className="mb-0" rules={[{ required: true, message: 'Không được để trống!' }]}>
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
                                          categoryGroupCode: CATEGORY_GROUP_CODE.LOAI_DU_AN,
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
                                          form.setFieldValue(['danhMucHangMucs', name, 'loaiDuAnId'], current?.id);
                                        } else {
                                          form.setFieldValue(['danhMucHangMucs', name, 'loaiDuAnId'], null);
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item {...restField} name={[name, 'ghiChu']} className="mb-0">
                                    <Input.TextArea placeholder=" " autoSize={{ minRows: 1, maxRows: 3 }} />
                                  </Form.Item>
                                </td>
                                {mocDinhMucs.map((v, idx) => (
                                  <td key={idx}>
                                    <Form.Item {...restField}
                                      name={[name, 'chiTietHangMucs', idx, 'dinhMuc']}
                                      className="mb-0"
                                      rules={[{ required: true, message: 'Không được để trống!' }]}>
                                      <InputNumber
                                        controls={false}
                                        placeholder=""
                                        style={{ width: '100%' }}
                                        min={0} />
                                    </Form.Item>
                                  </td>
                                ))}
                                <td className="text-center align-middle">
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
                                <Button type="button" className="btn btn-sm btn-primary" onClick={() => add()} disabled={dataModal?.readOnly ?? false}>
                                  <i className="fa-regular fa-plus me-2"></i>
                                  Thêm
                                </Button>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  )}
                </Form.List>
              </div>
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