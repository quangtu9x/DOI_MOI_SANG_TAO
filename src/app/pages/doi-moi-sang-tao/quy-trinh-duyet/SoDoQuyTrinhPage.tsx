import React, { useCallback, useEffect, useState } from 'react';
import { Steps, Card, Tag, Row, Col, Spin, Button, InputNumber, message } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { getCauHinhXuLyYTuong } from '@/app/services/ideaPortalApi';
import { useDMSTRole } from '@/app/hooks/useDMSTRole';
import { requestPOST } from '@/utils/baseAPI';
import { IResult } from '@/models';

// Đồng bộ màu trạng thái với DashboardDoiMoiPage.tsx (STATUS_COLORS)
const STATUS_COLORS: Record<string, string> = {
  'Bản nháp':       'default',
  'Đã nộp':         'processing',
  'Đã tiếp nhận':   'success',
  'Đã trả lại':     'error',
  'Đã hủy':         'default',
  'Được công nhận': 'purple',
};

// Trùng key với CauHinhXuLyYTuongModal.tsx — chỉ 2 bước này có thời hạn tính quá hạn,
// các bước còn lại (Bản nháp, Được công nhận, Đã trả lại, Đã hủy) không tính thời hạn.
const APP_CONFIG_KEYS = {
  tiepNhanNgay: 'YTuong_ThoiHanTiepNhan_Ngay',
  kiemDuyetNgay: 'YTuong_ThoiHanKiemDuyetCongNhan_Ngay',
} as const;

/** Ô cấu hình thời hạn cho 1 bước duy nhất — lưu riêng, không ảnh hưởng các cấu hình khác. */
const InlineDeadlineEditor: React.FC<{
  label: string;
  value: number;
  configKey: string;
  description: string;
  editable: boolean;
  onSaved: (v: number) => void;
}> = ({ label, value, configKey, description, editable, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  const save = async () => {
    const v = Math.max(0, Number(draft) || 0);
    setSaving(true);
    try {
      const res = await requestPOST<IResult<boolean>>('appconfigs/createall', {
        data: [{ key: configKey, value: String(v), description, isActivePortal: false }],
      });
      if (res?.status === 200 && res?.data?.succeeded) {
        message.success(`Đã lưu ${label.toLowerCase()}: ${v} ngày.`);
        onSaved(v);
        setEditing(false);
      } else {
        message.error(res?.data?.message?.toString() || `Lưu ${label.toLowerCase()} thất bại.`);
      }
    } catch {
      message.error(`Lưu ${label.toLowerCase()} thất bại.`);
    } finally {
      setSaving(false);
    }
  };

  if (!editable) {
    return <Tag color="blue" className="fs-8">{label}: {value} ngày</Tag>;
  }

  if (!editing) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Tag color="blue" className="fs-8">{label}: {value} ngày</Tag>
        <Button size="small" type="link" icon={<i className="fa-regular fa-pen" />} onClick={() => setEditing(true)}>
          Sửa
        </Button>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <InputNumber min={0} max={365} size="small" value={draft} onChange={v => setDraft(Number(v) || 0)} addonAfter="ngày" style={{ width: 130 }} />
      <Button size="small" type="primary" loading={saving} onClick={save}>Lưu</Button>
      <Button size="small" onClick={() => { setDraft(value); setEditing(false); }}>Hủy</Button>
    </div>
  );
};

