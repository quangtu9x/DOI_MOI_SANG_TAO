import React, { useState } from 'react';
import { Button, Select, DatePicker, message, Table, Tag } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// Báo cáo theo lĩnh vực — Vietnam Airlines
const REPORT_DATA = [
  { stt: 1, linhVuc: 'Khai thác bay', tongSo: 52, choDuyet: 7, daDuyet: 34, tuChoi: 6, congNhan: 5 },
  { stt: 2, linhVuc: 'Kỹ thuật bảo dưỡng', tongSo: 45, choDuyet: 8, daDuyet: 28, tuChoi: 5, congNhan: 4 },
  { stt: 3, linhVuc: 'Dịch vụ hành khách', tongSo: 38, choDuyet: 6, daDuyet: 24, tuChoi: 5, congNhan: 3 },
  { stt: 4, linhVuc: 'Dịch vụ mặt đất', tongSo: 32, choDuyet: 5, daDuyet: 20, tuChoi: 4, congNhan: 3 },
  { stt: 5, linhVuc: 'Công nghệ thông tin', tongSo: 27, choDuyet: 3, daDuyet: 17, tuChoi: 4, congNhan: 3 },
  { stt: 6, linhVuc: 'Đào tạo nhân lực', tongSo: 20, choDuyet: 2, daDuyet: 12, tuChoi: 3, congNhan: 3 },
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
              dataSource={[...REPORT_DATA, ...summaryRow] as typeof REPORT_DATA}
              rowKey="stt"
              pagination={false}
              bordered
              size="small"
              rowClassName={record => (record as any).linhVuc === 'TỔNG CỘNG' ? 'fw-bold bg-light' : ''}
            />
          </div>
        </div>
        <div
          className="card mt-5"
          dangerouslySetInnerHTML={{
            __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        🏆 Bảng xếp hạng Đổi mới sáng tạo
    </h3>
</div>

<div class="card-body">

<div class="row mb-5">

<div class="col-md-4">
<div class="card bg-warning bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:48px">🥇</div>
<h3>Ban Công nghệ thông tin</h3>
<div class="text-muted">980 điểm</div>
</div>
</div>
</div>

<div class="col-md-4">
<div class="card bg-info bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:48px">🥈</div>
<h3>Nguyễn Văn A</h3>
<div class="text-muted">940 điểm</div>
</div>
</div>
</div>

<div class="col-md-4">
<div class="card bg-success bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:48px">🥉</div>
<h3>Ban Khai thác</h3>
<div class="text-muted">900 điểm</div>
</div>
</div>
</div>

</div>

<table class="table table-hover table-bordered align-middle">

<thead class="table-light">
<tr>
<th>Hạng</th>
<th>Cá nhân / Đơn vị</th>
<th>Điểm</th>
<th>Sáng kiến</th>
<th>Tỷ lệ áp dụng</th>
<th>Danh hiệu</th>
</tr>
</thead>

<tbody>

<tr>
<td>🥇</td>
<td>Ban Công nghệ thông tin</td>
<td><b>980</b></td>
<td>42</td>
<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:95%">95%</div>
</div>
</td>
<td><span class="badge bg-warning">Xuất sắc</span></td>
</tr>

<tr>
<td>🥈</td>
<td>Nguyễn Văn A</td>
<td><b>940</b></td>
<td>36</td>
<td>
<div class="progress">
<div class="progress-bar bg-info" style="width:90%">90%</div>
</div>
</td>
<td><span class="badge bg-primary">Tiêu biểu</span></td>
</tr>

<tr>
<td>🥉</td>
<td>Ban Khai thác</td>
<td><b>900</b></td>
<td>34</td>
<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:87%">87%</div>
</div>
</td>
<td><span class="badge bg-success">Đổi mới</span></td>
</tr>

<tr>
<td>4</td>
<td>Trần Thị B</td>
<td>860</td>
<td>30</td>
<td>
<div class="progress">
<div class="progress-bar" style="width:82%">82%</div>
</div>
</td>
<td>-</td>
</tr>

<tr>
<td>5</td>
<td>Ban Dịch vụ</td>
<td>835</td>
<td>29</td>
<td>
<div class="progress">
<div class="progress-bar" style="width:81%">81%</div>
</div>
</td>
<td>-</td>
</tr>

</tbody>

</table>

</div>
`,
          }}
        />



        <div
          className="card mt-5"
          dangerouslySetInnerHTML={{
            __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        📊 Báo cáo tương tác hệ thống
    </h3>
    <div class="text-muted">
        Thống kê lượt xem, lượt thích, bình luận, tham gia chiến dịch và mức độ sử dụng hệ thống
    </div>
</div>

<div class="card-body">

<div class="row mb-5">

<div class="col-md-2">
<div class="card bg-primary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">👁️</div>
<h2 class="text-primary">18.542</h2>
<div class="text-muted">Lượt xem</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-danger bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">❤️</div>
<h2 class="text-danger">6.785</h2>
<div class="text-muted">Lượt thích</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-success bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">💬</div>
<h2 class="text-success">2.315</h2>
<div class="text-muted">Bình luận</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-warning bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">🚀</div>
<h2 class="text-warning">1.258</h2>
<div class="text-muted">Chiến dịch</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-info bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">👤</div>
<h2 class="text-info">438</h2>
<div class="text-muted">Người dùng</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-secondary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">🏢</div>
<h2 class="text-secondary">27</h2>
<div class="text-muted">Đơn vị</div>
</div>
</div>
</div>

</div>

<h4 class="mb-3">Top người dùng tương tác nhiều nhất</h4>

<table class="table table-bordered table-hover align-middle">

<thead class="table-light">
<tr>
<th width="60">#</th>
<th>Người dùng</th>
<th>Đơn vị</th>
<th>Lượt xem</th>
<th>Thích</th>
<th>Bình luận</th>
<th>Chiến dịch</th>
<th>Mức độ sử dụng</th>
</tr>
</thead>

<tbody>

<tr>
<td>1</td>
<td>Nguyễn Văn A</td>
<td>Ban CNTT</td>
<td>1.280</td>
<td>315</td>
<td>96</td>
<td>15</td>
<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:98%">98%</div>
</div>
</td>
</tr>

<tr>
<td>2</td>
<td>Trần Thị B</td>
<td>Ban Khai thác</td>
<td>1.145</td>
<td>286</td>
<td>88</td>
<td>13</td>
<td>
<div class="progress">
<div class="progress-bar bg-info" style="width:92%">92%</div>
</div>
</td>
</tr>

<tr>
<td>3</td>
<td>Lê Văn C</td>
<td>Dịch vụ hành khách</td>
<td>1.010</td>
<td>250</td>
<td>71</td>
<td>12</td>
<td>
<div class="progress">
<div class="progress-bar bg-primary" style="width:89%">89%</div>
</div>
</td>
</tr>

<tr>
<td>4</td>
<td>Phạm Văn D</td>
<td>Kỹ thuật</td>
<td>865</td>
<td>214</td>
<td>62</td>
<td>10</td>
<td>
<div class="progress">
<div class="progress-bar bg-warning" style="width:81%">81%</div>
</div>
</td>
</tr>

<tr>
<td>5</td>
<td>Hoàng Thị E</td>
<td>Ban Thương mại</td>
<td>742</td>
<td>198</td>
<td>55</td>
<td>8</td>
<td>
<div class="progress">
<div class="progress-bar bg-secondary" style="width:76%">76%</div>
</div>
</td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">Mức độ sử dụng theo đơn vị</h4>

<table class="table table-striped table-bordered">

<thead class="table-light">
<tr>
<th>Đơn vị</th>
<th>Người dùng</th>
<th>Lượt truy cập</th>
<th>Tỷ lệ hoạt động</th>
</tr>
</thead>

<tbody>

<tr>
<td>Ban Công nghệ thông tin</td>
<td>48</td>
<td>5.845</td>
<td>97%</td>
</tr>

<tr>
<td>Ban Khai thác</td>
<td>65</td>
<td>4.925</td>
<td>94%</td>
</tr>

<tr>
<td>Dịch vụ hành khách</td>
<td>53</td>
<td>4.210</td>
<td>91%</td>
</tr>

<tr>
<td>Kỹ thuật bảo dưỡng</td>
<td>61</td>
<td>3.785</td>
<td>89%</td>
</tr>

<tr>
<td>Ban Thương mại</td>
<td>44</td>
<td>2.960</td>
<td>85%</td>
</tr>

</tbody>

</table>

</div>
`,
          }}
        />

<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        🚀 Báo cáo chiến dịch Đổi mới sáng tạo
    </h3>
    <div class="text-muted">
        Theo dõi hiệu quả từng chiến dịch, số người tham gia, số ý tưởng/giải pháp và tỷ lệ triển khai
    </div>
</div>

<div class="card-body">

<div class="row mb-5">

<div class="col-md-3">
<div class="card bg-primary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">📢</div>
<h2 class="text-primary">12</h2>
<div class="text-muted">Chiến dịch</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-success bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">👥</div>
<h2 class="text-success">2.845</h2>
<div class="text-muted">Người tham gia</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-warning bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">💡</div>
<h2 class="text-warning">658</h2>
<div class="text-muted">Ý tưởng / Giải pháp</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-info bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">🏆</div>
<h2 class="text-info">124</h2>
<div class="text-muted">Được triển khai</div>
</div>
</div>
</div>

</div>

<h4 class="mb-3">Danh sách chiến dịch</h4>

<table class="table table-bordered table-hover align-middle">

<thead class="table-light">
<tr>
<th>Chiến dịch</th>
<th>Thời gian</th>
<th>Người tham gia</th>
<th>Ý tưởng</th>
<th>Được công nhận</th>
<th>Tỷ lệ triển khai</th>
<th>Trạng thái</th>
</tr>
</thead>

<tbody>

<tr>
<td>Chuyển đổi số trong khai thác bay</td>
<td>01/2026 - 03/2026</td>
<td>685</td>
<td>154</td>
<td>28</td>
<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:91%">91%</div>
</div>
</td>
<td><span class="badge bg-success">Hoàn thành</span></td>
</tr>

<tr>
<td>Nâng cao trải nghiệm hành khách</td>
<td>02/2026 - 05/2026</td>
<td>512</td>
<td>126</td>
<td>22</td>
<td>
<div class="progress">
<div class="progress-bar bg-primary" style="width:85%">85%</div>
</div>
</td>
<td><span class="badge bg-primary">Đang triển khai</span></td>
</tr>

<tr>
<td>Tối ưu bảo dưỡng tàu bay</td>
<td>03/2026 - 06/2026</td>
<td>436</td>
<td>98</td>
<td>18</td>
<td>
<div class="progress">
<div class="progress-bar bg-info" style="width:82%">82%</div>
</div>
</td>
<td><span class="badge bg-primary">Đang triển khai</span></td>
</tr>

<tr>
<td>Tiết kiệm nhiên liệu</td>
<td>04/2026 - 06/2026</td>
<td>395</td>
<td>83</td>
<td>15</td>
<td>
<div class="progress">
<div class="progress-bar bg-warning" style="width:74%">74%</div>
</div>
</td>
<td><span class="badge bg-warning text-dark">Đánh giá</span></td>
</tr>

<tr>
<td>Sáng kiến AI hỗ trợ điều hành</td>
<td>05/2026 - Nay</td>
<td>817</td>
<td>197</td>
<td>41</td>
<td>
<div class="progress">
<div class="progress-bar bg-danger" style="width:96%">96%</div>
</div>
</td>
<td><span class="badge bg-success">Hiệu quả cao</span></td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">Top 5 chiến dịch hiệu quả</h4>

<table class="table table-striped table-bordered">

<thead class="table-light">
<tr>
<th>Hạng</th>
<th>Chiến dịch</th>
<th>Điểm hiệu quả</th>
<th>Người tham gia</th>
<th>Ý tưởng</th>
</tr>
</thead>

<tbody>

<tr>
<td>🥇</td>
<td>Sáng kiến AI hỗ trợ điều hành</td>
<td><b>98</b></td>
<td>817</td>
<td>197</td>
</tr>

<tr>
<td>🥈</td>
<td>Chuyển đổi số trong khai thác bay</td>
<td><b>95</b></td>
<td>685</td>
<td>154</td>
</tr>

<tr>
<td>🥉</td>
<td>Nâng cao trải nghiệm hành khách</td>
<td><b>91</b></td>
<td>512</td>
<td>126</td>
</tr>

<tr>
<td>4</td>
<td>Tối ưu bảo dưỡng tàu bay</td>
<td>88</td>
<td>436</td>
<td>98</td>
</tr>

<tr>
<td>5</td>
<td>Tiết kiệm nhiên liệu</td>
<td>84</td>
<td>395</td>
<td>83</td>
</tr>

</tbody>

</table>

</div>
`,
  }}
/>
<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        🏗️ Báo cáo Chương trình / Dự án Chuyển đổi số (CĐS), R&D và Sandbox
    </h3>
    <div class="text-muted">
        Theo dõi tiến độ, ngân sách, milestone và hiệu quả của các chương trình trọng điểm
    </div>
</div>

<div class="card-body">

<div class="row mb-5">

<div class="col-md-2">
<div class="card bg-primary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">📂</div>
<h2 class="text-primary">18</h2>
<div class="text-muted">Chương trình</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-success bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">✅</div>
<h2 class="text-success">12</h2>
<div class="text-muted">Đúng tiến độ</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-warning bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">⏳</div>
<h2 class="text-warning">4</h2>
<div class="text-muted">Có rủi ro</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-danger bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">⚠️</div>
<h2 class="text-danger">2</h2>
<div class="text-muted">Trễ hạn</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-info bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">💰</div>
<h2 class="text-info">128 tỷ</h2>
<div class="text-muted">Ngân sách</div>
</div>
</div>
</div>

<div class="col-md-2">
<div class="card bg-secondary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">🎯</div>
<h2 class="text-secondary">86%</h2>
<div class="text-muted">Hoàn thành</div>
</div>
</div>
</div>

</div>

<h4 class="mb-3">Danh sách chương trình / dự án</h4>

<table class="table table-bordered table-hover align-middle">

<thead class="table-light">

<tr>
<th>Chương trình</th>
<th>Loại</th>
<th>Tiến độ</th>
<th>Milestone</th>
<th>Ngân sách</th>
<th>Hiệu quả</th>
<th>Trạng thái</th>
</tr>

</thead>

<tbody>

<tr>
<td>AI hỗ trợ điều hành chuyến bay</td>
<td>R&D</td>

<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:92%">92%</div>
</div>
</td>

<td>18/20</td>

<td>18 / 20 tỷ</td>

<td>Rút ngắn 35% thời gian xử lý</td>

<td>
<span class="badge bg-success">Đúng hạn</span>
</td>

</tr>

<tr>

<td>Digital Airport</td>

<td>CĐS</td>

<td>
<div class="progress">
<div class="progress-bar bg-primary" style="width:84%">84%</div>
</div>
</td>

<td>16/20</td>

<td>31 / 35 tỷ</td>

<td>Giảm 22% thời gian phục vụ</td>

<td>
<span class="badge bg-primary">
Đang triển khai
</span>
</td>

</tr>

<tr>

<td>Sandbox Chatbot AI</td>

<td>Sandbox</td>

<td>
<div class="progress">
<div class="progress-bar bg-warning" style="width:71%">71%</div>
</div>
</td>

<td>12/18</td>

<td>6 / 8 tỷ</td>

<td>Tăng 48% tốc độ phản hồi</td>

<td>
<span class="badge bg-warning text-dark">
Có rủi ro
</span>
</td>

</tr>

<tr>

<td>Predictive Maintenance</td>

<td>R&D</td>

<td>
<div class="progress">
<div class="progress-bar bg-danger" style="width:58%">58%</div>
</div>
</td>

<td>9/16</td>

<td>13 / 18 tỷ</td>

<td>Đang đánh giá</td>

<td>
<span class="badge bg-danger">
Trễ tiến độ
</span>
</td>

</tr>

<tr>

<td>e-Office 4.0</td>

<td>CĐS</td>

<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:100%">100%</div>
</div>
</td>

<td>15/15</td>

<td>12 / 12 tỷ</td>

<td>Tiết kiệm 65% giấy tờ</td>

<td>
<span class="badge bg-success">
Hoàn thành
</span>
</td>

</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">Tổng hợp ngân sách theo chương trình</h4>

<table class="table table-striped table-bordered">

<thead class="table-light">

<tr>

<th>Loại chương trình</th>

<th>Số dự án</th>

<th>Ngân sách</th>

<th>Đã sử dụng</th>

<th>Tỷ lệ sử dụng</th>

</tr>

</thead>

<tbody>

<tr>

<td>Chuyển đổi số (CĐS)</td>

<td>8</td>

<td>65 tỷ</td>

<td>54 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-primary" style="width:83%">83%</div>
</div>
</td>

</tr>

<tr>

<td>R&D</td>

<td>6</td>

<td>45 tỷ</td>

<td>36 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:80%">80%</div>
</div>
</td>

</tr>

<tr>

<td>Sandbox</td>

<td>4</td>

<td>18 tỷ</td>

<td>13 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-warning" style="width:72%">72%</div>
</div>
</td>

</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">Top chương trình hiệu quả nhất</h4>

<table class="table table-hover table-bordered">

<thead class="table-light">

<tr>
<th>Hạng</th>
<th>Chương trình</th>
<th>Điểm hiệu quả</th>
<th>ROI</th>
<th>Đánh giá</th>
</tr>

</thead>

<tbody>

<tr>
<td>🥇</td>
<td>e-Office 4.0</td>
<td><b>98</b></td>
<td>245%</td>
<td><span class="badge bg-success">Rất hiệu quả</span></td>
</tr>

<tr>
<td>🥈</td>
<td>AI hỗ trợ điều hành chuyến bay</td>
<td><b>95</b></td>
<td>228%</td>
<td><span class="badge bg-primary">Hiệu quả cao</span></td>
</tr>

<tr>
<td>🥉</td>
<td>Digital Airport</td>
<td><b>92</b></td>
<td>205%</td>
<td><span class="badge bg-info">Tốt</span></td>
</tr>

<tr>
<td>4</td>
<td>Sandbox Chatbot AI</td>
<td>86</td>
<td>168%</td>
<td><span class="badge bg-warning text-dark">Đang thử nghiệm</span></td>
</tr>

<tr>
<td>5</td>
<td>Predictive Maintenance</td>
<td>79</td>
<td>145%</td>
<td><span class="badge bg-secondary">Đang cải thiện</span></td>
</tr>

</tbody>

</table>

</div>
`,
  }}
