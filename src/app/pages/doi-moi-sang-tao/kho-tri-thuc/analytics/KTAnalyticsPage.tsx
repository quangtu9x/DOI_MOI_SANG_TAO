import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Spin, Empty, Tabs, Table, Tag, Select, Alert, Modal, Checkbox, Button,
} from 'antd';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';
import { useAuth } from '@/app/modules/auth';
import {
  getKTDashboard,
  getKTLeaderboardTaiLieu,
  getKTLeaderboardChuyenGia,
  getKTLeaderboardCongDong,
  getKTLeaderboardNguoiDung,
} from '@/app/services/khoTriThucApi';
import type {
  IKTDashboardStats,
  IKTLeaderboardTaiLieu,
  IKTLeaderboardChuyenGia,
  IKTLeaderboardCongDong,
  IKTLeaderboardNguoiDung,
  IKTTrendThang,
} from '@/app/models/knowledge-hub';

// ── Constants ────────────────────────────────────────────────────────────────

const LOAI_DISPLAY: Record<string, string> = {
  TaiLieuHuongDan:    'Hướng dẫn',
  Playbook:           'Playbook',
  Template:           'Mẫu biểu',
  NghienCuu:          'Nghiên cứu',
  TinhHuong:          'Tình huống',
  BaiHocKinhNghiem:   'Bài học KN',
};

const ROLE_SCOPE_META: Record<string, { label: string; color: string }> = {
  all:      { label: 'Toàn hệ thống', color: 'blue' },
  unit:     { label: 'Đơn vị của tôi', color: 'green' },
  personal: { label: 'Của tôi',        color: 'orange' },
};

const MONTHS_VI = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const KPI_CARD_IDS = [
  'tongSoTaiLieu',
  'taiLieuDaXuatBan',
  'taiLieuChoXetDuyet',
  'tongLuotXem',
  'tongSoChuyenGia',
  'tongSoCongDong',
  'tongLuotThich',
  'tongBinhLuan',
] as const;

type KpiCardId = (typeof KPI_CARD_IDS)[number];

type KpiLayout = {
  order: KpiCardId[];
  visible: KpiCardId[];
};

