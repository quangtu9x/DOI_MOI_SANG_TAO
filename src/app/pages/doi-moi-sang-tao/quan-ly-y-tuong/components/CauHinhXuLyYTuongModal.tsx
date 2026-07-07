import { useEffect, useMemo, useState } from 'react';
import { Form, InputNumber, Select, Spin, Modal, Button, message } from 'antd';

import { ICauHinhXuLyYTuong, IPaginationResponse, IResult, IUserDetails } from '@/models';
import { requestGET, requestPOST } from '@/utils/baseAPI';
import { getCauHinhXuLyYTuong } from '@/app/services/ideaPortalApi';

const APP_CONFIG_KEYS = {
  nguoiTiepNhan: 'YTuong_NguoiTiepNhan_UserIds',
  tiepNhanNgay: 'YTuong_ThoiHanTiepNhan_Ngay',
  kiemDuyetNgay: 'YTuong_ThoiHanKiemDuyetCongNhan_Ngay',
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

export const CauHinhXuLyYTuongModal = ({ visible, onClose, onSaved }: Props) => {
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
    if (!visible) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [cfgRes, usersRes] = await Promise.all([
          getCauHinhXuLyYTuong(),
          requestPOST<IPaginationResponse<IUserDetails[]>>('users/search', {
            pageNumber: 1,
            pageSize: 1000,
            keyword: null,
          }, 'neutral'),
        ]);

        const config = (cfgRes as any)?.data?.data as ICauHinhXuLyYTuong | undefined;
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
                if (!user?.data?.id) return null;
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
        console.error('Fetch cau hinh xu ly y tuong error', error);
        message.error('Không thể tải cấu hình xử lý hồ sơ.');
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
      const values = await form.validateFields();

      setSaving(true);
      const payload = {
        data: [
          {
            key: APP_CONFIG_KEYS.nguoiTiepNhan,
            value: (values.nguoiTiepNhanUserIds ?? []).join(','),
            description: 'Danh sach UserId tiep nhan y tuong DMST (GUID, phan cach bang dau phay)',
            isActivePortal: false,
          },
          {
            key: APP_CONFIG_KEYS.tiepNhanNgay,
            value: String(values.thoiHanTiepNhanNgay ?? 5),
            description: 'So ngay tiep nhan y tuong ke tu ngay nop',
            isActivePortal: false,
          },
          {
            key: APP_CONFIG_KEYS.kiemDuyetNgay,
            value: String(values.thoiHanKiemDuyetCongNhanNgay ?? 30),
            description: 'So ngay kiem duyet cong nhan/khong cong nhan y tuong ke tu ngay da tiep nhan',
            isActivePortal: false,
          },
        ],
      };

      const response = await requestPOST<IResult<boolean>>('appconfigs/createall', payload);
      if (response?.status === 200 && response?.data?.succeeded) {
        message.success('Lưu cấu hình xử lý hồ sơ thành công.');
        onSaved?.();
        handleCancel();
      } else {
        message.error(response?.data?.message?.toString() || 'Lưu cấu hình thất bại.');
      }
    } catch (error: any) {
      if (!error?.errorFields) {
        console.error('Save cau hinh xu ly y tuong error', error);
        message.error('Lưu cấu hình thất bại.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      title="Cấu hình xử lý hồ sơ ý tưởng"
      onOk={handleSubmit}
      okText="Lưu cấu hình"
      cancelText="Đóng"
      okButtonProps={{ loading: saving }}
      width={640}
    >
      <Spin spinning={loading}>
        <Form<FormValues> form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="Người được tiếp nhận ý tưởng"
            name="nguoiTiepNhanUserIds"
            extra="Danh sách cán bộ được phép tiếp nhận ý tưởng khi nộp lên hệ thống."
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

          <div className="row">
            <div className="col-6">
              <Form.Item
                label="Thời hạn tiếp nhận hồ sơ (ngày)"
                name="thoiHanTiepNhanNgay"
                extra="Tính từ ngày nộp ý tưởng."
                rules={[{ required: true, message: 'Không được để trống.' }]}
              >
                <InputNumber min={0} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <div className="col-6">
              <Form.Item
                label="Thời hạn kiểm duyệt công nhận (ngày)"
                name="thoiHanKiemDuyetCongNhanNgay"
                extra="Tính từ ngày tiếp nhận."
                rules={[{ required: true, message: 'Không được để trống.' }]}
              >
                <InputNumber min={0} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CauHinhXuLyYTuongModal;
