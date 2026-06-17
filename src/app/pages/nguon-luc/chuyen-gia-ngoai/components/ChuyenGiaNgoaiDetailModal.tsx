import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker, Form, Input, Radio, Spin, type FormInstance } from 'antd';
import { Modal, Button } from 'react-bootstrap';

import * as actionsModal from '@/redux/modal/Actions';
import * as actionsGlobal from '@/redux/global/Actions';
import { RootState, AppDispatch } from '@/redux/Store';
import { IChuyenGia, IPaginationResponse, IResult, DiemTrinhDoNgoaiNgu, ITrinhDoNgoaiNgu, ITrinhDoNgoaiNguFormItem } from '@/models';
import { API_URL, requestGET, requestPOST, requestPUT } from '@/utils/baseAPI';
import { FileUpload, HeaderTitle, ImageUpload, TDSelect } from '@/app/components';
import { TDUploadFile } from '@/models/TDUploadFile';
import { CATEGORY_GROUP_CODE, GENDERS } from '@/data';
import { useAuth } from '@/app/modules/auth';
import { handleFiles, handleImage, toSaveDate, toViewDate } from '@/utils/utils';


const SingleSelectCheckbox = ({
  checked,
  onChange,
  group,
  field,
  index,
  form
}: {
  checked?: boolean;
  onChange?: (e: any) => void;
  group: string;
  field: string;
  index: number;
  form: FormInstance<IChuyenGia>
}) => {
  return (
    <input
      type="checkbox"
      className="form-check-input"
      checked={checked}
      onChange={(e) => {
        if (onChange) {
          onChange(e);
        }

        if (e.target.checked && field) {
          const fieldsToReset: Record<string, string[]> = {
            nghe: ['ngheTot', 'ngheKha', 'ngheTrungBinh'],
            noi: ['noiTot', 'noiKha', 'noiTrungBinh'],
            viet: ['vietTot', 'vietKha', 'vietTrungBinh'],
            doc: ['docTot', 'docKha', 'docTrungBinh'],
          };
          const siblings = fieldsToReset[group].filter(f => f !== field);
          const currentValues = form.getFieldValue('trinhDoNgoaiNgus') || [];

          if (currentValues[index]) {
            const updatedItem = { ...currentValues[index] };
            siblings.forEach(sibling => {
              updatedItem[sibling] = false;
            });

            const newValues = [...currentValues];
            newValues[index] = updatedItem;

            form.setFieldValue('trinhDoNgoaiNgus', newValues);
          }
        }
      }}
    />
  );
};

