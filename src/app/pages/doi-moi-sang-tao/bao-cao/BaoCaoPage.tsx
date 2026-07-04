import React, { useState, useEffect, useCallback } from 'react';
import { Button, Select, message, Table, Tag, Spin, Empty, Tabs, Tooltip } from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { getIdeaDashboard, getIdeaContributions, exportIdeaReport } from '@/app/services/ideaPortalApi';
import type { IIdeaDashboard, IIdeaContributionReport, IIdeaContribution, INhomSoLuong } from '@/models/idea-portal';

const { Option } = Select;

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2];

const safeItem = <T,>(res: any): T | null => {
  const d = res?.data ?? res;
  return (d?.data ?? d ?? null) as T | null;
};

const fmtNum = (v?: number | null) => (v ?? 0).toLocaleString('vi-VN');

// ── KPI card ──────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{ title: string; value: React.ReactNode; icon: string; color: string; sub?: string }> =
  ({ title, value, icon, color, sub }) => (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
      <div className="card-body py-4 px-5 d-flex align-items-center gap-4">
        <div className={`d-flex align-items-center justify-content-center rounded-3 bg-light-${color}`}
          style={{ width: 48, height: 48, flexShrink: 0 }}>
          <i className={`fa-regular ${icon} fs-3 text-${color}`} />
        </div>
        <div>
          <div className="fs-2 fw-bold text-gray-900">{value}</div>
          <div className="fs-8 text-muted">{title}</div>
          {sub && <div className="fs-9 text-muted">{sub}</div>}
        </div>
      </div>
    </div>
  );