/>



<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        📊 Dashboard tiến độ CĐS / R&D / Sandbox
    </h3>
    <div class="text-muted">
        Theo dõi tiến độ triển khai, biểu đồ Gantt, milestone và cảnh báo dự án
    </div>
</div>

<div class="card-body">

<div class="row mb-5">

<div class="col-md-3">
<div class="card bg-primary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:34px;">📂</div>
<h2 class="text-primary">18</h2>
<div class="text-muted">Dự án đang triển khai</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-success bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:34px;">✅</div>
<h2 class="text-success">72%</h2>
<div class="text-muted">Tiến độ trung bình</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-warning bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:34px;">⚠️</div>
<h2 class="text-warning">4</h2>
<div class="text-muted">Dự án có rủi ro</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-danger bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:34px;">💰</div>
<h2 class="text-danger">2</h2>
<div class="text-muted">Vượt ngân sách</div>
</div>
</div>
</div>

</div>

<h4 class="mb-4">
📅 Biểu đồ Gantt (Demo)
</h4>

<table class="table table-bordered align-middle">

<thead class="table-light">

<tr>

<th style="width:280px;">Dự án</th>

<th>Tháng 1</th>
<th>Tháng 2</th>
<th>Tháng 3</th>
<th>Tháng 4</th>
<th>Tháng 5</th>
<th>Tháng 6</th>

