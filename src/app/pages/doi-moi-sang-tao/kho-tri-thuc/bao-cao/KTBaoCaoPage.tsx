import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card, Row, Col, Statistic, Spin, Empty, Tabs, Table, Tag, Button,
  Alert, DatePicker, Select, message, Tooltip, Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import {
  getKTBaoCaoTongHop,
  getKTBaoCaoDongGop,
  getKTBaoCaoTaiLieu,
  exportKTBaoCaoTongHopExcel,
  exportKTBaoCaoDongGopExcel,
} from '@/app/services/khoTriThucApi';
import type {
  IKTBaoCaoFilter,
  IKTBaoCaoTongHop,
  IKTBaoCaoDongGop,
  IKTBaoCaoTaiLieu,
} from '@/app/models/knowledge-hub';
import { saveBlobAsFile } from '@/utils/utils';

const { RangePicker } = DatePicker;

// ── Constants ─────────────────────────────────────────────────────────────────

const LOAI_LABEL: Record<string, string> = {
  TaiLieuHuongDan:  'Hướng dẫn',
  Playbook:         'Playbook',
  Template:         'Mẫu biểu',
  NghienCuu:        'Nghiên cứu',
  TinhHuong:        'Tình huống',
  BaiHocKinhNghiem: 'Bài học KN',
};

const TRANG_THAI_LABEL: Record<string, string> = {
  NhapLieu:    'Nháp',
  ChoXetDuyet: 'Chờ duyệt',
  DaXuatBan:   'Đã xuất bản',
  TuChoi:      'Từ chối',
};

const TRANG_THAI_COLOR: Record<string, string> = {
  NhapLieu:    'default',
  ChoXetDuyet: 'processing',
  DaXuatBan:   'success',
  TuChoi:      'error',
};

const LOAI_OPTIONS = Object.entries(LOAI_LABEL).map(([value, label]) => ({ value, label }));
const TRANG_THAI_OPTIONS = Object.entries(TRANG_THAI_LABEL).map(([value, label]) => ({ value, label }));