export const BaoCaoPage: React.FC = () => {
  const [year, setYear]         = useState(THIS_YEAR);
  const [loading, setLoading]   = useState(false);
  const [dash, setDash]         = useState<IIdeaDashboard | null>(null);

  // Leaderboard
  const [lbPeriod, setLbPeriod] = useState<'nam' | 'quy' | 'thang'>('nam');
  const [lbValue, setLbValue]   = useState<number>(1);
  const [lbLoading, setLbLoading] = useState(false);
  const [lb, setLb]             = useState<IIdeaContributionReport | null>(null);

  const [exporting, setExporting] = useState(false);

  const loadDash = useCallback(async (y = year) => {
    setLoading(true);
    try {
      const res = await getIdeaDashboard(y);
      setDash(safeItem<IIdeaDashboard>(res));
    } catch { message.error('Không tải được số liệu báo cáo'); }
    finally { setLoading(false); }
  }, [year]);

  const loadLb = useCallback(async (y = year, period = lbPeriod, value = lbValue) => {
    setLbLoading(true);
    try {
      const res = await getIdeaContributions({
        nam: y,
        quy: period === 'quy' ? value : undefined,
        thang: period === 'thang' ? value : undefined,
        top: 10,
      });
      setLb(safeItem<IIdeaContributionReport>(res));
    } catch { /* ignore */ }
    finally { setLbLoading(false); }
  }, [year, lbPeriod, lbValue]);

  useEffect(() => { loadDash(); loadLb(); }, []);

  const changeYear = (y: number) => { setYear(y); loadDash(y); loadLb(y); };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportIdeaReport(year);
      if (res?.data) {
        const url = URL.createObjectURL(res.data as Blob);
        const a = document.createElement('a');
        a.href = url; a.download = `bao-cao-dmst-${year}.csv`; a.click();
        URL.revokeObjectURL(url);
        message.success('Đã xuất báo cáo (CSV — mở bằng Excel)');
      } else {
        message.error('Không xuất được báo cáo');
      }
    } finally { setExporting(false); }
  };

  // ── Charts ──────────────────────────────────────────────────────────────────
  const monthlyOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#2563eb'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: Array.from({ length: 12 }, (_, i) => `T${i + 1}`) },
    yaxis: { labels: { formatter: (v: number) => `${Math.round(v)}` } },
    grid: { strokeDashArray: 4 },
  };

  const statusSeries = dash
    ? [dash.soBanNhap, dash.soDaNop, dash.soDaTiepNhan, dash.soTraLai, dash.soDuocCongNhan]
    : [];
  const statusOptions: ApexOptions = {
    labels: ['Bản nháp', 'Đã nộp/Chờ xét duyệt', 'Đã tiếp nhận', 'Đã trả lại', 'Được công nhận'],
    colors: ['#94a3b8', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
    legend: { position: 'bottom', fontSize: '12px' },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
  };

  // ── Tables ──────────────────────────────────────────────────────────────────
  const groupColumns = (label: string) => [
    { title: label, dataIndex: 'ten', key: 'ten', render: (t: string) => <span className="fw-semibold">{t}</span> },
    { title: 'Số lượng', dataIndex: 'soLuong', key: 'soLuong', width: 100, className: 'text-center' },
    { title: 'Được duyệt', dataIndex: 'soDuocDuyet', key: 'soDuocDuyet', width: 110, className: 'text-center' },
    {
      title: 'Công nhận', dataIndex: 'soDuocCongNhan', key: 'soDuocCongNhan', width: 100, className: 'text-center',
      render: (v: number) => v > 0 ? <Tag color="purple">{v}</Tag> : <span className="text-muted">0</span>,
    },
    {
      title: 'Tỷ lệ duyệt', key: 'rate', width: 100, className: 'text-center',
      render: (_: unknown, r: INhomSoLuong) =>
        r.soLuong > 0 ? `${Math.round((r.soDuocDuyet / r.soLuong) * 100)}%` : '—',
    },
  ];

  const lbColumns = (isUnit: boolean) => [
    {
      title: '#', dataIndex: 'xepHang', key: 'xepHang', width: 56, className: 'text-center',
      render: (v: number) =>
        v === 1 ? <i className="fa-solid fa-trophy text-warning fs-5" />
        : v === 2 ? <i className="fa-solid fa-trophy text-secondary fs-5" />
        : v === 3 ? <i className="fa-solid fa-trophy" style={{ color: '#cd7f32' }} />
        : <span className="text-muted fw-semibold">{v}</span>,
    },
    {
      title: isUnit ? 'Đơn vị' : 'Cá nhân', dataIndex: 'ten', key: 'ten',
      render: (t: string, r: IIdeaContribution) => (
        <div>
          <div className="fw-semibold">{t}</div>
          {!isUnit && r.donVi && <div className="text-muted fs-8">{r.donVi}</div>}
        </div>
      ),
    },
    { title: 'Số nộp', dataIndex: 'soNop', key: 'soNop', width: 90, className: 'text-center' },
    { title: 'Được duyệt', dataIndex: 'soDuocDuyet', key: 'soDuocDuyet', width: 110, className: 'text-center' },
    {
      title: 'Công nhận', dataIndex: 'soDuocCongNhan', key: 'soDuocCongNhan', width: 100, className: 'text-center',
      render: (v: number) => v > 0 ? <Tag color="purple">{v}</Tag> : <span className="text-muted">0</span>,
    },
  ];

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
      ]}>Báo cáo & thống kê</PageTitle>

      <Content>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-5">
          <div>
            <h4 className="fw-bold text-gray-900 mb-1">Báo cáo hoạt động Đổi mới sáng tạo</h4>
            <p className="text-muted fs-7 mb-0">
              Số liệu thời gian thực từ hồ sơ ý tưởng — trạng thái, đơn vị, lĩnh vực, SLA xử lý và xếp hạng đóng góp
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Select value={year} onChange={changeYear} style={{ width: 100 }}>
              {YEARS.map(y => <Option key={y} value={y}>{y}</Option>)}
            </Select>
            <Tooltip title="Làm mới">
              <Button icon={<i className="fa-regular fa-refresh" />} onClick={() => { loadDash(); loadLb(); }} />
            </Tooltip>
            <Button type="primary" loading={exporting} onClick={handleExport}
              icon={<i className="fa-regular fa-file-excel me-1" />}>
              Xuất báo cáo
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
          {!dash && !loading ? (
            <Empty description="Chưa có dữ liệu" className="py-10" />
          ) : dash && (
            <>
              {/* KPI hàng 1 — trạng thái */}
              <div className="row g-4 mb-4">
                <div className="col-6 col-xl-2"><KpiCard title="Tổng ý tưởng" value={fmtNum(dash.tongYTuong)} icon="fa-lightbulb" color="primary" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Đã nộp/Chờ xét duyệt" value={fmtNum(dash.soDaNop)} icon="fa-clock" color="warning" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Đã tiếp nhận" value={fmtNum(dash.soDaTiepNhan)} icon="fa-circle-check" color="info" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Được công nhận" value={fmtNum(dash.soDuocCongNhan)} icon="fa-medal" color="success" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Người tham gia" value={fmtNum(dash.soNguoiThamGia)} icon="fa-users" color="primary" /></div>
                <div className="col-6 col-xl-2"><KpiCard title="Đơn vị tham gia" value={fmtNum(dash.soDonViThamGia)} icon="fa-building" color="info" /></div>
              </div>

              {/* KPI hàng 2 — SLA */}
              <div className="row g-4 mb-4">
                <div className="col-6 col-xl-3">
                  <KpiCard title="Thời gian xử lý trung bình" icon="fa-stopwatch" color="primary"
                    value={dash.gioXuLyTrungBinh != null ? `${dash.gioXuLyTrungBinh} giờ` : '—'} />
                </div>
                <div className="col-6 col-xl-3">
                  <KpiCard title={`Tỷ lệ đúng hạn (SLA ${dash.slaGio}h)`} icon="fa-gauge-high" color="success"
                    value={dash.tyLeDungHan != null ? `${dash.tyLeDungHan}%` : '—'} />
                </div>
                <div className="col-6 col-xl-3">
                  <KpiCard title="Hồ sơ đang chờ xử lý" icon="fa-inbox" color="warning" value={fmtNum(dash.soChoXuLy)} />
                </div>
                <div className="col-6 col-xl-3">
                  <KpiCard title="Tồn đọng quá hạn" icon="fa-triangle-exclamation" color="danger"
                    value={fmtNum(dash.soTonDong)}
                    sub={dash.soTonDong > 0 ? 'Cần xử lý ngay' : 'Không có tồn đọng'} />
                </div>
              </div>

              {/* Charts */}
              <div className="row g-4 mb-4">
                <div className="col-xl-8">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className="fa-regular fa-chart-column text-primary me-2" />
                        Ý tưởng nộp theo tháng — {dash.nam}
                      </div>
                      <ReactApexChart type="bar" height={260}
                        series={[{ name: 'Số nộp', data: dash.nopTheoThang }]}
                        options={monthlyOptions} />
                    </div>
                  </div>
                </div>
                <div className="col-xl-4">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className="fa-regular fa-chart-pie text-primary me-2" />
                        Phân bố theo trạng thái
                      </div>
                      {statusSeries.every(v => v === 0)
                        ? <Empty description="Chưa có dữ liệu" style={{ padding: 24 }} />
                        : <ReactApexChart type="donut" height={260} series={statusSeries} options={statusOptions} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Theo lĩnh vực / đơn vị */}
              <div className="row g-4 mb-4">
                <div className="col-xl-6">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className="fa-regular fa-tags text-primary me-2" />Theo lĩnh vực
                      </div>
                      <Table columns={groupColumns('Lĩnh vực')} dataSource={dash.theoLinhVuc}
                        rowKey="ten" size="small" pagination={false}
                        locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }} />
                    </div>
                  </div>
                </div>
                <div className="col-xl-6">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                    <div className="card-body p-5">
                      <div className="fw-bold text-gray-800 mb-3">
                        <i className="fa-regular fa-building text-primary me-2" />Theo đơn vị
                      </div>
                      <Table columns={groupColumns('Đơn vị')} dataSource={dash.theoDonVi}
                        rowKey="ten" size="small" pagination={false}
                        locale={{ emptyText: <Empty description="Chưa có dữ liệu" /> }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
                <div className="card-body p-5">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div className="fw-bold text-gray-800">
                      <i className="fa-regular fa-ranking-star text-primary me-2" />
                      Bảng xếp hạng đóng góp {lb ? `— ${lb.ky}` : ''}
                    </div>
                    <div className="d-flex gap-2">
                      <Select value={lbPeriod} style={{ width: 110 }}
                        onChange={(p: 'nam' | 'quy' | 'thang') => { setLbPeriod(p); setLbValue(1); loadLb(year, p, 1); }}>
                        <Option value="nam">Năm</Option>
                        <Option value="quy">Quý</Option>
                        <Option value="thang">Tháng</Option>
                      </Select>
                      {lbPeriod !== 'nam' && (
                        <Select value={lbValue} style={{ width: 110 }}
                          onChange={(v: number) => { setLbValue(v); loadLb(year, lbPeriod, v); }}>
                          {(lbPeriod === 'quy' ? [1, 2, 3, 4] : Array.from({ length: 12 }, (_, i) => i + 1)).map(v => (
                            <Option key={v} value={v}>{lbPeriod === 'quy' ? `Quý ${v}` : `Tháng ${v}`}</Option>
                          ))}
                        </Select>
                      )}
                    </div>
                  </div>

                  <Spin spinning={lbLoading}>
                    <Tabs
                      items={[
                        {
                          key: 'ca-nhan',
                          label: <span><i className="fa-regular fa-user me-1" />Cá nhân</span>,
                          children: (
                            <Table columns={lbColumns(false)} dataSource={lb?.caNhan ?? []}
                              rowKey="ten" size="small" pagination={false}
                              locale={{ emptyText: <Empty description="Chưa có dữ liệu trong kỳ" /> }} />
                          ),
                        },
                        {
                          key: 'don-vi',
                          label: <span><i className="fa-regular fa-building me-1" />Đơn vị</span>,
                          children: (
                            <Table columns={lbColumns(true)} dataSource={lb?.donVi ?? []}
                              rowKey="ten" size="small" pagination={false}
                              locale={{ emptyText: <Empty description="Chưa có dữ liệu trong kỳ" /> }} />
                          ),
                        },
                      ]}
                    />
                  </Spin>
                </div>
              </div>
            </>
          )}
        </Spin>
      </Content>
    </>
  );
};