</tr>

</thead>

<tbody>

<tr>

<td>AI hỗ trợ điều hành</td>

<td style="background:#0d6efd"></td>

<td style="background:#0d6efd"></td>

<td style="background:#198754"></td>

<td style="background:#198754"></td>

<td style="background:#198754"></td>

<td></td>

</tr>

<tr>

<td>Digital Airport</td>

<td></td>

<td style="background:#0dcaf0"></td>

<td style="background:#0dcaf0"></td>

<td style="background:#0dcaf0"></td>

<td style="background:#ffc107"></td>

<td></td>

</tr>

<tr>

<td>Sandbox Chatbot AI</td>

<td></td>

<td></td>

<td style="background:#198754"></td>

<td style="background:#198754"></td>

<td style="background:#198754"></td>

<td style="background:#198754"></td>

</tr>

<tr>

<td>Predictive Maintenance</td>

<td style="background:#dc3545"></td>

<td style="background:#dc3545"></td>

<td style="background:#dc3545"></td>

<td></td>

<td></td>

<td></td>

</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">
📈 Tiến độ các chương trình
</h4>

<table class="table table-hover table-bordered">

<thead class="table-light">

<tr>

<th>Chương trình</th>

<th>Tiến độ</th>

<th>Milestone</th>

<th>Ngân sách</th>

