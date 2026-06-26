import React, { useState } from 'react';
import { Button, Select, DatePicker, message, Table, Tag } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// Báo cáo theo lĩnh vực — Vietnam Airlines
const REPORT_DATA = [
  { stt: 1, linhVuc: 'Khai thác bay',        tongSo: 52, choDuyet: 7, daDuyet: 34, tuChoi: 6, congNhan: 5 },
  { stt: 2, linhVuc: 'Kỹ thuật bảo dưỡng',  tongSo: 45, choDuyet: 8, daDuyet: 28, tuChoi: 5, congNhan: 4 },
  { stt: 3, linhVuc: 'Dịch vụ hành khách',  tongSo: 38, choDuyet: 6, daDuyet: 24, tuChoi: 5, congNhan: 3 },
  { stt: 4, linhVuc: 'Dịch vụ mặt đất',     tongSo: 32, choDuyet: 5, daDuyet: 20, tuChoi: 4, congNhan: 3 },
  { stt: 5, linhVuc: 'Công nghệ thông tin',  tongSo: 27, choDuyet: 3, daDuyet: 17, tuChoi: 4, congNhan: 3 },
  { stt: 6, linhVuc: 'Đào tạo nhân lực',    tongSo: 20, choDuyet: 2, daDuyet: 12, tuChoi: 3, congNhan: 3 },
];

const TOTALS = REPORT_DATA.reduce(
  (acc, row) => ({
    tongSo: acc.tongSo + row.tongSo,
    choDuyet: acc.choDuyet + row.choDuyet,
    daDuyet: acc.daDuyet + row.daDuyet,
    tuChoi: acc.tuChoi + row.tuChoi,
    congNhan: acc.congNhan + row.congNhan,
  }),
  { tongSo: 0, choDuyet: 0, daDuyet: 0, tuChoi: 0, congNhan: 0 }
);

const REPORT_TYPES = [
  { label: 'Báo cáo tổng hợp ý tưởng theo lĩnh vực', value: 'linh-vuc' },
  { label: 'Báo cáo tổng hợp theo trạng thái', value: 'trang-thai' },
  { label: 'Báo cáo theo tháng/quý/năm', value: 'thoi-gian' },
  { label: 'Báo cáo người đóng góp nhiều nhất', value: 'nguoi-gui' },
];

const BAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];
const maxCount = Math.max(...REPORT_DATA.map(r => r.tongSo));