export const ChuyenGiaNgoaiDetailModal = () => {
  const dispatch: AppDispatch = useDispatch();
  const dataModal = useSelector((state: RootState) => state.modal.dataModal) as IChuyenGia | null;
  const modalVisible = useSelector((state: RootState) => state.modal.modalVisible);
  const id = dataModal?.id ?? null;
  const { currentUser } = useAuth();
  const [form] = Form.useForm<IChuyenGia>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [dinhKem, setDinhKem] = useState<TDUploadFile[]>([]);
  const [ngoaiNguDinhKems, setNgoaiNguDinhKems] = useState<{ [key: number]: TDUploadFile[] }>({});


  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await requestGET<IResult<IChuyenGia>>(`ChuyenGias/${id}`);
        const _data = response?.data?.data ?? null;
        if (_data) {

          _data.maNgach = _data?.maNgachId ? {
            value: _data?.maNgachId,
            label: _data?.maNgachTen
          } : null;

          _data.hocVi = _data?.hocViId ? {
            value: _data?.hocViId,
            label: _data?.hocViTen
          } : null;

          _data.hocHam = _data?.hocHamId ? {
            value: _data?.hocHamId,
            label: _data?.hocHamTen
          } : null;

          _data.ngaySinh = toViewDate(_data?.ngaySinh);
          _data.ngayDatHocVi = toViewDate(_data?.ngayDatHocVi);
          _data.ngayDatHocHam = toViewDate(_data?.ngayDatHocHam);
          setDinhKem(handleImage(_data?.dinhKem ?? ''));

          if (_data.trinhDoNgoaiNgus) {
            _data.trinhDoNgoaiNgus = _data.trinhDoNgoaiNgus.map((lang: any) => ({
              ...lang,
              ngoaiNgu: lang.ngoaiNguId ? { value: lang.ngoaiNguId, label: lang.ngoaiNguTen } : null,
              ngoaiNguTen: lang.ngoaiNguTen,
              ngheTot: lang.nghe === DiemTrinhDoNgoaiNgu.Tot,
              ngheKha: lang.nghe === DiemTrinhDoNgoaiNgu.Kha,
              ngheTrungBinh: lang.nghe === DiemTrinhDoNgoaiNgu.TrungBinh,
              noiTot: lang.noi === DiemTrinhDoNgoaiNgu.Tot,
              noiKha: lang.noi === DiemTrinhDoNgoaiNgu.Kha,
              noiTrungBinh: lang.noi === DiemTrinhDoNgoaiNgu.TrungBinh,
              vietTot: lang.viet === DiemTrinhDoNgoaiNgu.Tot,
              vietKha: lang.viet === DiemTrinhDoNgoaiNgu.Kha,
              vietTrungBinh: lang.viet === DiemTrinhDoNgoaiNgu.TrungBinh,
              docTot: lang.doc === DiemTrinhDoNgoaiNgu.Tot,
              docKha: lang.doc === DiemTrinhDoNgoaiNgu.Kha,
              docTrungBinh: lang.doc === DiemTrinhDoNgoaiNgu.TrungBinh,
            }));
            const dinhKems = _data?.trinhDoNgoaiNgus?.reduce((
              acc: { [key: number]: TDUploadFile[] }, item: any, index: number) => {
              if (item.dinhKem && item.dinhKem.length > 0) {
                acc[index] = handleImage(item.dinhKem);
              }
              return acc;
            }, {}) || {};
            setNgoaiNguDinhKems(dinhKems);
          }

          form.setFieldsValue({
            ..._data,
            trinhDoNgoaiNgus: _data.trinhDoNgoaiNgus || [],
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

      const transformedForeignLanguages: ITrinhDoNgoaiNgu[] = values.trinhDoNgoaiNgus?.map((lang: ITrinhDoNgoaiNguFormItem, index: number) => {
        const getDiemTrinhDoNgoaiNgu = (tot: boolean, kha: boolean, trungbinh: boolean): DiemTrinhDoNgoaiNgu | null => {
          if (tot) return DiemTrinhDoNgoaiNgu.Tot;
          if (kha) return DiemTrinhDoNgoaiNgu.Kha;
          if (trungbinh) return DiemTrinhDoNgoaiNgu.TrungBinh;
          return null;
        };

        return {
          id: lang.id,
          ngoaiNguId: lang.ngoaiNguId,
          nghe: getDiemTrinhDoNgoaiNgu(lang.ngheTot, lang.ngheKha, lang.ngheTrungBinh),
          noi: getDiemTrinhDoNgoaiNgu(lang.noiTot, lang.noiKha, lang.noiTrungBinh),
          viet: getDiemTrinhDoNgoaiNgu(lang.vietTot, lang.vietKha, lang.vietTrungBinh),
          doc: getDiemTrinhDoNgoaiNgu(lang.docTot, lang.docKha, lang.docTrungBinh),
          dinhKem: handleFiles(ngoaiNguDinhKems[index] || []).join('##'),
        } as ITrinhDoNgoaiNgu;
      }) || [];

      const formData: IChuyenGia = {
        ...values,
        ...(id && { id }),
        ngaySinh: toSaveDate(values.ngaySinh),
        ngayDatHocVi: toSaveDate(values.ngayDatHocVi),
        ngayDatHocHam: toSaveDate(values.ngayDatHocHam),
        dinhKem: dinhKem ? handleFiles(dinhKem).join('##') : '',
        trinhDoNgoaiNgus: transformedForeignLanguages,
      };
      const response = id
        ? await requestPUT<IResult<string>>(`ChuyenGias/${id}`, formData)
        : await requestPOST<IResult<string>>(`ChuyenGias`, formData);

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
            <Form<IChuyenGia>
              initialValues={{
                organizationUnitId: currentUser?.organizationUnitId,
                laChuyenGiaNgoai: true,
              }}
              form={form} layout="vertical" autoComplete="off"
              disabled={dataModal?.readOnly ?? false}>
              <>
                <HeaderTitle title={"Thông tin chung"} />
                <div className="row">
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item label="Ảnh chân dung (4x6)" name='dinhKem'
                      rules={[
                        { required: true, message: "Không được để trống!" },
                      ]}
                    >
                      <ImageUpload
                        accept={['.png', '.jpg', '.jpeg']}
                        URL={`${API_URL}/api/v1/attachments/public`}
                        fileList={dinhKem}
                        data={{
                          generateThumbnail: true,
                        }}
                        onChange={e => {
                          setDinhKem(e.fileList);
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="row">
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item
                      label="Họ tên"
                      name="hoTen"
                      rules={[
                        { required: true, message: "Không được để trống!" },
                      ]}
                    >
                      <Input placeholder="" allowClear />
                    </Form.Item>
                  </div>

                  <div className="col-xl-2 col-lg-2">
                    <Form.Item label="Ngày sinh" name="ngaySinh"
                      rules={[
                        { required: true, message: "Không được để trống!" },
                      ]}>
                      <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  <div className="col-xl-2 col-lg-2">
                    <Form.Item
                      name="gioiTinh"
                      label="Giới tính"
                      rules={[
                        { required: true, message: "Không được để trống!" },
                      ]}
                    >
                      <Radio.Group block>
                        {GENDERS?.map((item, key) => (
                          <Radio.Button
                            key={key}
                            value={item.id}
                          >
                            <span className='user-select-none'>{item.name}</span>
                          </Radio.Button>
                        ))}
                      </Radio.Group>
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4"></div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item
                      label="Điện thoại"
                      name="dienThoai"
                    >
                      <Input placeholder="" allowClear />
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item
                      label="Email"
                      name="email"
                    >
                      <Input placeholder="" allowClear />
                    </Form.Item>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <Form.Item
                      label="Địa chỉ"
                      name="diaChi"
                    >
                      <Input placeholder="" allowClear />
                    </Form.Item>
                  </div>

                  <div className="col-xl-6 col-lg-6">
                    <Form.Item
                      label="Đơn vị công tác"
                      name="donViCongTac"
                    >
                      <Input placeholder="" allowClear />
                    </Form.Item>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <Form.Item label="Chức vụ" name="chucVu">
                      <Input placeholder="" allowClear />
                    </Form.Item>
                  </div>
                </div>

                <HeaderTitle title={"Thông tin chuyên môn"} />
                <div className="row">
                  <div className="col-xl-3 col-lg-3">
                    <Form.Item label="Học vị" name="hocVi">
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
                            categoryGroupCode: CATEGORY_GROUP_CODE.HOC_VI,
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
                            form.setFieldValue('hocViId', current?.id);
                          } else {
                            form.setFieldValue('hocViId', null);
                          }
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Item label="Ngày đạt học vị" name="ngayDatHocVi">
                      <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Item label="Học hàm" name="hocHam">
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
                            categoryGroupCode: CATEGORY_GROUP_CODE.HOC_HAM,
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
                            form.setFieldValue('hocHamId', current?.id);
                          } else {
                            form.setFieldValue('hocHamId', null);
                          }
                        }}
                      />
                    </Form.Item>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Item label="Ngày đạt học hàm" name="ngayDatHocHam">
                      <DatePicker placeholder='' format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                  </div>

                  <div className="col-xl-3 col-lg-3">
                    <Form.Item
                      label="Lĩnh vực"
                      name="linhVuc"
                    >
                      <Input.TextArea rows={2} placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Item
                      label="Chuyên ngành"
                      name="chuyenNganh"
                    >
                      <Input.TextArea rows={2} placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Item
                      label="Chuyên môn"
                      name="chuyenMon"
                    >
                      <Input.TextArea rows={2} placeholder="" />
                    </Form.Item>
                  </div>
                  <div className="col-xl-3 col-lg-3">
                    <Form.Item
                      label="Hướng nghiên cứu"
                      name="huongNghienCuu"
                    >
                      <Input.TextArea rows={2} placeholder="" />
                    </Form.Item>
                  </div>
                </div>
                <HeaderTitle title={"Trình độ ngoại ngữ"} />
                <Form.List name="trinhDoNgoaiNgus">
                  {(fields, { add, remove }) => (
                    <>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th rowSpan={2} className="text-center align-middle" style={{ width: '50px' }}>TT</th>
                              <th rowSpan={2} className="text-center align-middle" >Tên ngoại ngữ</th>
                              <th colSpan={3} className="text-center">Nghe</th>
                              <th colSpan={3} className="text-center">Nói</th>
                              <th colSpan={3} className="text-center">Viết</th>
                              <th colSpan={3} className="text-center">Đọc hiểu tài liệu</th>
                              <th rowSpan={2} className="text-center align-middle" style={{ width: '15%' }} >Đính kèm</th>
                              <th rowSpan={2} className="text-center align-middle" style={{ width: '5%' }}>Thao tác</th>
                            </tr>
                            <tr>
                              <th className="text-center" style={{ width: '5%' }}>Tốt</th>
                              <th className="text-center" style={{ width: '5%' }}>Khá</th>
                              <th className="text-center" style={{ width: '5%' }}>TB</th>
                              <th className="text-center" style={{ width: '5%' }}>Tốt</th>
                              <th className="text-center" style={{ width: '5%' }}>Khá</th>
                              <th className="text-center" style={{ width: '5%' }}>TB</th>
                              <th className="text-center" style={{ width: '5%' }}>Tốt</th>
                              <th className="text-center" style={{ width: '5%' }}>Khá</th>
                              <th className="text-center" style={{ width: '5%' }}>TB</th>
                              <th className="text-center" style={{ width: '5%' }}>Tốt</th>
                              <th className="text-center" style={{ width: '5%' }}>Khá</th>
                              <th className="text-center" style={{ width: '5%' }}>TB</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <tr key={key}>
                                <td className="text-center align-middle">{index + 1}</td>
                                <td>
                                  <Form.Item
                                    {...restField}
                                    name={[name, 'ngoaiNgu']}
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
                                          categoryGroupCode: CATEGORY_GROUP_CODE.NGOAI_NGU,
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
                                          form.setFieldValue(['trinhDoNgoaiNgus', name, 'ngoaiNguId'], current?.id);
                                        } else {
                                          form.setFieldValue(['trinhDoNgoaiNgus', name, 'ngoaiNguId'], null);
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                {/* Nghe */}
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'ngheTot']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="nghe" field="ngheTot" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'ngheKha']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="nghe" field="ngheKha" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'ngheTrungBinh']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="nghe" field="ngheTrungBinh" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                {/* Nói */}
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'noiTot']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="noi" field="noiTot" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'noiKha']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="noi" field="noiKha" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'noiTrungBinh']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="noi" field="noiTrungBinh" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                {/* Viết */}
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'vietTot']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="viet" field="vietTot" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'vietKha']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="viet" field="vietKha" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'vietTrungBinh']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="viet" field="vietTrungBinh" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                {/* Đọc hiểu */}
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'docTot']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="doc" field="docTot" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'docKha']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="doc" field="docKha" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                <td className="text-center">
                                  <Form.Item {...restField} name={[name, 'docTrungBinh']} className="mb-0" valuePropName="checked">
                                    <SingleSelectCheckbox group="doc" field="docTrungBinh" index={name} form={form} />
                                  </Form.Item>
                                </td>
                                {/* Đính kèm */}
                                <td className='text-center' style={{ width: '15%' }}>
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
                                      fileList={ngoaiNguDinhKems[name] || []}
                                      onChange={e => {
                                        setNgoaiNguDinhKems(prev => ({
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
                                      setNgoaiNguDinhKems(prev => {
                                        const updated = { ...prev };
                                        delete updated[name];
                                        return updated;
                                      })
                                    }}
                                    disabled={dataModal?.readOnly ?? false}
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
                                  Thêm ngoại ngữ
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