</tr>

</thead>

<tbody>

<tr>

<td>AI hỗ trợ điều hành</td>

<td>

<div class="progress">

<div class="progress-bar bg-success" style="width:92%">
92%
</div>

</div>

</td>

<td>18 / 20</td>

<td>90%</td>

</tr>

<tr>

<td>Digital Airport</td>

<td>

<div class="progress">

<div class="progress-bar bg-primary" style="width:84%">
84%
</div>

</div>

</td>

<td>16 / 20</td>

<td>88%</td>

</tr>

<tr>

<td>Sandbox Chatbot AI</td>

<td>

<div class="progress">

<div class="progress-bar bg-warning" style="width:70%">
70%
</div>

</div>

</td>

<td>12 / 18</td>

<td>76%</td>

</tr>

<tr>

<td>Predictive Maintenance</td>

<td>

<div class="progress">

<div class="progress-bar bg-danger" style="width:56%">
56%
</div>

</div>

</td>

<td>9 / 16</td>

<td>112%</td>

</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">
⚠️ Cảnh báo dự án
</h4>

<table class="table table-striped table-bordered">

<thead class="table-light">

<tr>

<th>Dự án</th>

<th>Loại cảnh báo</th>

<th>Mức độ</th>

<th>Khuyến nghị</th>

</tr>

</thead>

<tbody>

<tr>

<td>Predictive Maintenance</td>

<td>
<span class="badge bg-danger">
Trễ tiến độ
</span>
</td>

<td>Cao</td>

<td>Điều chỉnh nguồn lực thực hiện</td>

</tr>

<tr>

<td>Digital Airport</td>

<td>
<span class="badge bg-warning text-dark">
Milestone chậm
</span>
</td>

<td>Trung bình</td>

<td>Đẩy nhanh nghiệm thu</td>

</tr>

<tr>

<td>Sandbox Chatbot AI</td>

<td>
<span class="badge bg-warning text-dark">
Nguy cơ vượt ngân sách
</span>
</td>

<td>Trung bình</td>

<td>Kiểm soát chi phí phát triển</td>

</tr>

<tr>

<td>AI hỗ trợ điều hành</td>

<td>
<span class="badge bg-success">
Đúng tiến độ
</span>
</td>

<td>Thấp</td>

<td>Tiếp tục theo dõi</td>

</tr>

</tbody>

</table>

</div>
`,
  }}
/>


<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        💰 Báo cáo Quỹ phát triển Khoa học & Công nghệ (KHCN)
    </h3>
    <div class="text-muted">
        Theo dõi phân bổ, sử dụng và số dư quỹ theo thời gian thực
    </div>
</div>

<div class="card-body">

<div class="row mb-5">

<div class="col-md-3">
<div class="card bg-primary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">🏦</div>
<h2 class="text-primary">250 tỷ</h2>
<div class="text-muted">Ngân sách ban đầu</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-danger bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">💸</div>
<h2 class="text-danger">162 tỷ</h2>
<div class="text-muted">Đã sử dụng</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-success bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">💰</div>
<h2 class="text-success">88 tỷ</h2>
<div class="text-muted">Còn lại</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-info bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">📊</div>
<h2 class="text-info">64.8%</h2>
<div class="text-muted">Tỷ lệ giải ngân</div>
</div>
</div>
</div>

</div>

<h4 class="mb-3">📑 Phân bổ quỹ theo loại</h4>

<table class="table table-bordered table-hover">

<thead class="table-light">

<tr>

<th>Loại quỹ</th>

<th>Ngân sách</th>

<th>Đã sử dụng</th>

<th>Còn lại</th>

<th>Tỷ lệ sử dụng</th>

</tr>

</thead>

<tbody>

<tr>

<td>Đổi mới sáng tạo</td>

<td>90 tỷ</td>

<td>62 tỷ</td>

<td>28 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-primary" style="width:69%">69%</div>
</div>
</td>

</tr>

<tr>

<td>Nghiên cứu & Phát triển (R&D)</td>

<td>80 tỷ</td>

<td>56 tỷ</td>

<td>24 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:70%">70%</div>
</div>
</td>

</tr>

<tr>

<td>Chuyển đổi số</td>

<td>60 tỷ</td>

<td>33 tỷ</td>

<td>27 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-info" style="width:55%">55%</div>
</div>
</td>

</tr>

<tr>

<td>Sandbox</td>

<td>20 tỷ</td>

<td>11 tỷ</td>

<td>9 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-warning" style="width:55%">55%</div>
</div>
</td>

</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">🏢 Sử dụng quỹ theo đơn vị</h4>

<table class="table table-striped table-bordered">

<thead class="table-light">

<tr>

<th>Đơn vị</th>

<th>Được phân bổ</th>

<th>Đã sử dụng</th>

<th>Còn lại</th>

<th>Giải ngân</th>

</tr>

</thead>

<tbody>

<tr>

<td>Ban CNTT</td>

<td>48 tỷ</td>

<td>38 tỷ</td>

<td>10 tỷ</td>

<td>79%</td>

</tr>

<tr>

<td>Ban Khai thác</td>

<td>36 tỷ</td>

<td>25 tỷ</td>

<td>11 tỷ</td>

<td>69%</td>

</tr>

<tr>

<td>Ban Kỹ thuật</td>

<td>42 tỷ</td>

<td>27 tỷ</td>

<td>15 tỷ</td>

<td>64%</td>

</tr>

<tr>

<td>Ban Thương mại</td>

<td>28 tỷ</td>

<td>17 tỷ</td>

<td>11 tỷ</td>

<td>61%</td>

</tr>

<tr>

<td>Dịch vụ hành khách</td>

<td>31 tỷ</td>

<td>18 tỷ</td>

<td>13 tỷ</td>

<td>58%</td>

</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">📅 Theo dõi giải ngân theo quý</h4>

<table class="table table-bordered">

<thead class="table-light">

<tr>

<th>Quý</th>

<th>Ngân sách</th>

<th>Đã chi</th>

<th>Tỷ lệ</th>

</tr>

</thead>

<tbody>

<tr>

<td>Quý I</td>

<td>60 tỷ</td>

<td>42 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:70%">70%</div>
</div>
</td>

</tr>

<tr>

<td>Quý II</td>

<td>65 tỷ</td>

<td>46 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-primary" style="width:71%">71%</div>
</div>
</td>

</tr>

<tr>

<td>Quý III</td>

<td>62 tỷ</td>

<td>39 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-info" style="width:63%">63%</div>
</div>
</td>

</tr>

<tr>

<td>Quý IV</td>

<td>63 tỷ</td>

<td>35 tỷ</td>

<td>
<div class="progress">
<div class="progress-bar bg-warning" style="width:56%">56%</div>
</div>
</td>

</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">⚠️ Cảnh báo tài chính</h4>

<table class="table table-hover table-bordered">

<thead class="table-light">

<tr>

<th>Đối tượng</th>

<th>Cảnh báo</th>

<th>Mức độ</th>

<th>Khuyến nghị</th>

</tr>

</thead>

<tbody>

<tr>

<td>Ban CNTT</td>

<td><span class="badge bg-warning text-dark">Giải ngân cao</span></td>

<td>Trung bình</td>

<td>Theo dõi các khoản chi còn lại</td>

</tr>

<tr>

<td>Quỹ ĐMST</td>

<td><span class="badge bg-success">Ổn định</span></td>

<td>Thấp</td>

<td>Tiếp tục thực hiện theo kế hoạch</td>

</tr>

<tr>

<td>Sandbox</td>

<td><span class="badge bg-info">Đúng kế hoạch</span></td>

<td>Thấp</td>

<td>Duy trì tiến độ giải ngân</td>

</tr>

<tr>

<td>R&D</td>

<td><span class="badge bg-danger">Chi phí tăng</span></td>

<td>Cao</td>

<td>Rà soát và tối ưu ngân sách</td>

</tr>

</tbody>

</table>

</div>
`,
  }}
