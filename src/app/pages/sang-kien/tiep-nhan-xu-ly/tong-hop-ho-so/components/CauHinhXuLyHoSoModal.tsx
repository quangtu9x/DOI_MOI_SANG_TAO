import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Form, InputNumber, Select, Spin } from 'antd';
import { Button, Modal } from 'react-bootstrap';

import { ICauHinhXuLyHoSoSangKien, IPaginationResponse, IResult, IUserDetails } from '@/models';
import { requestGET, requestPOST } from '@/utils/baseAPI';

const APP_CONFIG_KEYS = {
  nguoiTiepNhan: 'SangKien_NguoiTiepNhan_UserIds',
  tiepNhanNgay: 'SangKien_ThoiHanTiepNhan_Ngay',
  kiemDuyetNgay: 'SangKien_ThoiHanKiemDuyetCongNhan_Ngay',
} as const;

type FormValues = {
  nguoiTiepNhanUserIds: string[];
  thoiHanTiepNhanNgay: number;
  thoiHanKiemDuyetCongNhanNgay: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export const CauHinhXuLyHoSoModal = ({ visible, onClose, onSaved }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<Array<{ label: string; value: string }>>([]);

  const selectedUserIds = Form.useWatch('nguoiTiepNhanUserIds', form) || [];

  const selectedLabel = useMemo(() => {
    if (!selectedUserIds.length) {
      return 'Chưa chọn người tiếp nhận';
    }

    const selectedUsers = users.filter(u => selectedUserIds.includes(u.value));
    if (!selectedUsers.length) {
      return `Đã chọn ${selectedUserIds.length} người`;
    }

    return selectedUsers.map(u => u.label).join(', ');
  }, [selectedUserIds, users]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [cfgRes, usersRes] = await Promise.all([
          requestGET<IResult<ICauHinhXuLyHoSoSangKien>>('HoSoSangKiens/cau-hinh-xu-ly'),
          requestPOST<IPaginationResponse<IUserDetails[]>>('users/search', {
            pageNumber: 1,
            pageSize: 1000,
            keyword: null,
          }),
        ]);

        const config = cfgRes?.data?.data;
        const userOptions =
          usersRes?.data?.data?.map(item => ({
            value: item.id,
            label: `${item.fullName || item.userName || item.id}${item.userName ? ` (${item.userName})` : ''}`,
          })) ?? [];

        const selectedIds = config?.nguoiTiepNhanUserIds ?? [];
        const missingIds = selectedIds.filter(id => !userOptions.some(option => option.value === id));

        if (missingIds.length) {
          const missingUsers = await Promise.all(
            missingIds.map(async id => {
              try {
                const user = await requestGET<IUserDetails>(`users/${id}`, 'neutral');
                if (!user?.data?.id) {
                  return null;
                }
                return {
                  value: user.data.id,
                  label: `${user.data.fullName || user.data.userName || user.data.id}${user.data.userName ? ` (${user.data.userName})` : ''}`,
                };
              } catch {
                return null;
              }
            })
          );

          setUsers([...userOptions, ...missingUsers.filter(Boolean) as Array<{ label: string; value: string }>]);
        } else {
          setUsers(userOptions);
        }

        form.setFieldsValue({
          nguoiTiepNhanUserIds: selectedIds,
          thoiHanTiepNhanNgay: config?.thoiHanTiepNhanNgay ?? 5,
          thoiHanKiemDuyetCongNhanNgay: config?.thoiHanKiemDuyetCongNhanNgay ?? 30,
        });
      } catch (error) {
        console.error('Fetch quick config error', error);
        toast.error('Không thể tải cấu hình xử lý hồ sơ.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible, form]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);

      setSaving(true);
      const payload = {
        data: [
          {
            key: APP_CONFIG_KEYS.nguoiTiepNhan,
            value: (values.nguoiTiepNhanUserIds ?? []).join(','),
            description: 'Danh sach UserId tiep nhan ho so sang kien (GUID, phan cach bang dau phay)',
            isActivePortal: false,
          },
          {
            key: APP_CONFIG_KEYS.tiepNhanNgay,
            value: String(values.thoiHanTiepNhanNgay ?? 5),
            description: 'So ngay tiep nhan ho so sang kien ke tu ngay nop',
            isActivePortal: false,
          },
          {
            key: APP_CONFIG_KEYS.kiemDuyetNgay,
            value: String(values.thoiHanKiemDuyetCongNhanNgay ?? 30),
            description: 'So ngay kiem duyet cong nhan/khong cong nhan ke tu ngay da tiep nhan',
            isActivePortal: false,
          },
        ],
      };

      const response = await requestPOST<IResult<boolean>>('appconfigs/createall', payload);
      if (response?.status === 200 && response?.data?.succeeded) {
        toast.success('Lưu cấu hình xử lý hồ sơ thành công.');
        onSaved?.();
        handleCancel();
      } else {
        toast.error(response?.data?.message?.toString() || 'Lưu cấu hình thất bại.');
      }
    } catch (error) {
      console.error('Save quick config error', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={visible}
      fullscreen={'lg-down'}
      size="lg"
      onExited={handleCancel}
      keyboard
      scrollable
      onEscapeKeyDown={handleCancel}
      centered
    >
      <Modal.Header className="bg-primary px-4 py-3">
        <Modal.Title className="text-white">Cấu hình xử lý hồ sơ sáng kiến</Modal.Title>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
      </Modal.Header>
      <Modal.Body>
        <Spin spinning={loading || saving}>
          <Form<FormValues> form={form} layout="vertical" autoComplete="off">
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <Form.Item
                  label="Người được tiếp nhận hồ sơ"
                  name="nguoiTiepNhanUserIds"
                  rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 người tiếp nhận.' }]}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    placeholder="Chọn người tiếp nhận"
                    optionFilterProp="label"
                    options={users}
                  />
                </Form.Item>
                <div className="text-muted fs-8 mb-3">{selectedLabel}</div>
              </div>

              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Thời hạn tiếp nhận hồ sơ (ngày)"
                  name="thoiHanTiepNhanNgay"
                  rules={[{ required: true, message: 'Không được để trống.' }]}
                >
                  <InputNumber min={0} max={365} className="w-100" />
                </Form.Item>
              </div>

              <div className="col-xl-6 col-lg-6">
                <Form.Item
                  label="Thời hạn kiểm duyệt công nhận (ngày)"
                  name="thoiHanKiemDuyetCongNhanNgay"
                  rules={[{ required: true, message: 'Không được để trống.' }]}
                >
                  <InputNumber min={0} max={365} className="w-100" />
                </Form.Item>
              </div>
            </div>
          </Form>
        </Spin>
      </Modal.Body>
      <Modal.Footer className="bg-light px-4 py-2 align-items-center">
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-primary rounded-1 p-2 ms-2" onClick={handleSubmit} disabled={saving}>
            <i className="fa-regular fa-floppy-disk"></i>Lưu
          </Button>
        </div>
        <div className="d-flex justify-content-center align-items-center">
          <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel} disabled={saving}>
            <i className="fa-regular fa-xmark"></i>Đóng
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
