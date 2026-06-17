import { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Form, Input, Select, Spin, Steps, DatePicker } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import dayjs from 'dayjs';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IKeHoach, IResult, IDanhMucChiPhi, LoaiNhapLieuChiPhi, IChiTietDuToan, IPaginationResponse } from '@/models';
import { requestGET, requestPOST, requestPUT, API_URL, FILE_URL } from '@/utils/baseAPI';
import { FileUpload, OrganizationUnitTreeSelect, OrganizationUnitTreeSelectByCode, TDHotTable, TDSelect } from '@/app/components';
import { CATEGORY_GROUP_CODE, LOAI_BANGS } from '@/data';
import { convertImage, handleImage } from '@/utils/utils';
import { numericRenderer } from 'handsontable/renderers';


export const KeHoachChoDuyetDetailModal = props => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModalCapHai) as any | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisibleCapHai);
  const id = dataModal?.id ?? null;
  const isReadOnly = dataModal?.readOnly ?? false;
  const isAdd = !id;

  const [form] = Form.useForm<IKeHoach>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tableData, setTableData] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [showLegendModal, setShowLegendModal] = useState<boolean>(false);

  const hotRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IKeHoach>>(`KeHoachs/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {
          const processedChiTiet = (_data.chiTietDuToans ?? []).map((item: any) => ({
            ...item,
            isSubHeader: item.stt && String(item.stt).split('.').length < 3,
          }));
          form.setFieldsValue({
            ..._data,
            chiTietDuToans: processedChiTiet,
          });
          setFileList(handleImage(_data.dinhKem ?? '', FILE_URL));
          setTableData(processedChiTiet);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
      } finally {
        setIsLoading(false);
      }
    };
    if (id && modalVisible) {
      fetchData();
    }
  }, [id, modalVisible, form]);

  const handleAddRowBelow = (rowIndex: number) => {
    const hotInstance = hotRef.current?.hotInstance;
    if (!hotInstance) return;

    const currentData = [...hotInstance.getSourceData()];

    const parentRow = currentData[rowIndex];

    const parentId = parentRow.id || null;
    const parentStt = parentRow.stt || '';

    let maxChildIndex = 0;
    let insertIndex = rowIndex + 1;
    const parentSttPartsLength = parentStt ? parentStt.split('.').length : 0;

    for (let i = rowIndex + 1; i < currentData.length; i++) {
      const childRow = currentData[i];
      if (childRow.stt && childRow.stt.startsWith(`${parentStt}.`)) {
        insertIndex = i + 1;

        const childSttParts = childRow.stt.split('.');
        if (childSttParts.length === parentSttPartsLength + 1) {
          const lastNum = parseInt(childSttParts[childSttParts.length - 1], 10);
          if (!isNaN(lastNum) && lastNum > maxChildIndex) {
            maxChildIndex = lastNum;
          }
        }
      } else {
        break;
      }
    }

    const nextStt = parentStt ? `${parentStt}.${maxChildIndex + 1}` : '';

    const newRow = {
      stt: nextStt,
      ten: 'Phần mềm...',
      kyHieu: '',
      chiPhiTruocThue: 0,
      chiPhiThueVAT: 0,
      chiPhiSauThue: 0,
      canCu: '',
      loaiNhapLieu: LoaiNhapLieuChiPhi.NguoiDungNhapLieu,
      danhMucChaId: parentId,
      isSubHeader: nextStt && String(nextStt).split('.').length < 2,
    };

    currentData.splice(insertIndex, 0, newRow);
    setTableData(currentData);
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    setTableData([]);
    setFileList([]);
    dispatch(actionsModal.setModalVisibleCapHai(false));
  };


  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields();
        const phanLoai = form.getFieldValue('phanLoai');
        if (!id || tableData.length === 0) {
          setIsLoading(true);
          try {
            const response = await requestGET<IDanhMucChiPhi[]>(`KeHoachs/template/${phanLoai}`);
            if (response?.data) {
              const templateData = response.data.map((item: any) => ({
                ...item,
                isSubHeader: item.stt && String(item.stt).split('.').length < 2,
              }));
              setTableData(templateData);
            }
          } catch (error) {
            console.error('Error fetching template:', error);
            toast.error('Không thể tải mẫu danh mục chi phí!');
          } finally {
            setIsLoading(false);
          }
        }
        setCurrentStep(1);
      } catch (error) {
        console.log('Validate Step 1 failed:', error);
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(0);
  };

  const calculateData = async (changes: any[] | null) => {
    if (!changes) return;
    const hotInstance = hotRef.current?.hotInstance;
    if (!hotInstance) return;

    const currentData = hotInstance.getSourceData();
    try {
      const response = await requestPOST<any[]>(`KeHoachs/calculate`, {
        phanLoai: form.getFieldValue('phanLoai'),
        danhMucChiPhis: currentData.map(item => ({
          ...item,
          chiPhiTruocThue: Number(item.chiPhiTruocThue) || 0,
        }))
      });
      console.log('Calculate response:', response);
      if (response?.data) {
        const processedData = response.data.map((item: any) => ({
          ...item,
          isSubHeader: item.stt && String(item.stt).split('.').length < 2,
        }));
        setTableData(processedData);
      }
    } catch (error) {
      console.error('Error calculating:', error);
    }
  };

  const onFinish = async () => {
    setButtonLoading(true);
    try {
      const values = form.getFieldsValue(true);
      const hotInstance = hotRef.current?.hotInstance;
      const chiTietData = hotInstance ? hotInstance.getSourceData() : tableData;
      const formData = {
        ...values,
        id: id || undefined,
        dinhKem: convertImage(fileList),
        chiTietDuToans: chiTietData.map((item: any) => ({
          id: isAdd ? undefined : item.id,
          KeHoachChoDuyetId: id || null,
          danhMucChiPhiId: item.id,
          dinhMuc: item.dinhMuc,
          chiPhiTruocThue: Number(item.chiPhiTruocThue) || 0,
          chiPhiThueVAT: Number(item.chiPhiThueVAT) || 0,
          chiPhiSauThue: Number(item.chiPhiSauThue) || 0,
          cachTinhGiaTri: item.cachTinhGiaTri,
        } as IChiTietDuToan)),
        nhuCauKinhPhi: chiTietData.find((item: any) => item.loaiNhapLieu === 5)?.chiPhiSauThue || 0,
      };

      const response = id
        ? await requestPUT<IResult<string>>(`KeHoachs/${id}`, formData)
        : await requestPOST<IResult<string>>(`KeHoachs`, formData);

      if (response?.status === 200) {
        toast.success(id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        dispatch(actionsGlobal.setRandom());
        handleCancel();
      } else {
        toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
      }
    } catch (error) {
      console.log('Failed:', error);
    } finally {
      setButtonLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      data: 'stt',
      title: 'STT',
      readOnly: false,
      width: 50,
      className: 'htCenter htMiddle',
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const rowData = instance.getSourceDataAtRow(row);
        cellProperties.readOnly = true;
        if (rowData.stt === 'II.2.1') {
          td.style.setProperty('background-color', '#DFFFEA', 'important');
        } else if (rowData.stt === 'VI') {
          td.style.setProperty('background-color', '#FFF4DE', 'important'); // light-warning
        } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
          td.style.setProperty('background-color', '#E1F0FF', 'important'); // light-primary
        } else {
          td.style.background = '#f7f7f9';
        }
        if (rowData.isSubHeader) {
          td.style.fontWeight = '600';
        }

        td.innerText = value || '';
        td.className = 'htCenter htMiddle';
        return td;
      }
    },
    {
      data: 'ten',
      title: 'Tên chi phí',
      readOnly: false,
      width: 250,
      className: 'htMiddle',
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const rowData = instance.getSourceDataAtRow(row);
        if (isReadOnly) {
          cellProperties.readOnly = true;
        } else if (rowData.stt === 'II.2.1') {
          cellProperties.readOnly = true;
          td.style.setProperty('background-color', '#DFFFEA', 'important');
        } else if (rowData.stt?.includes('II.2.1.')) {
          td.style.background = '#fff';
          cellProperties.readOnly = false;
        } else {
          cellProperties.readOnly = true;
        }

        if (rowData.stt === 'VI') {
          td.style.setProperty('background-color', '#FFF4DE', 'important');
        } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
          td.style.setProperty('background-color', '#E1F0FF', 'important');
        }

        if (rowData.isSubHeader) {
          td.style.fontWeight = '600';
        }
        td.innerText = value || '';
        return td;
      }
    },
    {
      data: 'kyHieu',
      title: 'Ký hiệu',
      readOnly: true,
      width: 100,
      className: 'htCenter htMiddle',
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const rowData = instance.getSourceDataAtRow(row);
        if (rowData.stt === 'II.2.1') {
          td.style.setProperty('background-color', '#DFFFEA', 'important');
        } else if (rowData.stt === 'VI') {
          td.style.setProperty('background-color', '#FFF4DE', 'important');
        } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
          td.style.setProperty('background-color', '#E1F0FF', 'important');
        } else {
          td.style.background = '';
        }
        if (rowData.isSubHeader) {
          td.style.fontWeight = '600';
        }
        td.innerText = value || '';
        td.className = 'htCenter htMiddle';
        return td;
      }
    },
    {
      data: 'chiPhiTruocThue',
      title: 'Chi phí trước thuế',
      type: 'numeric',
      numericFormat: { pattern: '0,0', culture: 'en-US' },
      width: 150,
      className: 'htRight htMiddle',
      readOnly: false,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const rowData = instance.getSourceDataAtRow(row);
        numericRenderer(instance, td, row, col, prop, value, cellProperties);
        if (isReadOnly) {
          cellProperties.readOnly = true;
        } else if (rowData.stt === 'II.2.1') {
          td.style.setProperty('background-color', '#DFFFEA', 'important');
          cellProperties.readOnly = true;
        } else if (rowData.loaiNhapLieu !== LoaiNhapLieuChiPhi.NguoiDungNhapLieu) {
          cellProperties.readOnly = true;
          td.style.background = '#f0f0f0';
        } else {
          cellProperties.readOnly = false;
          td.style.background = '#fff';
        }

        if (rowData.stt === 'VI') {
          td.style.setProperty('background-color', '#FFF4DE', 'important');
        } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
          td.style.setProperty('background-color', '#E1F0FF', 'important');
        }

        if (value && value !== 0 && rowData.cachTinhGiaTri) {
          td.setAttribute('title', rowData.cachTinhGiaTri);
        } else {
          td.removeAttribute('title');
        }

        if (rowData.isSubHeader) {
          td.style.fontWeight = '600';
        }
      }
    },
    {
      data: 'chiPhiThueVAT',
      title: 'Thuế VAT',
      type: 'numeric',
      numericFormat: { pattern: '0,0', culture: 'en-US' },
      width: 120,
      className: 'htRight htMiddle',
      readOnly: true,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const rowData = instance.getSourceDataAtRow(row);
        numericRenderer(instance, td, row, col, prop, value, cellProperties);
        if (rowData.stt === 'II.2.1') {
          td.style.setProperty('background-color', '#DFFFEA', 'important');
        } else if (rowData.stt === 'VI') {
          td.style.setProperty('background-color', '#FFF4DE', 'important');
        } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
          td.style.setProperty('background-color', '#E1F0FF', 'important');
        } else {
          td.style.background = '';
        }

        if (rowData.isSubHeader) {
          td.style.fontWeight = '600';
        }
      }
    },
    {
      data: 'chiPhiSauThue',
      title: 'Chi phí sau thuế',
      type: 'numeric',
      numericFormat: { pattern: '0,0', culture: 'en-US' },
      width: 150,
      className: 'htRight htMiddle',
      readOnly: true,
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const rowData = instance.getSourceDataAtRow(row);
        numericRenderer(instance, td, row, col, prop, value, cellProperties);
        if (rowData.stt === 'II.2.1') {
          td.style.setProperty('background-color', '#DFFFEA', 'important');
        } else if (rowData.stt === 'VI') {
          td.style.setProperty('background-color', '#FFF4DE', 'important');
        } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
          td.style.setProperty('background-color', '#E1F0FF', 'important');
        } else {
          td.style.background = '';
        }

        if (rowData.isSubHeader) {
          td.style.fontWeight = '600';
        }
      }
    },
    {
      data: 'canCu',
      title: 'Căn cứ',
      readOnly: false,
      width: 180,
      className: 'htMiddle',
      renderer: (instance, td, row, col, prop, value, cellProperties) => {
        const rowData = instance.getSourceDataAtRow(row);
        if (isReadOnly) {
          cellProperties.readOnly = true;
        } else if (rowData.stt === 'II.2.1') {
          cellProperties.readOnly = true;
          td.style.setProperty('background-color', '#DFFFEA', 'important');
        } else if (rowData.stt?.includes('II.2.1.')) {
          td.style.background = '#fff';
          cellProperties.readOnly = false;
        } else {
          cellProperties.readOnly = true;
        }

        if (rowData.stt === 'VI') {
          td.style.setProperty('background-color', '#FFF4DE', 'important');
        } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
          td.style.setProperty('background-color', '#E1F0FF', 'important');
        }

        if (rowData.isSubHeader) {
          td.style.fontWeight = '600';
        }
        td.innerText = value || '';
        return td;
      }
    },
  ], [isReadOnly]);

  return (
    <>
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
          <Modal.Title className="text-white">
            {isReadOnly ? 'Chi tiết kế hoạch' : (id ? 'Chỉnh sửa kế hoạch' : 'Thêm mới kế hoạch')}
          </Modal.Title>
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
        </Modal.Header>
        <Modal.Body>
          {isAdd && (
            <Steps
              current={currentStep}
              className="mb-4"
              items={[
                { title: 'Thông tin chung' },
                { title: 'Chi tiết dự toán' },
              ]}
            />
          )}

          <Spin spinning={isLoading}>
            <div style={{ display: (isAdd ? currentStep === 0 : true) ? 'block' : 'none' }}>
              <Form form={form} layout="vertical" autoComplete="off" disabled={isReadOnly}>
                <div className="row">
                  <div className="col-xl-8 col-lg-8">
                    <Form.Item label="Tên kế hoạch" name="ten" rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <Input placeholder=" " />
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item label="Đơn vị" name="organizationUnitCode">
                      <OrganizationUnitTreeSelectByCode useCurrentUserDefault={false} disabled />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Thời gian thực hiện" name="thoiGianThucHien" rules={[{ required: true, message: 'Không được để trống!' }]}>
                      <Input placeholder=" " />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Phân loại" name="phanLoai" rules={[{ required: true, message: 'Vui lòng chọn phân loại!' }]}>
                      <Select placeholder=" " disabled={!isAdd}>
                        {LOAI_BANGS.map(item => (
                          <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Loại nhiệm vụ" name="loaiNhiemVu" >
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
                            categoryGroupCode: CATEGORY_GROUP_CODE.LOAI_NHIEM_VU,
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
                            form.setFieldValue('loaiNhiemVuId', current?.id);
                          } else {
                            form.setFieldValue('loaiNhiemVuId', null);
                          }
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Nguồn nhiệm vụ" name="nguonNhiemVu" >
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
                            categoryGroupCode: CATEGORY_GROUP_CODE.NGUON_NHIEM_VU,
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
                            form.setFieldValue('nguonNhiemVuId', current?.id);
                          } else {
                            form.setFieldValue('nguonNhiemVuId', null);
                          }
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Ghi chú" name="ghiChu">
                      <Input.TextArea rows={4} placeholder=" " />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Đính kèm">
                      <FileUpload
                        URL={`${API_URL}/api/v1/attachments/public`}
                        fileList={fileList}
                        onChange={e => setFileList(e.fileList)}
                        multiple={true}
                        disabled={isReadOnly}
                      />
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </div>

            {(isAdd ? currentStep === 1 : true) && !isLoading && (
              <div style={{ height: '500px' }} className={!isAdd ? 'mt-4' : ''}>
                <TDHotTable
                  ref={hotRef}
                  data={tableData}
                  columns={columns}
                  stretchH="all"
                  readOnly={isReadOnly}
                  afterChange={(changes) => {
                    if (changes) {
                      calculateData(changes);
                    }
                  }}
                  contextMenu={isReadOnly ? false : {
                    items: {
                      "add_child_row": {
                        name: 'Thêm dòng bên dưới',
                        hidden: function () {
                          const selected = this.getSelectedLast();
                          if (!selected) return true;

                          const rowIndex = selected[0];
                          const rowData = this.getSourceDataAtRow(rowIndex) as any;
                          return rowData?.stt !== 'II.2.1';
                        },
                        callback: function (key, selection, clickEvent) {
                          const rowIndex = selection[0].end.row;
                          handleAddRowBelow(rowIndex); // Gọi hàm thêm vào State
                        }
                      },
                      "hsep1": "---------",
                      "remove_row": {
                        name: 'Xóa dòng',
                        hidden: function () {
                          // Ẩn nút xóa nếu đang chọn dòng cha II.2.1
                          const selected = this.getSelectedLast();
                          if (!selected) return true;
                          const rowData = this.getSourceDataAtRow(selected[0]) as any;
                          return rowData?.stt?.includes('II.2.1.') ? false : true; // Chỉ cho phép xóa nếu là dòng con của II.2.1
                        }
                      },
                      "hsep2": "---------",
                      "legend": {
                        name: 'Chú thích',
                        callback: function () {
                          setShowLegendModal(true);
                        }
                      }
                    }
                  }}
                  wrapperStyle={{ height: '100%' }}

                />
              </div>
            )}
          </Spin>
        </Modal.Body>
        <Modal.Footer className="bg-light px-4 py-2">
          <div className="d-flex justify-content-end w-100">
            {isAdd && currentStep === 1 && (
              <Button variant="secondary" className="btn-sm ms-2" onClick={handlePrev} disabled={buttonLoading}>
                <i className="fa-regular fa-arrow-left"></i> Quay lại
              </Button>
            )}
            {isAdd && currentStep === 0 ? (
              <Button variant="primary" className="btn-sm ms-2" onClick={handleNext}>
                Tiếp theo <i className="fa-regular fa-arrow-right"></i>
              </Button>
            ) : (
              !isReadOnly && (
                <Button variant="primary" className="btn-sm ms-2" onClick={onFinish} disabled={buttonLoading}>
                  <i className="fa-regular fa-floppy-disk"></i> {id ? 'Lưu' : 'Tạo mới'}
                </Button>
              )
            )}
            <Button variant="secondary" className="btn-sm ms-2" onClick={handleCancel} disabled={buttonLoading}>
              <i className="fa-regular fa-xmark"></i> Đóng
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <LegendModal show={showLegendModal} onHide={() => setShowLegendModal(false)} />
    </>
  );
};

const LegendModal = ({ show, onHide }: { show: boolean; onHide: () => void }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chú thích bảng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-center mb-3">
          <div style={{ width: 25, height: 25, background: '#f0f0f0', border: '1px solid #ccc', marginRight: 10 }}></div>
          <span>Chỉ đọc</span>
        </div>
        <div className="d-flex align-items-center mb-3">
          <div style={{ width: 25, height: 25, background: '#fff', border: '1px solid #ccc', marginRight: 10 }}></div>
          <span>Cho phép chỉnh sửa</span>
        </div>
        <div className="d-flex align-items-center mb-3">
          <div style={{ width: 25, height: 25, background: '#DFFFEA', border: '1px solid #ccc', marginRight: 10 }}></div>
          <span>Cho phép thêm dòng con (Dự án phần mềm)</span>
        </div>
        <div className="d-flex align-items-center mb-3">
          <div style={{ width: 25, height: 25, background: '#FFF4DE', border: '1px solid #ccc', marginRight: 10 }}></div>
          <span>Cho phép nhập định mức</span>
        </div>
        <div className="d-flex align-items-center mb-3">
          <div style={{ width: 25, height: 25, background: '#E1F0FF', border: '1px solid #ccc', marginRight: 10 }}></div>
          <span>Dòng tính tổng dự toán</span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="btn-sm" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