/>



<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        💎 Báo cáo chi thưởng
    </h3>
    <div class="text-muted">
        Thống kê tiền thưởng và điểm thưởng theo cá nhân, đơn vị, chiến dịch, sáng kiến và thời gian
    </div>
</div>

<div class="card-body">

<div class="row mb-5">

<div class="col-md-3">
<div class="card bg-success bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">💰</div>
<h2 class="text-success">5,28 tỷ</h2>
<div class="text-muted">Tổng tiền thưởng</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-warning bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">⭐</div>
<h2 class="text-warning">128.500</h2>
<div class="text-muted">Điểm thưởng</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-primary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">👤</div>
<h2 class="text-primary">436</h2>
<div class="text-muted">Cá nhân được thưởng</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-info bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px">🏢</div>
<h2 class="text-info">27</h2>
<div class="text-muted">Đơn vị được thưởng</div>
</div>
</div>
</div>

</div>

<h4 class="mb-3">🏆 Chi thưởng theo cá nhân</h4>

<table class="table table-bordered table-hover">

<thead class="table-light">
<tr>
<th>Họ tên</th>
<th>Đơn vị</th>
<th>Sáng kiến</th>
<th>Điểm thưởng</th>
<th>Tiền thưởng</th>
<th>Xếp loại</th>
</tr>
</thead>

<tbody>

<tr>
<td>Nguyễn Văn A</td>
<td>Ban CNTT</td>
<td>12</td>
<td>3.500</td>
<td>185.000.000 đ</td>
<td><span class="badge bg-warning text-dark">Xuất sắc</span></td>
</tr>

<tr>
<td>Trần Thị B</td>
<td>Ban Khai thác</td>
<td>10</td>
<td>3.200</td>
<td>170.000.000 đ</td>
<td><span class="badge bg-success">A</span></td>
</tr>

<tr>
<td>Lê Văn C</td>
<td>Ban Kỹ thuật</td>
<td>9</td>
<td>2.950</td>
<td>150.000.000 đ</td>
<td><span class="badge bg-primary">A</span></td>
</tr>

<tr>
<td>Phạm Văn D</td>
<td>Dịch vụ HK</td>
<td>8</td>
<td>2.700</td>
<td>135.000.000 đ</td>
<td><span class="badge bg-info">Khá</span></td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">🏢 Chi thưởng theo đơn vị</h4>

<table class="table table-striped table-bordered">

<thead class="table-light">
<tr>
<th>Đơn vị</th>
<th>Số sáng kiến</th>
<th>Điểm thưởng</th>
<th>Tiền thưởng</th>
<th>Tỷ trọng</th>
</tr>
</thead>

<tbody>

<tr>
<td>Ban CNTT</td>
<td>68</td>
<td>18.500</td>
<td>920 triệu</td>
<td>17%</td>
</tr>

<tr>
<td>Ban Khai thác</td>
<td>59</td>
<td>16.200</td>
<td>810 triệu</td>
<td>15%</td>
</tr>

<tr>
<td>Ban Kỹ thuật</td>
<td>54</td>
<td>14.600</td>
<td>735 triệu</td>
<td>14%</td>
</tr>

<tr>
<td>Dịch vụ hành khách</td>
<td>47</td>
<td>12.800</td>
<td>650 triệu</td>
<td>12%</td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">🚀 Chi thưởng theo chiến dịch</h4>

<table class="table table-bordered">

<thead class="table-light">
<tr>
<th>Chiến dịch</th>
<th>Người đạt thưởng</th>
<th>Điểm thưởng</th>
<th>Tiền thưởng</th>
</tr>
</thead>

<tbody>

<tr>
<td>AI hỗ trợ điều hành</td>
<td>52</td>
<td>15.200</td>
<td>820 triệu</td>
</tr>

<tr>
<td>Digital Airport</td>
<td>44</td>
<td>12.600</td>
<td>690 triệu</td>
</tr>

<tr>
<td>Tiết kiệm nhiên liệu</td>
<td>37</td>
<td>10.900</td>
<td>560 triệu</td>
</tr>

<tr>
<td>Chuyển đổi số nội bộ</td>
<td>61</td>
<td>18.800</td>
<td>980 triệu</td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">📅 Thống kê theo thời gian</h4>

<table class="table table-hover table-bordered">

<thead class="table-light">
<tr>
<th>Kỳ</th>
<th>Tiền thưởng</th>
<th>Điểm thưởng</th>
<th>Người nhận</th>
<th>Tăng/Giảm</th>
</tr>
</thead>

<tbody>