export const BaoCaoPage: React.FC = () => {
  const [reportType, setReportType] = useState('linh-vuc');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(format);
    await new Promise(r => setTimeout(r, 1200));
    setExporting(null);
    message.success(`Đã xuất báo cáo ${format.toUpperCase()} thành công!`);
  };

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center' as const },
    { title: 'Lĩnh vực', dataIndex: 'linhVuc', key: 'linhVuc' },
    {
      title: 'Tổng số',
      dataIndex: 'tongSo',
      key: 'tongSo',
      width: 90,
      align: 'center' as const,
      render: (v: number) => <span className="fw-bold">{v}</span>,
    },
    {
      title: 'Chờ duyệt',
      dataIndex: 'choDuyet',
      key: 'choDuyet',
      width: 100,
      align: 'center' as const,
      render: (v: number) => <Tag color="processing">{v}</Tag>,
    },
    {
      title: 'Đã duyệt',
      dataIndex: 'daDuyet',
      key: 'daDuyet',
      width: 100,
      align: 'center' as const,
      render: (v: number) => <Tag color="success">{v}</Tag>,
    },
    {
      title: 'Từ chối',
      dataIndex: 'tuChoi',
      key: 'tuChoi',
      width: 90,
      align: 'center' as const,
      render: (v: number) => <Tag color="error">{v}</Tag>,
    },
    {
      title: 'Được công nhận',
      dataIndex: 'congNhan',
      key: 'congNhan',
      width: 130,
      align: 'center' as const,
      render: (v: number) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: 'Tỷ lệ duyệt',
      key: 'tyLe',
      width: 100,
      align: 'center' as const,
      render: (_: unknown, record: typeof REPORT_DATA[0]) => {
        const rate = record.tongSo > 0 ? Math.round((record.daDuyet / record.tongSo) * 100) : 0;
        return <span className={rate >= 60 ? 'text-success fw-bold' : 'text-warning fw-bold'}>{rate}%</span>;
      },
    },
  ];

  const summaryRow = [{ key: 'total', stt: '', linhVuc: 'TỔNG CỘNG', ...TOTALS }];

  return (
    <>
      <PageTitle breadcrumbs={[{ title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false }]}>
        Báo cáo & Thống kê
      </PageTitle>
      <Content>
        {/* Summary cards */}
        <div className="row g-4 mb-6">
          {[
            { label: 'Tổng ý tưởng', value: TOTALS.tongSo, icon: 'fa-lightbulb', color: 'primary' },
            { label: 'Đã phê duyệt', value: TOTALS.daDuyet, icon: 'fa-circle-check', color: 'success' },
            { label: 'Đang chờ duyệt', value: TOTALS.choDuyet, icon: 'fa-clock', color: 'warning' },
            { label: 'Được công nhận', value: TOTALS.congNhan, icon: 'fa-medal', color: 'info' },
          ].map((s, i) => (
            <div key={i} className="col-sm-6 col-xl-3">
              <div className={`card border-start border-${s.color} border-4`}>
                <div className="card-body d-flex align-items-center py-4 px-5">
                  <div className={`symbol symbol-45px me-4`}>
                    <div className={`symbol-label bg-light-${s.color}`}>
                      <i className={`fa-regular ${s.icon} fs-2 text-${s.color}`} />
                    </div>
                  </div>
                  <div>
                    <div className={`fs-2 fw-bold text-${s.color}`}>{s.value}</div>
                    <div className="fs-7 text-muted">{s.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Export */}
        <div className="card mb-5">
          <div className="card-body py-4">
            <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <Select
                  options={REPORT_TYPES}
                  value={reportType}
                  onChange={setReportType}
                  style={{ width: 320 }}
                />
                <RangePicker
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                  onChange={(dates) => setDateRange(dates as any)}
                />
              </div>
              <div className="d-flex gap-2">
                <Button
                  icon={<i className="fa-regular fa-file-excel me-1" style={{ color: '#10B981' }} />}
                  style={{ color: '#10B981', borderColor: '#10B981' }}
                  loading={exporting === 'excel'}
                  onClick={() => handleExport('excel')}
                >
                  Xuất Excel
                </Button>
                <Button
                  icon={<i className="fa-regular fa-file-pdf me-1" style={{ color: '#EF4444' }} />}
                  style={{ color: '#EF4444', borderColor: '#EF4444' }}
                  loading={exporting === 'pdf'}
                  onClick={() => handleExport('pdf')}
                >
                  Xuất PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bar chart visual */}
        <div className="card mb-5">
          <div className="card-header border-0 pt-5">
            <h3 className="card-title fw-bold text-gray-800">Biểu đồ ý tưởng theo lĩnh vực</h3>
          </div>
          <div className="card-body pb-5">
            <div className="d-flex align-items-end gap-4" style={{ height: 220 }}>
              {REPORT_DATA.map((r, i) => (
                <div key={i} className="d-flex flex-column align-items-center flex-1">
                  <div className="fw-bold fs-7 mb-1" style={{ color: BAR_COLORS[i] }}>{r.tongSo}</div>
                  <div
                    className="rounded-top w-100 d-flex flex-column justify-content-end"
                    style={{ height: `${(r.tongSo / maxCount) * 170}px`, background: BAR_COLORS[i], opacity: 0.85, minHeight: 8 }}
                  />
                  <div className="fs-8 text-muted mt-2 text-center" style={{ maxWidth: 80, lineHeight: '1.2' }}>
                    {r.linhVuc.split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header border-0 pt-5">
            <h3 className="card-title fw-bold text-gray-800">Bảng thống kê chi tiết</h3>
          </div>
          <div className="card-body py-3">
            <Table
              columns={columns}
              dataSource={[...REPORT_DATA, ...summaryRow]}
              rowKey="stt"
              pagination={false}
              bordered
              size="small"
              rowClassName={record => (record as any).linhVuc === 'TỔNG CỘNG' ? 'fw-bold bg-light' : ''}
            />
          </div>
        </div>
      </Content>
    </>
  );
};