const CHART_COLORS = ['#3699FF', '#1BC5BD', '#8950FC', '#F64E60', '#FFA800', '#0BB783'];
const MONTHS_VI = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const ROLE_META: Record<string, { label: string; color: string }> = {
  all:      { label: 'Toàn hệ thống', color: 'blue' },
  unit:     { label: 'Đơn vị của tôi', color: 'green' },
  personal: { label: 'Của tôi',        color: 'orange' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtNum = (n?: number | null) => (n ?? 0).toLocaleString('vi-VN');
const fmtDate = (s?: string | null) => (s ? dayjs(s).format('DD/MM/YYYY') : '—');

// ── Component ─────────────────────────────────────────────────────────────────

export const KTBaoCaoPage: React.FC = () => {
  // Filter inputs
  const [filterDates, setFilterDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [loaiTL, setLoaiTL]           = useState<string | undefined>();
  const [trangThaiVal, setTrangThaiVal] = useState<string | undefined>();

  // Data state
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [tongHop, setTongHop]       = useState<IKTBaoCaoTongHop | null>(null);
  const [dongGop, setDongGop]       = useState<IKTBaoCaoDongGop[]>([]);
  const [taiLieu, setTaiLieu]       = useState<IKTBaoCaoTaiLieu[]>([]);
  const [taiLieuTotal, setTaiLieuTotal] = useState(0);
  const [taiLieuPage, setTaiLieuPage]   = useState(1);
  const [taiLieuPageSize]               = useState(20);

  // Export state
  const [exportExcel, setExportExcel] = useState<'tong-hop' | 'dong-gop' | null>(null);
  const [exportPdf, setExportPdf]     = useState(false);

  // Refs for PDF capture
  const tongHopRef = useRef<HTMLDivElement>(null);
  const dongGopRef = useRef<HTMLDivElement>(null);

  // ── Build filter ─────────────────────────────────────────────────────────

  const buildFilter = useCallback(
    (page = 1, pageSize = taiLieuPageSize): IKTBaoCaoFilter & { pageNumber: number; pageSize: number } => ({
      tuNgay:      filterDates?.[0]?.format('YYYY-MM-DD'),
      denNgay:     filterDates?.[1]?.format('YYYY-MM-DD'),
      loaiTaiLieu: loaiTL,
      trangThai:   trangThaiVal,
      pageNumber:  page,
      pageSize,
    }),
    [filterDates, loaiTL, trangThaiVal, taiLieuPageSize],
  );

  // ── Fetch data ────────────────────────────────────────────────────────────

  const fetchData = useCallback(
    async (filter: IKTBaoCaoFilter & { pageNumber: number; pageSize: number }) => {
      setLoading(true);
      setError(null);
      try {
        const [r1, r2, r3] = await Promise.all([
          getKTBaoCaoTongHop(filter),
          getKTBaoCaoDongGop(filter),
          getKTBaoCaoTaiLieu(filter),
        ]);

        setTongHop(r1?.data?.succeeded ? (r1.data.data ?? null) : null);
        setDongGop(r2?.data?.succeeded ? (r2.data.data ?? []) : []);

        if (r3?.data?.succeeded && r3.data.data) {
          setTaiLieu(r3.data.data.data ?? []);
          setTaiLieuTotal(r3.data.data.totalCount ?? 0);
        } else {
          setTaiLieu([]);
          setTaiLieuTotal(0);
        }

        if (!r1?.data?.succeeded && !r2?.data?.succeeded) {
          setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại.');
        }
      } catch {
        setError('Có lỗi xảy ra khi kết nối server.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial load on mount with empty filters
  useEffect(() => {
    fetchData({ pageNumber: 1, pageSize: taiLieuPageSize });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleApply = () => {
    setTaiLieuPage(1);
    fetchData(buildFilter(1));
  };

  const handleReset = () => {
    setFilterDates(null);
    setLoaiTL(undefined);
    setTrangThaiVal(undefined);
    setTaiLieuPage(1);
    fetchData({ pageNumber: 1, pageSize: taiLieuPageSize });
  };

  const handleTaiLieuPageChange = (page: number) => {
    setTaiLieuPage(page);
    fetchData(buildFilter(page));
  };

  const handleExcelExport = async (type: 'tong-hop' | 'dong-gop') => {
    setExportExcel(type);
    const filter = buildFilter();
    try {
      const res = type === 'tong-hop'
        ? await exportKTBaoCaoTongHopExcel(filter)
        : await exportKTBaoCaoDongGopExcel(filter);
      if (res) {
        saveBlobAsFile(res);
      } else {
        message.error('Xuất Excel thất bại. Vui lòng thử lại.');
      }
    } catch {
      message.error('Có lỗi khi xuất Excel.');
    } finally {
      setExportExcel(null);
    }
  };

  const handlePdfExport = async (
    ref: React.RefObject<HTMLDivElement>,
    filename: string,
  ) => {
    if (!ref.current) return;
    setExportPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(ref.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
      });

      const imgData  = canvas.toDataURL('image/jpeg', 0.88);
      const pdf      = new jsPDF('p', 'mm', 'a4');
      const pageW    = pdf.internal.pageSize.getWidth();
      const pageH    = pdf.internal.pageSize.getHeight();
      const imgH     = (canvas.height * pageW) / canvas.width;

      let heightLeft = imgH;
      let yOffset    = 0;

      while (heightLeft > 0) {
        pdf.addImage(imgData, 'JPEG', 0, yOffset, pageW, imgH);
        heightLeft -= pageH;
        if (heightLeft > 0) {
          yOffset -= pageH;
          pdf.addPage();
        }
      }

      pdf.save(filename);
    } catch {
      message.error('Xuất PDF thất bại. Vui lòng thử lại.');
    } finally {
      setExportPdf(false);
    }
  };

  // ── Chart data ────────────────────────────────────────────────────────────

  const thangMap = new Map(
    (tongHop?.theoThang ?? []).map(t => [t.thang, t.taiLieuMoi]),
  );
  const trendSeries = [{ name: 'Tài liệu mới', data: Array.from({ length: 12 }, (_, i) => thangMap.get(i + 1) ?? 0) }];
  const trendEmpty  = trendSeries[0].data.every(v => v === 0);

  const trendOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.03 } },
    xaxis: { categories: MONTHS_VI, labels: { style: { fontSize: '11px' } } },
    yaxis: { min: 0, labels: { formatter: v => Math.floor(v).toString() } },
    colors: ['#3699FF'],
    grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
    tooltip: { x: { show: true } },
  };

  const donutSeries  = (tongHop?.theoLoai ?? []).map(x => x.soLuong);
  const donutLabels  = (tongHop?.theoLoai ?? []).map(x => LOAI_LABEL[x.loaiTen] ?? x.loaiTen);
  const donutOptions: ApexOptions = {
    chart: { type: 'donut', animations: { enabled: false } },
    labels: donutLabels,
    dataLabels: { enabled: true, formatter: (val: number) => `${Number(val).toFixed(0)}%` },
    legend: { position: 'bottom', fontSize: '11px' },
    colors: CHART_COLORS,
    plotOptions: { pie: { donut: { size: '60%' } } },
    tooltip: { y: { formatter: v => `${v} tài liệu` } },
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const colsDongGop: ColumnsType<IKTBaoCaoDongGop> = [
    {
      title: '#', key: 'stt', width: 48, align: 'center',
      render: (_v, _r, i) => <span className="fw-semibold text-muted">{i + 1}</span>,
    },
    {
      title: 'Họ tên', dataIndex: 'tenNguoiDung',
      render: (v: string, r: IKTBaoCaoDongGop) => (
        <div>
          <div className="fw-semibold text-gray-800">{v}</div>
          {r.donVi && <div className="text-muted fs-8">{r.donVi}</div>}
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', width: 200, render: (v: string | null) => v ?? '—' },
    { title: 'Tổng TL', dataIndex: 'soTaiLieuTong', width: 90, align: 'center', render: fmtNum },
    {
      title: 'Xuất bản', dataIndex: 'soTaiLieuXuatBan', width: 90, align: 'center',
      render: (v: number) => <span className="text-success fw-semibold">{fmtNum(v)}</span>,
    },
    {
      title: 'Tỉ lệ duyệt', dataIndex: 'tiLeDuyetPhanTram', width: 130,
      render: (v: number) => (
        <div style={{ minWidth: 100 }}>
          <Progress
            percent={Math.round(v)}
            size="small"
            strokeColor={v >= 70 ? '#0BB783' : v >= 40 ? '#FFA800' : '#F64E60'}
            format={p => `${p}%`}
          />
        </div>
      ),
    },
    { title: 'Lượt xem', dataIndex: 'tongLuotXem', width: 100, align: 'center', render: fmtNum },
    {
      title: 'Đóng góp gần nhất', dataIndex: 'ngayDongGopGanNhat', width: 150,
      render: fmtDate,
    },
  ];

  const colsTaiLieu: ColumnsType<IKTBaoCaoTaiLieu> = [
    {
      title: 'Tài liệu', dataIndex: 'tieuDe',
      render: (v: string, r: IKTBaoCaoTaiLieu) => (
        <div>
          <div className="fw-semibold text-gray-800" style={{ maxWidth: 340 }}>{v}</div>
          <div className="d-flex gap-1 mt-1">
            <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
              {LOAI_LABEL[r.loaiTaiLieu] ?? r.loaiTaiLieu}
            </Tag>
            <Tag color={TRANG_THAI_COLOR[r.trangThai] ?? 'default'} style={{ fontSize: 10, margin: 0 }}>
              {TRANG_THAI_LABEL[r.trangThai] ?? r.trangThai}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Tác giả / Đơn vị', dataIndex: 'tacGia', width: 180,
      render: (v: string, r: IKTBaoCaoTaiLieu) => (
        <div>
          <div className="fw-semibold text-gray-700">{v}</div>
          {r.donVi && <div className="text-muted fs-8">{r.donVi}</div>}
        </div>
      ),
    },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', width: 110, render: fmtDate },
    { title: 'Xuất bản', dataIndex: 'ngayXuatBan', width: 110, render: fmtDate },
    { title: 'Xem', dataIndex: 'luotXem', width: 72, align: 'center', render: fmtNum },
    { title: 'Thích', dataIndex: 'soLuotThich', width: 64, align: 'center', render: fmtNum },
    { title: 'BL', dataIndex: 'soBinhLuan', width: 56, align: 'center', render: fmtNum },
  ];

  const colsTheoDonVi = [
    { title: 'Đơn vị', dataIndex: 'donViCode' },
    { title: 'Tổng TL', dataIndex: 'soTaiLieu', width: 90, align: 'center' as const, render: fmtNum },
    {
      title: 'Xuất bản', dataIndex: 'soXuatBan', width: 90, align: 'center' as const,
      render: (v: number) => <span className="text-success fw-semibold">{fmtNum(v)}</span>,
    },
    { title: 'Lượt xem', dataIndex: 'tongLuotXem', width: 100, align: 'center' as const, render: fmtNum },
  ];

  // ── Scope badge ───────────────────────────────────────────────────────────

  const scopeMeta = ROLE_META[tongHop?.roleScope ?? 'all'];
  const taiLieuTuChoi = tongHop
    ? tongHop.tongTaiLieu - tongHop.taiLieuXuatBan - tongHop.taiLieuChoDuyet - tongHop.taiLieuNhapLieu
    : 0;

  // ── Export button bar ─────────────────────────────────────────────────────

  const exportBar = (
    type: 'tong-hop' | 'dong-gop',
    pdfRef: React.RefObject<HTMLDivElement>,
    pdfFilename: string,
  ) => (
    <div className="d-flex gap-2 mb-4 justify-content-end">
      <Tooltip title="Xuất file Excel từ server">
        <Button
          icon={<i className="fa-regular fa-file-excel me-1" style={{ color: '#10B981' }} />}
          style={{ color: '#10B981', borderColor: '#10B981' }}
          loading={exportExcel === type}
          disabled={exportPdf}
          onClick={() => handleExcelExport(type)}
        >
          Xuất Excel
        </Button>
      </Tooltip>
      <Tooltip title="Xuất PDF từ nội dung hiển thị">
        <Button
          icon={<i className="fa-regular fa-file-pdf me-1" style={{ color: '#EF4444' }} />}
          style={{ color: '#EF4444', borderColor: '#EF4444' }}
          loading={exportPdf}
          disabled={exportExcel !== null}
          onClick={() => handlePdfExport(pdfRef, pdfFilename)}
        >
          Xuất PDF
        </Button>
      </Tooltip>
    </div>
  );

  // ── Breadcrumbs ───────────────────────────────────────────────────────────

  const breadcrumbs = [
    { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
    { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Báo cáo Kho tri thức</PageTitle>
      <Content>

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-6">
          <div>
            <h4 className="fw-bold text-gray-900 mb-1">Báo cáo Kho Tri Thức</h4>
            <p className="text-muted mb-0 fs-7">
              Tổng hợp KPI, đóng góp người dùng và danh sách tài liệu theo bộ lọc
            </p>
          </div>
          {tongHop && (
            <Tag color={scopeMeta.color} style={{ fontSize: 13, padding: '4px 10px', margin: 0 }}>
              <i className="fa-regular fa-building me-1" />{scopeMeta.label}
            </Tag>
          )}
        </div>

        {/* Filter card */}
        <Card bordered={false} className="shadow-sm mb-5">
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <RangePicker
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={filterDates}
                onChange={v => setFilterDates(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                allowClear
              />
              <Select
                placeholder="Loại tài liệu"
                options={LOAI_OPTIONS}
                value={loaiTL}
                onChange={setLoaiTL}
                allowClear
                style={{ width: 160 }}
              />
              <Select
                placeholder="Trạng thái"
                options={TRANG_THAI_OPTIONS}
                value={trangThaiVal}
                onChange={setTrangThaiVal}
                allowClear
                style={{ width: 140 }}
              />
            </div>
            <div className="d-flex gap-2">
              <Button type="primary" icon={<i className="fa-regular fa-search me-1" />} onClick={handleApply} loading={loading}>
                Xem báo cáo
              </Button>
              <Button icon={<i className="fa-regular fa-rotate me-1" />} onClick={handleReset} disabled={loading}>
                Đặt lại
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Alert type="error" message={error} showIcon closable className="mb-4" onClose={() => setError(null)} />
        )}

        {/* Tabs */}
        <Spin spinning={loading} tip="Đang tải...">
          <Tabs
            defaultActiveKey="tong-hop"
            items={[
              // ── Tab 1: Tổng hợp ────────────────────────────────────────────
              {
                key: 'tong-hop',
                label: <span><i className="fa-regular fa-chart-pie me-1" />Tổng hợp KPI</span>,
                children: (
                  <>
                    {exportBar('tong-hop', tongHopRef, `KTBaoCao_TongHop_${dayjs().format('YYYYMMDD')}.pdf`)}

                    {!tongHop && !loading ? (
                      <Empty description="Nhấn 'Xem báo cáo' để tải dữ liệu" className="py-10" />
                    ) : (
                      <div ref={tongHopRef}>
                        {/* KPI Cards — Row 1: Tài liệu */}
                        <Row gutter={[16, 16]} className="mb-4">
                          {[
                            { title: 'Tổng tài liệu',  value: tongHop?.tongTaiLieu,     icon: 'fa-books',         color: '#3699FF' },
                            { title: 'Đã xuất bản',    value: tongHop?.taiLieuXuatBan,  icon: 'fa-circle-check',  color: '#0BB783' },
                            { title: 'Chờ xét duyệt',  value: tongHop?.taiLieuChoDuyet, icon: 'fa-clock',         color: '#FFA800' },
                            { title: 'Nháp',           value: tongHop?.taiLieuNhapLieu, icon: 'fa-file-pen',      color: '#8950FC' },
                          ].map((s, i) => (
                            <Col key={i} xs={12} sm={6}>
                              <Card bordered={false} className="shadow-sm h-100">
                                <Statistic
                                  title={s.title}
                                  value={s.value ?? 0}
                                  prefix={<i className={`fa-regular ${s.icon} me-2`} style={{ color: s.color }} />}
                                  valueStyle={{ color: s.color, fontWeight: 700 }}
                                />
                              </Card>
                            </Col>
                          ))}
                        </Row>

                        {/* KPI Cards — Row 2: Từ chối + Tương tác + Tư vấn */}
                        <Row gutter={[16, 16]} className="mb-5">
                          {[
                            { title: 'Từ chối',        value: taiLieuTuChoi,               icon: 'fa-ban',          color: '#F64E60' },
                            { title: 'Tổng lượt xem',  value: tongHop?.tongLuotXem,         icon: 'fa-eye',          color: '#1BC5BD' },
                            { title: 'Lượt thích',     value: tongHop?.tongLuotThich,       icon: 'fa-heart',        color: '#F64E60' },
                            { title: 'Bình luận',      value: tongHop?.tongBinhLuan,        icon: 'fa-comments',     color: '#3699FF' },
                            { title: 'Yêu cầu tư vấn', value: tongHop?.tongYeuCauTuVan,    icon: 'fa-headset',      color: '#FFA800' },
                            { title: 'Tư vấn hoàn tất', value: tongHop?.yeuCauDaHoanTat,   icon: 'fa-check-double', color: '#0BB783' },
                          ].map((s, i) => (
                            <Col key={i} xs={12} sm={8} lg={4}>
                              <Card bordered={false} className="shadow-sm h-100" bodyStyle={{ padding: '12px 16px' }}>
                                <Statistic
                                  title={<span className="fs-8">{s.title}</span>}
                                  value={s.value ?? 0}
                                  prefix={<i className={`fa-regular ${s.icon} me-1`} style={{ color: s.color, fontSize: 12 }} />}
                                  valueStyle={{ color: s.color, fontWeight: 700, fontSize: 20 }}
                                />
                              </Card>
                            </Col>
                          ))}
                        </Row>

                        {/* Charts */}
                        <Row gutter={[16, 16]} className="mb-5">
                          <Col xs={24} lg={16}>
                            <Card
                              bordered={false} className="shadow-sm"
                              title={<span className="fw-semibold"><i className="fa-regular fa-chart-line text-primary me-2" />Tài liệu mới theo tháng</span>}
                            >
                              {trendEmpty ? (
                                <Empty description="Không có dữ liệu xu hướng" style={{ padding: 32 }} />
                              ) : (
                                <ReactApexChart type="area" height={200} series={trendSeries} options={trendOptions} />
                              )}
                            </Card>
                          </Col>
                          <Col xs={24} lg={8}>
                            <Card
                              bordered={false} className="shadow-sm h-100"
                              title={<span className="fw-semibold"><i className="fa-regular fa-chart-pie text-primary me-2" />Phân loại tài liệu</span>}
                            >
                              {donutSeries.length === 0 ? (
                                <Empty description="Chưa có tài liệu" style={{ padding: 32 }} />
                              ) : (
                                <ReactApexChart type="donut" height={200} series={donutSeries} options={donutOptions} />
                              )}
                            </Card>
                          </Col>
                        </Row>

                        {/* TheoDonVi — admin scope only */}
                        {(tongHop?.theoDonVi ?? []).length > 0 && (
                          <Card
                            bordered={false} className="shadow-sm"
                            title={<span className="fw-semibold"><i className="fa-regular fa-building text-primary me-2" />Tài liệu theo đơn vị</span>}
                          >
                            <Table
                              dataSource={tongHop!.theoDonVi}
                              columns={colsTheoDonVi}
                              rowKey="donViCode"
                              size="small"
                              pagination={false}
                            />
                          </Card>
                        )}
                      </div>
                    )}
                  </>
                ),
              },

              // ── Tab 2: Đóng góp ────────────────────────────────────────────
              {
                key: 'dong-gop',
                label: <span><i className="fa-regular fa-award me-1" />Đóng góp người dùng</span>,
                children: (
                  <>
                    {exportBar('dong-gop', dongGopRef, `KTBaoCao_DongGop_${dayjs().format('YYYYMMDD')}.pdf`)}

                    <div ref={dongGopRef}>
                      <Table
                        dataSource={dongGop}
                        columns={colsDongGop}
                        rowKey="userId"
                        size="small"
                        pagination={false}
                        locale={{ emptyText: <Empty description={loading ? 'Đang tải...' : 'Chưa có dữ liệu đóng góp'} /> }}
                        scroll={{ x: 900 }}
                      />
                      {dongGop.length >= 200 && (
                        <div className="text-muted fs-8 mt-2 text-end">
                          <i className="fa-regular fa-circle-info me-1" />Hiển thị tối đa 200 người đóng góp hàng đầu
                        </div>
                      )}
                    </div>
                  </>
                ),
              },

              // ── Tab 3: Danh sách tài liệu ─────────────────────────────────
              {
                key: 'tai-lieu',
                label: <span><i className="fa-regular fa-file-lines me-1" />Danh sách tài liệu</span>,
                children: (
                  <Table
                    dataSource={taiLieu}
                    columns={colsTaiLieu}
                    rowKey="id"
                    size="small"
                    pagination={{
                      current: taiLieuPage,
                      pageSize: taiLieuPageSize,
                      total: taiLieuTotal,
                      showTotal: total => `Tổng ${total.toLocaleString('vi-VN')} tài liệu`,
                      onChange: handleTaiLieuPageChange,
                      showSizeChanger: false,
                    }}
                    locale={{ emptyText: <Empty description={loading ? 'Đang tải...' : 'Không có tài liệu'} /> }}
                    scroll={{ x: 900 }}
                  />
                ),
              },
            ]}
          />
        </Spin>
      </Content>
    </>
  );
};