type KpiCardConfig = {
  id: KpiCardId;
  title: string;
  render: () => React.ReactNode;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const padTrend = (trend: IKTTrendThang[]): number[] => {
  const map = new Map(trend.map(t => [t.thang, t.soTaiLieuMoi]));
  return Array.from({ length: 12 }, (_, i) => map.get(i + 1) ?? 0);
};

const fmtNum = (n?: number) => (n ?? 0).toLocaleString('vi-VN');

const defaultKpiLayout: KpiLayout = {
  order: [...KPI_CARD_IDS],
  visible: [...KPI_CARD_IDS],
};

const mergeLayout = (layout?: Partial<KpiLayout> | null): KpiLayout => {
  const order = (layout?.order ?? []).filter((id): id is KpiCardId => KPI_CARD_IDS.includes(id as KpiCardId));
  const visible = (layout?.visible ?? []).filter((id): id is KpiCardId => KPI_CARD_IDS.includes(id as KpiCardId));

  const fullOrder = [...order, ...KPI_CARD_IDS.filter(id => !order.includes(id))];
  const fullVisible = visible.length > 0 ? visible : [...KPI_CARD_IDS];

  return {
    order: fullOrder,
    visible: fullVisible,
  };
};

// ── Page component ───────────────────────────────────────────────────────────

export const KTAnalyticsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [refreshKey, setRefreshKey] = useState(0);
  const [kpiLayout, setKpiLayout] = useState<KpiLayout>(defaultKpiLayout);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [draggingCardId, setDraggingCardId] = useState<KpiCardId | null>(null);

  const [loadingDash, setLoadingDash] = useState(false);
  const [loadingLB, setLoadingLB]     = useState(false);
  const [dashError, setDashError]     = useState<string | null>(null);

  const [stats, setStats]         = useState<IKTDashboardStats | null>(null);
  const [lbTaiLieu, setLbTaiLieu] = useState<IKTLeaderboardTaiLieu[]>([]);
  const [lbChuyen, setLbChuyen]   = useState<IKTLeaderboardChuyenGia[]>([]);
  const [lbCongDong, setLbCongDong] = useState<IKTLeaderboardCongDong[]>([]);
  const [lbNguoiDung, setLbNguoiDung] = useState<IKTLeaderboardNguoiDung[]>([]);

  const kpiStorageKey = `kt-analytics-kpi-layout-${currentUser?.id ?? 'anonymous'}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(kpiStorageKey);
      if (!raw) {
        setKpiLayout(defaultKpiLayout);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<KpiLayout>;
      setKpiLayout(mergeLayout(parsed));
    } catch {
      setKpiLayout(defaultKpiLayout);
    }
  }, [kpiStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(kpiStorageKey, JSON.stringify(kpiLayout));
    } catch {
      // Ignore localStorage failures in private mode.
    }
  }, [kpiLayout, kpiStorageKey]);

  // ── Fetch dashboard ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingDash(true);
      setDashError(null);
      try {
        const res = await getKTDashboard(selectedYear);
        const d = res?.data;
        if (d?.succeeded && d?.data) {
          setStats(d.data);
        } else {
          setStats(null);
          setDashError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
        }
      } catch {
        setDashError('Có lỗi xảy ra khi kết nối server.');
      } finally {
        setLoadingDash(false);
      }
    };
    load();
  }, [selectedYear, refreshKey]);

  // ── Fetch leaderboards (once + on refresh) ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingLB(true);
      try {
        const [tl, cg, cd, nd] = await Promise.all([
          getKTLeaderboardTaiLieu(10),
          getKTLeaderboardChuyenGia(10),
          getKTLeaderboardCongDong(10),
          getKTLeaderboardNguoiDung(10),
        ]);
        setLbTaiLieu(tl?.data?.succeeded  ? (tl.data.data  ?? []) : []);
        setLbChuyen( cg?.data?.succeeded  ? (cg.data.data  ?? []) : []);
        setLbCongDong(cd?.data?.succeeded ? (cd.data.data  ?? []) : []);
        setLbNguoiDung(nd?.data?.succeeded? (nd.data.data  ?? []) : []);
      } finally {
        setLoadingLB(false);
      }
    };
    load();
  }, [refreshKey]);

  // ── Chart configs ──────────────────────────────────────────────────────────
  const trendData = stats ? padTrend(stats.trendTheoThang) : Array(12).fill(0);
  const trendEmpty = trendData.every(v => v === 0);

  const trendOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.03 },
    },
    xaxis: {
      categories: MONTHS_VI,
      labels: { style: { fontSize: '12px' } },
    },
    yaxis: {
      min: 0,
      labels: { formatter: (v) => Math.floor(v).toString() },
    },
    colors: ['#3699FF'],
    grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
    tooltip: { x: { show: true } },
  };

  const trendSeries = [{ name: 'Tài liệu mới', data: trendData }];

  const donutSeries = stats?.taiLieuTheoLoai.map(x => x.soLuong) ?? [];
  const donutLabels = stats?.taiLieuTheoLoai.map(x => LOAI_DISPLAY[x.loaiTen] ?? x.loaiTen) ?? [];
  const donutOptions: ApexOptions = {
    chart: { type: 'donut' },
    labels: donutLabels,
    dataLabels: { enabled: true, formatter: (val: number) => `${Number(val).toFixed(0)}%` },
    legend: { position: 'bottom', fontSize: '12px' },
    colors: ['#3699FF','#1BC5BD','#8950FC','#F64E60','#FFA800','#0BB783'],
    plotOptions: { pie: { donut: { size: '62%' } } },
    tooltip: { y: { formatter: (v) => `${v} tài liệu` } },
  };

  // ── Leaderboard columns ───────────────────────────────────────────────────
  const colsTL = [
    {
      title: '#', dataIndex: 'xepHang', width: 44,
      render: (v: number) => <span className="fw-bold text-gray-700">{v}</span>,
    },
    {
      title: 'Tài liệu', dataIndex: 'tieuDe',
      render: (v: string, r: IKTLeaderboardTaiLieu) => (
        <div>
          <div className="fw-semibold text-gray-800" style={{ maxWidth: 340, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{v}</div>
          {r.loaiTaiLieu && (
            <Tag color="blue" style={{ fontSize: 11, marginTop: 2 }}>
              {LOAI_DISPLAY[r.loaiTaiLieu] ?? r.loaiTaiLieu}
            </Tag>
          )}
        </div>
      ),
    },
    { title: 'Lượt xem',  dataIndex: 'luotXem',  width: 100, render: fmtNum },
    { title: 'Lượt thích', dataIndex: 'luotThich', width: 100, render: fmtNum },
  ];

  const colsCG = [
    {
      title: '#', dataIndex: 'xepHang', width: 44,
      render: (v: number) => <span className="fw-bold text-gray-700">{v}</span>,
    },
    {
      title: 'Chuyên gia', dataIndex: 'hoTen',
      render: (v: string, r: IKTLeaderboardChuyenGia) => (
        <div>
          <div className="fw-semibold text-gray-800">{v}</div>
          {r.linhVuc && <div className="text-muted fs-7">{r.linhVuc}</div>}
        </div>
      ),
    },
    {
      title: 'Điểm TB', dataIndex: 'diemTrungBinh', width: 90,
      render: (v: number) => <span className="fw-semibold text-warning">{v.toFixed(1)} ⭐</span>,
    },
    { title: 'Nhận xét', dataIndex: 'soLuotNhanXet', width: 90, render: (v: number) => `${v} lượt` },
  ];

  const colsCD = [
    {
      title: '#', dataIndex: 'xepHang', width: 44,
      render: (v: number) => <span className="fw-bold text-gray-700">{v}</span>,
    },
    { title: 'Cộng đồng',  dataIndex: 'ten' },
    { title: 'Thành viên', dataIndex: 'soThanhVien', width: 110, render: fmtNum },
    { title: 'Bài viết',   dataIndex: 'soBaiViet',   width: 90,  render: fmtNum },
  ];

  const colsND = [
    {
      title: '#', dataIndex: 'xepHang', width: 44,
      render: (v: number) => <span className="fw-bold text-gray-700">{v}</span>,
    },
    {
      title: 'Người đóng góp', dataIndex: 'tenNguoiDung',
      render: (v: string, r: IKTLeaderboardNguoiDung) => (
        <div>
          <div className="fw-semibold text-gray-800">{v}</div>
          {r.donVi && <div className="text-muted fs-7">{r.donVi}</div>}
        </div>
      ),
    },
    { title: 'Tài liệu',  dataIndex: 'soTaiLieu',  width: 90, render: fmtNum },
    { title: 'Lượt xem',  dataIndex: 'tongLuotXem', width: 100, render: fmtNum },
  ];

  // ── Scope badge ────────────────────────────────────────────────────────────
  const scopeMeta = ROLE_SCOPE_META[stats?.roleScope ?? 'all'];

  const kpiCards: KpiCardConfig[] = [
    {
      id: 'tongSoTaiLieu',
      title: 'Tổng tài liệu',
      render: () => (
        <Statistic
          title="Tổng tài liệu"
          value={stats?.tongSoTaiLieu ?? 0}
          prefix={<i className="fa-regular fa-books text-primary me-2" />}
          valueStyle={{ color: '#3699FF', fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'taiLieuDaXuatBan',
      title: 'Đã xuất bản',
      render: () => (
        <Statistic
          title="Đã xuất bản"
          value={stats?.taiLieuDaXuatBan ?? 0}
          prefix={<i className="fa-regular fa-circle-check text-success me-2" />}
          valueStyle={{ color: '#0BB783', fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'taiLieuChoXetDuyet',
      title: 'Chờ xét duyệt',
      render: () => (
        <Statistic
          title="Chờ xét duyệt"
          value={stats?.taiLieuChoXetDuyet ?? 0}
          prefix={<i className="fa-regular fa-clock text-warning me-2" />}
          valueStyle={{
            color: (stats?.taiLieuChoXetDuyet ?? 0) > 0 ? '#FFA800' : '#a0a0a0',
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      id: 'tongLuotXem',
      title: 'Lượt xem tổng',
      render: () => (
        <Statistic
          title="Lượt xem tổng"
          value={stats?.tongLuotXem ?? 0}
          prefix={<i className="fa-regular fa-eye text-info me-2" />}
          valueStyle={{ color: '#1BC5BD', fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'tongSoChuyenGia',
      title: 'Chuyên gia',
      render: () => (
        <>
          <Statistic
            title="Chuyên gia"
            value={stats?.tongSoChuyenGia ?? 0}
            prefix={<i className="fa-regular fa-user-tie text-primary me-2" />}
          />
          <div className="text-muted fs-8 mt-1">
            {(stats?.yeuCauTuVanCho ?? 0) > 0 && (
              <span className="text-warning me-3">
                <i className="fa-regular fa-bell me-1" />{stats?.yeuCauTuVanCho} yêu cầu chờ
              </span>
            )}
            ⭐ TB: {stats?.diemTrungBinhHT?.toFixed(1) ?? '—'}
          </div>
        </>
      ),
    },
    {
      id: 'tongSoCongDong',
      title: 'Cộng đồng',
      render: () => (
        <>
          <Statistic
            title="Cộng đồng"
            value={stats?.tongSoCongDong ?? 0}
            prefix={<i className="fa-regular fa-users text-primary me-2" />}
          />
          <div className="text-muted fs-8 mt-1">
            {fmtNum(stats?.tongSoThanhVien)} thành viên · {fmtNum(stats?.tongSoBaiViet)} bài viết
          </div>
        </>
      ),
    },
    {
      id: 'tongLuotThich',
      title: 'Lượt thích',
      render: () => (
        <Statistic
          title="Lượt thích"
          value={stats?.tongLuotThich ?? 0}
          prefix={<i className="fa-regular fa-heart text-danger me-2" />}
          valueStyle={{ color: '#F64E60', fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'tongBinhLuan',
      title: 'Bình luận',
      render: () => (
        <Statistic
          title="Bình luận"
          value={stats?.tongBinhLuan ?? 0}
          prefix={<i className="fa-regular fa-comments text-muted me-2" />}
        />
      ),
    },
  ];

  const visibleKpiCards = kpiLayout.order
    .filter(id => kpiLayout.visible.includes(id))
    .map(id => kpiCards.find(card => card.id === id))
    .filter((card): card is KpiCardConfig => Boolean(card));

  const handleVisibleChange = (checkedIds: KpiCardId[]) => {
    if (checkedIds.length === 0) {
      return;
    }

    setKpiLayout(prev => ({
      ...prev,
      visible: prev.order.filter(id => checkedIds.includes(id)),
    }));
  };

  const moveCard = (dragId: KpiCardId, targetId: KpiCardId) => {
    if (dragId === targetId) {
      return;
    }

    setKpiLayout(prev => {
      const nextOrder = [...prev.order];
      const from = nextOrder.indexOf(dragId);
      const to = nextOrder.indexOf(targetId);
      if (from < 0 || to < 0) {
        return prev;
      }

      nextOrder.splice(from, 1);
      nextOrder.splice(to, 0, dragId);
      return {
        ...prev,
        order: nextOrder,
      };
    });
  };

  const breadcrumbs = [
    { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
    { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Thống kê & Bảng xếp hạng</PageTitle>
      <Content>
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-6">
          <div>
            <h4 className="fw-bold text-gray-900 mb-1">Thống kê Thư viện ĐMST</h4>
            <p className="text-muted mb-0 fs-7">
              Bảng điều hành tổng hợp — dữ liệu lưu đệm 15 phút, tự cập nhật khi có tài liệu được duyệt
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {stats && (
              <Tag color={scopeMeta.color} style={{ fontSize: 13, padding: '4px 10px', margin: 0 }}>
                <i className="fa-regular fa-building me-1" />{scopeMeta.label}
              </Tag>
            )}
            <Button size="small" onClick={() => setShowConfigModal(true)}>
              <i className="fa-regular fa-sliders me-1" />Tùy chỉnh ô số liệu
            </Button>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 96 }}
              size="middle"
            >
              {YEAR_OPTIONS.map(y => (
                <Select.Option key={y} value={y}>{y}</Select.Option>
              ))}
            </Select>
            <button
              className="btn btn-sm btn-light-primary"
              onClick={() => setRefreshKey(k => k + 1)}
              disabled={loadingDash || loadingLB}
            >
              <i className="fa-regular fa-rotate me-1" />Làm mới
            </button>
          </div>
        </div>

        {dashError && (
          <Alert
            type="error"
            message={dashError}
            showIcon
            closable
            className="mb-4"
            onClose={() => setDashError(null)}
          />
        )}

        {/* KPI Cards */}
        <Spin spinning={loadingDash} tip="Đang tải...">
          {!stats && !loadingDash ? (
            <Empty description="Chưa có dữ liệu thống kê" className="py-10" />
          ) : (
            <>
              {/* Row 1: Tài liệu */}
              <Row gutter={[16, 16]} className="mb-4">
                {visibleKpiCards.map(card => (
                  <Col
                    key={card.id}
                    xs={12}
                    sm={6}
                    draggable
                    onDragStart={() => setDraggingCardId(card.id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (draggingCardId) {
                        moveCard(draggingCardId, card.id);
                      }
                      setDraggingCardId(null);
                    }}
                    onDragEnd={() => setDraggingCardId(null)}
                    style={{ cursor: 'move' }}
                  >
                    <Card bordered={false} className="shadow-sm h-100">
                      {card.render()}
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Charts */}
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={16}>
                  <Card
                    bordered={false}
                    className="shadow-sm"
                    title={
                      <span className="fw-semibold">
                        <i className="fa-regular fa-chart-line text-primary me-2" />
                        Tài liệu mới theo tháng — {selectedYear}
                      </span>
                    }
                  >
                    {trendEmpty ? (
                      <Empty description="Không có tài liệu mới được xuất bản trong năm này" style={{ padding: 32 }} />
                    ) : (
                      <ReactApexChart type="area" height={220} series={trendSeries} options={trendOptions} />
                    )}
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card
                    bordered={false}
                    className="shadow-sm h-100"
                    title={
                      <span className="fw-semibold">
                        <i className="fa-regular fa-chart-pie text-primary me-2" />
                        Phân loại tài liệu
                      </span>
                    }
                  >
                    {donutSeries.length === 0 ? (
                      <Empty description="Chưa có tài liệu" style={{ padding: 32 }} />
                    ) : (
                      <ReactApexChart type="donut" height={220} series={donutSeries} options={donutOptions} />
                    )}
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Spin>

        {/* Leaderboards */}
        <Card bordered={false} className="shadow-sm">
          <div className="fw-bold text-gray-800 fs-6 mb-4">
            <i className="fa-regular fa-trophy text-warning me-2" />
            Bảng xếp hạng
          </div>
          <Spin spinning={loadingLB}>
            <Tabs
              defaultActiveKey="tai-lieu"
              items={[
                {
                  key: 'tai-lieu',
                  label: (
                    <span><i className="fa-regular fa-fire me-1" />Tài liệu nổi bật</span>
                  ),
                  children: (
                    <Table
                      dataSource={lbTaiLieu}
                      columns={colsTL}
                      rowKey="taiLieuId"
                      size="small"
                      pagination={false}
                      locale={{ emptyText: <Empty description="Chưa có tài liệu xuất bản" /> }}
                    />
                  ),
                },
                {
                  key: 'chuyen-gia',
                  label: (
                    <span><i className="fa-regular fa-star me-1" />Chuyên gia</span>
                  ),
                  children: (
                    <Table
                      dataSource={lbChuyen}
                      columns={colsCG}
                      rowKey="chuyenGiaId"
                      size="small"
                      pagination={false}
                      locale={{ emptyText: <Empty description="Chưa có nhận xét chuyên gia" /> }}
                    />
                  ),
                },
                {
                  key: 'cong-dong',
                  label: (
                    <span><i className="fa-regular fa-users me-1" />Cộng đồng</span>
                  ),
                  children: (
                    <Table
                      dataSource={lbCongDong}
                      columns={colsCD}
                      rowKey="congDongId"
                      size="small"
                      pagination={false}
                      locale={{ emptyText: <Empty description="Chưa có cộng đồng hoạt động" /> }}
                    />
                  ),
                },
                {
                  key: 'nguoi-dung',
                  label: (
                    <span><i className="fa-regular fa-award me-1" />Người đóng góp</span>
                  ),
                  children: (
                    <Table
                      dataSource={lbNguoiDung}
                      columns={colsND}
                      rowKey="userId"
                      size="small"
                      pagination={false}
                      locale={{ emptyText: <Empty description="Chưa có tài liệu xuất bản" /> }}
                    />
                  ),
                },
              ]}
            />
          </Spin>
        </Card>

        <Modal
          title="Tùy chỉnh ô số liệu"
          open={showConfigModal}
          onCancel={() => setShowConfigModal(false)}
          footer={[
            <Button
              key="reset"
              onClick={() => {
                setKpiLayout(defaultKpiLayout);
              }}
            >
              Khôi phục mặc định
            </Button>,
            <Button key="ok" type="primary" onClick={() => setShowConfigModal(false)}>
              Xong
            </Button>,
          ]}
        >
          <div className="text-muted mb-3 fs-7">
            Chọn các ô số liệu cần hiển thị. Bạn có thể kéo thả trực tiếp các ô trên dashboard để đổi vị trí theo nhu cầu cá nhân.
          </div>
          <Checkbox.Group
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            value={kpiLayout.visible}
            onChange={values => handleVisibleChange(values as KpiCardId[])}
          >
            {kpiLayout.order.map(id => {
              const card = kpiCards.find(x => x.id === id);
              if (!card) {
                return null;
              }

              return (
                <Checkbox key={id} value={id}>
                  {card.title}
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        </Modal>
      </Content>
    </>
  );
};