<tr>
<td>Quý I/2026</td>
<td>1,12 tỷ</td>
<td>28.500</td>
<td>102</td>
<td><span class="text-success">+8%</span></td>
</tr>

<tr>
<td>Quý II/2026</td>
<td>1,35 tỷ</td>
<td>34.600</td>
<td>118</td>
<td><span class="text-success">+12%</span></td>
</tr>

<tr>
<td>Quý III/2026</td>
<td>1,48 tỷ</td>
<td>36.900</td>
<td>126</td>
<td><span class="text-success">+9%</span></td>
</tr>

<tr>
<td>Quý IV/2026</td>
<td>1,33 tỷ</td>
<td>28.500</td>
<td>90</td>
<td><span class="text-danger">-10%</span></td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">📈 Phân bổ quỹ thưởng</h4>

<table class="table table-bordered">

<thead class="table-light">
<tr>
<th>Loại thưởng</th>
<th>Tỷ lệ</th>
<th>Giá trị</th>
</tr>
</thead>

<tbody>

<tr>
<td>🏅 Thưởng sáng kiến</td>
<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:58%">58%</div>
</div>
</td>
<td>3,06 tỷ</td>
</tr>

<tr>
<td>🚀 Thưởng chiến dịch</td>
<td>
<div class="progress">
<div class="progress-bar bg-primary" style="width:24%">24%</div>
</div>
</td>
<td>1,27 tỷ</td>
</tr>

<tr>
<td>⭐ Thưởng điểm tích lũy</td>
<td>
<div class="progress">
<div class="progress-bar bg-warning" style="width:18%">18%</div>
</div>
</td>
<td>950 triệu</td>
</tr>

</tbody>

</table>

</div>
`,
  }}
/>



<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        💳 Báo cáo Ví và Giao dịch
    </h3>
    <div class="text-muted">
        Tra cứu lịch sử giao dịch, số dư ví tiền mặt, ví Cánh Sen/Bông Sen và hỗ trợ đối soát
    </div>
</div>

<div class="card-body">

<div class="row mb-5">

<div class="col-md-3">
<div class="card bg-success bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px;">💵</div>
<h2 class="text-success">2,86 tỷ</h2>
<div class="text-muted">Ví tiền mặt</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-warning bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px;">🪽</div>
<h2 class="text-warning">1.285.000</h2>
<div class="text-muted">Điểm Cánh Sen</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-info bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px;">🌸</div>
<h2 class="text-info">856.200</h2>
<div class="text-muted">Điểm Bông Sen</div>
</div>
</div>
</div>

<div class="col-md-3">
<div class="card bg-primary bg-opacity-10">
<div class="card-body text-center">
<div style="font-size:32px;">🔄</div>
<h2 class="text-primary">18.542</h2>
<div class="text-muted">Giao dịch</div>
</div>
</div>
</div>

</div>

<h4 class="mb-3">💳 Thống kê số dư ví</h4>

<table class="table table-bordered table-hover">

<thead class="table-light">
<tr>
<th>Loại ví</th>
<th>Số tài khoản</th>
<th>Tổng số dư</th>
<th>Khả dụng</th>
<th>Đang khóa</th>
</tr>
</thead>

<tbody>

<tr>
<td>Ví tiền mặt</td>
<td>1.250</td>
<td>2,86 tỷ</td>
<td>2,74 tỷ</td>
<td>120 triệu</td>
</tr>

<tr>
<td>Ví Cánh Sen</td>
<td>1.250</td>
<td>1.285.000 điểm</td>
<td>1.260.500 điểm</td>
<td>24.500 điểm</td>
</tr>

<tr>
<td>Ví Bông Sen</td>
<td>985</td>
<td>856.200 điểm</td>
<td>842.600 điểm</td>
<td>13.600 điểm</td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">📋 Lịch sử giao dịch gần nhất</h4>

<table class="table table-striped table-bordered">

<thead class="table-light">
<tr>
<th>Thời gian</th>
<th>Mã GD</th>
<th>Người dùng</th>
<th>Loại giao dịch</th>
<th>Số tiền / Điểm</th>
<th>Trạng thái</th>
</tr>
</thead>

<tbody>

<tr>
<td>29/06/2026 09:30</td>
<td>GD000125</td>
<td>Nguyễn Văn A</td>
<td>Chi thưởng sáng kiến</td>
<td class="text-success">+25.000.000 đ</td>
<td><span class="badge bg-success">Thành công</span></td>
</tr>

<tr>
<td>29/06/2026 09:10</td>
<td>GD000124</td>
<td>Trần Thị B</td>
<td>Cộng điểm Cánh Sen</td>
<td class="text-primary">+2.500 điểm</td>
<td><span class="badge bg-success">Thành công</span></td>
</tr>

<tr>
<td>29/06/2026 08:42</td>
<td>GD000123</td>
<td>Lê Văn C</td>
<td>Đổi điểm thưởng</td>
<td class="text-danger">-800 điểm</td>
<td><span class="badge bg-warning text-dark">Chờ xử lý</span></td>
</tr>

<tr>
<td>28/06/2026 16:15</td>
<td>GD000122</td>
<td>Phạm Văn D</td>
<td>Hoàn tiền</td>
<td class="text-success">+5.000.000 đ</td>
<td><span class="badge bg-success">Hoàn tất</span></td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">📊 Thống kê giao dịch theo loại</h4>

<table class="table table-bordered">

<thead class="table-light">
<tr>
<th>Loại giao dịch</th>
<th>Số lượng</th>
<th>Giá trị</th>
<th>Tỷ trọng</th>
</tr>
</thead>

<tbody>

<tr>
<td>Chi thưởng</td>
<td>5.842</td>
<td>4,62 tỷ</td>
<td>
<div class="progress">
<div class="progress-bar bg-success" style="width:48%">48%</div>
</div>
</td>
</tr>

<tr>
<td>Cộng điểm</td>
<td>4.725</td>
<td>865.000 điểm</td>
<td>
<div class="progress">
<div class="progress-bar bg-primary" style="width:26%">26%</div>
</div>
</td>
</tr>

<tr>
<td>Đổi thưởng</td>
<td>3.218</td>
<td>2,15 tỷ</td>
<td>
<div class="progress">
<div class="progress-bar bg-warning" style="width:17%">17%</div>
</div>
</td>
</tr>

<tr>
<td>Điều chỉnh / Hoàn tiền</td>
<td>1.125</td>
<td>485 triệu</td>
<td>
<div class="progress">
<div class="progress-bar bg-info" style="width:9%">9%</div>
</div>
</td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">📑 Báo cáo đối soát</h4>

<table class="table table-hover table-bordered">

<thead class="table-light">
<tr>
<th>Kỳ đối soát</th>
<th>Tổng giao dịch</th>
<th>Khớp</th>
<th>Chênh lệch</th>
<th>Trạng thái</th>
</tr>
</thead>

<tbody>

<tr>
<td>Ngày 29/06/2026</td>
<td>1.248</td>
<td>1.246</td>
<td>2</td>
<td><span class="badge bg-warning text-dark">Đang xử lý</span></td>
</tr>

<tr>
<td>Ngày 28/06/2026</td>
<td>1.315</td>
<td>1.315</td>
<td>0</td>
<td><span class="badge bg-success">Đã đối soát</span></td>
</tr>

<tr>
<td>Ngày 27/06/2026</td>
<td>1.287</td>
<td>1.287</td>
<td>0</td>
<td><span class="badge bg-success">Hoàn tất</span></td>
</tr>

</tbody>

</table>

<br>

<h4 class="mb-3">⚠️ Giao dịch cần kiểm tra</h4>

<table class="table table-bordered table-striped">

<thead class="table-light">
<tr>
<th>Mã GD</th>
<th>Người dùng</th>
<th>Nội dung</th>
<th>Giá trị</th>
<th>Nguyên nhân</th>
</tr>
</thead>

<tbody>

<tr>
<td>GD000123</td>
<td>Lê Văn C</td>
<td>Đổi điểm thưởng</td>
<td>800 điểm</td>
<td><span class="badge bg-warning text-dark">Chờ xác nhận</span></td>
</tr>

<tr>
<td>GD000118</td>
<td>Ban CNTT</td>
<td>Chi thưởng tập thể</td>
<td>120.000.000 đ</td>
<td><span class="badge bg-danger">Chênh lệch đối soát</span></td>
</tr>

</tbody>

</table>

</div>
`,
  }}