export const SoDoQuyTrinhPage: React.FC = () => {
  const { isReviewer } = useDMSTRole();
  const [loading, setLoading] = useState(false);
  const [thoiHanTiepNhanNgay, setThoiHanTiepNhanNgay] = useState(5);
  const [thoiHanKiemDuyetCongNhanNgay, setThoiHanKiemDuyetCongNhanNgay] = useState(30);

  const loadCauHinh = useCallback(() => {
    setLoading(true);
    return getCauHinhXuLyYTuong()
      .then(res => {
        const cfg = (res as any)?.data?.data;
        setThoiHanTiepNhanNgay(cfg?.thoiHanTiepNhanNgay ?? 5);
        setThoiHanKiemDuyetCongNhanNgay(cfg?.thoiHanKiemDuyetCongNhanNgay ?? 30);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCauHinh(); }, [loadCauHinh]);

  const breadcrumbs = [
    { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
    { title: 'Quy trình phê duyệt', path: '#', isActive: false, isSeparator: false },
  ];

  const mainSteps = [
    {
      title: 'Bản nháp',
      icon: <i className="fa-regular fa-pen" />,
      status: 'finish' as const,
      description: 'Người đề xuất soạn thảo nội dung ý tưởng, có thể lưu và chỉnh sửa nhiều lần trước khi nộp. Không tính thời hạn.',
      deadline: null as null | { label: string; value: number; configKey: string; setter: (v: number) => void; desc: string },
    },
    {
      title: 'Đã nộp',
      icon: <i className="fa-regular fa-paper-plane" />,
      status: 'finish' as const,
      description: 'Ý tưởng được gửi cho cán bộ tiếp nhận xử lý.',
      deadline: {
        label: 'Thời hạn tiếp nhận',
        value: thoiHanTiepNhanNgay,
        configKey: APP_CONFIG_KEYS.tiepNhanNgay,
        setter: setThoiHanTiepNhanNgay,
        desc: 'So ngay tiep nhan y tuong ke tu ngay nop',
      },
    },
    {
      title: 'Đã tiếp nhận',
      icon: <i className="fa-regular fa-inbox" />,
      status: 'finish' as const,
      description: 'Cán bộ tiếp nhận kiểm duyệt nội dung.',
      deadline: {
        label: 'Thời hạn kiểm duyệt & công nhận',
        value: thoiHanKiemDuyetCongNhanNgay,
        configKey: APP_CONFIG_KEYS.kiemDuyetNgay,
        setter: setThoiHanKiemDuyetCongNhanNgay,
        desc: 'So ngay kiem duyet cong nhan/khong cong nhan y tuong ke tu ngay da tiep nhan',
      },
    },
    {
      title: 'Được công nhận',
      icon: <i className="fa-regular fa-award" />,
      status: 'finish' as const,
      description: 'Ý tưởng được công nhận, ghi nhận kết quả và đính kèm quyết định/tài liệu công nhận. Không tính thời hạn.',
      deadline: null,
    },
  ];

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Sơ đồ quy trình</PageTitle>
      <Content>
        <div className="card mb-5">
          <div className="card-header border-0 pt-5">
            <h3 className="card-title fw-bold text-gray-800">
              <i className="fa-regular fa-diagram-project me-2" />
              Luồng xử lý chính
            </h3>
          </div>
          <div className="card-body py-3">
            <Spin spinning={loading}>
              <Steps
                items={mainSteps.map(s => ({ title: s.title, icon: s.icon, status: s.status, description: s.description }))}
                labelPlacement="vertical"
                responsive
              />
              <Row gutter={[16, 12]} className="mt-4">
                {mainSteps.filter(s => s.deadline).map(s => (
                  <Col xs={24} md={12} key={s.title}>
                    <div className="border rounded p-3">
                      <div className="text-muted fs-8 mb-1">Sau bước "{s.title}"</div>
                      <InlineDeadlineEditor
                        label={s.deadline!.label}
                        value={s.deadline!.value}
                        configKey={s.deadline!.configKey}
                        description={s.deadline!.desc}
                        editable={isReviewer}
                        onSaved={s.deadline!.setter}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Spin>
            <div className="text-muted fs-8 mt-4">
              <i className="fa-regular fa-circle-info me-1" />
              Chỉ 2 bước "Đã nộp" và "Đã tiếp nhận" có thời hạn tính quá hạn; các bước "Bản nháp", "Được công nhận" và các nhánh
              "Đã trả lại"/"Đã hủy" không tính thời hạn. Mỗi lần nộp lại (kể cả sau khi bị trả lại), thời hạn tiếp nhận được
              tính lại từ thời điểm nộp lại gần nhất — không tính từ lần nộp đầu tiên.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header border-0 pt-5">
            <h3 className="card-title fw-bold text-gray-800">
              <i className="fa-regular fa-code-branch me-2" />
              Các nhánh phát sinh
            </h3>
          </div>
          <div className="card-body py-3">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" bordered className="h-100">
                  <div className="d-flex align-items-center mb-2">
                    <Tag color={STATUS_COLORS['Đã trả lại']} className="fs-7">Đã trả lại</Tag>
                  </div>
                  <div className="text-gray-700 mb-2">
                    Phát sinh từ bước <b>Đã tiếp nhận</b> khi hồ sơ chưa đạt yêu cầu. Cán bộ tiếp nhận trả lại kèm ý kiến.
                  </div>
                  <div className="d-flex align-items-center gap-2 text-primary fw-semibold fs-7">
                    <Tag color={STATUS_COLORS['Đã trả lại']}>Đã trả lại</Tag>
                    <i className="fa-regular fa-arrow-right" />
                    <span>Người đề xuất chỉnh sửa & nộp lại</span>
                    <i className="fa-regular fa-arrow-right" />
                    <Tag color={STATUS_COLORS['Đã nộp']}>Đã nộp</Tag>
                    <i className="fa-regular fa-rotate-left ms-1" title="Vòng lặp: có thể trả lại rồi nộp lại nhiều lần" />
                  </div>
                  <div className="text-muted fs-8 mt-2">
                    Vòng lặp này có thể xảy ra nhiều lần cho đến khi hồ sơ được tiếp nhận. Mỗi lần nộp lại, thời hạn tiếp nhận
                    ({thoiHanTiepNhanNgay} ngày) được tính lại từ ngày nộp lại đó.
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" bordered className="h-100">
                  <div className="d-flex align-items-center mb-2">
                    <Tag color={STATUS_COLORS['Đã hủy']} className="fs-7">Đã hủy</Tag>
                  </div>
                  <div className="text-gray-700">
                    Người đề xuất thu hồi hoặc cán bộ tiếp nhận hủy bỏ ý tưởng khi không còn phù hợp để tiếp tục xử lý.
                    Đây là trạng thái kết thúc, không quay lại các bước trước.
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Content>
    </>
  );
};