/>



<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        💰 Báo cáo Ngân sách & ROI
    </h3>
    <div class="text-muted">
        Theo dõi ngân sách quỹ khen thưởng, chi phí đã sử dụng và đánh giá hiệu quả đầu tư (ROI) từ các sáng kiến.
    </div>
</div>

<div class="card-body">
    <div class="row g-5">

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-success">
                <div class="fs-6 text-gray-600">Tổng ngân sách</div>
                <div class="fs-2 fw-bold text-success">15,2 tỷ VNĐ</div>
                <div class="text-muted">Năm 2026</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-primary">
                <div class="fs-6 text-gray-600">Đã chi thưởng</div>
                <div class="fs-2 fw-bold text-primary">11,8 tỷ VNĐ</div>
                <div class="text-muted">77,6% ngân sách</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-warning">
                <div class="fs-6 text-gray-600">Giá trị mang lại</div>
                <div class="fs-2 fw-bold text-warning">58,6 tỷ VNĐ</div>
                <div class="text-muted">Từ các sáng kiến</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-info">
                <div class="fs-6 text-gray-600">ROI trung bình</div>
                <div class="fs-2 fw-bold text-info">396%</div>
                <div class="text-muted">1 đồng đầu tư thu về 3,96 đồng</div>
            </div>
        </div>

    </div>

    <div class="separator my-8"></div>

    <h5 class="fw-bold mb-4">📊 Hiệu quả đầu tư theo chương trình</h5>

    <table class="table table-row-bordered table-striped align-middle">
        <thead class="table-light">
            <tr>
                <th>Chương trình</th>
                <th>Chi phí thưởng</th>
                <th>Giá trị mang lại</th>
                <th>ROI</th>
                <th>Đánh giá</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Sáng kiến cải tiến sản xuất</td>
                <td>3,2 tỷ</td>
                <td>18,5 tỷ</td>
                <td><span class="badge badge-success">578%</span></td>
                <td>Hiệu quả rất cao</td>
            </tr>
            <tr>
                <td>Chuyển đổi số</td>
                <td>4,1 tỷ</td>
                <td>20,3 tỷ</td>
                <td><span class="badge badge-success">495%</span></td>
                <td>Hiệu quả cao</td>
            </tr>
            <tr>
                <td>Tiết kiệm năng lượng</td>
                <td>2,6 tỷ</td>
                <td>10,8 tỷ</td>
                <td><span class="badge badge-primary">315%</span></td>
                <td>Hiệu quả tốt</td>
            </tr>
            <tr>
                <td>Nâng cao chất lượng dịch vụ</td>
                <td>1,9 tỷ</td>
                <td>9,0 tỷ</td>
                <td><span class="badge badge-primary">374%</span></td>
                <td>Hiệu quả tốt</td>
            </tr>
        </tbody>
    </table>

    <div class="separator my-8"></div>

    <div class="row">

        <div class="col-md-6">
            <div class="alert alert-success">
                <h5 class="fw-bold mb-3">📈 Phân tích</h5>
                <ul class="mb-0">
                    <li>77,6% ngân sách đã được sử dụng.</li>
                    <li>ROI trung bình đạt 396%.</li>
                    <li>Chương trình "Sáng kiến cải tiến sản xuất" mang lại hiệu quả cao nhất.</li>
                    <li>Dự kiến ngân sách còn lại đủ triển khai thêm 12 đợt khen thưởng.</li>
                </ul>
            </div>
        </div>

        <div class="col-md-6">
            <div class="alert alert-info">
                <h5 class="fw-bold mb-3">📌 Đề xuất</h5>
                <ul class="mb-0">
                    <li>Tăng ngân sách cho các chương trình có ROI trên 500%.</li>
                    <li>Ưu tiên đầu tư cho các sáng kiến chuyển đổi số.</li>
                    <li>Rà soát các chương trình có hiệu quả thấp để tối ưu chi phí.</li>
                    <li>Theo dõi ROI theo từng đơn vị và từng quý.</li>
                </ul>
            </div>
        </div>

    </div>

</div>
`,
  }}
/>




<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        👥 Báo cáo Người dùng & Sử dụng hệ thống
    </h3>
    <div class="text-muted">
        Thống kê người dùng hoạt động, tần suất đăng nhập, mức độ sử dụng tính năng và tương tác theo phòng ban/đơn vị
    </div>
</div>

<div class="card-body">

    <div class="row g-5">

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-primary">
                <div class="fs-6 text-gray-600">Người dùng hoạt động</div>
                <div class="fs-2 fw-bold text-primary">1.248</div>
                <div class="text-muted">Trong 30 ngày</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-success">
                <div class="fs-6 text-gray-600">Lượt đăng nhập</div>
                <div class="fs-2 fw-bold text-success">8.562</div>
                <div class="text-muted">Trung bình 6.8 lần/người</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-warning">
                <div class="fs-6 text-gray-600">Tỷ lệ sử dụng tính năng</div>
                <div class="fs-2 fw-bold text-warning">73%</div>
                <div class="text-muted">Ít nhất 1 tính năng/ngày</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-info">
                <div class="fs-6 text-gray-600">Mức độ tương tác</div>
                <div class="fs-2 fw-bold text-info">Cao</div>
                <div class="text-muted">Tăng 12% so với tháng trước</div>
            </div>
        </div>

    </div>

    <div class="separator my-8"></div>

    <h5 class="fw-bold mb-4">📊 Thống kê theo phòng ban</h5>

    <table class="table table-row-bordered table-striped align-middle">
        <thead class="table-light">
            <tr>
                <th>Phòng ban</th>
                <th>Người dùng hoạt động</th>
                <th>Lượt đăng nhập</th>
                <th>Tần suất TB</th>
                <th>Mức độ tương tác</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Phòng CNTT</td>
                <td>210</td>
                <td>1.950</td>
                <td>9.3</td>
                <td><span class="badge badge-success">Rất cao</span></td>
            </tr>
            <tr>
                <td>Phòng Kinh doanh</td>
                <td>320</td>
                <td>2.870</td>
                <td>8.9</td>
                <td><span class="badge badge-success">Cao</span></td>
            </tr>
            <tr>
                <td>Phòng Nhân sự</td>
                <td>180</td>
                <td>1.120</td>
                <td>6.2</td>
                <td><span class="badge badge-primary">Trung bình</span></td>
            </tr>
            <tr>
                <td>Khối vận hành</td>
                <td>538</td>
                <td>2.622</td>
                <td>4.9</td>
                <td><span class="badge badge-warning">Khá</span></td>
            </tr>
        </tbody>
    </table>

    <div class="separator my-8"></div>

    <div class="row">

        <div class="col-md-6">
            <div class="alert alert-primary">
                <h5 class="fw-bold mb-3">📈 Phân tích hành vi</h5>
                <ul class="mb-0">
                    <li>Phòng CNTT có mức độ tương tác cao nhất hệ thống.</li>
                    <li>Trung bình mỗi người dùng đăng nhập 6–9 lần/tháng.</li>
                    <li>73% người dùng sử dụng ít nhất 1 tính năng mỗi ngày.</li>
                    <li>Khối vận hành có tần suất thấp hơn nhưng số lượng người dùng lớn.</li>
                </ul>
            </div>
        </div>

        <div class="col-md-6">
            <div class="alert alert-info">
                <h5 class="fw-bold mb-3">📌 Đề xuất cải thiện</h5>
                <ul class="mb-0">
                    <li>Tăng đào tạo sử dụng hệ thống cho khối vận hành.</li>
                    <li>Khuyến khích sử dụng thêm tính năng nâng cao.</li>
                    <li>Tối ưu UX cho nhóm người dùng ít tương tác.</li>
                    <li>Theo dõi hành vi theo tuần để phát hiện xu hướng giảm sử dụng.</li>
                </ul>
            </div>
        </div>

    </div>

</div>
`,
  }}
/>



<div
  className="card mt-5"
  dangerouslySetInnerHTML={{
    __html: `
<div class="card-header border-0 pt-5">
    <h3 class="card-title fw-bold text-gray-800">
        🎁 Báo cáo Quy đổi Quà tặng
    </h3>
    <div class="text-muted">
        Thống kê số lượng quy đổi, loại quà phổ biến, tồn kho và chi phí quy đổi quà tặng trong hệ thống
    </div>
</div>

<div class="card-body">

    <div class="row g-5">

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-primary">
                <div class="fs-6 text-gray-600">Tổng lượt quy đổi</div>
                <div class="fs-2 fw-bold text-primary">5.842</div>
                <div class="text-muted">Trong năm 2026</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-success">
                <div class="fs-6 text-gray-600">Chi phí quy đổi</div>
                <div class="fs-2 fw-bold text-success">3,6 tỷ VNĐ</div>
                <div class="text-muted">Tổng giá trị quà tặng</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-warning">
                <div class="fs-6 text-gray-600">Loại quà phổ biến</div>
                <div class="fs-2 fw-bold text-warning">Voucher</div>
                <div class="text-muted">Chiếm 42% tổng lượt</div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6">
            <div class="border rounded p-5 bg-light-info">
                <div class="fs-6 text-gray-600">Tồn kho quà tặng</div>
                <div class="fs-2 fw-bold text-info">12.450</div>
                <div class="text-muted">Còn khả dụng</div>
            </div>
        </div>

    </div>

    <div class="separator my-8"></div>

    <h5 class="fw-bold mb-4">📊 Top quà tặng được quy đổi nhiều nhất</h5>

    <table class="table table-row-bordered table-striped align-middle">
        <thead class="table-light">
            <tr>
                <th>Quà tặng</th>
                <th>Số lượt quy đổi</th>
                <th>Chi phí</th>
                <th>Tỷ lệ</th>
                <th>Tình trạng</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Voucher mua sắm</td>
                <td>2.450</td>
                <td>1,2 tỷ</td>
                <td>42%</td>
                <td><span class="badge badge-success">Phổ biến</span></td>
            </tr>
            <tr>
                <td>Thẻ điện thoại</td>
                <td>1.320</td>
                <td>680 triệu</td>
                <td>23%</td>
                <td><span class="badge badge-primary">Ổn định</span></td>
            </tr>
            <tr>
                <td>Quà hiện vật</td>
                <td>980</td>
                <td>1,1 tỷ</td>
                <td>17%</td>
                <td><span class="badge badge-warning">Trung bình</span></td>
            </tr>
            <tr>
                <td>Tiền mặt</td>
                <td>1.092</td>
                <td>600 triệu</td>
                <td>18%</td>
                <td><span class="badge badge-info">Khác</span></td>
            </tr>
        </tbody>
    </table>

    <div class="separator my-8"></div>

    <div class="row">

        <div class="col-md-6">
            <div class="alert alert-success">
                <h5 class="fw-bold mb-3">📈 Phân tích xu hướng</h5>
                <ul class="mb-0">
                    <li>Voucher là loại quà được ưa chuộng nhất (42%).</li>
                    <li>Chi phí quy đổi tập trung chủ yếu vào voucher và quà hiện vật.</li>
                    <li>Tồn kho quà tặng vẫn đảm bảo đáp ứng nhu cầu ngắn hạn.</li>
                    <li>Xu hướng chuyển dần sang quà số hóa (voucher, thẻ điện thoại).</li>
                </ul>
            </div>
        </div>

        <div class="col-md-6">
            <div class="alert alert-info">
                <h5 class="fw-bold mb-3">📌 Đề xuất quản lý</h5>
                <ul class="mb-0">
                    <li>Tăng tỷ trọng quà số để giảm chi phí vận hành.</li>
                    <li>Rà soát tồn kho quà hiện vật để tránh dư thừa.</li>
                    <li>Đàm phán thêm nhà cung cấp voucher để tối ưu chi phí.</li>
                    <li>Theo dõi hành vi quy đổi theo phòng ban/chiến dịch.</li>
                </ul>
            </div>
        </div>

    </div>

</div>
`,
  }}
/>

      </Content>
    </>
  );
};
